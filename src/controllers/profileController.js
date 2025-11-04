/**
 * Profile Controller
 * Phase 3: Profile management endpoints
 */

const profileService = require('../services/profileService');
const logger = require('../utils/logger');

/**
 * GET /api/v1/profile/me
 * Get authenticated user's profile
 */
const getMyProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const profile = await profileService.getProfile(userId.toString());
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    logger.error({ error: error.message, userId: req.user._id }, 'Failed to get my profile');
    res.status(500).json({
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR',
      message: 'Failed to retrieve your profile.'
    });
  }
};

/**
 * GET /api/v1/profile/:userIdOrHandle
 * Get public profile by user ID or handle
 */
const getProfile = async (req, res) => {
  try {
    const { userIdOrHandle } = req.params;
    const profile = await profileService.getProfile(userIdOrHandle);

    // Check visibility (simplified - in production, check privacy settings)
    if (profile.visibility === 'private' && req.user?._id.toString() !== profile.userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Permission denied',
        code: 'FORBIDDEN',
        message: 'This profile is private.'
      });
    }

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        error: 'Profile not found',
        code: 'NOT_FOUND',
        message: 'The requested profile could not be found.'
      });
    }
    logger.error({ error: error.message, userIdOrHandle: req.params.userIdOrHandle }, 'Failed to get profile');
    res.status(500).json({
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR',
      message: 'Failed to retrieve profile.'
    });
  }
};

/**
 * PUT /api/v1/profile
 * Update authenticated user's profile
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const payload = req.body;

    // Validate payload
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        code: 'INVALID_PAYLOAD',
        message: 'Profile data is required.'
      });
    }

    const profile = await profileService.updateProfile(userId.toString(), payload);
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: profile
    });
  } catch (error) {
    logger.error({ error: error.message, userId: req.user._id, body: req.body }, 'Failed to update profile');
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        code: 'VALIDATION_ERROR',
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR',
      message: 'Failed to update profile.'
    });
  }
};

/**
 * GET /api/v1/profile/search?q=&page=&limit=
 * Search profiles
 */
const searchProfiles = async (req, res) => {
  try {
    const query = req.query.q || '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await profileService.searchProfiles(query, { page, limit });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    logger.error({ error: error.message, query: req.query }, 'Failed to search profiles');
    res.status(500).json({
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR',
      message: 'Failed to search profiles.'
    });
  }
};

module.exports = {
  getMyProfile,
  getProfile,
  updateProfile,
  searchProfiles
};

