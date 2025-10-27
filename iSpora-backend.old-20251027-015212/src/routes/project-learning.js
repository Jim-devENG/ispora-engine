const express = require('express');
const db = require('../database/connection');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ==================== LEARNING CONTENT MANAGEMENT ====================

// @desc    Create learning content
// @route   POST /api/project-learning/:projectId/content
// @access  Private
router.post('/:projectId/content', protect, async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const {
      title,
      description,
      type,
      category,
      file_url,
      thumbnail_url,
      original_filename,
      mime_type,
      file_size,
      duration_seconds,
      transcript,
      tags,
      is_public,
      requires_completion,
      access_level,
      external_url,
      external_platform,
      external_id,
      parent_content_id,
      folder_path,
    } = req.body;

    if (!title || !type || !category) {
      return res.status(400).json({
        success: false,
        error: 'Title, type, and category are required',
      });
    }

    // Verify user has permission to create content
    const projectAccess = await db('project_members as pm')
      .select(['pm.role'])
      .where({ project_id: projectId, user_id: req.user.id, status: 'active' })
      .first();

    if (!projectAccess || !['admin', 'mentor'].includes(projectAccess.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to create learning content',
      });
    }

    const content = await db('learning_content')
      .insert({
        project_id: projectId,
        created_by: req.user.id,
        title,
        description,
        type,
        category,
        file_url,
        thumbnail_url,
        original_filename,
        mime_type,
        file_size,
        duration_seconds,
        transcript,
        tags: JSON.stringify(tags),
        is_public: is_public || false,
        requires_completion: requires_completion || false,
        access_level: access_level || 1,
        external_url,
        external_platform,
        external_id,
        parent_content_id,
        folder_path,
      })
      .returning('*');

    res.status(201).json({
      success: true,
      message: 'Learning content created successfully',
      data: content[0],
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update learning content
// @route   PUT /api/project-learning/content/:contentId
// @access  Private
router.put('/content/:contentId', protect, async (req, res, next) => {
  try {
    const { contentId } = req.params;
    const updateData = req.body;

    // Verify user has permission to update content
    const content = await db('learning_content as lc')
      .select(['lc.*', 'pm.role'])
      .leftJoin('project_members as pm', function () {
        this.on('lc.project_id', '=', 'pm.project_id').andOn(
          'pm.user_id',
          '=',
          db.raw('?', [req.user.id]),
        );
      })
      .where('lc.id', contentId)
      .first();

    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'Content not found',
      });
    }

    if (content.created_by !== req.user.id && !['admin', 'mentor'].includes(content.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to update this content',
      });
    }

    // Handle JSON fields
    if (updateData.tags) {
      updateData.tags = JSON.stringify(updateData.tags);
    }

    updateData.updated_at = new Date();

    await db('learning_content').where({ id: contentId }).update(updateData);

    const updatedContent = await db('learning_content').where({ id: contentId }).first();

    res.status(200).json({
      success: true,
      message: 'Content updated successfully',
      data: updatedContent,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete learning content
// @route   DELETE /api/project-learning/content/:contentId
// @access  Private
router.delete('/content/:contentId', protect, async (req, res, next) => {
  try {
    const { contentId } = req.params;

    // Verify user has permission to delete content
    const content = await db('learning_content as lc')
      .select(['lc.*', 'pm.role'])
      .leftJoin('project_members as pm', function () {
        this.on('lc.project_id', '=', 'pm.project_id').andOn(
          'pm.user_id',
          '=',
          db.raw('?', [req.user.id]),
        );
      })
      .where('lc.id', contentId)
      .first();

    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'Content not found',
      });
    }

    if (content.created_by !== req.user.id && !['admin', 'mentor'].includes(content.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to delete this content',
      });
    }

    await db('learning_content').where({ id: contentId }).del();

    res.status(200).json({
      success: true,
      message: 'Content deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// ==================== CONTENT PROGRESS ====================

// @desc    Update content progress
// @route   POST /api/project-learning/content/:contentId/progress
// @access  Private
router.post('/content/:contentId/progress', protect, async (req, res, next) => {
  try {
    const { contentId } = req.params;
    const {
      progress_percentage,
      time_spent_seconds,
      is_completed,
      is_bookmarked,
      rating,
      feedback,
      last_position_seconds,
      total_watch_time_seconds,
      play_count,
      notes,
      bookmarks,
      highlights,
    } = req.body;

    // Verify user has access to content
    const content = await db('learning_content as lc')
      .select(['lc.*', 'pm.role'])
      .leftJoin('project_members as pm', function () {
        this.on('lc.project_id', '=', 'pm.project_id').andOn(
          'pm.user_id',
          '=',
          db.raw('?', [req.user.id]),
        );
      })
      .where('lc.id', contentId)
      .first();

    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'Content not found',
      });
    }

    // Check if progress record exists
    const existingProgress = await db('content_progress')
      .where({ content_id: contentId, user_id: req.user.id })
      .first();

    const progressData = {
      content_id: contentId,
      user_id: req.user.id,
      progress_percentage: progress_percentage || 0,
      time_spent_seconds: time_spent_seconds || 0,
      last_accessed_at: new Date(),
      is_completed: is_completed || false,
      is_bookmarked: is_bookmarked || false,
      rating,
      feedback,
      last_position_seconds,
      total_watch_time_seconds,
      play_count,
      notes: JSON.stringify(notes),
      bookmarks: JSON.stringify(bookmarks),
      highlights: JSON.stringify(highlights),
    };

    if (is_completed && !existingProgress?.is_completed) {
      progressData.completed_at = new Date();
    }

    if (!existingProgress?.started_at) {
      progressData.started_at = new Date();
    }

    let progress;
    if (existingProgress) {
      await db('content_progress')
        .where({ content_id: contentId, user_id: req.user.id })
        .update({
          ...progressData,
          updated_at: new Date(),
        });

      progress = await db('content_progress')
        .where({ content_id: contentId, user_id: req.user.id })
        .first();
    } else {
      progress = await db('content_progress').insert(progressData).returning('*');
      progress = progress[0];
    }

    res.status(200).json({
      success: true,
      message: 'Progress updated successfully',
      data: progress,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get user's content progress
// @route   GET /api/project-learning/:projectId/progress
// @access  Private
router.get('/:projectId/progress', protect, async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { content_id } = req.query;

    // Verify user has access to project
    const projectAccess = await db('project_members')
      .where({ project_id: projectId, user_id: req.user.id, status: 'active' })
      .first();

    if (!projectAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this project',
      });
    }

    let query = db('content_progress as cp')
      .select([
        'cp.*',
        'lc.title as content_title',
        'lc.type as content_type',
        'lc.category as content_category',
      ])
      .join('learning_content as lc', 'cp.content_id', 'lc.id')
      .where('cp.user_id', req.user.id)
      .where('lc.project_id', projectId);

    if (content_id) {
      query = query.where('cp.content_id', content_id);
    }

    const progress = await query.orderBy('cp.last_accessed_at', 'desc');

    // Parse JSON fields
    progress.forEach((item) => {
      if (item.notes) {
        item.notes = JSON.parse(item.notes);
      }
      if (item.bookmarks) {
        item.bookmarks = JSON.parse(item.bookmarks);
      }
      if (item.highlights) {
        item.highlights = JSON.parse(item.highlights);
      }
    });

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    next(error);
  }
});

// ==================== CONTENT RATINGS ====================

// @desc    Rate learning content
// @route   POST /api/project-learning/content/:contentId/rate
// @access  Private
router.post('/content/:contentId/rate', protect, async (req, res, next) => {
  try {
    const { contentId } = req.params;
    const { rating, feedback } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5',
      });
    }

    // Verify user has access to content
    const content = await db('learning_content as lc')
      .select(['lc.*', 'pm.role'])
      .leftJoin('project_members as pm', function () {
        this.on('lc.project_id', '=', 'pm.project_id').andOn(
          'pm.user_id',
          '=',
          db.raw('?', [req.user.id]),
        );
      })
      .where('lc.id', contentId)
      .first();

    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'Content not found',
      });
    }

    // Update or create progress record with rating
    const existingProgress = await db('content_progress')
      .where({ content_id: contentId, user_id: req.user.id })
      .first();

    if (existingProgress) {
      await db('content_progress').where({ content_id: contentId, user_id: req.user.id }).update({
        rating,
        feedback,
        updated_at: new Date(),
      });
    } else {
      await db('content_progress').insert({
        content_id: contentId,
        user_id: req.user.id,
        rating,
        feedback,
        last_accessed_at: new Date(),
      });
    }

    // Update content average rating
    const ratingStats = await db('content_progress')
      .where({ content_id: contentId })
      .whereNotNull('rating')
      .select([db.raw('AVG(rating) as avg_rating'), db.raw('COUNT(*) as rating_count')])
      .first();

    await db('learning_content')
      .where({ id: contentId })
      .update({
        average_rating: parseFloat(ratingStats.avg_rating),
        rating_count: parseInt(ratingStats.rating_count),
        updated_at: new Date(),
      });

    res.status(200).json({
      success: true,
      message: 'Content rated successfully',
      data: {
        rating,
        feedback,
        average_rating: parseFloat(ratingStats.avg_rating),
        rating_count: parseInt(ratingStats.rating_count),
      },
    });
  } catch (error) {
    next(error);
  }
});

// ==================== CONTENT ANALYTICS ====================

// @desc    Get content analytics
// @route   GET /api/project-learning/:projectId/analytics
// @access  Private
router.get('/:projectId/analytics', protect, async (req, res, next) => {
  try {
    const { projectId } = req.params;

    // Verify user has admin/mentor access
    const projectAccess = await db('project_members')
      .where({ project_id: projectId, user_id: req.user.id, status: 'active' })
      .first();

    if (!projectAccess || !['admin', 'mentor'].includes(projectAccess.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to view analytics',
      });
    }

    const [
      totalContent,
      contentByType,
      contentByCategory,
      completionStats,
      topRatedContent,
      recentActivity,
    ] = await Promise.all([
      db('learning_content').where({ project_id: projectId }).count('* as count').first(),
      db('learning_content')
        .select('type')
        .count('* as count')
        .where({ project_id: projectId })
        .groupBy('type'),
      db('learning_content')
        .select('category')
        .count('* as count')
        .where({ project_id: projectId })
        .groupBy('category'),
      db('content_progress as cp')
        .join('learning_content as lc', 'cp.content_id', 'lc.id')
        .where('lc.project_id', projectId)
        .select([
          db.raw('COUNT(*) as total_progress_records'),
          db.raw('SUM(CASE WHEN is_completed = true THEN 1 ELSE 0 END) as completed_count'),
          db.raw('AVG(progress_percentage) as avg_progress'),
        ])
        .first(),
      db('learning_content')
        .where({ project_id: projectId })
        .whereNotNull('average_rating')
        .orderBy('average_rating', 'desc')
        .limit(5),
      db('content_progress as cp')
        .select(['cp.*', 'lc.title as content_title', 'u.first_name', 'u.last_name'])
        .join('learning_content as lc', 'cp.content_id', 'lc.id')
        .join('users as u', 'cp.user_id', 'u.id')
        .where('lc.project_id', projectId)
        .orderBy('cp.updated_at', 'desc')
        .limit(10),
    ]);

    const completionRate =
      completionStats.total_progress_records > 0
        ? (
            (completionStats.completed_count / completionStats.total_progress_records) *
            100
          ).toFixed(1)
        : 0;

    res.status(200).json({
      success: true,
      data: {
        total_content: parseInt(totalContent.count),
        content_by_type: contentByType,
        content_by_category: contentByCategory,
        completion_stats: {
          total_progress_records: parseInt(completionStats.total_progress_records),
          completed_count: parseInt(completionStats.completed_count),
          completion_rate: parseFloat(completionRate),
          average_progress: parseFloat(completionStats.avg_progress) || 0,
        },
        top_rated_content: topRatedContent,
        recent_activity: recentActivity,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ==================== CONTENT FOLDERS ====================

// @desc    Get content folders
// @route   GET /api/project-learning/:projectId/folders
// @access  Private
router.get('/:projectId/folders', protect, async (req, res, next) => {
  try {
    const { projectId } = req.params;

    // Verify user has access to project
    const projectAccess = await db('project_members')
      .where({ project_id: projectId, user_id: req.user.id, status: 'active' })
      .first();

    if (!projectAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this project',
      });
    }

    const folders = await db('learning_content')
      .select('folder_path')
      .count('* as content_count')
      .where({ project_id: projectId })
      .whereNotNull('folder_path')
      .groupBy('folder_path')
      .orderBy('folder_path', 'asc');

    res.status(200).json({
      success: true,
      data: folders,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
