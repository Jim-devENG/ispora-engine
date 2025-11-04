/**
 * Reaction Service
 * Phase 3: Reaction management service
 */

const Reaction = require('../models/Reaction');
const Project = require('../models/Project');
const ProjectUpdate = require('../models/ProjectUpdate');
const Task = require('../models/Task');
const logger = require('../utils/logger');

/**
 * Add or update a reaction
 */
const addOrUpdateReaction = async (userId, targetType, targetId, reactionType) => {
  try {
    // Verify target exists
    await verifyTargetExists(targetType, targetId);

    const reaction = await Reaction.findOneAndUpdate(
      { userId, targetType, targetId },
      {
        $set: {
          reactionType,
          createdAt: new Date() // Update timestamp when reaction changes
        }
      },
      { new: true, upsert: true, runValidators: true }
    );

    // Update reaction count on target (async)
    updateReactionCount(targetType, targetId).catch(err => {
      logger.error({ error: err.message }, 'Failed to update reaction count');
    });

    logger.info({ reactionId: reaction._id.toString(), targetType, targetId, reactionType }, 'Reaction added/updated');

    return reaction.toJSON();
  } catch (error) {
    logger.error({ error: error.message, userId, targetType, targetId, reactionType }, 'Failed to add/update reaction');
    throw error;
  }
};

/**
 * Remove a reaction
 */
const removeReaction = async (userId, targetType, targetId) => {
  try {
    const reaction = await Reaction.findOneAndDelete({
      userId,
      targetType,
      targetId
    });

    if (!reaction) {
      throw new Error('Reaction not found');
    }

    // Update reaction count on target (async)
    updateReactionCount(targetType, targetId).catch(err => {
      logger.error({ error: err.message }, 'Failed to update reaction count');
    });

    logger.info({ userId, targetType, targetId }, 'Reaction removed');

    return { success: true, message: 'Reaction removed successfully' };
  } catch (error) {
    logger.error({ error: error.message, userId, targetType, targetId }, 'Failed to remove reaction');
    throw error;
  }
};

/**
 * Get reactions for a target
 */
const getReactions = async (targetType, targetId, viewerId = null) => {
  try {
    const reactions = await Reaction.find({ targetType, targetId })
      .populate('userId', 'name email firstName lastName username avatar')
      .sort({ createdAt: -1 })
      .lean();

    // Count reactions by type
    const counts = reactions.reduce((acc, r) => {
      acc[r.reactionType] = (acc[r.reactionType] || 0) + 1;
      return acc;
    }, {});

    // Find viewer's reaction if provided
    const viewerReaction = viewerId
      ? reactions.find(r => r.userId._id.toString() === viewerId.toString())
      : null;

    return {
      counts,
      total: reactions.length,
      viewerReaction: viewerReaction
        ? {
            reactionType: viewerReaction.reactionType,
            createdAt: viewerReaction.createdAt
          }
        : null,
      reactions: reactions.map(r => ({
        id: r._id.toString(),
        userId: r.userId,
        reactionType: r.reactionType,
        createdAt: r.createdAt
      }))
    };
  } catch (error) {
    logger.error({ error: error.message, targetType, targetId }, 'Failed to get reactions');
    throw error;
  }
};

/**
 * Verify target exists
 */
const verifyTargetExists = async (targetType, targetId) => {
  switch (targetType) {
    case 'project':
      const project = await Project.findById(targetId);
      if (!project) {
        throw new Error('Project not found');
      }
      break;

    case 'update':
      const update = await ProjectUpdate.findById(targetId);
      if (!update) {
        throw new Error('Project update not found');
      }
      break;

    case 'task':
      const task = await Task.findById(targetId);
      if (!task) {
        throw new Error('Task not found');
      }
      break;

    case 'comment':
      const Comment = require('../models/Comment');
      const comment = await Comment.findById(targetId);
      if (!comment) {
        throw new Error('Comment not found');
      }
      break;

    default:
      // For 'post' or other types, assume exists
      break;
  }
};

/**
 * Update reaction count on target (async, fire and forget)
 */
const updateReactionCount = async (targetType, targetId) => {
  try {
    const reactions = await Reaction.find({ targetType, targetId });
    const counts = reactions.reduce((acc, r) => {
      acc[r.reactionType] = (acc[r.reactionType] || 0) + 1;
      return acc;
    }, {});

    // Update parent document if it has reactionCount fields
    switch (targetType) {
      case 'project':
        await Project.findByIdAndUpdate(targetId, {
          $set: {
            reactionCount: reactions.length,
            reactionCounts: counts
          }
        }, { upsert: false });
        break;

      case 'update':
        await ProjectUpdate.findByIdAndUpdate(targetId, {
          $set: {
            reactionCount: reactions.length,
            reactionCounts: counts
          }
        }, { upsert: false });
        break;

      case 'task':
        await Task.findByIdAndUpdate(targetId, {
          $set: {
            reactionCount: reactions.length,
            reactionCounts: counts
          }
        }, { upsert: false });
        break;
    }
  } catch (error) {
    logger.warn({ error: error.message, targetType, targetId }, 'Failed to update reaction count');
  }
};

module.exports = {
  addOrUpdateReaction,
  removeReaction,
  getReactions
};

