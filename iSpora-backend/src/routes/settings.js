const express = require('express');
const db = require('../database/connection');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get user settings
// @route   GET /api/settings
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    let settings = await db('user_settings').where({ user_id: req.user.id }).first();

    if (!settings) {
      // Create default settings if they don't exist
      settings = await createDefaultSettings(req.user.id);
    }

    // Remove user_id from response
    const { user_id, ...settingsData } = settings;

    res.status(200).json({
      success: true,
      data: settingsData,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update user settings
// @route   PUT /api/settings
// @access  Private
router.put('/', protect, async (req, res, next) => {
  try {
    const {
      // Privacy settings
      profile_visibility,
      show_email,
      show_phone,
      show_location,
      show_connections,
      show_activity,

      // Communication settings
      allow_direct_messages,
      allow_connection_requests,
      allow_project_invites,
      allow_opportunity_notifications,

      // Language and region
      language,
      timezone,
      date_format,
      time_format,

      // Theme and display
      theme,
      compact_mode,
      show_online_status,

      // Email preferences
      email_notifications,
      email_weekly_digest,
      email_marketing,

      // Push notification preferences
      push_notifications,
      push_mentorship,
      push_projects,
      push_connections,
      push_opportunities,
    } = req.body;

    const updateData = {};

    // Only update provided fields
    const allowedFields = [
      'profile_visibility',
      'show_email',
      'show_phone',
      'show_location',
      'show_connections',
      'show_activity',
      'allow_direct_messages',
      'allow_connection_requests',
      'allow_project_invites',
      'allow_opportunity_notifications',
      'language',
      'timezone',
      'date_format',
      'time_format',
      'theme',
      'compact_mode',
      'show_online_status',
      'email_notifications',
      'email_weekly_digest',
      'email_marketing',
      'push_notifications',
      'push_mentorship',
      'push_projects',
      'push_connections',
      'push_opportunities',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    updateData.updated_at = new Date();

    // Check if settings exist
    const existingSettings = await db('user_settings').where({ user_id: req.user.id }).first();

    if (existingSettings) {
      await db('user_settings').where({ user_id: req.user.id }).update(updateData);
    } else {
      await db('user_settings').insert({
        user_id: req.user.id,
        ...updateData,
      });
    }

    // Get updated settings
    const updatedSettings = await db('user_settings').where({ user_id: req.user.id }).first();

    const { user_id, ...settingsData } = updatedSettings;

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: settingsData,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update privacy settings
// @route   PUT /api/settings/privacy
// @access  Private
router.put('/privacy', protect, async (req, res, next) => {
  try {
    const {
      profile_visibility,
      show_email,
      show_phone,
      show_location,
      show_connections,
      show_activity,
    } = req.body;

    const updateData = {};

    if (profile_visibility !== undefined) updateData.profile_visibility = profile_visibility;
    if (show_email !== undefined) updateData.show_email = show_email;
    if (show_phone !== undefined) updateData.show_phone = show_phone;
    if (show_location !== undefined) updateData.show_location = show_location;
    if (show_connections !== undefined) updateData.show_connections = show_connections;
    if (show_activity !== undefined) updateData.show_activity = show_activity;

    updateData.updated_at = new Date();

    await updateOrCreateSettings(req.user.id, updateData);

    res.status(200).json({
      success: true,
      message: 'Privacy settings updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update notification settings
// @route   PUT /api/settings/notifications
// @access  Private
router.put('/notifications', protect, async (req, res, next) => {
  try {
    const {
      email_notifications,
      email_weekly_digest,
      email_marketing,
      push_notifications,
      push_mentorship,
      push_projects,
      push_connections,
      push_opportunities,
    } = req.body;

    const updateData = {};

    if (email_notifications !== undefined) updateData.email_notifications = email_notifications;
    if (email_weekly_digest !== undefined) updateData.email_weekly_digest = email_weekly_digest;
    if (email_marketing !== undefined) updateData.email_marketing = email_marketing;
    if (push_notifications !== undefined) updateData.push_notifications = push_notifications;
    if (push_mentorship !== undefined) updateData.push_mentorship = push_mentorship;
    if (push_projects !== undefined) updateData.push_projects = push_projects;
    if (push_connections !== undefined) updateData.push_connections = push_connections;
    if (push_opportunities !== undefined) updateData.push_opportunities = push_opportunities;

    updateData.updated_at = new Date();

    await updateOrCreateSettings(req.user.id, updateData);

    res.status(200).json({
      success: true,
      message: 'Notification settings updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update communication settings
// @route   PUT /api/settings/communication
// @access  Private
router.put('/communication', protect, async (req, res, next) => {
  try {
    const {
      allow_direct_messages,
      allow_connection_requests,
      allow_project_invites,
      allow_opportunity_notifications,
    } = req.body;

    const updateData = {};

    if (allow_direct_messages !== undefined)
      updateData.allow_direct_messages = allow_direct_messages;
    if (allow_connection_requests !== undefined)
      updateData.allow_connection_requests = allow_connection_requests;
    if (allow_project_invites !== undefined)
      updateData.allow_project_invites = allow_project_invites;
    if (allow_opportunity_notifications !== undefined)
      updateData.allow_opportunity_notifications = allow_opportunity_notifications;

    updateData.updated_at = new Date();

    await updateOrCreateSettings(req.user.id, updateData);

    res.status(200).json({
      success: true,
      message: 'Communication settings updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update appearance settings
// @route   PUT /api/settings/appearance
// @access  Private
router.put('/appearance', protect, async (req, res, next) => {
  try {
    const {
      theme,
      compact_mode,
      show_online_status,
      language,
      timezone,
      date_format,
      time_format,
    } = req.body;

    const updateData = {};

    if (theme !== undefined) updateData.theme = theme;
    if (compact_mode !== undefined) updateData.compact_mode = compact_mode;
    if (show_online_status !== undefined) updateData.show_online_status = show_online_status;
    if (language !== undefined) updateData.language = language;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (date_format !== undefined) updateData.date_format = date_format;
    if (time_format !== undefined) updateData.time_format = time_format;

    updateData.updated_at = new Date();

    await updateOrCreateSettings(req.user.id, updateData);

    res.status(200).json({
      success: true,
      message: 'Appearance settings updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Reset settings to default
// @route   POST /api/settings/reset
// @access  Private
router.post('/reset', protect, async (req, res, next) => {
  try {
    const { section } = req.body; // 'all', 'privacy', 'notifications', 'communication', 'appearance'

    if (section === 'all') {
      // Delete existing settings and create new defaults
      await db('user_settings').where({ user_id: req.user.id }).del();

      await createDefaultSettings(req.user.id);
    } else {
      // Reset specific section
      const defaultSettings = getDefaultSettings();
      const updateData = {};

      switch (section) {
        case 'privacy':
          updateData.profile_visibility = defaultSettings.profile_visibility;
          updateData.show_email = defaultSettings.show_email;
          updateData.show_phone = defaultSettings.show_phone;
          updateData.show_location = defaultSettings.show_location;
          updateData.show_connections = defaultSettings.show_connections;
          updateData.show_activity = defaultSettings.show_activity;
          break;
        case 'notifications':
          updateData.email_notifications = defaultSettings.email_notifications;
          updateData.email_weekly_digest = defaultSettings.email_weekly_digest;
          updateData.email_marketing = defaultSettings.email_marketing;
          updateData.push_notifications = defaultSettings.push_notifications;
          updateData.push_mentorship = defaultSettings.push_mentorship;
          updateData.push_projects = defaultSettings.push_projects;
          updateData.push_connections = defaultSettings.push_connections;
          updateData.push_opportunities = defaultSettings.push_opportunities;
          break;
        case 'communication':
          updateData.allow_direct_messages = defaultSettings.allow_direct_messages;
          updateData.allow_connection_requests = defaultSettings.allow_connection_requests;
          updateData.allow_project_invites = defaultSettings.allow_project_invites;
          updateData.allow_opportunity_notifications =
            defaultSettings.allow_opportunity_notifications;
          break;
        case 'appearance':
          updateData.theme = defaultSettings.theme;
          updateData.compact_mode = defaultSettings.compact_mode;
          updateData.show_online_status = defaultSettings.show_online_status;
          updateData.language = defaultSettings.language;
          updateData.timezone = defaultSettings.timezone;
          updateData.date_format = defaultSettings.date_format;
          updateData.time_format = defaultSettings.time_format;
          break;
      }

      updateData.updated_at = new Date();
      await updateOrCreateSettings(req.user.id, updateData);
    }

    res.status(200).json({
      success: true,
      message: `${section === 'all' ? 'All' : section.charAt(0).toUpperCase() + section.slice(1)} settings reset to default`,
    });
  } catch (error) {
    next(error);
  }
});

// Helper functions
async function createDefaultSettings(userId) {
  const defaultSettings = getDefaultSettings();

  const settings = await db('user_settings')
    .insert({
      user_id: userId,
      ...defaultSettings,
    })
    .returning('*');

  return settings[0];
}

async function updateOrCreateSettings(userId, updateData) {
  const existingSettings = await db('user_settings').where({ user_id: userId }).first();

  if (existingSettings) {
    await db('user_settings').where({ user_id: userId }).update(updateData);
  } else {
    await db('user_settings').insert({
      user_id: userId,
      ...getDefaultSettings(),
      ...updateData,
    });
  }
}

function getDefaultSettings() {
  return {
    profile_visibility: true,
    show_email: false,
    show_phone: false,
    show_location: true,
    show_connections: true,
    show_activity: true,
    allow_direct_messages: true,
    allow_connection_requests: true,
    allow_project_invites: true,
    allow_opportunity_notifications: true,
    language: 'en',
    timezone: 'UTC',
    date_format: 'MM/DD/YYYY',
    time_format: '12h',
    theme: 'light',
    compact_mode: false,
    show_online_status: true,
    email_notifications: true,
    email_weekly_digest: true,
    email_marketing: false,
    push_notifications: true,
    push_mentorship: true,
    push_projects: true,
    push_connections: true,
    push_opportunities: false,
  };
}

module.exports = router;
