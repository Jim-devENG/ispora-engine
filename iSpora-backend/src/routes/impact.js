const express = require('express');
const db = require('../database/connection');
const { protect, authorize } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// ==================== IMPACT METRICS ====================

// @desc    Get user's impact metrics
// @route   GET /api/impact/metrics
// @access  Private
router.get('/metrics', protect, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, status, project_id } = req.query;
    const offset = (page - 1) * limit;

    let query = db('impact_metrics as im')
      .select([
        'im.*',
        'p.title as project_title',
        'verifier.first_name as verifier_first_name',
        'verifier.last_name as verifier_last_name',
      ])
      .leftJoin('projects as p', 'im.project_id', 'p.id')
      .leftJoin('users as verifier', 'im.verified_by', 'verifier.id')
      .where('im.user_id', req.user.id);

    if (category) query = query.where('im.category', category);
    if (status) query = query.where('im.status', status);
    if (project_id) query = query.where('im.project_id', project_id);

    const metrics = await query
      .orderBy('im.created_at', 'desc')
      .limit(parseInt(limit))
      .offset(offset);

    // Get latest measurements for each metric
    for (let metric of metrics) {
      const latestMeasurement = await db('impact_measurements')
        .where({ metric_id: metric.id })
        .orderBy('measurement_date', 'desc')
        .first();

      metric.latest_measurement = latestMeasurement;
    }

    const totalCount = await db('impact_metrics')
      .where({ user_id: req.user.id })
      .count('* as count')
      .first();

    res.status(200).json({
      success: true,
      count: metrics.length,
      total: parseInt(totalCount.count),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalCount.count / limit),
      },
      data: metrics,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create new impact metric
// @route   POST /api/impact/metrics
// @access  Private
router.post('/metrics', protect, async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      type,
      unit,
      baseline_value,
      target_value,
      project_id,
      measurement_method,
      data_sources,
      tags,
      is_public,
      target_date,
      beneficiaries,
    } = req.body;

    if (!name || !category || !type) {
      return res.status(400).json({
        success: false,
        error: 'Name, category, and type are required',
      });
    }

    const metric = await db('impact_metrics')
      .insert({
        user_id: req.user.id,
        project_id,
        name,
        description,
        category,
        type,
        unit,
        baseline_value,
        target_value,
        measurement_method: JSON.stringify(measurement_method),
        data_sources: JSON.stringify(data_sources),
        tags: JSON.stringify(tags),
        is_public: is_public || false,
        target_date,
        beneficiaries: JSON.stringify(beneficiaries),
      })
      .returning('*');

    // Create feed item
    await createImpactFeedItem(req.user.id, {
      type: 'metric_created',
      title: `Created new impact metric: ${name}`,
      description: description,
      impact_category: category,
      related_metric_id: metric[0].id,
      related_project_id: project_id,
    });

    res.status(201).json({
      success: true,
      message: 'Impact metric created successfully',
      data: metric[0],
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update impact metric
// @route   PUT /api/impact/metrics/:id
// @access  Private
router.put('/metrics/:id', protect, async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const metric = await db('impact_metrics').where({ id, user_id: req.user.id }).first();

    if (!metric) {
      return res.status(404).json({
        success: false,
        error: 'Impact metric not found',
      });
    }

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.user_id;
    delete updateData.created_at;

    // Handle JSON fields
    if (updateData.measurement_method) {
      updateData.measurement_method = JSON.stringify(updateData.measurement_method);
    }
    if (updateData.data_sources) {
      updateData.data_sources = JSON.stringify(updateData.data_sources);
    }
    if (updateData.tags) {
      updateData.tags = JSON.stringify(updateData.tags);
    }
    if (updateData.beneficiaries) {
      updateData.beneficiaries = JSON.stringify(updateData.beneficiaries);
    }

    updateData.updated_at = new Date();

    await db('impact_metrics').where({ id }).update(updateData);

    const updatedMetric = await db('impact_metrics').where({ id }).first();

    res.status(200).json({
      success: true,
      message: 'Impact metric updated successfully',
      data: updatedMetric,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Add measurement to metric
// @route   POST /api/impact/metrics/:id/measurements
// @access  Private
router.post('/metrics/:id/measurements', protect, async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      value,
      unit,
      measurement_date,
      data_source,
      collection_method,
      notes,
      confidence_level,
      data_quality,
      is_estimate,
      margin_of_error,
      context,
      tags,
    } = req.body;

    if (!value || !measurement_date) {
      return res.status(400).json({
        success: false,
        error: 'Value and measurement date are required',
      });
    }

    const metric = await db('impact_metrics').where({ id, user_id: req.user.id }).first();

    if (!metric) {
      return res.status(404).json({
        success: false,
        error: 'Impact metric not found',
      });
    }

    const measurement = await db('impact_measurements')
      .insert({
        metric_id: id,
        user_id: req.user.id,
        value,
        unit: unit || metric.unit,
        measurement_date,
        data_source,
        collection_method,
        notes,
        confidence_level,
        data_quality,
        is_estimate: is_estimate || false,
        margin_of_error,
        context: JSON.stringify(context),
        tags: JSON.stringify(tags),
      })
      .returning('*');

    // Update metric's current value
    await db('impact_metrics').where({ id }).update({
      current_value: value,
      measurement_date,
      updated_at: new Date(),
    });

    // Create feed item
    await createImpactFeedItem(req.user.id, {
      type: 'metric_updated',
      title: `Updated ${metric.name}: ${value} ${metric.unit || ''}`,
      description: notes,
      impact_category: metric.category,
      related_metric_id: id,
      related_project_id: metric.project_id,
      metadata: { value, unit: unit || metric.unit },
    });

    res.status(201).json({
      success: true,
      message: 'Measurement added successfully',
      data: measurement[0],
    });
  } catch (error) {
    next(error);
  }
});

// ==================== IMPACT STORIES ====================

// @desc    Get impact stories
// @route   GET /api/impact/stories
// @access  Public
router.get('/stories', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, user_id, is_featured, is_verified } = req.query;
    const offset = (page - 1) * limit;

    let query = db('impact_stories as is')
      .select([
        'is.*',
        'u.first_name',
        'u.last_name',
        'u.avatar_url',
        'p.title as project_title',
        'verifier.first_name as verifier_first_name',
        'verifier.last_name as verifier_last_name',
      ])
      .leftJoin('users as u', 'is.user_id', 'u.id')
      .leftJoin('projects as p', 'is.project_id', 'p.id')
      .leftJoin('users as verifier', 'is.verified_by', 'verifier.id')
      .where('is.is_public', true)
      .andWhere('is.status', 'published');

    if (category) query = query.where('is.category', category);
    if (user_id) query = query.where('is.user_id', user_id);
    if (is_featured === 'true') query = query.where('is.is_featured', true);
    if (is_verified === 'true') query = query.where('is.is_verified', true);

    const stories = await query
      .orderBy('is.featured_at', 'desc')
      .orderBy('is.published_at', 'desc')
      .limit(parseInt(limit))
      .offset(offset);

    const totalCount = await db('impact_stories')
      .where('is_public', true)
      .andWhere('status', 'published')
      .count('* as count')
      .first();

    res.status(200).json({
      success: true,
      count: stories.length,
      total: parseInt(totalCount.count),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalCount.count / limit),
      },
      data: stories,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create impact story
// @route   POST /api/impact/stories
// @access  Private
router.post('/stories', protect, async (req, res, next) => {
  try {
    const {
      title,
      description,
      summary,
      category,
      location,
      beneficiaries_count,
      impact_score,
      impact_metrics,
      outcomes,
      media_urls,
      featured_image_url,
      project_id,
      story_date,
      tags,
      is_public,
      allow_comments,
    } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        error: 'Title, description, and category are required',
      });
    }

    const story = await db('impact_stories')
      .insert({
        user_id: req.user.id,
        project_id,
        title,
        description,
        summary,
        category,
        location,
        beneficiaries_count: beneficiaries_count || 0,
        impact_score,
        impact_metrics: JSON.stringify(impact_metrics),
        outcomes: JSON.stringify(outcomes),
        media_urls: JSON.stringify(media_urls),
        featured_image_url,
        story_date,
        tags: JSON.stringify(tags),
        is_public: is_public !== false,
        allow_comments: allow_comments !== false,
        status: 'published',
        published_at: new Date(),
      })
      .returning('*');

    // Create feed item
    await createImpactFeedItem(req.user.id, {
      type: 'story_published',
      title: `Published impact story: ${title}`,
      description: summary || description.substring(0, 200),
      impact_category: category,
      related_story_id: story[0].id,
      related_project_id: project_id,
      featured_image_url,
      metadata: { beneficiaries_count, impact_score },
    });

    res.status(201).json({
      success: true,
      message: 'Impact story created successfully',
      data: story[0],
    });
  } catch (error) {
    next(error);
  }
});

// ==================== IMPACT FEED ====================

// @desc    Get impact feed
// @route   GET /api/impact/feed
// @access  Public
router.get('/feed', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, type, is_featured } = req.query;
    const offset = (page - 1) * limit;

    let query = db('impact_feed as if')
      .select([
        'if.*',
        'u.first_name',
        'u.last_name',
        'u.avatar_url',
        'u.user_type',
        'related_user.first_name as related_user_first_name',
        'related_user.last_name as related_user_last_name',
        'related_user.avatar_url as related_user_avatar',
        'p.title as project_title',
      ])
      .leftJoin('users as u', 'if.user_id', 'u.id')
      .leftJoin('users as related_user', 'if.related_user_id', 'related_user.id')
      .leftJoin('projects as p', 'if.related_project_id', 'p.id')
      .where('if.visibility', 'public')
      .andWhere('if.status', 'active');

    if (category) query = query.where('if.impact_category', category);
    if (type) query = query.where('if.type', type);
    if (is_featured === 'true') query = query.where('if.is_featured', true);

    const feedItems = await query
      .orderBy('if.is_featured', 'desc')
      .orderBy('if.published_at', 'desc')
      .limit(parseInt(limit))
      .offset(offset);

    const totalCount = await db('impact_feed')
      .where('visibility', 'public')
      .andWhere('status', 'active')
      .count('* as count')
      .first();

    res.status(200).json({
      success: true,
      count: feedItems.length,
      total: parseInt(totalCount.count),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalCount.count / limit),
      },
      data: feedItems,
    });
  } catch (error) {
    next(error);
  }
});

// ==================== IMPACT ANALYTICS ====================

// @desc    Get impact analytics
// @route   GET /api/impact/analytics
// @access  Private
router.get('/analytics', protect, async (req, res, next) => {
  try {
    const { period_type = 'monthly', period_start, period_end } = req.query;

    // Get user's impact summary
    const impactSummary = await getUserImpactSummary(req.user.id);

    // Get category breakdown
    const categoryBreakdown = await getCategoryBreakdown(req.user.id);

    // Get timeline data
    const timelineData = await getTimelineData(req.user.id, period_type, period_start, period_end);

    // Get recent achievements
    const recentAchievements = await getRecentAchievements(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        summary: impactSummary,
        category_breakdown: categoryBreakdown,
        timeline: timelineData,
        achievements: recentAchievements,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ==================== IMPACT DASHBOARD ====================

// @desc    Get impact dashboard data
// @route   GET /api/impact/dashboard
// @access  Private
router.get('/dashboard', protect, async (req, res, next) => {
  try {
    const [
      totalMetrics,
      activeMetrics,
      totalStories,
      verifiedStories,
      totalBeneficiaries,
      averageImpactScore,
      recentActivity,
      topCategories,
    ] = await Promise.all([
      db('impact_metrics').where({ user_id: req.user.id }).count('* as count').first(),
      db('impact_metrics')
        .where({ user_id: req.user.id, status: 'active' })
        .count('* as count')
        .first(),
      db('impact_stories').where({ user_id: req.user.id }).count('* as count').first(),
      db('impact_stories')
        .where({ user_id: req.user.id, is_verified: true })
        .count('* as count')
        .first(),
      db('impact_stories')
        .where({ user_id: req.user.id })
        .sum('beneficiaries_count as total')
        .first(),
      db('impact_stories').where({ user_id: req.user.id }).avg('impact_score as avg').first(),
      getRecentImpactActivity(req.user.id),
      getTopImpactCategories(req.user.id),
    ]);

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          total: parseInt(totalMetrics.count),
          active: parseInt(activeMetrics.count),
          completed: parseInt(totalMetrics.count) - parseInt(activeMetrics.count),
        },
        stories: {
          total: parseInt(totalStories.count),
          verified: parseInt(verifiedStories.count),
          verification_rate:
            totalStories.count > 0
              ? ((verifiedStories.count / totalStories.count) * 100).toFixed(1)
              : 0,
        },
        impact: {
          total_beneficiaries: parseInt(totalBeneficiaries.total) || 0,
          average_score: parseFloat(averageImpactScore.avg) || 0,
        },
        recent_activity: recentActivity,
        top_categories: topCategories,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Helper functions
async function createImpactFeedItem(userId, feedData) {
  try {
    await db('impact_feed').insert({
      user_id: userId,
      ...feedData,
      published_at: new Date(),
    });
  } catch (error) {
    console.error('Failed to create impact feed item:', error);
  }
}

async function getUserImpactSummary(userId) {
  const [totalMetrics, totalStories, totalBeneficiaries, averageScore] = await Promise.all([
    db('impact_metrics').where({ user_id: userId }).count('* as count').first(),
    db('impact_stories').where({ user_id: userId }).count('* as count').first(),
    db('impact_stories').where({ user_id: userId }).sum('beneficiaries_count as total').first(),
    db('impact_stories').where({ user_id: userId }).avg('impact_score as avg').first(),
  ]);

  return {
    total_metrics: parseInt(totalMetrics.count),
    total_stories: parseInt(totalStories.count),
    total_beneficiaries: parseInt(totalBeneficiaries.total) || 0,
    average_impact_score: parseFloat(averageScore.avg) || 0,
  };
}

async function getCategoryBreakdown(userId) {
  const breakdown = await db('impact_stories')
    .select('category')
    .count('* as count')
    .sum('beneficiaries_count as beneficiaries')
    .avg('impact_score as avg_score')
    .where({ user_id: userId })
    .groupBy('category');

  return breakdown;
}

async function getTimelineData(userId, periodType, startDate, endDate) {
  // Implementation for timeline data based on period type
  // This would generate time-series data for charts
  return [];
}

async function getRecentAchievements(userId) {
  const achievements = await db('impact_stories')
    .select(['title', 'impact_score', 'beneficiaries_count', 'created_at'])
    .where({ user_id: userId, is_verified: true })
    .orderBy('impact_score', 'desc')
    .limit(5);

  return achievements;
}

async function getRecentImpactActivity(userId) {
  const activity = await db('impact_feed')
    .select(['type', 'title', 'created_at'])
    .where({ user_id: userId })
    .orderBy('created_at', 'desc')
    .limit(10);

  return activity;
}

async function getTopImpactCategories(userId) {
  const categories = await db('impact_stories')
    .select('category')
    .count('* as count')
    .where({ user_id: userId })
    .groupBy('category')
    .orderBy('count', 'desc')
    .limit(5);

  return categories;
}

module.exports = router;
