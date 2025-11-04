/**
 * Profile Service
 * Phase 3: Profile management service
 */

const Profile = require('../models/Profile');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Get profile by user ID or username/handle
 */
const getProfile = async (userIdOrHandle) => {
  try {
    let user;
    
    // Check if it's an ObjectId or username/email
    if (userIdOrHandle.match(/^[0-9a-fA-F]{24}$/)) {
      // It's an ObjectId
      user = await User.findById(userIdOrHandle);
    } else {
      // It's a username or email
      user = await User.findOne({
        $or: [
          { username: userIdOrHandle },
          { email: userIdOrHandle }
        ]
      });
    }

    if (!user) {
      throw new Error('User not found');
    }

    let profile = await Profile.findOne({ userId: user._id })
      .populate('userId', 'name email firstName lastName username avatar');

    // If profile doesn't exist, create a default one
    if (!profile) {
      profile = await Profile.create({
        userId: user._id,
        displayName: user.name || user.firstName || user.email,
        visibility: 'public'
      });
      await profile.populate('userId', 'name email firstName lastName username avatar');
    }

    return profile.toJSON();
  } catch (error) {
    logger.error({ error: error.message, userIdOrHandle }, 'Failed to get profile');
    throw error;
  }
};

/**
 * Update profile for a user
 */
const updateProfile = async (userId, payload) => {
  try {
    const updateData = {
      ...payload,
      updatedAt: new Date()
    };

    const profile = await Profile.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    ).populate('userId', 'name email firstName lastName username avatar');

    return profile.toJSON();
  } catch (error) {
    logger.error({ error: error.message, userId, payload }, 'Failed to update profile');
    throw error;
  }
};

/**
 * Search profiles
 */
const searchProfiles = async (query, options = {}) => {
  try {
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 20;
    const skip = (page - 1) * limit;

    let searchQuery = { visibility: 'public' };

    if (query && query.trim().length > 0) {
      // Text search on displayName, bio, title
      searchQuery.$or = [
        { displayName: { $regex: query, $options: 'i' } },
        { bio: { $regex: query, $options: 'i' } },
        { title: { $regex: query, $options: 'i' } },
        { skills: { $in: [new RegExp(query, 'i')] } }
      ];
    }

    const profiles = await Profile.find(searchQuery)
      .populate('userId', 'name email firstName lastName username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Profile.countDocuments(searchQuery);

    return {
      profiles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error({ error: error.message, query, options }, 'Failed to search profiles');
    throw error;
  }
};

module.exports = {
  getProfile,
  updateProfile,
  searchProfiles
};

