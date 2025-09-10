const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const db = require('../database/connection');

const router = express.Router();

// @desc    Get notification analytics overview
// @route   GET /api/notification-analytics/overview
// @access  Private
router.get('/overview', protect, async (req, res, next) => {
  try {
    const { period = '30d', user_id } = req.query;

    // Calculate date range based on period
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

    let baseQuery = db('notifications')
      .where('created_at', '>=', startDate);

    // Filter by user if specified (admin only)
    if (user_id && req.user.role === 'admin') {
      baseQuery = baseQuery.where('user_id', user_id);
    } else if (!user_id) {
      baseQuery = baseQuery.where('user_id', req.user.id);
    }

    // Get overall statistics
    const overview = await baseQuery.clone()
      .select(
        db.raw('COUNT(*) as total_notifications'),
        db.raw('COUNT(CASE WHEN read = true THEN 1 END) as read_count'),
        db.raw('COUNT(CASE WHEN read = false THEN 1 END) as unread_count'),
        db.raw('COUNT(CASE WHEN action_required = true THEN 1 END) as action_required_count'),
        db.raw('COUNT(CASE WHEN clicked_at IS NOT NULL THEN 1 END) as clicked_count'),
        db.raw('COUNT(CASE WHEN dismissed_at IS NOT NULL THEN 1 END) as dismissed_count'),
        db.raw('ROUND(AVG(CASE WHEN read_at IS NOT NULL THEN (julianday(read_at) - julianday(created_at)) * 24 * 60 END), 2) as avg_read_time_minutes')
      )
      .first();

    // Get statistics by type
    const byType = await baseQuery.clone()
      .select('type')
      .count('* as count')
      .count(db.raw('CASE WHEN read = true THEN 1 END as read_count'))
      .count(db.raw('CASE WHEN clicked_at IS NOT NULL THEN 1 END as clicked_count'))
      .groupBy('type')
      .orderBy('count', 'desc');

    // Get statistics by priority
    const byPriority = await baseQuery.clone()
      .select('priority')
      .count('* as count')
      .count(db.raw('CASE WHEN read = true THEN 1 END as read_count'))
      .groupBy('priority')
      .orderBy('count', 'desc');

    // Get daily statistics for the period
    const dailyStats = await baseQuery.clone()
      .select(
        db.raw('DATE(created_at) as date'),
        db.raw('COUNT(*) as sent'),
        db.raw('COUNT(CASE WHEN read = true THEN 1 END) as read'),
        db.raw('COUNT(CASE WHEN clicked_at IS NOT NULL THEN 1 END) as clicked')
      )
      .groupBy(db.raw('DATE(created_at)'))
      .orderBy('date', 'asc');

    // Calculate engagement rates
    const engagementRates = {
      read_rate: overview.total_notifications > 0 ? 
        ((overview.read_count / overview.total_notifications) * 100).toFixed(2) : 0,
      click_rate: overview.total_notifications > 0 ? 
        ((overview.clicked_count / overview.total_notifications) * 100).toFixed(2) : 0,
      action_completion_rate: overview.action_required_count > 0 ? 
        ((overview.clicked_count / overview.action_required_count) * 100).toFixed(2) : 0
    };

    res.status(200).json({
      success: true,
      data: {
        period,
        start_date: startDate,
        end_date: now,
        overview: {
          ...overview,
          ...engagementRates
        },
        by_type: byType,
        by_priority: byPriority,
        daily_stats: dailyStats
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get notification analytics for specific notification
// @route   GET /api/notification-analytics/notification/:id
// @access  Private
router.get('/notification/:id', protect, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if user has access to this notification
    const notification = await db('notifications')
      .where({ id })
      .where(function() {
        this.where('user_id', req.user.id)
          .orWhere(req.user.role === 'admin', true);
      })
      .first();

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    // Get analytics events for this notification
    const analytics = await db('notification_analytics')
      .where({ notification_id: id })
      .orderBy('event_timestamp', 'desc');

    // Group analytics by event type
    const analyticsByType = analytics.reduce((acc, event) => {
      if (!acc[event.event_type]) {
        acc[event.event_type] = [];
      }
      acc[event.event_type].push(event);
      return acc;
    }, {});

    // Get summary statistics
    const summary = {
      total_events: analytics.length,
      event_types: Object.keys(analyticsByType),
      first_event: analytics.length > 0 ? analytics[analytics.length - 1].event_timestamp : null,
      last_event: analytics.length > 0 ? analytics[0].event_timestamp : null
    };

    res.status(200).json({
      success: true,
      data: {
        notification_id: id,
        summary,
        analytics_by_type: analyticsByType,
        all_events: analytics
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get user notification preferences analytics
// @route   GET /api/notification-analytics/preferences
// @access  Private
router.get('/preferences', protect, async (req, res, next) => {
  try {
    // Get user preferences
    const user = await db('users')
      .select('preferences')
      .where({ id: req.user.id })
      .first();

    const preferences = user?.preferences?.notifications || {};

    // Get notification statistics by type based on user preferences
    const { period = '30d' } = req.query;
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

    const stats = await db('notifications')
      .where({ user_id: req.user.id })
      .where('created_at', '>=', startDate)
      .select('type')
      .count('* as total')
      .count(db.raw('CASE WHEN read = true THEN 1 END as read'))
      .count(db.raw('CASE WHEN clicked_at IS NOT NULL THEN 1 END as clicked'))
      .groupBy('type');

    // Map preferences to notification types
    const preferenceMapping = {
      'connections': ['connection'],
      'mentorship': ['mentorship'],
      'projects': ['project'],
      'opportunities': ['opportunity'],
      'system': ['system', 'achievement']
    };

    const preferenceStats = Object.keys(preferenceMapping).map(pref => {
      const types = preferenceMapping[pref];
      const typeStats = stats.filter(stat => types.includes(stat.type));
      
      return {
        preference: pref,
        enabled: preferences[pref] || false,
        types: types,
        total_notifications: typeStats.reduce((sum, stat) => sum + parseInt(stat.total), 0),
        read_count: typeStats.reduce((sum, stat) => sum + parseInt(stat.read), 0),
        clicked_count: typeStats.reduce((sum, stat) => sum + parseInt(stat.clicked), 0)
      };
    });

    res.status(200).json({
      success: true,
      data: {
        period,
        preferences,
        preference_stats: preferenceStats,
        overall_stats: stats
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Track notification event
// @route   POST /api/notification-analytics/track
// @access  Private
router.post('/track', protect, async (req, res, next) => {
  try {
    const {
      notification_id,
      event_type,
      event_data,
      user_agent,
      ip_address
    } = req.body;

    // Validate required fields
    if (!notification_id || !event_type) {
      return res.status(400).json({
        success: false,
        error: 'notification_id and event_type are required'
      });
    }

    // Verify notification belongs to user
    const notification = await db('notifications')
      .where({ id: notification_id, user_id: req.user.id })
      .first();

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    // Create analytics record
    const analyticsRecord = {
      id: require('uuid').v4(),
      notification_id,
      user_id: req.user.id,
      event_type,
      event_data: event_data ? JSON.stringify(event_data) : null,
      user_agent: user_agent || req.get('User-Agent'),
      ip_address: ip_address || req.ip,
      event_timestamp: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    };

    await db('notification_analytics').insert(analyticsRecord);

    // Update notification based on event type
    const updateData = {};
    
    switch (event_type) {
      case 'read':
        updateData.read = true;
        updateData.read_at = new Date();
        break;
      case 'clicked':
        updateData.clicked_at = new Date();
        updateData.click_count = db.raw('click_count + 1');
        break;
      case 'dismissed':
        updateData.dismissed_at = new Date();
        break;
    }

    if (Object.keys(updateData).length > 0) {
      await db('notifications')
        .where({ id: notification_id })
        .update(updateData);
    }

    res.status(201).json({
      success: true,
      message: 'Event tracked successfully',
      data: analyticsRecord
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get notification performance metrics
// @route   GET /api/notification-analytics/performance
// @access  Private (Admin only)
router.get('/performance', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { period = '30d', group_by = 'type' } = req.query;

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

    let groupByField;
    switch (group_by) {
      case 'type':
        groupByField = 'type';
        break;
      case 'priority':
        groupByField = 'priority';
        break;
      case 'category':
        groupByField = 'category_id';
        break;
      default:
        groupByField = 'type';
    }

    const performance = await db('notifications')
      .where('created_at', '>=', startDate)
      .select(groupByField)
      .count('* as total_sent')
      .count(db.raw('CASE WHEN read = true THEN 1 END as total_read'))
      .count(db.raw('CASE WHEN clicked_at IS NOT NULL THEN 1 END as total_clicked'))
      .count(db.raw('CASE WHEN action_required = true THEN 1 END as total_action_required'))
      .count(db.raw('CASE WHEN action_required = true AND clicked_at IS NOT NULL THEN 1 END as action_completed'))
      .groupBy(groupByField)
      .orderBy('total_sent', 'desc');

    // Calculate performance metrics
    const performanceWithMetrics = performance.map(item => {
      const totalSent = parseInt(item.total_sent);
      const totalRead = parseInt(item.total_read);
      const totalClicked = parseInt(item.total_clicked);
      const totalActionRequired = parseInt(item.total_action_required);
      const actionCompleted = parseInt(item.action_completed);

      return {
        ...item,
        read_rate: totalSent > 0 ? ((totalRead / totalSent) * 100).toFixed(2) : 0,
        click_rate: totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(2) : 0,
        action_completion_rate: totalActionRequired > 0 ? ((actionCompleted / totalActionRequired) * 100).toFixed(2) : 0,
        engagement_score: totalSent > 0 ? (((totalRead + totalClicked) / (totalSent * 2)) * 100).toFixed(2) : 0
      };
    });

    res.status(200).json({
      success: true,
      data: {
        period,
        group_by,
        start_date: startDate,
        end_date: now,
        performance: performanceWithMetrics
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
