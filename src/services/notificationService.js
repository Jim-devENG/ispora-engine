/**
 * Notification Service
 * Phase 2: Centralized notification creation and management
 * Phase 2.1: Enhanced with preference checking
 */

const Notification = require('../models/Notification');
const notificationPreferenceService = require('./notificationPreferenceService');
const logger = require('../utils/logger');

/**
 * Create a notification for a user
 * Phase 2.1: Respects user preferences - persists notification but may skip realtime delivery
 * @param {Object} notificationData - Notification data
 * @param {String} notificationData.userId - User ID to notify
 * @param {String} notificationData.type - Notification type
 * @param {String} notificationData.title - Notification title
 * @param {String} notificationData.message - Notification message
 * @param {String} notificationData.relatedId - Related resource ID (optional)
 * @param {String} notificationData.relatedType - Related resource type (optional)
 * @param {Object} notificationData.metadata - Additional metadata (optional)
 * @param {Boolean} notificationData.skipPreferenceCheck - Skip preference check (default: false)
 * @returns {Promise<Object>} Created notification with deliveryAllowed flag
 */
const createNotification = async (notificationData) => {
  try {
    const {
      userId,
      type,
      title,
      message,
      relatedId = null,
      relatedType = null,
      metadata = {},
      skipPreferenceCheck = false
    } = notificationData;

    // Validate required fields
    if (!userId || !type || !title || !message) {
      logger.warn({ notificationData }, 'Invalid notification data - missing required fields');
      throw new Error('Missing required fields: userId, type, title, message');
    }

    // Phase 2.1: Check if delivery is allowed (realtime)
    let deliveryAllowed = true;
    if (!skipPreferenceCheck) {
      try {
        deliveryAllowed = await notificationPreferenceService.checkIfDeliveryAllowed(
          userId,
          type,
          'realtime'
        );
      } catch (prefError) {
        logger.warn({ error: prefError.message, userId, type }, 'Failed to check preferences, defaulting to allow');
        // Fail open - allow delivery if preference check fails
        deliveryAllowed = true;
      }
    }

    // Phase 2.1: Always persist notification (regardless of preferences)
    // Default behavior: persist even if realtime is disabled
    // This allows users to see notifications later even if they muted realtime
    const notification = new Notification({
      userId,
      type,
      title: title.trim(),
      message: message.trim(),
      relatedId,
      relatedType,
      metadata
    });

    await notification.save();

    logger.info({
      notificationId: notification._id.toString(),
      userId,
      type,
      title,
      deliveryAllowed
    }, `✅ Notification created successfully (realtime: ${deliveryAllowed ? 'enabled' : 'disabled'})`);

    // Return notification with delivery flag
    const notificationJson = notification.toJSON();
    notificationJson.deliveryAllowed = deliveryAllowed;

    return notificationJson;
  } catch (error) {
    logger.error({ error: error.message, notificationData }, '❌ Failed to create notification');
    throw error;
  }
};

/**
 * Create notifications for multiple users
 * Phase 2.1: Respects user preferences for each user
 * @param {Array<String>} userIds - Array of user IDs to notify
 * @param {Object} notificationData - Notification data (same structure as createNotification)
 * @param {Boolean} skipPreferenceCheck - Skip preference check (default: false)
 * @returns {Promise<Array>} Created notifications with deliveryAllowed flags
 */
const createBulkNotifications = async (userIds, notificationData, skipPreferenceCheck = false) => {
  try {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      logger.warn({ userIds }, 'Invalid user IDs for bulk notification');
      return [];
    }

    const notifications = [];
    const allowedForRealtime = []; // Users who should receive realtime notifications

    for (const userId of userIds) {
      try {
        const notification = await createNotification({
          ...notificationData,
          userId,
          skipPreferenceCheck
        });
        
        notifications.push(notification);
        
        // Track users who should receive realtime notifications
        if (notification.deliveryAllowed) {
          allowedForRealtime.push(userId.toString());
        }
      } catch (error) {
        logger.error({ userId, error: error.message }, 'Failed to create notification for user');
        // Continue with other users even if one fails
      }
    }

    logger.info({
      totalUsers: userIds.length,
      createdNotifications: notifications.length,
      realtimeAllowed: allowedForRealtime.length
    }, '✅ Bulk notifications created');

    return {
      notifications,
      allowedForRealtime // Return list of users who should receive realtime notifications
    };
  } catch (error) {
    logger.error({ error: error.message, userIds }, '❌ Failed to create bulk notifications');
    throw error;
  }
};

/**
 * Mark notification as read
 * @param {String} notificationId - Notification ID
 * @param {String} userId - User ID (for authorization)
 * @returns {Promise<Object>} Updated notification
 */
const markAsRead = async (notificationId, userId) => {
  try {
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      throw new Error('Notification not found');
    }

    // Verify user owns this notification
    if (notification.userId.toString() !== userId.toString()) {
      throw new Error('Permission denied - notification belongs to another user');
    }

    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    logger.info({ notificationId, userId }, '✅ Notification marked as read');

    return notification.toJSON();
  } catch (error) {
    logger.error({ notificationId, userId, error: error.message }, '❌ Failed to mark notification as read');
    throw error;
  }
};

/**
 * Mark all notifications as read for a user
 * @param {String} userId - User ID
 * @returns {Promise<Object>} Update result
 */
const markAllAsRead = async (userId) => {
  try {
    const result = await Notification.updateMany(
      { userId, read: false },
      { 
        $set: { 
          read: true, 
          readAt: new Date() 
        } 
      }
    );

    logger.info({ userId, updatedCount: result.modifiedCount }, '✅ All notifications marked as read');

    return {
      success: true,
      updatedCount: result.modifiedCount
    };
  } catch (error) {
    logger.error({ userId, error: error.message }, '❌ Failed to mark all notifications as read');
    throw error;
  }
};

module.exports = {
  createNotification,
  createBulkNotifications,
  markAsRead,
  markAllAsRead,
  // Keep old createNotification signature for backward compatibility
  // Phase 2.1: Returns notification with deliveryAllowed flag
};

