const express = require('express');
const db = require('../database/connection');
const { protect } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// ==================== PROJECT WORKSPACE OVERVIEW ====================

// @desc    Get project workspace overview
// @route   GET /api/project-workspace/:projectId/overview
// @access  Private
router.get('/:projectId/overview', protect, async (req, res, next) => {
  try {
    const { projectId } = req.params;

    // Verify user has access to project
    const projectAccess = await verifyProjectAccess(req.user.id, projectId);
    if (!projectAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this project',
      });
    }

    // Get project details
    const project = await db('projects as p')
      .select([
        'p.*',
        'creator.first_name as creator_first_name',
        'creator.last_name as creator_last_name',
        'creator.avatar_url as creator_avatar',
      ])
      .leftJoin('users as creator', 'p.created_by', 'creator.id')
      .where('p.id', projectId)
      .first();

    // Get workspace statistics
    const [
      totalSessions,
      upcomingSessions,
      totalTasks,
      completedTasks,
      totalMessages,
      totalContent,
      totalDeliverables,
      submittedDeliverables,
      totalCertificates,
      earnedCertificates,
    ] = await Promise.all([
      db('project_sessions').where({ project_id: projectId }).count('* as count').first(),
      db('project_sessions')
        .where({ project_id: projectId, status: 'upcoming' })
        .count('* as count')
        .first(),
      db('project_tasks').where({ project_id: projectId }).count('* as count').first(),
      db('project_tasks')
        .where({ project_id: projectId, status: 'done' })
        .count('* as count')
        .first(),
      db('project_messages').where({ project_id: projectId }).count('* as count').first(),
      db('learning_content').where({ project_id: projectId }).count('* as count').first(),
      db('project_deliverables').where({ project_id: projectId }).count('* as count').first(),
      db('project_deliverables')
        .where({ project_id: projectId, status: 'submitted' })
        .count('* as count')
        .first(),
      db('project_certificates').where({ project_id: projectId }).count('* as count').first(),
      db('project_certificates')
        .where({ project_id: projectId, user_id: req.user.id })
        .count('* as count')
        .first(),
    ]);

    // Get recent activity
    const recentActivity = await getRecentWorkspaceActivity(projectId, 10);

    // Get project members
    const members = await db('project_members as pm')
      .select([
        'u.id',
        'u.first_name',
        'u.last_name',
        'u.avatar_url',
        'u.is_online',
        'pm.role',
        'pm.joined_at',
        'pm.status',
      ])
      .join('users as u', 'pm.user_id', 'u.id')
      .where('pm.project_id', projectId)
      .andWhere('pm.status', 'active')
      .orderBy('pm.joined_at', 'asc');

    res.status(200).json({
      success: true,
      data: {
        project,
        statistics: {
          sessions: {
            total: parseInt(totalSessions.count),
            upcoming: parseInt(upcomingSessions.count),
          },
          tasks: {
            total: parseInt(totalTasks.count),
            completed: parseInt(completedTasks.count),
            completion_rate:
              totalTasks.count > 0
                ? ((completedTasks.count / totalTasks.count) * 100).toFixed(1)
                : 0,
          },
          messages: {
            total: parseInt(totalMessages.count),
          },
          content: {
            total: parseInt(totalContent.count),
          },
          deliverables: {
            total: parseInt(totalDeliverables.count),
            submitted: parseInt(submittedDeliverables.count),
          },
          certificates: {
            total: parseInt(totalCertificates.count),
            earned: parseInt(earnedCertificates.count),
          },
        },
        recent_activity: recentActivity,
        members,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ==================== SESSION BOARD ====================

// @desc    Get project sessions
// @route   GET /api/project-workspace/:projectId/sessions
// @access  Private
router.get('/:projectId/sessions', protect, async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { page = 1, limit = 20, status, type, upcoming_only } = req.query;
    const offset = (page - 1) * limit;

    // Verify project access
    const projectAccess = await verifyProjectAccess(req.user.id, projectId);
    if (!projectAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this project',
      });
    }

    let query = db('project_sessions as ps')
      .select([
        'ps.*',
        'creator.first_name as creator_first_name',
        'creator.last_name as creator_last_name',
        'creator.avatar_url as creator_avatar',
      ])
      .leftJoin('users as creator', 'ps.created_by', 'creator.id')
      .where('ps.project_id', projectId);

    if (status) {
      query = query.where('ps.status', status);
    }

    if (type) {
      query = query.where('ps.type', type);
    }

    if (upcoming_only === 'true') {
      query = query.where('ps.scheduled_date', '>', new Date());
    }

    const sessions = await query
      .orderBy('ps.scheduled_date', 'asc')
      .limit(parseInt(limit))
      .offset(offset);

    // Get attendees for each session
    for (let session of sessions) {
      const attendees = await db('session_attendees as sa')
        .select([
          'u.id',
          'u.first_name',
          'u.last_name',
          'u.avatar_url',
          'sa.role',
          'sa.response_status',
          'sa.attended',
        ])
        .join('users as u', 'sa.user_id', 'u.id')
        .where('sa.session_id', session.id);

      session.attendees = attendees;
    }

    const totalCount = await db('project_sessions')
      .where({ project_id: projectId })
      .count('* as count')
      .first();

    res.status(200).json({
      success: true,
      count: sessions.length,
      total: parseInt(totalCount.count),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalCount.count / limit),
      },
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create new session
// @route   POST /api/project-workspace/:projectId/sessions
// @access  Private
router.post('/:projectId/sessions', protect, async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const {
      title,
      description,
      scheduled_date,
      duration_minutes,
      type,
      meeting_link,
      meeting_id,
      meeting_password,
      location,
      agenda,
      is_public,
      allow_recordings,
      max_participants,
      tags,
      attendee_ids,
    } = req.body;

    // Verify project access and permissions
    const projectAccess = await verifyProjectAccess(req.user.id, projectId);
    if (!projectAccess || !['admin', 'mentor'].includes(projectAccess.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to create sessions',
      });
    }

    if (!title || !scheduled_date || !type) {
      return res.status(400).json({
        success: false,
        error: 'Title, scheduled date, and type are required',
      });
    }

    // Create session
    const session = await db('project_sessions')
      .insert({
        project_id: projectId,
        created_by: req.user.id,
        title,
        description,
        scheduled_date: new Date(scheduled_date),
        duration_minutes: duration_minutes || 60,
        type,
        meeting_link,
        meeting_id,
        meeting_password,
        location,
        agenda: JSON.stringify(agenda),
        is_public: is_public || false,
        allow_recordings: allow_recordings !== false,
        max_participants,
        tags: JSON.stringify(tags),
        share_url: generateShareUrl(),
      })
      .returning('*');

    // Add attendees
    if (attendee_ids && attendee_ids.length > 0) {
      const attendees = attendee_ids.map((userId) => ({
        session_id: session[0].id,
        user_id: userId,
        role: userId === req.user.id ? 'host' : 'participant',
      }));

      await db('session_attendees').insert(attendees);
    }

    // Add creator as host if not already included
    const existingAttendee = await db('session_attendees')
      .where({ session_id: session[0].id, user_id: req.user.id })
      .first();

    if (!existingAttendee) {
      await db('session_attendees').insert({
        session_id: session[0].id,
        user_id: req.user.id,
        role: 'host',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Session created successfully',
      data: session[0],
    });
  } catch (error) {
    next(error);
  }
});

// ==================== TASK MANAGER ====================

// @desc    Get project tasks
// @route   GET /api/project-workspace/:projectId/tasks
// @access  Private
router.get('/:projectId/tasks', protect, async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { page = 1, limit = 20, status, priority, assignee_id, type } = req.query;
    const offset = (page - 1) * limit;

    // Verify project access
    const projectAccess = await verifyProjectAccess(req.user.id, projectId);
    if (!projectAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this project',
      });
    }

    let query = db('project_tasks as pt')
      .select([
        'pt.*',
        'creator.first_name as creator_first_name',
        'creator.last_name as creator_last_name',
        'creator.avatar_url as creator_avatar',
        'assignee.first_name as assignee_first_name',
        'assignee.last_name as assignee_last_name',
        'assignee.avatar_url as assignee_avatar',
      ])
      .leftJoin('users as creator', 'pt.created_by', 'creator.id')
      .leftJoin('users as assignee', 'pt.assigned_to', 'assignee.id')
      .where('pt.project_id', projectId);

    if (status) {
      query = query.where('pt.status', status);
    }

    if (priority) {
      query = query.where('pt.priority', priority);
    }

    if (assignee_id) {
      query = query.where('pt.assigned_to', assignee_id);
    }

    if (type) {
      query = query.where('pt.type', type);
    }

    const tasks = await query
      .orderBy('pt.created_at', 'desc')
      .limit(parseInt(limit))
      .offset(offset);

    // Get comment counts for each task
    for (let task of tasks) {
      const commentCount = await db('task_comments')
        .where({ task_id: task.id })
        .count('* as count')
        .first();

      task.comments_count = parseInt(commentCount.count);
    }

    const totalCount = await db('project_tasks')
      .where({ project_id: projectId })
      .count('* as count')
      .first();

    res.status(200).json({
      success: true,
      count: tasks.length,
      total: parseInt(totalCount.count),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalCount.count / limit),
      },
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create new task
// @route   POST /api/project-workspace/:projectId/tasks
// @access  Private
router.post('/:projectId/tasks', protect, async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const {
      title,
      description,
      assigned_to,
      priority,
      type,
      due_date,
      estimated_hours,
      tags,
      parent_task_id,
      is_milestone,
    } = req.body;

    // Verify project access
    const projectAccess = await verifyProjectAccess(req.user.id, projectId);
    if (!projectAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this project',
      });
    }

    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Task title is required',
      });
    }

    const task = await db('project_tasks')
      .insert({
        project_id: projectId,
        created_by: req.user.id,
        assigned_to,
        title,
        description,
        priority: priority || 'medium',
        type,
        due_date: due_date ? new Date(due_date) : null,
        estimated_hours,
        tags: JSON.stringify(tags),
        parent_task_id,
        is_milestone: is_milestone || false,
      })
      .returning('*');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task[0],
    });
  } catch (error) {
    next(error);
  }
});

// ==================== LEARNING VAULT ====================

// @desc    Get learning content
// @route   GET /api/project-workspace/:projectId/learning-content
// @access  Private
router.get('/:projectId/learning-content', protect, async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { page = 1, limit = 20, type, category, status } = req.query;
    const offset = (page - 1) * limit;

    // Verify project access
    const projectAccess = await verifyProjectAccess(req.user.id, projectId);
    if (!projectAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this project',
      });
    }

    let query = db('learning_content as lc')
      .select([
        'lc.*',
        'creator.first_name as creator_first_name',
        'creator.last_name as creator_last_name',
        'creator.avatar_url as creator_avatar',
      ])
      .leftJoin('users as creator', 'lc.created_by', 'creator.id')
      .where('lc.project_id', projectId);

    if (type) {
      query = query.where('lc.type', type);
    }

    if (category) {
      query = query.where('lc.category', category);
    }

    if (status) {
      query = query.where('lc.status', status);
    }

    const content = await query
      .orderBy('lc.sort_order', 'asc')
      .orderBy('lc.created_at', 'desc')
      .limit(parseInt(limit))
      .offset(offset);

    // Get user progress for each content item
    for (let item of content) {
      const progress = await db('content_progress')
        .where({ content_id: item.id, user_id: req.user.id })
        .first();

      item.user_progress = progress || {
        progress_percentage: 0,
        is_completed: false,
        is_bookmarked: false,
        last_accessed_at: null,
      };
    }

    const totalCount = await db('learning_content')
      .where({ project_id: projectId })
      .count('* as count')
      .first();

    res.status(200).json({
      success: true,
      count: content.length,
      total: parseInt(totalCount.count),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalCount.count / limit),
      },
      data: content,
    });
  } catch (error) {
    next(error);
  }
});

// ==================== DELIVERABLES ====================

// @desc    Get project deliverables
// @route   GET /api/project-workspace/:projectId/deliverables
// @access  Private
router.get('/:projectId/deliverables', protect, async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { page = 1, limit = 20, status, type, assigned_to } = req.query;
    const offset = (page - 1) * limit;

    // Verify project access
    const projectAccess = await verifyProjectAccess(req.user.id, projectId);
    if (!projectAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this project',
      });
    }

    let query = db('project_deliverables as pd')
      .select([
        'pd.*',
        'creator.first_name as creator_first_name',
        'creator.last_name as creator_last_name',
        'creator.avatar_url as creator_avatar',
        'assignee.first_name as assignee_first_name',
        'assignee.last_name as assignee_last_name',
        'assignee.avatar_url as assignee_avatar',
        'reviewer.first_name as reviewer_first_name',
        'reviewer.last_name as reviewer_last_name',
        'reviewer.avatar_url as reviewer_avatar',
      ])
      .leftJoin('users as creator', 'pd.created_by', 'creator.id')
      .leftJoin('users as assignee', 'pd.assigned_to', 'assignee.id')
      .leftJoin('users as reviewer', 'pd.reviewed_by', 'reviewer.id')
      .where('pd.project_id', projectId);

    if (status) {
      query = query.where('pd.status', status);
    }

    if (type) {
      query = query.where('pd.type', type);
    }

    if (assigned_to) {
      query = query.where('pd.assigned_to', assigned_to);
    }

    const deliverables = await query
      .orderBy('pd.due_date', 'asc')
      .orderBy('pd.created_at', 'desc')
      .limit(parseInt(limit))
      .offset(offset);

    const totalCount = await db('project_deliverables')
      .where({ project_id: projectId })
      .count('* as count')
      .first();

    res.status(200).json({
      success: true,
      count: deliverables.length,
      total: parseInt(totalCount.count),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalCount.count / limit),
      },
      data: deliverables,
    });
  } catch (error) {
    next(error);
  }
});

// ==================== CERTIFICATES ====================

// @desc    Get project certificates
// @route   GET /api/project-workspace/:projectId/certificates
// @access  Private
router.get('/:projectId/certificates', protect, async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { page = 1, limit = 20, type, status, user_id } = req.query;
    const offset = (page - 1) * limit;

    // Verify project access
    const projectAccess = await verifyProjectAccess(req.user.id, projectId);
    if (!projectAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this project',
      });
    }

    let query = db('project_certificates as pc')
      .select([
        'pc.*',
        'user.first_name as user_first_name',
        'user.last_name as user_last_name',
        'user.avatar_url as user_avatar',
        'issuer.first_name as issuer_first_name',
        'issuer.last_name as issuer_last_name',
        'issuer.avatar_url as issuer_avatar',
      ])
      .leftJoin('users as user', 'pc.user_id', 'user.id')
      .leftJoin('users as issuer', 'pc.issued_by', 'issuer.id')
      .where('pc.project_id', projectId);

    if (type) {
      query = query.where('pc.type', type);
    }

    if (status) {
      query = query.where('pc.status', status);
    }

    if (user_id) {
      query = query.where('pc.user_id', user_id);
    }

    const certificates = await query
      .orderBy('pc.issued_date', 'desc')
      .limit(parseInt(limit))
      .offset(offset);

    const totalCount = await db('project_certificates')
      .where({ project_id: projectId })
      .count('* as count')
      .first();

    res.status(200).json({
      success: true,
      count: certificates.length,
      total: parseInt(totalCount.count),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalCount.count / limit),
      },
      data: certificates,
    });
  } catch (error) {
    next(error);
  }
});

// Helper functions
async function verifyProjectAccess(userId, projectId) {
  const membership = await db('project_members')
    .where({ project_id: projectId, user_id: userId, status: 'active' })
    .first();

  return membership;
}

async function getRecentWorkspaceActivity(projectId, limit = 10) {
  // This would aggregate recent activity from all workspace components
  // For now, return a placeholder
  return [];
}

function generateShareUrl() {
  return `https://ispora.com/sessions/${uuidv4()}`;
}

module.exports = router;
