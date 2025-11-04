/**
 * Follow Controller
 * Phase 3: Follow graph management endpoints
 */

const followService = require('../services/followService');
const notificationService = require('../services/notificationService');
const logger = require('../utils/logger');

/**
 * POST /api/v1/follow
 * Follow a user
 */
const followUser = async (req, res) => {
  try {
    const followerId = req.user._id;
    const { followeeId } = req.body;

    if (!followeeId) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        code: 'INVALID_PAYLOAD',
        message: 'Followee ID is required.'
      });
    }

    const follow = await followService.follow(followerId.toString(), followeeId);

    // Create notification for followee (respects preferences)
    notificationService.createNotification({
      userId: followeeId,
      type: 'system',
      title: 'New follower',
      message: `${req.user.name || req.user.email} started following you`,
      relatedId: followerId.toString(),
      relatedType: 'User',
      metadata: {
        followerId: followerId.toString(),
        followerName: req.user.name || req.user.email
      }
    }).catch(err => {
      logger.warn({ error: err.message }, 'Failed to create follow notification');
    });

    res.status(201).json({
      success: true,
      message: 'Followed successfully',
      data: follow
    });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        code: 'NOT_FOUND',
        message: 'The user you are trying to follow does not exist.'
      });
    }
    if (error.message === 'Cannot follow yourself') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        code: 'INVALID_ACTION',
        message: 'You cannot follow yourself.'
      });
    }
    if (error.message.includes('duplicate') || error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: 'Duplicate follow',
        code: 'DUPLICATE_FOLLOW',
        message: 'You are already following this user.'
      });
    }
    logger.error({ error: error.message, followerId: req.user._id, body: req.body }, 'Failed to follow user');
    res.status(500).json({
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR',
      message: 'Failed to follow user.'
    });
  }
};

/**
 * DELETE /api/v1/follow/:followeeId
 * Unfollow a user
 */
const unfollowUser = async (req, res) => {
  try {
    const followerId = req.user._id;
    const { followeeId } = req.params;

    const result = await followService.unfollow(followerId.toString(), followeeId);
    res.status(200).json({
      success: true,
      message: 'Unfollowed successfully',
      data: result
    });
  } catch (error) {
    if (error.message === 'Follow relationship not found') {
      return res.status(404).json({
        success: false,
        error: 'Follow not found',
        code: 'NOT_FOUND',
        message: 'You are not following this user.'
      });
    }
    logger.error({ error: error.message, followerId: req.user._id, followeeId: req.params.followeeId }, 'Failed to unfollow user');
    res.status(500).json({
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR',
      message: 'Failed to unfollow user.'
    });
  }
};

/**
 * GET /api/v1/follow/:userId/followers?page&limit
 * Get followers of a user
 */
const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await followService.getFollowers(userId, { page, limit });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    logger.error({ error: error.message, userId: req.params.userId, query: req.query }, 'Failed to get followers');
    res.status(500).json({
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR',
      message: 'Failed to retrieve followers.'
    });
  }
};

/**
 * GET /api/v1/follow/:userId/following?page&limit
 * Get users that a user is following
 */
const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await followService.getFollowing(userId, { page, limit });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    logger.error({ error: error.message, userId: req.params.userId, query: req.query }, 'Failed to get following');
    res.status(500).json({
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR',
      message: 'Failed to retrieve following list.'
    });
  }
};

module.exports = {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing
};

