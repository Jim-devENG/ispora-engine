/**
 * Notifications Controller (Mongoose)
 * Phase 2: Notifications CRUD + SSE streaming
 */

const Notification = require('../models/Notification');
const notificationService = require('../services/notificationService');
const logger = require('../utils/logger');

/**
 * Get notifications for authenticated user
 * Supports pagination and filtering
 */
const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { read, type } = req.query;

    // Build query
    const query = { userId };

    // Filter by read status
    if (read !== undefined) {
      query.read = read === 'true' || read === true;
    }

    // Filter by type
    if (type) {
      query.type = type;
    }

    // Get notifications with pagination
    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .populate('userId', 'name email firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(query)
    ]);

    // Get unread count
    const unreadCount = await Notification.countDocuments({ userId, read: false });

    logger.info({
      userId: userId.toString(),
      total,
      unreadCount,
      page,
      limit
    }, '✅ Notifications retrieved successfully');

    res.status(200).json({
      success: true,
      data: notifications,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        unreadCount
      }
    });

  } catch (error) {
    logger.error({ error: error.message, userId: req.user._id?.toString() }, '❌ Failed to get notifications');

    res.status(500).json({
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR',
      message: 'Failed to retrieve notifications. Please try again later.'
    });
  }
};

/**
 * Get single notification by ID
 */
const getNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    const notificationId = req.params.id;

    const notification = await Notification.findOne({
      _id: notificationId,
      userId
    })
      .populate('userId', 'name email firstName lastName')
      .lean();

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found',
        code: 'NOT_FOUND',
        message: 'The requested notification could not be found'
      });
    }

    res.status(200).json({
      success: true,
      data: notification
    });

  } catch (error) {
    logger.error({ error: error.message, notificationId: req.params.id }, '❌ Failed to get notification');

    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid notification ID',
        code: 'INVALID_ID',
        message: 'The provided notification ID is invalid'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR',
      message: 'Failed to retrieve notification. Please try again later.'
    });
  }
};

/**
 * Mark notification as read
 */
const markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const notificationId = req.params.id;

    const notification = await notificationService.markAsRead(notificationId, userId);

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });

  } catch (error) {
    logger.error({ error: error.message, notificationId: req.params.id }, '❌ Failed to mark notification as read');

    if (error.message === 'Notification not found') {
      return res.status(404).json({
        success: false,
        error: 'Notification not found',
        code: 'NOT_FOUND',
        message: 'The requested notification could not be found'
      });
    }

    if (error.message === 'Permission denied - notification belongs to another user') {
      return res.status(403).json({
        success: false,
        error: 'Permission denied',
        code: 'FORBIDDEN',
        message: 'You do not have permission to modify this notification'
      });
    }

    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid notification ID',
        code: 'INVALID_ID',
        message: 'The provided notification ID is invalid'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR',
      message: 'Failed to mark notification as read. Please try again later.'
    });
  }
};

/**
 * Mark all notifications as read
 */
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await notificationService.markAllAsRead(userId);

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      data: result
    });

  } catch (error) {
    logger.error({ error: error.message, userId: req.user._id?.toString() }, '❌ Failed to mark all notifications as read');

    res.status(500).json({
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR',
      message: 'Failed to mark all notifications as read. Please try again later.'
    });
  }
};

/**
 * Delete notification
 */
const deleteNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    const notificationId = req.params.id;

    const notification = await Notification.findOne({
      _id: notificationId,
      userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found',
        code: 'NOT_FOUND',
        message: 'The requested notification could not be found'
      });
    }

    await Notification.deleteOne({ _id: notificationId });

    logger.info({ notificationId, userId: userId.toString() }, '✅ Notification deleted successfully');

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    logger.error({ error: error.message, notificationId: req.params.id }, '❌ Failed to delete notification');

    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid notification ID',
        code: 'INVALID_ID',
        message: 'The provided notification ID is invalid'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR',
      message: 'Failed to delete notification. Please try again later.'
    });
  }
};

module.exports = {
  getNotifications,
  getNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification
};

