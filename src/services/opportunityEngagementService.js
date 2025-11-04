/**
 * Opportunity Engagement Service
 * Phase 2.1: Centralized opportunity engagement tracking and metrics
 */

const OpportunityEngagement = require('../models/OpportunityEngagement');
const OpportunityMetrics = require('../models/OpportunityMetrics');
const Opportunity = require('../models/Opportunity');
const logger = require('../utils/logger');

/**
 * Record user engagement with an opportunity
 * @param {String} opportunityId - Opportunity ID
 * @param {String|null} userId - User ID (null for anonymous)
 * @param {String} type - Engagement type ('view', 'apply', 'bookmark', 'share')
 * @param {Object} meta - Additional metadata
 * @returns {Promise<Object>} Engagement record and updated metrics
 */
const recordEngagement = async (opportunityId, userId, type, meta = {}) => {
  try {
    // Validate opportunity exists
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      throw new Error('Opportunity not found');
    }

    // Validate engagement type
    const validTypes = ['view', 'apply', 'bookmark', 'share'];
    if (!validTypes.includes(type)) {
      throw new Error(`Invalid engagement type: ${type}. Must be one of: ${validTypes.join(', ')}`);
    }

    // For 'apply' and 'bookmark', require userId (not anonymous)
    if ((type === 'apply' || type === 'bookmark') && !userId) {
      throw new Error(`${type} requires user authentication`);
    }

    // For 'view', allow anonymous (userId can be null)
    // For 'share', allow anonymous but record userId if present

    let engagement = null;

    // Create engagement record for apply/bookmark (requires userId)
    if ((type === 'apply' || type === 'bookmark') && userId) {
      try {
        // Check if engagement already exists (prevent duplicates for apply/bookmark)
        engagement = await OpportunityEngagement.findOne({
          opportunityId,
          userId,
          type
        });

        if (!engagement) {
          engagement = new OpportunityEngagement({
            opportunityId,
            userId,
            type,
            meta
          });
          await engagement.save();
          logger.info({ opportunityId, userId, type }, 'Engagement recorded');
        } else {
          logger.debug({ opportunityId, userId, type }, 'Engagement already exists');
        }
      } catch (error) {
        // Handle duplicate key error (unique constraint)
        if (error.code === 11000) {
          logger.debug({ opportunityId, userId, type }, 'Engagement already exists (duplicate)');
          engagement = await OpportunityEngagement.findOne({
            opportunityId,
            userId,
            type
          });
        } else {
          throw error;
        }
      }
    }

    // For 'view' and 'share', create engagement if userId is present (optional)
    if ((type === 'view' || type === 'share') && userId) {
      try {
        // For views, allow multiple records (no unique constraint)
        // For shares, allow tracking multiple shares per user
        engagement = new OpportunityEngagement({
          opportunityId,
          userId,
          type,
          meta
        });
        await engagement.save();
        logger.info({ opportunityId, userId, type }, 'Engagement recorded');
      } catch (error) {
        logger.error({ error: error.message, opportunityId, userId, type }, 'Failed to record engagement');
        // Continue even if engagement record fails - metrics should still update
      }
    }

    // Update metrics atomically
    const metrics = await updateMetrics(opportunityId, type);

    logger.info({
      opportunityId,
      userId: userId || 'anonymous',
      type,
      metrics: {
        views: metrics.views,
        applies: metrics.applies,
        bookmarks: metrics.bookmarks,
        shares: metrics.shares
      }
    }, '✅ Engagement recorded and metrics updated');

    return {
      engagement: engagement ? engagement.toJSON() : null,
      metrics: metrics.toJSON()
    };
  } catch (error) {
    logger.error({ error: error.message, opportunityId, userId, type }, 'Failed to record engagement');
    throw error;
  }
};

/**
 * Update opportunity metrics atomically
 * @param {String} opportunityId - Opportunity ID
 * @param {String} type - Engagement type ('view', 'apply', 'bookmark', 'share')
 * @returns {Promise<Object>} Updated metrics
 */
const updateMetrics = async (opportunityId, type) => {
  try {
    // Map engagement type to metric field
    const typeToMetric = {
      'view': 'views',
      'apply': 'applies',
      'bookmark': 'bookmarks',
      'share': 'shares'
    };

    const metricField = typeToMetric[type];
    if (!metricField) {
      throw new Error(`Invalid engagement type for metrics: ${type}`);
    }

    // Use atomic increment
    const metrics = await OpportunityMetrics.incrementMetric(opportunityId, metricField);

    return metrics;
  } catch (error) {
    logger.error({ error: error.message, opportunityId, type }, 'Failed to update metrics');
    throw error;
  }
};

/**
 * Get opportunity metrics
 * @param {String} opportunityId - Opportunity ID
 * @returns {Promise<Object>} Opportunity metrics
 */
const getMetrics = async (opportunityId) => {
  try {
    let metrics = await OpportunityMetrics.findOne({ opportunityId });

    // If no metrics exist, create default
    if (!metrics) {
      metrics = await OpportunityMetrics.getOrCreate(opportunityId);
    }

    return metrics.toJSON();
  } catch (error) {
    logger.error({ error: error.message, opportunityId }, 'Failed to get metrics');
    throw error;
  }
};

/**
 * Remove bookmark engagement (for unbookmark)
 * @param {String} opportunityId - Opportunity ID
 * @param {String} userId - User ID
 * @returns {Promise<Object>} Updated metrics
 */
const removeBookmark = async (opportunityId, userId) => {
  try {
    // Remove engagement record
    await OpportunityEngagement.deleteOne({
      opportunityId,
      userId,
      type: 'bookmark'
    });

    // Decrement metrics atomically
    const metrics = await OpportunityMetrics.decrementMetric(opportunityId, 'bookmarks');

    logger.info({ opportunityId, userId }, 'Bookmark removed and metrics updated');

    return metrics.toJSON();
  } catch (error) {
    logger.error({ error: error.message, opportunityId, userId }, 'Failed to remove bookmark');
    throw error;
  }
};

module.exports = {
  recordEngagement,
  updateMetrics,
  getMetrics,
  removeBookmark
};

