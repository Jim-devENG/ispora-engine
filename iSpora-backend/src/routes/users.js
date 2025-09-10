const express = require('express');
const db = require('../database/connection');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all users
// @route   GET /api/users
// @access  Public
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      userType,
      skills,
      location
    } = req.query;

    const offset = (page - 1) * limit;
    let query = db('users')
      .select([
        'id', 'email', 'first_name', 'last_name', 'username', 'title',
        'company', 'location', 'bio', 'avatar_url', 'linkedin_url',
        'github_url', 'website_url', 'user_type', 'is_online',
        'skills', 'interests', 'created_at'
      ])
      .where({ status: 'active' });

    // Search filter
    if (search) {
      query = query.where(function() {
        this.where('first_name', 'like', `%${search}%`)
          .orWhere('last_name', 'like', `%${search}%`)
          .orWhere('email', 'like', `%${search}%`)
          .orWhere('username', 'like', `%${search}%`)
          .orWhere('title', 'like', `%${search}%`)
          .orWhere('company', 'like', `%${search}%`);
      });
    }

    // User type filter
    if (userType) {
      query = query.where('user_type', userType);
    }

    // Location filter
    if (location) {
      query = query.where('location', 'like', `%${location}%`);
    }

    // Skills filter
    if (skills) {
      const skillsArray = skills.split(',');
      query = query.where(function() {
        skillsArray.forEach(skill => {
          this.orWhere('skills', 'like', `%${skill.trim()}%`);
        });
      });
    }

    // Get total count
    const totalQuery = query.clone();
    const total = await totalQuery.count('* as count').first();
    const totalCount = total.count;

    // Apply pagination
    const users = await query
      .limit(parseInt(limit))
      .offset(offset)
      .orderBy('created_at', 'desc');

    res.status(200).json({
      success: true,
      count: users.length,
      total: totalCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalCount / limit)
      },
      data: users
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Public
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const user = await db('users')
      .select([
        'id', 'email', 'first_name', 'last_name', 'username', 'title',
        'company', 'location', 'bio', 'avatar_url', 'linkedin_url',
        'github_url', 'website_url', 'user_type', 'is_online',
        'skills', 'interests', 'education', 'experience', 'created_at'
      ])
      .where({ id: req.params.id, status: 'active' })
      .first();

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
router.put('/:id', protect, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if user is updating their own profile or is admin
    if (req.user.id !== id && req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this profile'
      });
    }

    const allowedFields = [
      'first_name', 'last_name', 'username', 'title', 'company',
      'location', 'bio', 'avatar_url', 'linkedin_url', 'github_url',
      'website_url', 'skills', 'interests', 'education', 'experience',
      'preferences'
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
        .andWhere('id', '!=', id)
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
      .where({ id })
      .update(updateData);

    const updatedUser = await db('users')
      .select([
        'id', 'email', 'first_name', 'last_name', 'username', 'title',
        'company', 'location', 'bio', 'avatar_url', 'linkedin_url',
        'github_url', 'website_url', 'user_type', 'is_online',
        'skills', 'interests', 'education', 'experience', 'updated_at'
      ])
      .where({ id })
      .first();

    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private
router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await db('users')
      .where({ id })
      .first();

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Soft delete by updating status
    await db('users')
      .where({ id })
      .update({
        status: 'inactive',
        updated_at: new Date()
      });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get user's network/connections
// @route   GET /api/users/:id/network
// @access  Private
router.get('/:id/network', protect, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Get mentorships where user is mentor or mentee
    const connections = await db('mentorships as m')
      .select([
        'u.id', 'u.first_name', 'u.last_name', 'u.username', 'u.title',
        'u.company', 'u.avatar_url', 'u.is_online',
        'm.status as connection_status',
        'm.type as connection_type',
        'm.created_at as connected_since'
      ])
      .join('users as u', function() {
        this.on('u.id', '=', 'm.mentor_id')
          .orOn('u.id', '=', 'm.mentee_id');
      })
      .where(function() {
        this.where('m.mentor_id', id)
          .orWhere('m.mentee_id', id);
      })
      .andWhere('u.id', '!=', id)
      .andWhere('m.status', 'active')
      .limit(parseInt(limit))
      .offset(offset)
      .orderBy('m.created_at', 'desc');

    res.status(200).json({
      success: true,
      count: connections.length,
      data: connections
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
