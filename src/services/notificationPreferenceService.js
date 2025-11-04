/**
 * Notification Preference Service
 * Phase 2.1: Centralized notification preference management
 */

const NotificationPreference = require('../models/NotificationPreference');
const logger = require('../utils/logger');

/**
 * Map notification types to preference categories
 */
const mapNotificationTypeToCategory = (notificationType) => {
  const categoryMap = {
    'project_update': 'project',
    'task_assigned': 'task',
    'task_completed': 'task',
    'task_due_soon': 'task',
    'opportunity_posted': 'opportunity',
    'mention': 'system',
    'comment': 'system',
    'system': 'system'
  };

  return categoryMap[notificationType] || 'system';
};

/**
 * Get user's notification preferences
 * @param {String} userId - User ID
 * @returns {Promise<Object>} User preferences
 */
const getPreferences = async (userId) => {
  try {
    let preference = await NotificationPreference.findOne({ userId });

    // If no preference exists, create default
    if (!preference) {
      preference = await NotificationPreference.getOrCreateDefault(userId);
      logger.info({ userId }, 'Created default notification preferences');
    }

    return preference.toJSON();
  } catch (error) {
    logger.error({ error: error.message, userId }, 'Failed to get notification preferences');
    throw error;
  }
};

/**
 * Set user's notification preferences
 * @param {String} userId - User ID
 * @param {Object} preferences - Preference updates
 * @returns {Promise<Object>} Updated preferences
 */
const setPreferences = async (userId, preferences) => {
  try {
    let preference = await NotificationPreference.findOne({ userId });

    if (!preference) {
      // Create new preference with provided values
      preference = new NotificationPreference({
        userId,
        preferences: {
          categories: {
            project: preferences.categories?.project ?? true,
            task: preferences.categories?.task ?? true,
            opportunity: preferences.categories?.opportunity ?? true,
            system: preferences.categories?.system ?? true
          },
          delivery: {
            realtime: preferences.delivery?.realtime ?? true,
            email: preferences.delivery?.email ?? false
          },
          mutedUntil: preferences.mutedUntil ? new Date(preferences.mutedUntil) : null
        }
      });
    } else {
      // Update existing preference
      if (preferences.categories) {
        if (typeof preferences.categories.project === 'boolean') {
          preference.preferences.categories.project = preferences.categories.project;
        }
        if (typeof preferences.categories.task === 'boolean') {
          preference.preferences.categories.task = preferences.categories.task;
        }
        if (typeof preferences.categories.opportunity === 'boolean') {
          preference.preferences.categories.opportunity = preferences.categories.opportunity;
        }
        if (typeof preferences.categories.system === 'boolean') {
          preference.preferences.categories.system = preferences.categories.system;
        }
      }

      if (preferences.delivery) {
        if (typeof preferences.delivery.realtime === 'boolean') {
          preference.preferences.delivery.realtime = preferences.delivery.realtime;
        }
        if (typeof preferences.delivery.email === 'boolean') {
          preference.preferences.delivery.email = preferences.delivery.email;
        }
      }

      if (preferences.mutedUntil !== undefined) {
        preference.preferences.mutedUntil = preferences.mutedUntil 
          ? new Date(preferences.mutedUntil) 
          : null;
      }
    }

    await preference.save();

    logger.info({ userId }, 'Notification preferences updated');

    return preference.toJSON();
  } catch (error) {
    logger.error({ error: error.message, userId }, 'Failed to set notification preferences');
    throw error;
  }
};

/**
 * Check if delivery is allowed for a notification category
 * Considers mutedUntil, category preferences, and realtime flag
 * @param {String} userId - User ID
 * @param {String} notificationType - Notification type (project_update, task_assigned, etc.)
 * @param {String} deliveryMethod - Delivery method ('realtime' or 'persist')
 * @returns {Promise<Boolean>} True if delivery is allowed
 */
const checkIfDeliveryAllowed = async (userId, notificationType, deliveryMethod = 'realtime') => {
  try {
    const preference = await NotificationPreference.findOne({ userId });

    // If no preference exists, allow delivery (default behavior)
    if (!preference) {
      return true;
    }

    const prefs = preference.preferences;

    // Check if user is muted
    if (prefs.mutedUntil && new Date(prefs.mutedUntil) > new Date()) {
      logger.debug({ userId, mutedUntil: prefs.mutedUntil }, 'User is muted, blocking delivery');
      return false;
    }

    // Map notification type to category
    const category = mapNotificationTypeToCategory(notificationType);

    // Check if category is enabled
    if (!prefs.categories[category]) {
      logger.debug({ userId, category, notificationType }, 'Category disabled, blocking delivery');
      return false;
    }

    // For realtime delivery, check realtime preference
    if (deliveryMethod === 'realtime' && !prefs.delivery.realtime) {
      logger.debug({ userId, notificationType }, 'Realtime delivery disabled, blocking SSE');
      return false;
    }

    // For persist (database), always allow if category is enabled and not muted
    // (persist happens regardless of realtime preference)
    if (deliveryMethod === 'persist') {
      return true;
    }

    // Default: allow delivery
    return true;
  } catch (error) {
    logger.error({ error: error.message, userId, notificationType }, 'Failed to check delivery permission');
    // On error, default to allowing delivery (fail open for user experience)
    return true;
  }
};

/**
 * Mute user notifications until a specific date
 * @param {String} userId - User ID
 * @param {Date|String} untilDate - Date until which to mute notifications
 * @returns {Promise<Object>} Updated preferences
 */
const muteUntil = async (userId, untilDate) => {
  try {
    const preference = await NotificationPreference.findOne({ userId });

    if (!preference) {
      // Create preference with mute
      const newPreference = new NotificationPreference({
        userId,
        preferences: {
          categories: {
            project: true,
            task: true,
            opportunity: true,
            system: true
          },
          delivery: {
            realtime: true,
            email: false
          },
          mutedUntil: new Date(untilDate)
        }
      });
      await newPreference.save();
      logger.info({ userId, mutedUntil: untilDate }, 'Created preferences with mute');
      return newPreference.toJSON();
    }

    preference.preferences.mutedUntil = new Date(untilDate);
    await preference.save();

    logger.info({ userId, mutedUntil: untilDate }, 'User notifications muted');

    return preference.toJSON();
  } catch (error) {
    logger.error({ error: error.message, userId }, 'Failed to mute notifications');
    throw error;
  }
};

module.exports = {
  getPreferences,
  setPreferences,
  checkIfDeliveryAllowed,
  muteUntil,
  mapNotificationTypeToCategory
};

