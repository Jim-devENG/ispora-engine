/**
 * Follow Service
 * Phase 3: Follow graph management service
 */

const Follow = require('../models/Follow');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Follow a user
 */
const follow = async (followerId, followeeId) => {
  try {
    // Check if users exist
    const follower = await User.findById(followerId);
    const followee = await User.findById(followeeId);

    if (!follower || !followee) {
      throw new Error('User not found');
    }

    if (followerId.toString() === followeeId.toString()) {
      throw new Error('Cannot follow yourself');
    }

    // Check if already following
    const existingFollow = await Follow.findOne({ follower: followerId, followee: followeeId });
    if (existingFollow) {
      return existingFollow.toJSON();
    }

    const follow = await Follow.create({
      follower: followerId,
      followee: followeeId
    });

    logger.info({ followerId, followeeId }, 'User followed successfully');

    return follow.toJSON();
  } catch (error) {
    logger.error({ error: error.message, followerId, followeeId }, 'Failed to follow user');
    throw error;
  }
};

/**
 * Unfollow a user
 */
const unfollow = async (followerId, followeeId) => {
  try {
    const follow = await Follow.findOneAndDelete({
      follower: followerId,
      followee: followeeId
    });

    if (!follow) {
      throw new Error('Follow relationship not found');
    }

    logger.info({ followerId, followeeId }, 'User unfollowed successfully');

    return { success: true, message: 'Unfollowed successfully' };
  } catch (error) {
    logger.error({ error: error.message, followerId, followeeId }, 'Failed to unfollow user');
    throw error;
  }
};

/**
 * Get followers of a user
 */
const getFollowers = async (userId, options = {}) => {
  try {
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 20;
    const skip = (page - 1) * limit;

    const follows = await Follow.find({ followee: userId })
      .populate('follower', 'name email firstName lastName username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Follow.countDocuments({ followee: userId });

    return {
      followers: follows.map(f => ({
        id: f._id.toString(),
        user: f.follower,
        createdAt: f.createdAt
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error({ error: error.message, userId, options }, 'Failed to get followers');
    throw error;
  }
};

/**
 * Get users that a user is following
 */
const getFollowing = async (userId, options = {}) => {
  try {
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 20;
    const skip = (page - 1) * limit;

    const follows = await Follow.find({ follower: userId })
      .populate('followee', 'name email firstName lastName username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Follow.countDocuments({ follower: userId });

    return {
      following: follows.map(f => ({
        id: f._id.toString(),
        user: f.followee,
        createdAt: f.createdAt
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error({ error: error.message, userId, options }, 'Failed to get following');
    throw error;
  }
};

/**
 * Check if user A follows user B
 */
const isFollowing = async (followerId, followeeId) => {
  try {
    const follow = await Follow.findOne({ follower: followerId, followee: followeeId });
    return !!follow;
  } catch (error) {
    logger.error({ error: error.message, followerId, followeeId }, 'Failed to check follow status');
    return false;
  }
};

module.exports = {
  follow,
  unfollow,
  getFollowers,
  getFollowing,
  isFollowing
};

