/**
 * Notification Preferences Controller (Mongoose)
 * Phase 2.1: Notification preferences management
 */

const notificationPreferenceService = require('../services/notificationPreferenceService');
const logger = require('../utils/logger');

/**
 * Get user's notification preferences
 */
const getPreferences = async (req, res) => {
  try {
    const userId = req.user._id;

    const preferences = await notificationPreferenceService.getPreferences(userId);

    res.status(200).json({
      success: true,
      data: preferences
    });

  } catch (error) {
    logger.error({ error: error.message, userId: req.user._id?.toString() }, '❌ Failed to get notification preferences');

    res.status(500).json({
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR',
      message: 'Failed to retrieve notification preferences. Please try again later.'
    });
  }
};

/**
 * Update user's notification preferences
 */
const updatePreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    const preferences = req.body.preferences || req.body;

    // Validate preferences structure
    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        code: 'INVALID_PAYLOAD',
        message: 'Preferences object is required'
      });
    }

    const updatedPreferences = await notificationPreferenceService.setPreferences(userId, preferences);

    res.status(200).json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: updatedPreferences
    });

  } catch (error) {
    logger.error({ error: error.message, userId: req.user._id?.toString() }, '❌ Failed to update notification preferences');

    res.status(500).json({
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR',
      message: 'Failed to update notification preferences. Please try again later.'
    });
  }
};

/**
 * Mute user notifications until a specific date
 */
const muteNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { until } = req.body;

    if (!until) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        code: 'INVALID_PAYLOAD',
        message: 'Until date is required'
      });
    }

    // Validate date
    const untilDate = new Date(until);
    if (isNaN(untilDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        code: 'INVALID_PAYLOAD',
        message: 'Invalid date format. Please provide a valid ISO date string.'
      });
    }

    // Check if date is in the past
    if (untilDate < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        code: 'INVALID_PAYLOAD',
        message: 'Mute date must be in the future'
      });
    }

    const updatedPreferences = await notificationPreferenceService.muteUntil(userId, untilDate);

    res.status(200).json({
      success: true,
      message: `Notifications muted until ${untilDate.toISOString()}`,
      data: updatedPreferences
    });

  } catch (error) {
    logger.error({ error: error.message, userId: req.user._id?.toString() }, '❌ Failed to mute notifications');

    res.status(500).json({
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR',
      message: 'Failed to mute notifications. Please try again later.'
    });
  }
};

module.exports = {
  getPreferences,
  updatePreferences,
  muteNotifications
};

