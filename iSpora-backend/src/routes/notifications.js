const express = require('express');
const { protect } = require('../middleware/auth');
const db = require('../database/connection');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      read,
      priority,
      category_id,
      action_required,
      related_entity_type,
      related_entity_id,
      search,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    const offset = (page - 1) * limit;
    
    let query = db('notifications as n')
      .select([
        'n.*',
        'related_user.first_name as related_user_first_name',
        'related_user.last_name as related_user_last_name',
        'related_user.avatar_url as related_user_avatar',
        'related_project.title as related_project_title',
        'nc.name as category_name',
        'nc.display_name as category_display_name',
        'nc.color as category_color',
        'nt.name as template_name'
      ])
      .leftJoin('users as related_user', 'n.related_user_id', 'related_user.id')
      .leftJoin('projects as related_project', 'n.related_project_id', 'related_project.id')
      .leftJoin('notification_categories as nc', 'n.category_id', 'nc.id')
      .leftJoin('notification_templates as nt', 'n.template_id', 'nt.id')
      .where('n.user_id', req.user.id)
      .where('n.is_archived', false);

    // Apply filters
    if (type) {
      query = query.where('n.type', type);
    }

    if (read !== undefined) {
      query = query.where('n.read', read === 'true');
    }

    if (priority) {
      query = query.where('n.priority', priority);
    }

    if (category_id) {
      query = query.where('n.category_id', category_id);
    }

    if (action_required !== undefined) {
      query = query.where('n.action_required', action_required === 'true');
    }

    if (related_entity_type) {
      query = query.where('n.related_entity_type', related_entity_type);
    }

    if (related_entity_id) {
      query = query.where('n.related_entity_id', related_entity_id);
    }

    if (search) {
      query = query.where(function() {
        this.where('n.title', 'like', `%${search}%`)
          .orWhere('n.message', 'like', `%${search}%`);
      });
    }

    // Filter out expired notifications
    query = query.where(function() {
      this.whereNull('n.expires_at')
        .orWhere('n.expires_at', '>', new Date());
    });

    // Apply sorting
    const validSortFields = ['created_at', 'read', 'priority', 'title'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
    const order = sort_order === 'asc' ? 'asc' : 'desc';
    
    query = query.orderBy(`n.${sortField}`, order);

    const notifications = await query
      .limit(parseInt(limit))
      .offset(offset);

    // Get unread count
    const unreadCount = await db('notifications')
      .where({ user_id: req.user.id, read: false, is_archived: false })
      .where(function() {
        this.whereNull('expires_at')
          .orWhere('expires_at', '>', new Date());
      })
      .count('* as count')
      .first();

    // Get action required count
    const actionRequiredCount = await db('notifications')
      .where({ user_id: req.user.id, action_required: true, read: false, is_archived: false })
      .where(function() {
        this.whereNull('expires_at')
          .orWhere('expires_at', '>', new Date());
      })
      .count('* as count')
      .first();

    res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount: unreadCount.count,
      actionRequiredCount: actionRequiredCount.count,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
router.put('/:id/read', protect, async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await db('notifications')
      .where({ id, user_id: req.user.id })
      .first();

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    await db('notifications')
      .where({ id })
      .update({ read: true, updated_at: new Date() });

    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
router.put('/read-all', protect, async (req, res, next) => {
  try {
    await db('notifications')
      .where({ user_id: req.user.id, read: false })
      .update({ read: true, updated_at: new Date() });

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await db('notifications')
      .where({ id, user_id: req.user.id })
      .first();

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    await db('notifications')
      .where({ id })
      .del();

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create notification (Internal use)
// @route   POST /api/notifications
// @access  Private (Internal)
const createNotification = async (notificationData) => {
  try {
    const notification = {
      id: uuidv4(),
      ...notificationData,
      created_at: new Date(),
      updated_at: new Date()
    };

    await db('notifications').insert(notification);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// @desc    Get notification settings
// @route   GET /api/notifications/settings
// @access  Private
router.get('/settings', protect, async (req, res, next) => {
  try {
    // Get user preferences from users table
    const user = await db('users')
      .select('preferences')
      .where({ id: req.user.id })
      .first();

    const defaultSettings = {
      email: {
        connections: true,
        mentorship: true,
        projects: true,
        opportunities: true,
        system: false
      },
      push: {
        connections: true,
        mentorship: true,
        projects: true,
        opportunities: false,
        system: false
      },
      inApp: {
        connections: true,
        mentorship: true,
        projects: true,
        opportunities: true,
        system: true
      }
    };

    const settings = user?.preferences?.notifications || defaultSettings;

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update notification settings
// @route   PUT /api/notifications/settings
// @access  Private
router.put('/settings', protect, async (req, res, next) => {
  try {
    const { settings } = req.body;

    // Get current preferences
    const user = await db('users')
      .select('preferences')
      .where({ id: req.user.id })
      .first();

    const currentPreferences = user?.preferences || {};
    const updatedPreferences = {
      ...currentPreferences,
      notifications: settings
    };

    await db('users')
      .where({ id: req.user.id })
      .update({
        preferences: JSON.stringify(updatedPreferences),
        updated_at: new Date()
      });

    res.status(200).json({
      success: true,
      message: 'Notification settings updated successfully',
      data: settings
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Mark notification as clicked
// @route   PUT /api/notifications/:id/click
// @access  Private
router.put('/:id/click', protect, async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await db('notifications')
      .where({ id, user_id: req.user.id })
      .first();

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    await db('notifications')
      .where({ id })
      .update({ 
        clicked_at: new Date(),
        click_count: db.raw('click_count + 1'),
        updated_at: new Date()
      });

    res.status(200).json({
      success: true,
      message: 'Notification click tracked'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Dismiss notification
// @route   PUT /api/notifications/:id/dismiss
// @access  Private
router.put('/:id/dismiss', protect, async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await db('notifications')
      .where({ id, user_id: req.user.id })
      .first();

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    await db('notifications')
      .where({ id })
      .update({ 
        dismissed_at: new Date(),
        updated_at: new Date()
      });

    res.status(200).json({
      success: true,
      message: 'Notification dismissed'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Archive notification
// @route   PUT /api/notifications/:id/archive
// @access  Private
router.put('/:id/archive', protect, async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await db('notifications')
      .where({ id, user_id: req.user.id })
      .first();

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    await db('notifications')
      .where({ id })
      .update({ 
        is_archived: true,
        updated_at: new Date()
      });

    res.status(200).json({
      success: true,
      message: 'Notification archived'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Bulk operations on notifications
// @route   PUT /api/notifications/bulk
// @access  Private
router.put('/bulk', protect, async (req, res, next) => {
  try {
    const { 
      notification_ids, 
      action, 
      filter_criteria 
    } = req.body;

    if (!action) {
      return res.status(400).json({
        success: false,
        error: 'Action is required'
      });
    }

    let query = db('notifications')
      .where('user_id', req.user.id);

    // Apply filter criteria or specific IDs
    if (notification_ids && notification_ids.length > 0) {
      query = query.whereIn('id', notification_ids);
    } else if (filter_criteria) {
      if (filter_criteria.type) {
        query = query.where('type', filter_criteria.type);
      }
      if (filter_criteria.read !== undefined) {
        query = query.where('read', filter_criteria.read);
      }
      if (filter_criteria.priority) {
        query = query.where('priority', filter_criteria.priority);
      }
      if (filter_criteria.category_id) {
        query = query.where('category_id', filter_criteria.category_id);
      }
    } else {
      return res.status(400).json({
        success: false,
        error: 'Either notification_ids or filter_criteria is required'
      });
    }

    const updateData = { updated_at: new Date() };

    switch (action) {
      case 'mark_read':
        updateData.read = true;
        updateData.read_at = new Date();
        break;
      case 'mark_unread':
        updateData.read = false;
        updateData.read_at = null;
        break;
      case 'archive':
        updateData.is_archived = true;
        break;
      case 'unarchive':
        updateData.is_archived = false;
        break;
      case 'dismiss':
        updateData.dismissed_at = new Date();
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid action'
        });
    }

    const affectedRows = await query.update(updateData);

    res.status(200).json({
      success: true,
      message: `${affectedRows} notifications updated`,
      affected_count: affectedRows
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get notification statistics
// @route   GET /api/notifications/stats
// @access  Private
router.get('/stats', protect, async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get overall statistics
    const stats = await db('notifications')
      .where({ user_id: req.user.id })
      .where('created_at', '>=', startDate)
      .select(
        db.raw('COUNT(*) as total_notifications'),
        db.raw('COUNT(CASE WHEN read = true THEN 1 END) as read_count'),
        db.raw('COUNT(CASE WHEN read = false THEN 1 END) as unread_count'),
        db.raw('COUNT(CASE WHEN action_required = true THEN 1 END) as action_required_count'),
        db.raw('COUNT(CASE WHEN clicked_at IS NOT NULL THEN 1 END) as clicked_count'),
        db.raw('COUNT(CASE WHEN dismissed_at IS NOT NULL THEN 1 END) as dismissed_count'),
        db.raw('COUNT(CASE WHEN is_archived = true THEN 1 END) as archived_count')
      )
      .first();

    // Get statistics by type
    const byType = await db('notifications')
      .where({ user_id: req.user.id })
      .where('created_at', '>=', startDate)
      .select('type')
      .count('* as count')
      .count(db.raw('CASE WHEN read = true THEN 1 END as read_count'))
      .count(db.raw('CASE WHEN clicked_at IS NOT NULL THEN 1 END as clicked_count'))
      .groupBy('type')
      .orderBy('count', 'desc');

    // Get statistics by priority
    const byPriority = await db('notifications')
      .where({ user_id: req.user.id })
      .where('created_at', '>=', startDate)
      .select('priority')
      .count('* as count')
      .count(db.raw('CASE WHEN read = true THEN 1 END as read_count'))
      .groupBy('priority')
      .orderBy('count', 'desc');

    // Calculate engagement rates
    const engagementRates = {
      read_rate: stats.total_notifications > 0 ? 
        ((stats.read_count / stats.total_notifications) * 100).toFixed(2) : 0,
      click_rate: stats.total_notifications > 0 ? 
        ((stats.clicked_count / stats.total_notifications) * 100).toFixed(2) : 0,
      action_completion_rate: stats.action_required_count > 0 ? 
        ((stats.clicked_count / stats.action_required_count) * 100).toFixed(2) : 0
    };

    res.status(200).json({
      success: true,
      data: {
        period,
        start_date: startDate,
        end_date: now,
        overview: {
          ...stats,
          ...engagementRates
        },
        by_type: byType,
        by_priority: byPriority
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get archived notifications
// @route   GET /api/notifications/archived
// @access  Private
router.get('/archived', protect, async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      priority,
      category_id
    } = req.query;

    const offset = (page - 1) * limit;
    
    let query = db('notifications as n')
      .select([
        'n.*',
        'related_user.first_name as related_user_first_name',
        'related_user.last_name as related_user_last_name',
        'related_user.avatar_url as related_user_avatar',
        'related_project.title as related_project_title',
        'nc.name as category_name',
        'nc.display_name as category_display_name',
        'nc.color as category_color'
      ])
      .leftJoin('users as related_user', 'n.related_user_id', 'related_user.id')
      .leftJoin('projects as related_project', 'n.related_project_id', 'related_project.id')
      .leftJoin('notification_categories as nc', 'n.category_id', 'nc.id')
      .where('n.user_id', req.user.id)
      .where('n.is_archived', true);

    // Apply filters
    if (type) {
      query = query.where('n.type', type);
    }

    if (priority) {
      query = query.where('n.priority', priority);
    }

    if (category_id) {
      query = query.where('n.category_id', category_id);
    }

    const notifications = await query
      .orderBy('n.created_at', 'desc')
      .limit(parseInt(limit))
      .offset(offset);

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
module.exports.createNotification = createNotification;
