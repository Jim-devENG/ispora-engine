/**
 * Follow Model (Mongoose)
 * Phase 3: Follow graph for user connections
 */

const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
  follower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Follower ID is required'],
    index: true
  },
  followee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Followee ID is required'],
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: false, // We only use createdAt
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    transform: function(doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Unique compound index: a user can only follow another user once
followSchema.index({ follower: 1, followee: 1 }, { unique: true });

// Prevent self-following
followSchema.pre('save', function(next) {
  if (this.follower.toString() === this.followee.toString()) {
    return next(new Error('Cannot follow yourself'));
  }
  next();
});

// Post-save hook to create notification for followee (Phase 3)
followSchema.post('save', async function(doc) {
  try {
    const notificationService = require('../services/notificationService');
    const User = require('./User');
    const logger = require('../utils/logger');

    // Get follower info
    const follower = await User.findById(doc.follower);
    if (!follower) {
      return;
    }

    const followerName = follower.name || follower.email || 'Someone';

    // Create notification for followee (respects preferences)
    await notificationService.createNotification({
      userId: doc.followee,
      type: 'system',
      title: 'New follower',
      message: `${followerName} started following you`,
      relatedId: doc.follower.toString(),
      relatedType: 'User',
      metadata: {
        followerId: doc.follower.toString(),
        followerName
      }
    });

    logger.debug({
      followerId: doc.follower.toString(),
      followeeId: doc.followee.toString()
    }, 'Follow notification created');
  } catch (error) {
    // Log error but don't throw - notification failure shouldn't break follow creation
    const logger = require('../utils/logger');
    logger.error({
      error: error.message,
      followId: doc._id?.toString()
    }, 'Failed to create notification for follow');
  }
});

const Follow = mongoose.model('Follow', followSchema);

module.exports = Follow;

