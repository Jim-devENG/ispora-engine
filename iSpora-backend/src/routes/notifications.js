const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// In-memory storage for notifications (replace with database in production)
let notifications = [
  {
    id: '1',
    userId: 'user_001',
    type: 'project',
    title: 'Engineering Mentorship Project',
    description:
      '3 new team members joined your project. Review their profiles and assign them to appropriate tasks.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    read: false,
    actionRequired: true,
    category: 'Project Updates',
    relatedId: 'proj_eng_001',
    relatedType: 'project',
    metadata: {
      participants: 8,
      progress: 65,
      tasksCompleted: 12,
      totalTasks: 18,
      priority: 'high',
      status: 'Active',
    },
    actions: {
      primary: {
        label: 'Review Members',
        action: 'navigate_project',
        params: { projectId: 'proj_eng_001', tab: 'members' },
      },
      secondary: {
        label: 'View Project',
        action: 'navigate_project',
        params: { projectId: 'proj_eng_001' },
      },
    },
  },
  {
    id: '2',
    userId: 'user_001',
    type: 'mentorship',
    title: 'Mentorship Request',
    description:
      'Sarah Johnson from University of Lagos requested mentorship in Software Engineering. She has 2 years of experience and is looking to transition into full-stack development.',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    read: false,
    actionRequired: true,
    category: 'Mentorship',
    relatedId: 'mentee_002',
    relatedType: 'mentorship',
    metadata: {
      location: 'Lagos, Nigeria',
      priority: 'medium',
      company: 'University of Lagos',
    },
    actions: {
      primary: {
        label: 'Review Profile',
        action: 'navigate_mentorship',
        params: { menteeId: 'mentee_002', action: 'review' },
      },
      secondary: {
        label: 'Schedule Call',
        action: 'navigate_mentorship',
        params: { menteeId: 'mentee_002', action: 'schedule' },
      },
    },
  },
];

// Get all notifications for a user
router.get('/', protect, async (req, res) => {
  try {
    const { filter = 'all', page = 1, limit = 20 } = req.query;
    const userId = req.user.id;

    let filteredNotifications = notifications.filter((n) => n.userId === userId);

    // Apply filters
    if (filter === 'unread') {
      filteredNotifications = filteredNotifications.filter((n) => !n.read);
    } else if (filter === 'action-required') {
      filteredNotifications = filteredNotifications.filter((n) => n.actionRequired);
    }

    // Sort by timestamp (newest first)
    filteredNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        notifications: paginatedNotifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredNotifications.length,
          pages: Math.ceil(filteredNotifications.length / limit),
        },
        stats: {
          total: filteredNotifications.length,
          unread: filteredNotifications.filter((n) => !n.read).length,
          actionRequired: filteredNotifications.filter((n) => n.actionRequired).length,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications',
    });
  }
});

// Get notification by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = notifications.find((n) => n.id === id && n.userId === userId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found',
      });
    }

    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error('Error fetching notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notification',
    });
  }
});

// Mark notification as read
router.put('/:id/read', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notificationIndex = notifications.findIndex((n) => n.id === id && n.userId === userId);

    if (notificationIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found',
      });
    }

    notifications[notificationIndex].read = true;

    res.json({
      success: true,
      data: notifications[notificationIndex],
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read',
    });
  }
});

// Mark all notifications as read
router.put('/mark-all-read', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    notifications = notifications.map((n) => (n.userId === userId ? { ...n, read: true } : n));

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark all notifications as read',
    });
  }
});

// Delete notification
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notificationIndex = notifications.findIndex((n) => n.id === id && n.userId === userId);

    if (notificationIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found',
      });
    }

    notifications.splice(notificationIndex, 1);

    res.json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete notification',
    });
  }
});

// Create notification (for system use)
router.post('/', protect, async (req, res) => {
  try {
    const {
      userId,
      type,
      title,
      description,
      category,
      relatedId,
      relatedType,
      metadata,
      actions,
    } = req.body;

    const notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type,
      title,
      description,
      timestamp: new Date().toISOString(),
      read: false,
      actionRequired: false,
      category,
      relatedId,
      relatedType,
      metadata: metadata || {},
      actions: actions || {},
    };

    notifications.push(notification);

    res.status(201).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create notification',
    });
  }
});

// Get notification preferences
router.get('/preferences', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Default preferences (in production, store in database)
    const preferences = {
      projectUpdates: true,
      mentorship: true,
      opportunities: true,
      messages: true,
      projectInvitations: true,
      system: true,
      email: true,
      push: true,
      inApp: true,
    };

    res.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notification preferences',
    });
  }
});

// Update notification preferences
router.put('/preferences', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const preferences = req.body;

    // In production, save to database
    console.log('Updating notification preferences for user:', userId, preferences);

    res.json({
      success: true,
      data: preferences,
      message: 'Notification preferences updated',
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update notification preferences',
    });
  }
});

module.exports = router;
