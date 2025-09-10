const express = require('express');
const db = require('../database/connection');
const { protect } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// @desc    Get current user's complete profile
// @route   GET /api/profile
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const user = await db('users')
      .select([
        'id', 'email', 'first_name', 'last_name', 'username', 'title',
        'company', 'location', 'bio', 'avatar_url', 'linkedin_url',
        'github_url', 'website_url', 'user_type', 'is_online',
        'skills', 'interests', 'education', 'experience', 'preferences',
        'created_at', 'updated_at', 'last_login_at'
      ])
      .where({ id: req.user.id })
      .first();

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get user settings
    const settings = await db('user_settings')
      .where({ user_id: req.user.id })
      .first();

    // Get user stats
    const stats = await getUserStats(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        ...user,
        settings: settings || getDefaultSettings(),
        stats
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
router.put('/', protect, async (req, res, next) => {
  try {
    const allowedFields = [
      'first_name', 'last_name', 'username', 'title', 'company',
      'location', 'bio', 'avatar_url', 'linkedin_url', 'github_url',
      'website_url', 'skills', 'interests', 'education', 'experience'
    ];

    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Check if username is unique
    if (updateData.username) {
      const existingUser = await db('users')
        .where({ username: updateData.username })
        .andWhere('id', '!=', req.user.id)
        .first();

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Username already taken'
        });
      }
    }

    updateData.updated_at = new Date();

    await db('users')
      .where({ id: req.user.id })
      .update(updateData);

    const updatedUser = await db('users')
      .select([
        'id', 'email', 'first_name', 'last_name', 'username', 'title',
        'company', 'location', 'bio', 'avatar_url', 'linkedin_url',
        'github_url', 'website_url', 'user_type', 'is_online',
        'skills', 'interests', 'education', 'experience', 'updated_at'
      ])
      .where({ id: req.user.id })
      .first();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get user profile by username
// @route   GET /api/profile/username/:username
// @access  Public
router.get('/username/:username', async (req, res, next) => {
  try {
    const user = await db('users')
      .select([
        'id', 'first_name', 'last_name', 'username', 'title',
        'company', 'location', 'bio', 'avatar_url', 'linkedin_url',
        'github_url', 'website_url', 'user_type', 'is_online',
        'skills', 'interests', 'education', 'created_at'
      ])
      .where({ username: req.params.username, status: 'active' })
      .first();

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get public stats
    const stats = await getPublicUserStats(user.id);

    res.status(200).json({
      success: true,
      data: {
        ...user,
        stats
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Upload profile avatar
// @route   POST /api/profile/avatar
// @access  Private
router.post('/avatar', protect, async (req, res, next) => {
  try {
    const { avatar_url } = req.body;

    if (!avatar_url) {
      return res.status(400).json({
        success: false,
        error: 'Avatar URL is required'
      });
    }

    await db('users')
      .where({ id: req.user.id })
      .update({
        avatar_url,
        updated_at: new Date()
      });

    res.status(200).json({
      success: true,
      message: 'Avatar updated successfully',
      data: { avatar_url }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get user activity feed
// @route   GET /api/profile/activity
// @access  Private
router.get('/activity', protect, async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const activities = await db('feed_activity as fa')
      .select([
        'fa.*',
        'related_user.first_name as related_user_first_name',
        'related_user.last_name as related_user_last_name',
        'related_user.avatar_url as related_user_avatar',
        'related_project.title as related_project_title'
      ])
      .leftJoin('users as related_user', 'fa.related_user_id', 'related_user.id')
      .leftJoin('projects as related_project', 'fa.related_project_id', 'related_project.id')
      .where('fa.user_id', req.user.id)
      .orderBy('fa.created_at', 'desc')
      .limit(parseInt(limit))
      .offset(offset);

    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get user connections/network
// @route   GET /api/profile/connections
// @access  Private
router.get('/connections', protect, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const offset = (page - 1) * limit;

    let query = db('connections as c')
      .select([
        'u.id', 'u.first_name', 'u.last_name', 'u.username', 'u.title',
        'u.company', 'u.avatar_url', 'u.is_online', 'u.user_type',
        'c.status as connection_status', 'c.type as connection_type',
        'c.created_at as connected_since'
      ])
      .join('users as u', function() {
        this.on('u.id', '=', 'c.connected_user_id');
      })
      .where('c.user_id', req.user.id)
      .andWhere('c.status', 'active');

    if (type) {
      query = query.where('c.type', type);
    }

    const connections = await query
      .limit(parseInt(limit))
      .offset(offset)
      .orderBy('c.created_at', 'desc');

    res.status(200).json({
      success: true,
      count: connections.length,
      data: connections
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get user projects
// @route   GET /api/profile/projects
// @access  Private
router.get('/projects', protect, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    let query = db('projects as p')
      .select([
        'p.*',
        'pm.role as user_role',
        'pm.joined_at'
      ])
      .join('project_members as pm', 'p.id', 'pm.project_id')
      .where('pm.user_id', req.user.id);

    if (status) {
      query = query.where('p.status', status);
    }

    const projects = await query
      .limit(parseInt(limit))
      .offset(offset)
      .orderBy('pm.joined_at', 'desc');

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    next(error);
  }
});

// Helper functions
async function getUserStats(userId) {
  const [
    connectionsCount,
    projectsCount,
    mentorshipsCount,
    opportunitiesCount
  ] = await Promise.all([
    db('connections').where({ user_id: userId, status: 'active' }).count('* as count').first(),
    db('project_members').where({ user_id: userId }).count('* as count').first(),
    db('mentorships').where(function() {
      this.where('mentor_id', userId).orWhere('mentee_id', userId);
    }).andWhere('status', 'active').count('* as count').first(),
    db('opportunities').where({ created_by: userId }).count('* as count').first()
  ]);

  return {
    connections: parseInt(connectionsCount.count),
    projects: parseInt(projectsCount.count),
    mentorships: parseInt(mentorshipsCount.count),
    opportunities: parseInt(opportunitiesCount.count)
  };
}

async function getPublicUserStats(userId) {
  const [
    connectionsCount,
    projectsCount
  ] = await Promise.all([
    db('connections').where({ user_id: userId, status: 'active' }).count('* as count').first(),
    db('project_members').where({ user_id: userId }).count('* as count').first()
  ]);

  return {
    connections: parseInt(connectionsCount.count),
    projects: parseInt(projectsCount.count)
  };
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
    push_opportunities: false
  };
}

module.exports = router;
