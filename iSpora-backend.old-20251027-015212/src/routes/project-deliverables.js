const express = require('express');
const db = require('../database/connection');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ==================== DELIVERABLE MANAGEMENT ====================

// @desc    Create deliverable
// @route   POST /api/project-deliverables/:projectId
// @access  Private
router.post('/:projectId', protect, async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const {
      title,
      description,
      type,
      assigned_to,
      requirements,
      acceptance_criteria,
      specifications,
      format,
      max_file_size_mb,
      due_date,
      is_mandatory,
      weight,
      tags,
    } = req.body;

    if (!title || !type) {
      return res.status(400).json({
        success: false,
        error: 'Title and type are required',
      });
    }

    // Verify user has permission to create deliverables
    const projectAccess = await db('project_members as pm')
      .select(['pm.role'])
      .where({ project_id: projectId, user_id: req.user.id, status: 'active' })
      .first();

    if (!projectAccess || !['admin', 'mentor'].includes(projectAccess.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to create deliverables',
      });
    }

    const deliverable = await db('project_deliverables')
      .insert({
        project_id: projectId,
        created_by: req.user.id,
        assigned_to,
        title,
        description,
        type,
        requirements,
        acceptance_criteria,
        specifications: JSON.stringify(specifications),
        format,
        max_file_size_mb,
        due_date: due_date ? new Date(due_date) : null,
        is_mandatory: is_mandatory !== false,
        weight: weight || 1,
        tags: JSON.stringify(tags),
      })
      .returning('*');

    res.status(201).json({
      success: true,
      message: 'Deliverable created successfully',
      data: deliverable[0],
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update deliverable
// @route   PUT /api/project-deliverables/:deliverableId
// @access  Private
router.put('/:deliverableId', protect, async (req, res, next) => {
  try {
    const { deliverableId } = req.params;
    const updateData = req.body;

    // Verify user has permission to update deliverable
    const deliverable = await db('project_deliverables as pd')
      .select(['pd.*', 'pm.role'])
      .leftJoin('project_members as pm', function () {
        this.on('pd.project_id', '=', 'pm.project_id').andOn(
          'pm.user_id',
          '=',
          db.raw('?', [req.user.id]),
        );
      })
      .where('pd.id', deliverableId)
      .first();

    if (!deliverable) {
      return res.status(404).json({
        success: false,
        error: 'Deliverable not found',
      });
    }

    // Check permissions (creator, assignee, or admin/mentor)
    const canUpdate =
      deliverable.created_by === req.user.id ||
      deliverable.assigned_to === req.user.id ||
      ['admin', 'mentor'].includes(deliverable.role);

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to update this deliverable',
      });
    }

    // Handle JSON fields
    if (updateData.specifications) {
      updateData.specifications = JSON.stringify(updateData.specifications);
    }
    if (updateData.tags) {
      updateData.tags = JSON.stringify(updateData.tags);
    }

    // Handle date fields
    if (updateData.due_date) {
      updateData.due_date = new Date(updateData.due_date);
    }

    updateData.updated_at = new Date();

    await db('project_deliverables').where({ id: deliverableId }).update(updateData);

    const updatedDeliverable = await db('project_deliverables')
      .where({ id: deliverableId })
      .first();

    res.status(200).json({
      success: true,
      message: 'Deliverable updated successfully',
      data: updatedDeliverable,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete deliverable
// @route   DELETE /api/project-deliverables/:deliverableId
// @access  Private
router.delete('/:deliverableId', protect, async (req, res, next) => {
  try {
    const { deliverableId } = req.params;

    // Verify user has permission to delete deliverable
    const deliverable = await db('project_deliverables as pd')
      .select(['pd.*', 'pm.role'])
      .leftJoin('project_members as pm', function () {
        this.on('pd.project_id', '=', 'pm.project_id').andOn(
          'pm.user_id',
          '=',
          db.raw('?', [req.user.id]),
        );
      })
      .where('pd.id', deliverableId)
      .first();

    if (!deliverable) {
      return res.status(404).json({
        success: false,
        error: 'Deliverable not found',
      });
    }

    // Only creator or admin/mentor can delete
    if (deliverable.created_by !== req.user.id && !['admin', 'mentor'].includes(deliverable.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to delete this deliverable',
      });
    }

    await db('project_deliverables').where({ id: deliverableId }).del();

    res.status(200).json({
      success: true,
      message: 'Deliverable deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// ==================== DELIVERABLE SUBMISSIONS ====================

// @desc    Submit deliverable
// @route   POST /api/project-deliverables/:deliverableId/submit
// @access  Private
router.post('/:deliverableId/submit', protect, async (req, res, next) => {
  try {
    const { deliverableId } = req.params;
    const {
      submission_url,
      submission_filename,
      submission_file_size,
      submission_mime_type,
      submission_notes,
    } = req.body;

    if (!submission_url) {
      return res.status(400).json({
        success: false,
        error: 'Submission URL is required',
      });
    }

    // Verify user has permission to submit
    const deliverable = await db('project_deliverables as pd')
      .select(['pd.*', 'pm.role'])
      .leftJoin('project_members as pm', function () {
        this.on('pd.project_id', '=', 'pm.project_id').andOn(
          'pm.user_id',
          '=',
          db.raw('?', [req.user.id]),
        );
      })
      .where('pd.id', deliverableId)
      .first();

    if (!deliverable) {
      return res.status(404).json({
        success: false,
        error: 'Deliverable not found',
      });
    }

    // Check if user is assigned or has access
    if (
      deliverable.assigned_to !== req.user.id &&
      !['admin', 'mentor'].includes(deliverable.role)
    ) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to submit this deliverable',
      });
    }

    // Check if already submitted
    if (deliverable.status === 'submitted' || deliverable.status === 'reviewed') {
      return res.status(400).json({
        success: false,
        error: 'Deliverable has already been submitted',
      });
    }

    await db('project_deliverables').where({ id: deliverableId }).update({
      status: 'submitted',
      submission_url,
      submission_filename,
      submission_file_size,
      submission_mime_type,
      submission_notes,
      submitted_date: new Date(),
      updated_at: new Date(),
    });

    res.status(200).json({
      success: true,
      message: 'Deliverable submitted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Review deliverable
// @route   POST /api/project-deliverables/:deliverableId/review
// @access  Private
router.post('/:deliverableId/review', protect, async (req, res, next) => {
  try {
    const { deliverableId } = req.params;
    const {
      reviewer_feedback,
      review_score,
      review_criteria_scores,
      requires_revision,
      revision_notes,
    } = req.body;

    // Verify user has permission to review
    const deliverable = await db('project_deliverables as pd')
      .select(['pd.*', 'pm.role'])
      .leftJoin('project_members as pm', function () {
        this.on('pd.project_id', '=', 'pm.project_id').andOn(
          'pm.user_id',
          '=',
          db.raw('?', [req.user.id]),
        );
      })
      .where('pd.id', deliverableId)
      .first();

    if (!deliverable) {
      return res.status(404).json({
        success: false,
        error: 'Deliverable not found',
      });
    }

    if (!['admin', 'mentor'].includes(deliverable.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to review deliverables',
      });
    }

    if (deliverable.status !== 'submitted') {
      return res.status(400).json({
        success: false,
        error: 'Deliverable must be submitted before it can be reviewed',
      });
    }

    const updateData = {
      status: requires_revision ? 'submitted' : 'reviewed',
      reviewed_by: req.user.id,
      reviewed_date: new Date(),
      reviewer_feedback,
      review_score,
      review_criteria_scores: JSON.stringify(review_criteria_scores),
      requires_revision: requires_revision || false,
      revision_notes,
      updated_at: new Date(),
    };

    await db('project_deliverables').where({ id: deliverableId }).update(updateData);

    res.status(200).json({
      success: true,
      message: requires_revision
        ? 'Deliverable marked for revision'
        : 'Deliverable reviewed successfully',
    });
  } catch (error) {
    next(error);
  }
});

// ==================== DELIVERABLE VERSIONS ====================

// @desc    Create new version of deliverable
// @route   POST /api/project-deliverables/:deliverableId/version
// @access  Private
router.post('/:deliverableId/version', protect, async (req, res, next) => {
  try {
    const { deliverableId } = req.params;
    const {
      submission_url,
      submission_filename,
      submission_file_size,
      submission_mime_type,
      submission_notes,
      version_notes,
    } = req.body;

    if (!submission_url) {
      return res.status(400).json({
        success: false,
        error: 'Submission URL is required',
      });
    }

    // Verify user has permission to create new version
    const deliverable = await db('project_deliverables as pd')
      .select(['pd.*', 'pm.role'])
      .leftJoin('project_members as pm', function () {
        this.on('pd.project_id', '=', 'pm.project_id').andOn(
          'pm.user_id',
          '=',
          db.raw('?', [req.user.id]),
        );
      })
      .where('pd.id', deliverableId)
      .first();

    if (!deliverable) {
      return res.status(404).json({
        success: false,
        error: 'Deliverable not found',
      });
    }

    // Check if user is assigned or has access
    if (
      deliverable.assigned_to !== req.user.id &&
      !['admin', 'mentor'].includes(deliverable.role)
    ) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to create new version',
      });
    }

    // Get current version history
    const versionHistory = JSON.parse(deliverable.version_history || '[]');

    // Add current version to history
    versionHistory.push({
      version: deliverable.version,
      submission_url: deliverable.submission_url,
      submission_filename: deliverable.submission_filename,
      submission_date: deliverable.submitted_date,
      submission_notes: deliverable.submission_notes,
      review_score: deliverable.review_score,
      reviewer_feedback: deliverable.reviewer_feedback,
    });

    const newVersion = deliverable.version + 1;

    await db('project_deliverables')
      .where({ id: deliverableId })
      .update({
        version: newVersion,
        status: 'submitted',
        submission_url,
        submission_filename,
        submission_file_size,
        submission_mime_type,
        submission_notes: version_notes || submission_notes,
        submitted_date: new Date(),
        version_history: JSON.stringify(versionHistory),
        // Reset review fields for new version
        reviewed_by: null,
        reviewed_date: null,
        reviewer_feedback: null,
        review_score: null,
        review_criteria_scores: null,
        requires_revision: false,
        revision_notes: null,
        updated_at: new Date(),
      });

    res.status(200).json({
      success: true,
      message: `Version ${newVersion} created successfully`,
      data: { version: newVersion },
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get deliverable versions
// @route   GET /api/project-deliverables/:deliverableId/versions
// @access  Private
router.get('/:deliverableId/versions', protect, async (req, res, next) => {
  try {
    const { deliverableId } = req.params;

    // Verify user has access to deliverable
    const deliverable = await db('project_deliverables as pd')
      .select(['pd.*', 'pm.role'])
      .leftJoin('project_members as pm', function () {
        this.on('pd.project_id', '=', 'pm.project_id').andOn(
          'pm.user_id',
          '=',
          db.raw('?', [req.user.id]),
        );
      })
      .where('pd.id', deliverableId)
      .first();

    if (!deliverable) {
      return res.status(404).json({
        success: false,
        error: 'Deliverable not found',
      });
    }

    const versionHistory = JSON.parse(deliverable.version_history || '[]');

    res.status(200).json({
      success: true,
      data: {
        current_version: deliverable.version,
        version_history: versionHistory,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ==================== DELIVERABLE TEMPLATES ====================

// @desc    Create deliverable template
// @route   POST /api/project-deliverables/:projectId/templates
// @access  Private
router.post('/:projectId/templates', protect, async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const {
      title,
      description,
      type,
      requirements,
      acceptance_criteria,
      specifications,
      format,
      max_file_size_mb,
      is_mandatory,
      weight,
      tags,
    } = req.body;

    if (!title || !type) {
      return res.status(400).json({
        success: false,
        error: 'Title and type are required',
      });
    }

    // Verify user has permission to create templates
    const projectAccess = await db('project_members as pm')
      .select(['pm.role'])
      .where({ project_id: projectId, user_id: req.user.id, status: 'active' })
      .first();

    if (!projectAccess || !['admin', 'mentor'].includes(projectAccess.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to create templates',
      });
    }

    const template = await db('project_deliverables')
      .insert({
        project_id: projectId,
        created_by: req.user.id,
        title,
        description,
        type,
        requirements,
        acceptance_criteria,
        specifications: JSON.stringify(specifications),
        format,
        max_file_size_mb,
        is_mandatory: is_mandatory !== false,
        weight: weight || 1,
        tags: JSON.stringify(tags),
        is_template: true,
      })
      .returning('*');

    res.status(201).json({
      success: true,
      message: 'Template created successfully',
      data: template[0],
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get deliverable templates
// @route   GET /api/project-deliverables/:projectId/templates
// @access  Private
router.get('/:projectId/templates', protect, async (req, res, next) => {
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

    const templates = await db('project_deliverables')
      .where({ project_id: projectId, is_template: true })
      .orderBy('created_at', 'desc');

    res.status(200).json({
      success: true,
      data: templates,
    });
  } catch (error) {
    next(error);
  }
});

// ==================== DELIVERABLE ANALYTICS ====================

// @desc    Get deliverable analytics
// @route   GET /api/project-deliverables/:projectId/analytics
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
      totalDeliverables,
      deliverablesByStatus,
      deliverablesByType,
      averageScore,
      submissionStats,
      overdueDeliverables,
    ] = await Promise.all([
      db('project_deliverables')
        .where({ project_id: projectId, is_template: false })
        .count('* as count')
        .first(),
      db('project_deliverables')
        .select('status')
        .count('* as count')
        .where({ project_id: projectId, is_template: false })
        .groupBy('status'),
      db('project_deliverables')
        .select('type')
        .count('* as count')
        .where({ project_id: projectId, is_template: false })
        .groupBy('type'),
      db('project_deliverables')
        .where({ project_id: projectId, is_template: false })
        .whereNotNull('review_score')
        .avg('review_score as avg')
        .first(),
      db('project_deliverables')
        .where({ project_id: projectId, is_template: false })
        .select([
          db.raw('COUNT(*) as total'),
          db.raw(
            "SUM(CASE WHEN status = 'submitted' OR status = 'reviewed' THEN 1 ELSE 0 END) as submitted_count",
          ),
          db.raw('AVG(CASE WHEN review_score IS NOT NULL THEN review_score END) as avg_score'),
        ])
        .first(),
      db('project_deliverables')
        .where({ project_id: projectId, is_template: false })
        .where('due_date', '<', new Date())
        .whereNotIn('status', ['submitted', 'reviewed'])
        .count('* as count')
        .first(),
    ]);

    const submissionRate =
      submissionStats.total > 0
        ? ((submissionStats.submitted_count / submissionStats.total) * 100).toFixed(1)
        : 0;

    res.status(200).json({
      success: true,
      data: {
        total_deliverables: parseInt(totalDeliverables.count),
        deliverables_by_status: deliverablesByStatus,
        deliverables_by_type: deliverablesByType,
        average_score: parseFloat(averageScore.avg) || 0,
        submission_stats: {
          total: parseInt(submissionStats.total),
          submitted: parseInt(submissionStats.submitted_count),
          submission_rate: parseFloat(submissionRate),
          average_score: parseFloat(submissionStats.avg_score) || 0,
        },
        overdue_deliverables: parseInt(overdueDeliverables.count),
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
