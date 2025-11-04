/**
 * Opportunity Engagement Controller (Mongoose)
 * Phase 2.1: Opportunity engagement tracking (view/apply/bookmark/share)
 */

const opportunityEngagementService = require('../services/opportunityEngagementService');
const Opportunity = require('../models/Opportunity');
const logger = require('../utils/logger');

/**
 * Record engagement with an opportunity
 * Public route - allows anonymous views (userId can be null)
 */
const recordEngagement = async (req, res) => {
  try {
    const opportunityId = req.params.id;
    const { type, meta = {} } = req.body;

    // Validate engagement type
    const validTypes = ['view', 'apply', 'bookmark', 'share'];
    if (!type || !validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        code: 'INVALID_PAYLOAD',
        message: `Type is required and must be one of: ${validTypes.join(', ')}`
      });
    }

    // Get userId from authenticated user (if present)
    // Anonymous users can still record views and shares
    const userId = req.user ? req.user._id : null;

    // For 'apply' and 'bookmark', require authentication
    if ((type === 'apply' || type === 'bookmark') && !userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'NO_TOKEN',
        message: `${type} requires authentication. Please log in.`
      });
    }

    // Verify opportunity exists
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        error: 'Opportunity not found',
        code: 'NOT_FOUND',
        message: 'The requested opportunity could not be found'
      });
    }

    // Record engagement
    const result = await opportunityEngagementService.recordEngagement(
      opportunityId,
      userId,
      type,
      meta
    );

    logger.info({
      opportunityId,
      userId: userId || 'anonymous',
      type
    }, '✅ Engagement recorded successfully');

    res.status(200).json({
      success: true,
      message: 'Engagement recorded successfully',
      data: {
        engagement: result.engagement,
        metrics: result.metrics
      }
    });

  } catch (error) {
    logger.error({ 
      error: error.message, 
      opportunityId: req.params.id,
      type: req.body?.type 
    }, '❌ Failed to record engagement');

    // Handle specific errors
    if (error.message === 'Opportunity not found') {
      return res.status(404).json({
        success: false,
        error: 'Opportunity not found',
        code: 'NOT_FOUND',
        message: 'The requested opportunity could not be found'
      });
    }

    if (error.message.includes('requires user authentication')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'NO_TOKEN',
        message: error.message
      });
    }

    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid opportunity ID',
        code: 'INVALID_ID',
        message: 'The provided opportunity ID is invalid'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR',
      message: 'Failed to record engagement. Please try again later.'
    });
  }
};

/**
 * Get opportunity metrics
 * Public route
 */
const getMetrics = async (req, res) => {
  try {
    const opportunityId = req.params.id;

    // Verify opportunity exists
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        error: 'Opportunity not found',
        code: 'NOT_FOUND',
        message: 'The requested opportunity could not be found'
      });
    }

    const metrics = await opportunityEngagementService.getMetrics(opportunityId);

    res.status(200).json({
      success: true,
      data: metrics
    });

  } catch (error) {
    logger.error({ error: error.message, opportunityId: req.params.id }, '❌ Failed to get metrics');

    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid opportunity ID',
        code: 'INVALID_ID',
        message: 'The provided opportunity ID is invalid'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR',
      message: 'Failed to retrieve metrics. Please try again later.'
    });
  }
};

/**
 * Remove bookmark (unbookmark)
 * Protected route - requires authentication
 */
const removeBookmark = async (req, res) => {
  try {
    const opportunityId = req.params.id;
    const userId = req.user._id;

    // Verify opportunity exists
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        error: 'Opportunity not found',
        code: 'NOT_FOUND',
        message: 'The requested opportunity could not be found'
      });
    }

    const metrics = await opportunityEngagementService.removeBookmark(opportunityId, userId);

    res.status(200).json({
      success: true,
      message: 'Bookmark removed successfully',
      data: metrics
    });

  } catch (error) {
    logger.error({ error: error.message, opportunityId: req.params.id }, '❌ Failed to remove bookmark');

    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid opportunity ID',
        code: 'INVALID_ID',
        message: 'The provided opportunity ID is invalid'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR',
      message: 'Failed to remove bookmark. Please try again later.'
    });
  }
};

module.exports = {
  recordEngagement,
  getMetrics,
  removeBookmark
};

