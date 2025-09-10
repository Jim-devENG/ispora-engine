const express = require('express');
const db = require('../database/connection');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// ==================== STORY VERIFICATION ====================

// @desc    Get stories pending verification
// @route   GET /api/impact/verification/stories
// @access  Private (Admin)
router.get('/stories', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status = 'pending' } = req.query;
    const offset = (page - 1) * limit;

    let query = db('impact_stories as is')
      .select([
        'is.*',
        'u.first_name',
        'u.last_name',
        'u.email',
        'u.avatar_url',
        'p.title as project_title'
      ])
      .leftJoin('users as u', 'is.user_id', 'u.id')
      .leftJoin('projects as p', 'is.project_id', 'p.id');

    if (status === 'pending') {
      query = query.where('is.is_verified', false).andWhere('is.status', 'published');
    } else if (status === 'verified') {
      query = query.where('is.is_verified', true);
    } else if (status === 'all') {
      // Get all stories
    }

    const stories = await query
      .orderBy('is.created_at', 'desc')
      .limit(parseInt(limit))
      .offset(offset);

    const totalCount = await db('impact_stories')
      .where('is_verified', status === 'verified')
      .count('* as count')
      .first();

    res.status(200).json({
      success: true,
      count: stories.length,
      total: parseInt(totalCount.count),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalCount.count / limit)
      },
      data: stories
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Verify impact story
// @route   POST /api/impact/verification/stories/:id/verify
// @access  Private (Admin)
router.post('/stories/:id/verify', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { 
      is_verified, 
      verification_notes, 
      impact_score_adjustment,
      is_featured 
    } = req.body;

    const story = await db('impact_stories')
      .where({ id })
      .first();

    if (!story) {
      return res.status(404).json({
        success: false,
        error: 'Story not found'
      });
    }

    const updateData = {
      is_verified: is_verified !== undefined ? is_verified : true,
      verified_by: req.user.id,
      verified_at: new Date(),
      verification_notes,
      updated_at: new Date()
    };

    if (impact_score_adjustment !== undefined) {
      updateData.impact_score = impact_score_adjustment;
    }

    if (is_featured !== undefined) {
      updateData.is_featured = is_featured;
      if (is_featured) {
        updateData.featured_at = new Date();
      }
    }

    await db('impact_stories')
      .where({ id })
      .update(updateData);

    const updatedStory = await db('impact_stories')
      .where({ id })
      .first();

    // Create feed item for verification
    if (is_verified) {
      await createVerificationFeedItem(story.user_id, {
        type: 'story_verified',
        title: `Story verified: ${story.title}`,
        description: verification_notes,
        related_story_id: id,
        related_project_id: story.project_id
      });
    }

    res.status(200).json({
      success: true,
      message: is_verified ? 'Story verified successfully' : 'Story verification updated',
      data: updatedStory
    });
  } catch (error) {
    next(error);
  }
});

// ==================== METRIC VERIFICATION ====================

// @desc    Get metrics pending verification
// @route   GET /api/impact/verification/metrics
// @access  Private (Admin)
router.get('/metrics', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status = 'pending' } = req.query;
    const offset = (page - 1) * limit;

    let query = db('impact_metrics as im')
      .select([
        'im.*',
        'u.first_name',
        'u.last_name',
        'u.email',
        'p.title as project_title'
      ])
      .leftJoin('users as u', 'im.user_id', 'u.id')
      .leftJoin('projects as p', 'im.project_id', 'p.id');

    if (status === 'pending') {
      query = query.where('im.is_verified', false);
    } else if (status === 'verified') {
      query = query.where('im.is_verified', true);
    }

    const metrics = await query
      .orderBy('im.created_at', 'desc')
      .limit(parseInt(limit))
      .offset(offset);

    const totalCount = await db('impact_metrics')
      .where('is_verified', status === 'verified')
      .count('* as count')
      .first();

    res.status(200).json({
      success: true,
      count: metrics.length,
      total: parseInt(totalCount.count),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalCount.count / limit)
      },
      data: metrics
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Verify impact metric
// @route   POST /api/impact/verification/metrics/:id/verify
// @access  Private (Admin)
router.post('/metrics/:id/verify', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { 
      is_verified, 
      verification_notes,
      impact_score,
      impact_description
    } = req.body;

    const metric = await db('impact_metrics')
      .where({ id })
      .first();

    if (!metric) {
      return res.status(404).json({
        success: false,
        error: 'Metric not found'
      });
    }

    const updateData = {
      is_verified: is_verified !== undefined ? is_verified : true,
      verified_by: req.user.id,
      verified_at: new Date(),
      updated_at: new Date()
    };

    if (verification_notes) {
      updateData.verification_notes = verification_notes;
    }

    if (impact_score !== undefined) {
      updateData.impact_score = impact_score;
    }

    if (impact_description) {
      updateData.impact_description = impact_description;
    }

    await db('impact_metrics')
      .where({ id })
      .update(updateData);

    const updatedMetric = await db('impact_metrics')
      .where({ id })
      .first();

    // Create feed item for verification
    if (is_verified) {
      await createVerificationFeedItem(metric.user_id, {
        type: 'metric_verified',
        title: `Metric verified: ${metric.name}`,
        description: verification_notes,
        related_metric_id: id,
        related_project_id: metric.project_id
      });
    }

    res.status(200).json({
      success: true,
      message: is_verified ? 'Metric verified successfully' : 'Metric verification updated',
      data: updatedMetric
    });
  } catch (error) {
    next(error);
  }
});

// ==================== VERIFICATION DASHBOARD ====================

// @desc    Get verification dashboard
// @route   GET /api/impact/verification/dashboard
// @access  Private (Admin)
router.get('/dashboard', protect, authorize('admin'), async (req, res, next) => {
  try {
    const [
      pendingStories,
      pendingMetrics,
      verifiedStories,
      verifiedMetrics,
      verificationStats,
      recentVerifications
    ] = await Promise.all([
      db('impact_stories').where({ is_verified: false, status: 'published' }).count('* as count').first(),
      db('impact_metrics').where({ is_verified: false }).count('* as count').first(),
      db('impact_stories').where({ is_verified: true }).count('* as count').first(),
      db('impact_metrics').where({ is_verified: true }).count('* as count').first(),
      getVerificationStats(),
      getRecentVerifications()
    ]);

    res.status(200).json({
      success: true,
      data: {
        pending: {
          stories: parseInt(pendingStories.count),
          metrics: parseInt(pendingMetrics.count),
          total: parseInt(pendingStories.count) + parseInt(pendingMetrics.count)
        },
        verified: {
          stories: parseInt(verifiedStories.count),
          metrics: parseInt(verifiedMetrics.count),
          total: parseInt(verifiedStories.count) + parseInt(verifiedMetrics.count)
        },
        stats: verificationStats,
        recent_verifications: recentVerifications
      }
    });
  } catch (error) {
    next(error);
  }
});

// ==================== BULK VERIFICATION ====================

// @desc    Bulk verify stories
// @route   POST /api/impact/verification/stories/bulk-verify
// @access  Private (Admin)
router.post('/stories/bulk-verify', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { story_ids, is_verified = true, verification_notes } = req.body;

    if (!story_ids || !Array.isArray(story_ids) || story_ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Story IDs array is required'
      });
    }

    const updateData = {
      is_verified,
      verified_by: req.user.id,
      verified_at: new Date(),
      verification_notes,
      updated_at: new Date()
    };

    const updatedStories = await db('impact_stories')
      .whereIn('id', story_ids)
      .update(updateData)
      .returning('*');

    res.status(200).json({
      success: true,
      message: `${updatedStories.length} stories ${is_verified ? 'verified' : 'unverified'} successfully`,
      data: {
        updated_count: updatedStories.length,
        stories: updatedStories
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Bulk verify metrics
// @route   POST /api/impact/verification/metrics/bulk-verify
// @access  Private (Admin)
router.post('/metrics/bulk-verify', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { metric_ids, is_verified = true, verification_notes } = req.body;

    if (!metric_ids || !Array.isArray(metric_ids) || metric_ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Metric IDs array is required'
      });
    }

    const updateData = {
      is_verified,
      verified_by: req.user.id,
      verified_at: new Date(),
      verification_notes,
      updated_at: new Date()
    };

    const updatedMetrics = await db('impact_metrics')
      .whereIn('id', metric_ids)
      .update(updateData)
      .returning('*');

    res.status(200).json({
      success: true,
      message: `${updatedMetrics.length} metrics ${is_verified ? 'verified' : 'unverified'} successfully`,
      data: {
        updated_count: updatedMetrics.length,
        metrics: updatedMetrics
      }
    });
  } catch (error) {
    next(error);
  }
});

// ==================== VERIFICATION REPORTS ====================

// @desc    Get verification report
// @route   GET /api/impact/verification/report
// @access  Private (Admin)
router.get('/report', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { period_start, period_end, format = 'json' } = req.query;

    let query = db('impact_stories as is')
      .select([
        'is.*',
        'u.first_name',
        'u.last_name',
        'verifier.first_name as verifier_first_name',
        'verifier.last_name as verifier_last_name'
      ])
      .leftJoin('users as u', 'is.user_id', 'u.id')
      .leftJoin('users as verifier', 'is.verified_by', 'verifier.id')
      .where('is.is_verified', true);

    if (period_start) {
      query = query.where('is.verified_at', '>=', new Date(period_start));
    }
    if (period_end) {
      query = query.where('is.verified_at', '<=', new Date(period_end));
    }

    const verifiedStories = await query.orderBy('is.verified_at', 'desc');

    const verificationSummary = {
      total_verified: verifiedStories.length,
      by_category: {},
      by_verifier: {},
      average_impact_score: 0,
      total_beneficiaries: 0
    };

    // Calculate summary statistics
    verifiedStories.forEach(story => {
      // By category
      if (!verificationSummary.by_category[story.category]) {
        verificationSummary.by_category[story.category] = 0;
      }
      verificationSummary.by_category[story.category]++;

      // By verifier
      const verifierName = story.verifier_first_name ? 
        `${story.verifier_first_name} ${story.verifier_last_name}` : 'Unknown';
      if (!verificationSummary.by_verifier[verifierName]) {
        verificationSummary.by_verifier[verifierName] = 0;
      }
      verificationSummary.by_verifier[verifierName]++;

      // Impact score and beneficiaries
      if (story.impact_score) {
        verificationSummary.average_impact_score += story.impact_score;
      }
      verificationSummary.total_beneficiaries += story.beneficiaries_count || 0;
    });

    if (verifiedStories.length > 0) {
      verificationSummary.average_impact_score = 
        (verificationSummary.average_impact_score / verifiedStories.length).toFixed(1);
    }

    if (format === 'csv') {
      // Generate CSV report
      const csvHeader = 'Title,Category,Author,Verifier,Verified At,Impact Score,Beneficiaries,Verification Notes\n';
      const csvRows = verifiedStories.map(story => 
        `"${story.title}","${story.category}","${story.first_name} ${story.last_name}","${story.verifier_first_name} ${story.verifier_last_name}","${story.verified_at}","${story.impact_score || ''}","${story.beneficiaries_count || 0}","${story.verification_notes || ''}"`
      ).join('\n');
      
      const csv = csvHeader + csvRows;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="verification_report_${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csv);
    } else {
      res.status(200).json({
        success: true,
        data: {
          summary: verificationSummary,
          verified_stories: verifiedStories,
          report_info: {
            generated_at: new Date(),
            period: {
              start: period_start,
              end: period_end
            }
          }
        }
      });
    }
  } catch (error) {
    next(error);
  }
});

// Helper functions
async function createVerificationFeedItem(userId, feedData) {
  try {
    await db('impact_feed').insert({
      user_id: userId,
      ...feedData,
      published_at: new Date()
    });
  } catch (error) {
    console.error('Failed to create verification feed item:', error);
  }
}

async function getVerificationStats() {
  const [
    totalStories,
    verifiedStories,
    totalMetrics,
    verifiedMetrics,
    avgImpactScore
  ] = await Promise.all([
    db('impact_stories').where({ status: 'published' }).count('* as count').first(),
    db('impact_stories').where({ is_verified: true }).count('* as count').first(),
    db('impact_metrics').count('* as count').first(),
    db('impact_metrics').where({ is_verified: true }).count('* as count').first(),
    db('impact_stories').where({ is_verified: true }).avg('impact_score as avg').first()
  ]);

  return {
    stories_verification_rate: totalStories.count > 0 ? 
      (verifiedStories.count / totalStories.count * 100).toFixed(1) : 0,
    metrics_verification_rate: totalMetrics.count > 0 ? 
      (verifiedMetrics.count / totalMetrics.count * 100).toFixed(1) : 0,
    average_verified_impact_score: parseFloat(avgImpactScore.avg) || 0
  };
}

async function getRecentVerifications() {
  const recentStories = await db('impact_stories as is')
    .select([
      'is.title',
      'is.category',
      'is.verified_at',
      'u.first_name',
      'u.last_name',
      'verifier.first_name as verifier_first_name',
      'verifier.last_name as verifier_last_name'
    ])
    .leftJoin('users as u', 'is.user_id', 'u.id')
    .leftJoin('users as verifier', 'is.verified_by', 'verifier.id')
    .where('is.is_verified', true)
    .orderBy('is.verified_at', 'desc')
    .limit(10);

  return recentStories;
}

module.exports = router;
