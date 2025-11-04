/**
 * Admin Insights Controller (Mongoose)
 * Phase 2.1: Admin insights and analytics (trending opportunities, etc.)
 */

const OpportunityMetrics = require('../models/OpportunityMetrics');
const Opportunity = require('../models/Opportunity');
const logger = require('../utils/logger');

/**
 * Get trending opportunities
 * Admin only - returns top opportunities by views/applies
 */
const getTrendingOpportunities = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const days = parseInt(req.query.days) || 7; // Default: last 7 days

    // Calculate date threshold
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    // Aggregate opportunities by metrics
    // Sort by applies first, then views, then last updated
    const trendingMetrics = await OpportunityMetrics.aggregate([
      {
        $match: {
          lastUpdated: { $gte: dateThreshold }
        }
      },
      {
        $sort: {
          applies: -1,
          views: -1,
          lastUpdated: -1
        }
      },
      {
        $limit: limit * 2 // Get more than needed to filter out inactive
      },
      {
        $lookup: {
          from: 'opportunities',
          localField: 'opportunityId',
          foreignField: '_id',
          as: 'opportunity'
        }
      },
      {
        $unwind: {
          path: '$opportunity',
          preserveNullAndEmptyArrays: false // Only include if opportunity exists
        }
      },
      {
        $match: {
          'opportunity.status': 'active', // Only active opportunities
          'opportunity.visibility': 'public'
        }
      },
      {
        $project: {
          opportunityId: 1,
          views: 1,
          applies: 1,
          bookmarks: 1,
          shares: 1,
          lastUpdated: 1,
          'opportunity.title': 1,
          'opportunity.type': 1,
          'opportunity.category': 1,
          'opportunity.organization': 1,
          'opportunity.featured': 1,
          'opportunity.status': 1
        }
      },
      {
        $limit: limit
      }
    ]);

    // Format response
    const formatted = trendingMetrics.map(item => ({
      opportunity: {
        id: item.opportunityId.toString(),
        title: item.opportunity.title,
        type: item.opportunity.type,
        category: item.opportunity.category,
        organization: item.opportunity.organization,
        featured: item.opportunity.featured,
        status: item.opportunity.status
      },
      metrics: {
        views: item.views || 0,
        applies: item.applies || 0,
        bookmarks: item.bookmarks || 0,
        shares: item.shares || 0,
        lastUpdated: item.lastUpdated
      },
      score: (item.applies || 0) * 10 + (item.views || 0) // Simple scoring algorithm
    }));

    // Sort by score (descending)
    formatted.sort((a, b) => b.score - a.score);

    logger.info({
      limit,
      days,
      count: formatted.length,
      adminId: req.user._id?.toString()
    }, '✅ Trending opportunities retrieved');

    res.status(200).json({
      success: true,
      data: formatted,
      meta: {
        limit,
        days,
        total: formatted.length
      }
    });

  } catch (error) {
    logger.error({ error: error.message, adminId: req.user._id?.toString() }, '❌ Failed to get trending opportunities');

    res.status(500).json({
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR',
      message: 'Failed to retrieve trending opportunities. Please try again later.'
    });
  }
};

/**
 * Get opportunity engagement analytics
 * Admin only - detailed metrics for a specific opportunity
 */
const getOpportunityAnalytics = async (req, res) => {
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

    // Get metrics
    const OpportunityMetrics = require('../models/OpportunityMetrics');
    const OpportunityEngagement = require('../models/OpportunityEngagement');

    const metrics = await OpportunityMetrics.findOne({ opportunityId }) || {
      views: 0,
      applies: 0,
      bookmarks: 0,
      shares: 0
    };

    // Get engagement breakdown by type
    const engagementBreakdown = await OpportunityEngagement.aggregate([
      {
        $match: { opportunityId: opportunity._id }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    const breakdown = {
      views: 0,
      applies: 0,
      bookmarks: 0,
      shares: 0
    };

    engagementBreakdown.forEach(item => {
      if (breakdown.hasOwnProperty(item._id)) {
        breakdown[item._id] = item.count;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        opportunity: {
          id: opportunity._id.toString(),
          title: opportunity.title,
          type: opportunity.type,
          status: opportunity.status
        },
        metrics: metrics.toJSON ? metrics.toJSON() : metrics,
        breakdown
      }
    });

  } catch (error) {
    logger.error({ error: error.message, opportunityId: req.params.id }, '❌ Failed to get opportunity analytics');

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
      message: 'Failed to retrieve opportunity analytics. Please try again later.'
    });
  }
};

module.exports = {
  getTrendingOpportunities,
  getOpportunityAnalytics
};

