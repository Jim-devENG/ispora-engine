/**
 * Reaction Controller
 * Phase 3: Reaction management endpoints
 */

const reactionService = require('../services/reactionService');
const logger = require('../utils/logger');

/**
 * POST /api/v1/reactions
 * Add or update a reaction
 */
const addReaction = async (req, res) => {
  try {
    const { targetType, targetId, reactionType } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!targetType || !targetId || !reactionType) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        code: 'INVALID_PAYLOAD',
        message: 'Target type, target ID, and reaction type are required.'
      });
    }

    // Validate enums
    if (!['project', 'update', 'post', 'comment', 'task'].includes(targetType)) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        code: 'INVALID_TARGET_TYPE',
        message: 'Invalid target type. Must be one of: project, update, post, comment, task.'
      });
    }

    if (!['like', 'love', 'celebrate', 'insightful', 'support'].includes(reactionType)) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        code: 'INVALID_REACTION_TYPE',
        message: 'Invalid reaction type. Must be one of: like, love, celebrate, insightful, support.'
      });
    }

    const reaction = await reactionService.addOrUpdateReaction(
      userId.toString(),
      targetType,
      targetId,
      reactionType
    );

    res.status(201).json({
      success: true,
      message: 'Reaction added successfully',
      data: reaction
    });
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('Not found')) {
      return res.status(404).json({
        success: false,
        error: 'Target not found',
        code: 'NOT_FOUND',
        message: error.message || 'The target resource could not be found.'
      });
    }
    logger.error({ error: error.message, userId: req.user._id, body: req.body }, 'Failed to add reaction');
    res.status(500).json({
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR',
      message: 'Failed to add reaction.'
    });
  }
};

/**
 * DELETE /api/v1/reactions
 * Remove a reaction
 */
const removeReaction = async (req, res) => {
  try {
    const { targetType, targetId } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!targetType || !targetId) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        code: 'INVALID_PAYLOAD',
        message: 'Target type and target ID are required.'
      });
    }

    const result = await reactionService.removeReaction(userId.toString(), targetType, targetId);
    res.status(200).json({
      success: true,
      message: 'Reaction removed successfully',
      data: result
    });
  } catch (error) {
    if (error.message === 'Reaction not found') {
      return res.status(404).json({
        success: false,
        error: 'Reaction not found',
        code: 'NOT_FOUND',
        message: 'You have not reacted to this resource.'
      });
    }
    logger.error({ error: error.message, userId: req.user._id, body: req.body }, 'Failed to remove reaction');
    res.status(500).json({
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR',
      message: 'Failed to remove reaction.'
    });
  }
};

/**
 * GET /api/v1/reactions?targetType=&targetId=
 * Get reactions for a target
 */
const getReactions = async (req, res) => {
  try {
    const { targetType, targetId } = req.query;

    if (!targetType || !targetId) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        code: 'INVALID_QUERY',
        message: 'Target type and target ID are required.'
      });
    }

    const viewerId = req.user ? req.user._id.toString() : null;
    const result = await reactionService.getReactions(targetType, targetId, viewerId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    logger.error({ error: error.message, query: req.query }, 'Failed to get reactions');
    res.status(500).json({
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR',
      message: 'Failed to retrieve reactions.'
    });
  }
};

module.exports = {
  addReaction,
  removeReaction,
  getReactions
};

