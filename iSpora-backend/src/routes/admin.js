const express = require('express');
const db = require('../database/connection');
const { protect, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Middleware to ensure only admins can access these routes
router.use(protect);
router.use(requireAdmin);

// @desc    Get system statistics
// @route   GET /api/admin/stats
// @access  Admin only
router.get('/stats', async (req, res, next) => {
  try {
    // Get user statistics
    const totalUsers = await db('users').count('id as count').first();
    const activeUsers = await db('users').where('status', 'active').count('id as count').first();
    const newUsersToday = await db('users')
      .whereRaw('DATE(created_at) = CURDATE()')
      .count('id as count')
      .first();

    // Get content statistics
    const totalProjects = await db('projects').count('id as count').first();
    const totalOpportunities = await db('opportunities').count('id as count').first();
    const totalMentorships = await db('mentorship_sessions').count('id as count').first();

    // Get system performance metrics (mock data for now)
    const systemStats = {
      totalUsers: parseInt(totalUsers.count),
      activeUsers: parseInt(activeUsers.count),
      newUsersToday: parseInt(newUsersToday.count),
      totalProjects: parseInt(totalProjects.count),
      totalOpportunities: parseInt(totalOpportunities.count),
      totalMentorships: parseInt(totalMentorships.count),
      systemHealth: 'excellent',
      uptime: '99.9%',
      responseTime: '120ms',
      storageUsed: '2.3GB',
      bandwidthUsed: '15.2GB',
      cpuUsage: '45%',
      memoryUsage: '67%',
      diskUsage: '34%',
      networkLatency: '12ms',
      errorRate: '0.1%',
      requestsPerMinute: 156,
      activeConnections: 89,
    };

    res.json({
      success: true,
      data: systemStats,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system statistics',
      error: error.message,
    });
  }
});

// @desc    Get all users with admin details
// @route   GET /api/admin/users
// @access  Admin only
router.get('/users', async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search, status, role } = req.query;
    const offset = (page - 1) * limit;

    let query = db('users').select([
      'id',
      'first_name',
      'last_name',
      'email',
      'username',
      'user_type',
      'status',
      'avatar_url',
      'created_at',
      'updated_at',
      'last_login',
    ]);

    if (search) {
      query = query.where(function () {
        this.where('first_name', 'like', `%${search}%`)
          .orWhere('last_name', 'like', `%${search}%`)
          .orWhere('email', 'like', `%${search}%`)
          .orWhere('username', 'like', `%${search}%`);
      });
    }

    if (status && status !== 'all') {
      query = query.where('status', status);
    }

    if (role && role !== 'all') {
      query = query.where('user_type', role);
    }

    const users = await query
      .orderBy('created_at', 'desc')
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    // Get additional stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const projectCount = await db('projects')
          .where('creator_id', user.id)
          .count('id as count')
          .first();

        const contributionCount = await db('user_actions')
          .where('user_id', user.id)
          .count('id as count')
          .first();

        return {
          ...user,
          name: `${user.first_name} ${user.last_name}`,
          role: user.user_type,
          projects: parseInt(projectCount.count),
          contributions: parseInt(contributionCount.count),
          joinDate: user.created_at,
          lastActive: user.last_login || user.updated_at,
        };
      }),
    );

    res.json({
      success: true,
      data: usersWithStats,
    });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message,
    });
  }
});

// @desc    Perform user action (suspend, activate, delete, promote)
// @route   POST /api/admin/users/:userId/:action
// @access  Admin only
router.post('/users/:userId/:action', async (req, res, next) => {
  try {
    const { userId, action } = req.params;
    const { reason } = req.body;

    const user = await db('users').where('id', userId).first();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    switch (action) {
      case 'suspend':
        await db('users').where('id', userId).update({
          status: 'suspended',
          updated_at: new Date(),
        });
        break;

      case 'activate':
        await db('users').where('id', userId).update({
          status: 'active',
          updated_at: new Date(),
        });
        break;

      case 'delete':
        await db('users').where('id', userId).del();
        break;

      case 'promote':
        await db('users').where('id', userId).update({
          user_type: 'moderator',
          updated_at: new Date(),
        });
        break;

      case 'demote':
        await db('users').where('id', userId).update({
          user_type: 'user',
          updated_at: new Date(),
        });
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action',
        });
    }

    // Log the admin action
    await db('admin_actions').insert({
      admin_id: req.user.id,
      target_user_id: userId,
      action: action,
      reason: reason || null,
      created_at: new Date(),
    });

    res.json({
      success: true,
      message: `User ${action} successful`,
    });
  } catch (error) {
    console.error('Admin user action error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform user action',
      error: error.message,
    });
  }
});

// @desc    Perform bulk user actions
// @route   POST /api/admin/users/bulk/:action
// @access  Admin only
router.post('/users/bulk/:action', async (req, res, next) => {
  try {
    const { action } = req.params;
    const { userIds, reason } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs are required',
      });
    }

    const updateData = {
      updated_at: new Date(),
    };

    switch (action) {
      case 'suspend':
        updateData.status = 'suspended';
        break;
      case 'activate':
        updateData.status = 'active';
        break;
      case 'delete':
        await db('users').whereIn('id', userIds).del();
        break;
      case 'promote':
        updateData.user_type = 'moderator';
        break;
      case 'demote':
        updateData.user_type = 'user';
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action',
        });
    }

    if (action !== 'delete') {
      await db('users').whereIn('id', userIds).update(updateData);
    }

    // Log the bulk admin action
    await db('admin_actions').insert({
      admin_id: req.user.id,
      target_user_ids: JSON.stringify(userIds),
      action: `bulk_${action}`,
      reason: reason || null,
      created_at: new Date(),
    });

    res.json({
      success: true,
      message: `Bulk ${action} successful for ${userIds.length} users`,
    });
  } catch (error) {
    console.error('Admin bulk action error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk action',
      error: error.message,
    });
  }
});

// @desc    Get reports
// @route   GET /api/admin/reports
// @access  Admin only
router.get('/reports', async (req, res, next) => {
  try {
    const { status = 'pending', priority, type } = req.query;

    let query = db('reports')
      .select([
        'id',
        'type',
        'reporter_id',
        'reported_user_id',
        'reported_content_id',
        'reason',
        'description',
        'priority',
        'status',
        'created_at',
        'resolved_at',
        'resolved_by',
      ])
      .orderBy('created_at', 'desc');

    if (status && status !== 'all') {
      query = query.where('status', status);
    }

    if (priority && priority !== 'all') {
      query = query.where('priority', priority);
    }

    if (type && type !== 'all') {
      query = query.where('type', type);
    }

    const reports = await query;

    // Get reporter and reported user details
    const reportsWithDetails = await Promise.all(
      reports.map(async (report) => {
        const reporter = await db('users')
          .select('first_name', 'last_name', 'email')
          .where('id', report.reporter_id)
          .first();

        const reportedUser = report.reported_user_id
          ? await db('users')
              .select('first_name', 'last_name', 'email')
              .where('id', report.reported_user_id)
              .first()
          : null;

        return {
          ...report,
          reporter: reporter ? `${reporter.first_name} ${reporter.last_name}` : 'Unknown',
          reportedUser: reportedUser
            ? `${reportedUser.first_name} ${reportedUser.last_name}`
            : null,
          content: report.description,
          date: report.created_at,
        };
      }),
    );

    res.json({
      success: true,
      data: reportsWithDetails,
    });
  } catch (error) {
    console.error('Admin reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports',
      error: error.message,
    });
  }
});

// @desc    Handle report action (resolve, dismiss, escalate)
// @route   POST /api/admin/reports/:reportId/:action
// @access  Admin only
router.post('/reports/:reportId/:action', async (req, res, next) => {
  try {
    const { reportId, action } = req.params;
    const { resolution, notes } = req.body;

    const report = await db('reports').where('id', reportId).first();
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    const updateData = {
      updated_at: new Date(),
    };

    switch (action) {
      case 'resolve':
        updateData.status = 'resolved';
        updateData.resolved_at = new Date();
        updateData.resolved_by = req.user.id;
        updateData.resolution = resolution;
        updateData.admin_notes = notes;
        break;

      case 'dismiss':
        updateData.status = 'dismissed';
        updateData.resolved_at = new Date();
        updateData.resolved_by = req.user.id;
        updateData.resolution = 'dismissed';
        updateData.admin_notes = notes;
        break;

      case 'escalate':
        updateData.priority = 'high';
        updateData.escalated_at = new Date();
        updateData.escalated_by = req.user.id;
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action',
        });
    }

    await db('reports').where('id', reportId).update(updateData);

    // Log the admin action
    await db('admin_actions').insert({
      admin_id: req.user.id,
      target_report_id: reportId,
      action: `report_${action}`,
      reason: notes || null,
      created_at: new Date(),
    });

    res.json({
      success: true,
      message: `Report ${action} successful`,
    });
  } catch (error) {
    console.error('Admin report action error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform report action',
      error: error.message,
    });
  }
});

// @desc    Get system logs
// @route   GET /api/admin/logs
// @access  Admin only
router.get('/logs', async (req, res, next) => {
  try {
    const { level, category, limit = 100 } = req.query;

    let query = db('system_logs')
      .select(['id', 'level', 'message', 'category', 'user_id', 'ip_address', 'created_at'])
      .orderBy('created_at', 'desc')
      .limit(parseInt(limit));

    if (level && level !== 'all') {
      query = query.where('level', level);
    }

    if (category && category !== 'all') {
      query = query.where('category', category);
    }

    const logs = await query;

    // Get user details for logs that have user_id
    const logsWithDetails = await Promise.all(
      logs.map(async (log) => {
        let user = null;
        if (log.user_id) {
          user = await db('users')
            .select('first_name', 'last_name', 'email')
            .where('id', log.user_id)
            .first();
        }

        return {
          ...log,
          user: user ? `${user.first_name} ${user.last_name}` : 'system',
          ip: log.ip_address,
          timestamp: log.created_at,
        };
      }),
    );

    res.json({
      success: true,
      data: logsWithDetails,
    });
  } catch (error) {
    console.error('Admin logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system logs',
      error: error.message,
    });
  }
});

module.exports = router;
