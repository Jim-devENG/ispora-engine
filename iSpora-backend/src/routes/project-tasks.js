const express = require('express');
const db = require('../database/connection');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ==================== TASK MANAGEMENT ====================

// @desc    Update task
// @route   PUT /api/project-tasks/:taskId
// @access  Private
router.put('/:taskId', protect, async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const updateData = req.body;

    // Verify user has permission to update task
    const task = await db('project_tasks as pt')
      .select(['pt.*', 'pm.role'])
      .leftJoin('project_members as pm', function() {
        this.on('pt.project_id', '=', 'pm.project_id')
          .andOn('pm.user_id', '=', db.raw('?', [req.user.id]));
      })
      .where('pt.id', taskId)
      .first();

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Check permissions (creator, assignee, or admin/mentor)
    const canUpdate = task.created_by === req.user.id || 
                     task.assigned_to === req.user.id || 
                     ['admin', 'mentor'].includes(task.role);

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to update this task'
      });
    }

    // Handle JSON fields
    if (updateData.tags) {
      updateData.tags = JSON.stringify(updateData.tags);
    }
    if (updateData.custom_fields) {
      updateData.custom_fields = JSON.stringify(updateData.custom_fields);
    }
    if (updateData.dependencies) {
      updateData.dependencies = JSON.stringify(updateData.dependencies);
    }

    // Handle date fields
    if (updateData.due_date) {
      updateData.due_date = new Date(updateData.due_date);
    }

    // Handle status changes
    if (updateData.status) {
      if (updateData.status === 'in-progress' && task.status === 'todo') {
        updateData.started_date = new Date();
      } else if (updateData.status === 'done' && task.status !== 'done') {
        updateData.completed_date = new Date();
        updateData.progress_percentage = 100;
      }
    }

    updateData.updated_at = new Date();

    await db('project_tasks')
      .where({ id: taskId })
      .update(updateData);

    const updatedTask = await db('project_tasks')
      .where({ id: taskId })
      .first();

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete task
// @route   DELETE /api/project-tasks/:taskId
// @access  Private
router.delete('/:taskId', protect, async (req, res, next) => {
  try {
    const { taskId } = req.params;

    // Verify user has permission to delete task
    const task = await db('project_tasks as pt')
      .select(['pt.*', 'pm.role'])
      .leftJoin('project_members as pm', function() {
        this.on('pt.project_id', '=', 'pm.project_id')
          .andOn('pm.user_id', '=', db.raw('?', [req.user.id]));
      })
      .where('pt.id', taskId)
      .first();

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Only creator or admin/mentor can delete
    if (task.created_by !== req.user.id && !['admin', 'mentor'].includes(task.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to delete this task'
      });
    }

    await db('project_tasks')
      .where({ id: taskId })
      .del();

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// ==================== TASK COMMENTS ====================

// @desc    Get task comments
// @route   GET /api/project-tasks/:taskId/comments
// @access  Private
router.get('/:taskId/comments', protect, async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Verify user has access to task
    const task = await db('project_tasks as pt')
      .select(['pt.*', 'pm.role'])
      .leftJoin('project_members as pm', function() {
        this.on('pt.project_id', '=', 'pm.project_id')
          .andOn('pm.user_id', '=', db.raw('?', [req.user.id]));
      })
      .where('pt.id', taskId)
      .first();

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    const comments = await db('task_comments as tc')
      .select([
        'tc.*',
        'u.first_name',
        'u.last_name',
        'u.avatar_url'
      ])
      .join('users as u', 'tc.user_id', 'u.id')
      .where('tc.task_id', taskId)
      .where(function() {
        this.where('tc.is_internal', false)
            .orWhere('tc.user_id', req.user.id)
            .orWhereIn('tc.user_id', function() {
              this.select('user_id')
                .from('project_members')
                .where('project_id', task.project_id)
                .where('role', 'admin');
            });
      })
      .orderBy('tc.created_at', 'asc')
      .limit(parseInt(limit))
      .offset(offset);

    const totalCount = await db('task_comments')
      .where({ task_id: taskId })
      .count('* as count')
      .first();

    res.status(200).json({
      success: true,
      count: comments.length,
      total: parseInt(totalCount.count),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalCount.count / limit)
      },
      data: comments
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Add comment to task
// @route   POST /api/project-tasks/:taskId/comments
// @access  Private
router.post('/:taskId/comments', protect, async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { 
      content, 
      type = 'comment', 
      is_internal = false, 
      mentions = [], 
      notify_assignee = false, 
      notify_creator = false,
      attachments = []
    } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Comment content is required'
      });
    }

    // Verify user has access to task
    const task = await db('project_tasks as pt')
      .select(['pt.*', 'pm.role'])
      .leftJoin('project_members as pm', function() {
        this.on('pt.project_id', '=', 'pm.project_id')
          .andOn('pm.user_id', '=', db.raw('?', [req.user.id]));
      })
      .where('pt.id', taskId)
      .first();

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    const comment = await db('task_comments')
      .insert({
        task_id: taskId,
        user_id: req.user.id,
        content,
        type,
        is_internal,
        mentions: JSON.stringify(mentions),
        notify_assignee,
        notify_creator,
        attachments: JSON.stringify(attachments)
      })
      .returning('*');

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: comment[0]
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update comment
// @route   PUT /api/project-tasks/comments/:commentId
// @access  Private
router.put('/comments/:commentId', protect, async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Comment content is required'
      });
    }

    const comment = await db('task_comments')
      .where({ id: commentId, user_id: req.user.id })
      .first();

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found or insufficient permissions'
      });
    }

    await db('task_comments')
      .where({ id: commentId })
      .update({
        content,
        is_edited: true,
        edited_at: new Date(),
        updated_at: new Date()
      });

    res.status(200).json({
      success: true,
      message: 'Comment updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete comment
// @route   DELETE /api/project-tasks/comments/:commentId
// @access  Private
router.delete('/comments/:commentId', protect, async (req, res, next) => {
  try {
    const { commentId } = req.params;

    const comment = await db('task_comments as tc')
      .select(['tc.*', 'pt.project_id', 'pm.role'])
      .join('project_tasks as pt', 'tc.task_id', 'pt.id')
      .leftJoin('project_members as pm', function() {
        this.on('pt.project_id', '=', 'pm.project_id')
          .andOn('pm.user_id', '=', db.raw('?', [req.user.id]));
      })
      .where('tc.id', commentId)
      .first();

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }

    // Check permissions (comment author or admin/mentor)
    if (comment.user_id !== req.user.id && !['admin', 'mentor'].includes(comment.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to delete this comment'
      });
    }

    await db('task_comments')
      .where({ id: commentId })
      .del();

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// ==================== TASK SUBTASKS ====================

// @desc    Get task subtasks
// @route   GET /api/project-tasks/:taskId/subtasks
// @access  Private
router.get('/:taskId/subtasks', protect, async (req, res, next) => {
  try {
    const { taskId } = req.params;

    // Verify user has access to parent task
    const parentTask = await db('project_tasks as pt')
      .select(['pt.*', 'pm.role'])
      .leftJoin('project_members as pm', function() {
        this.on('pt.project_id', '=', 'pm.project_id')
          .andOn('pm.user_id', '=', db.raw('?', [req.user.id]));
      })
      .where('pt.id', taskId)
      .first();

    if (!parentTask) {
      return res.status(404).json({
        success: false,
        error: 'Parent task not found'
      });
    }

    const subtasks = await db('project_tasks as pt')
      .select([
        'pt.*',
        'creator.first_name as creator_first_name',
        'creator.last_name as creator_last_name',
        'creator.avatar_url as creator_avatar',
        'assignee.first_name as assignee_first_name',
        'assignee.last_name as assignee_last_name',
        'assignee.avatar_url as assignee_avatar'
      ])
      .leftJoin('users as creator', 'pt.created_by', 'creator.id')
      .leftJoin('users as assignee', 'pt.assigned_to', 'assignee.id')
      .where('pt.parent_task_id', taskId)
      .orderBy('pt.sort_order', 'asc')
      .orderBy('pt.created_at', 'asc');

    res.status(200).json({
      success: true,
      data: subtasks
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create subtask
// @route   POST /api/project-tasks/:taskId/subtasks
// @access  Private
router.post('/:taskId/subtasks', protect, async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const {
      title,
      description,
      assigned_to,
      priority,
      due_date,
      estimated_hours
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Subtask title is required'
      });
    }

    // Verify user has access to parent task
    const parentTask = await db('project_tasks as pt')
      .select(['pt.*', 'pm.role'])
      .leftJoin('project_members as pm', function() {
        this.on('pt.project_id', '=', 'pm.project_id')
          .andOn('pm.user_id', '=', db.raw('?', [req.user.id]));
      })
      .where('pt.id', taskId)
      .first();

    if (!parentTask) {
      return res.status(404).json({
        success: false,
        error: 'Parent task not found'
      });
    }

    const subtask = await db('project_tasks')
      .insert({
        project_id: parentTask.project_id,
        parent_task_id: taskId,
        created_by: req.user.id,
        assigned_to,
        title,
        description,
        priority: priority || 'medium',
        due_date: due_date ? new Date(due_date) : null,
        estimated_hours
      })
      .returning('*');

    res.status(201).json({
      success: true,
      message: 'Subtask created successfully',
      data: subtask[0]
    });
  } catch (error) {
    next(error);
  }
});

// ==================== TASK STATISTICS ====================

// @desc    Get task statistics
// @route   GET /api/project-tasks/:taskId/stats
// @access  Private
router.get('/:taskId/stats', protect, async (req, res, next) => {
  try {
    const { taskId } = req.params;

    // Verify user has access to task
    const task = await db('project_tasks as pt')
      .select(['pt.*', 'pm.role'])
      .leftJoin('project_members as pm', function() {
        this.on('pt.project_id', '=', 'pm.project_id')
          .andOn('pm.user_id', '=', db.raw('?', [req.user.id]));
      })
      .where('pt.id', taskId)
      .first();

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    const [
      commentsCount,
      subtasksCount,
      completedSubtasksCount,
      timeSpent
    ] = await Promise.all([
      db('task_comments').where({ task_id: taskId }).count('* as count').first(),
      db('project_tasks').where({ parent_task_id: taskId }).count('* as count').first(),
      db('project_tasks').where({ parent_task_id: taskId, status: 'done' }).count('* as count').first(),
      db('project_tasks').where({ id: taskId }).select('actual_hours').first()
    ]);

    const subtaskCompletionRate = subtasksCount.count > 0 ? 
      (completedSubtasksCount.count / subtasksCount.count * 100).toFixed(1) : 0;

    res.status(200).json({
      success: true,
      data: {
        comments_count: parseInt(commentsCount.count),
        subtasks_count: parseInt(subtasksCount.count),
        completed_subtasks_count: parseInt(completedSubtasksCount.count),
        subtask_completion_rate: parseFloat(subtaskCompletionRate),
        time_spent_hours: task.actual_hours || 0,
        estimated_hours: task.estimated_hours || 0
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
