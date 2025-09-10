const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const db = require('../database/connection');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// @desc    Get all notification batches
// @route   GET /api/notification-batches
// @access  Private (Admin only)
router.get('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { 
      status, 
      page = 1,
      limit = 20
    } = req.query;

    const offset = (page - 1) * limit;

    let query = db('notification_batches as nb')
      .select([
        'nb.*',
        'nt.name as template_name',
        'nt.type as template_type'
      ])
      .leftJoin('notification_templates as nt', 'nb.template_id', 'nt.id')
      .orderBy('nb.created_at', 'desc');

    // Apply filters
    if (status) {
      query = query.where('nb.status', status);
    }

    const batches = await query
      .limit(parseInt(limit))
      .offset(offset);

    // Get total count for pagination
    const totalCount = await query.clone().count('* as count').first();

    res.status(200).json({
      success: true,
      count: batches.length,
      total: totalCount.count,
      page: parseInt(page),
      limit: parseInt(limit),
      data: batches
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single notification batch
// @route   GET /api/notification-batches/:id
// @access  Private (Admin only)
router.get('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;

    const batch = await db('notification_batches as nb')
      .select([
        'nb.*',
        'nt.name as template_name',
        'nt.type as template_type',
        'nt.title_template',
        'nt.message_template'
      ])
      .leftJoin('notification_templates as nt', 'nb.template_id', 'nt.id')
      .where('nb.id', id)
      .first();

    if (!batch) {
      return res.status(404).json({
        success: false,
        error: 'Notification batch not found'
      });
    }

    res.status(200).json({
      success: true,
      data: batch
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create notification batch
// @route   POST /api/notification-batches
// @access  Private (Admin only)
router.post('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const {
      batch_name,
      template_id,
      target_criteria,
      scheduled_at,
      batch_metadata
    } = req.body;

    // Validate required fields
    if (!batch_name || !template_id) {
      return res.status(400).json({
        success: false,
        error: 'batch_name and template_id are required'
      });
    }

    // Validate template exists
    const template = await db('notification_templates')
      .where({ id: template_id })
      .first();

    if (!template) {
      return res.status(400).json({
        success: false,
        error: 'Invalid template_id'
      });
    }

    // Calculate target recipients based on criteria
    let targetUsers = [];
    if (target_criteria) {
      let userQuery = db('users').select('id');
      
      if (target_criteria.user_type) {
        userQuery = userQuery.where('user_type', target_criteria.user_type);
      }
      
      if (target_criteria.university) {
        userQuery = userQuery.where('university', target_criteria.university);
      }
      
      if (target_criteria.skills && target_criteria.skills.length > 0) {
        userQuery = userQuery.where(function() {
          target_criteria.skills.forEach(skill => {
            this.orWhere('skills', 'like', `%${skill}%`);
          });
        });
      }
      
      if (target_criteria.location) {
        userQuery = userQuery.where('location', 'like', `%${target_criteria.location}%`);
      }

      targetUsers = await userQuery;
    }

    const batch = {
      id: uuidv4(),
      batch_name,
      template_id,
      target_criteria: target_criteria ? JSON.stringify(target_criteria) : null,
      total_recipients: targetUsers.length,
      sent_count: 0,
      delivered_count: 0,
      read_count: 0,
      clicked_count: 0,
      status: 'draft',
      scheduled_at: scheduled_at ? new Date(scheduled_at) : null,
      sent_at: null,
      batch_metadata: batch_metadata ? JSON.stringify(batch_metadata) : null,
      created_at: new Date(),
      updated_at: new Date()
    };

    await db('notification_batches').insert(batch);

    // Fetch the created batch with template info
    const createdBatch = await db('notification_batches as nb')
      .select([
        'nb.*',
        'nt.name as template_name',
        'nt.type as template_type'
      ])
      .leftJoin('notification_templates as nt', 'nb.template_id', 'nt.id')
      .where('nb.id', batch.id)
      .first();

    res.status(201).json({
      success: true,
      message: 'Notification batch created successfully',
      data: createdBatch
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update notification batch
// @route   PUT /api/notification-batches/:id
// @access  Private (Admin only)
router.put('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      batch_name,
      template_id,
      target_criteria,
      scheduled_at,
      batch_metadata,
      status
    } = req.body;

    const batch = await db('notification_batches')
      .where({ id })
      .first();

    if (!batch) {
      return res.status(404).json({
        success: false,
        error: 'Notification batch not found'
      });
    }

    // Validate template exists if provided
    if (template_id) {
      const template = await db('notification_templates')
        .where({ id: template_id })
        .first();

      if (!template) {
        return res.status(400).json({
          success: false,
          error: 'Invalid template_id'
        });
      }
    }

    // Recalculate target recipients if criteria changed
    let totalRecipients = batch.total_recipients;
    if (target_criteria) {
      let userQuery = db('users').select('id');
      
      if (target_criteria.user_type) {
        userQuery = userQuery.where('user_type', target_criteria.user_type);
      }
      
      if (target_criteria.university) {
        userQuery = userQuery.where('university', target_criteria.university);
      }
      
      if (target_criteria.skills && target_criteria.skills.length > 0) {
        userQuery = userQuery.where(function() {
          target_criteria.skills.forEach(skill => {
            this.orWhere('skills', 'like', `%${skill}%`);
          });
        });
      }
      
      if (target_criteria.location) {
        userQuery = userQuery.where('location', 'like', `%${target_criteria.location}%`);
      }

      const targetUsers = await userQuery;
      totalRecipients = targetUsers.length;
    }

    const updateData = {
      ...(batch_name && { batch_name }),
      ...(template_id && { template_id }),
      ...(target_criteria && { target_criteria: JSON.stringify(target_criteria) }),
      ...(scheduled_at && { scheduled_at: new Date(scheduled_at) }),
      ...(batch_metadata && { batch_metadata: JSON.stringify(batch_metadata) }),
      ...(status && { status }),
      ...(target_criteria && { total_recipients: totalRecipients }),
      updated_at: new Date()
    };

    await db('notification_batches')
      .where({ id })
      .update(updateData);

    const updatedBatch = await db('notification_batches as nb')
      .select([
        'nb.*',
        'nt.name as template_name',
        'nt.type as template_type'
      ])
      .leftJoin('notification_templates as nt', 'nb.template_id', 'nt.id')
      .where('nb.id', id)
      .first();

    res.status(200).json({
      success: true,
      message: 'Notification batch updated successfully',
      data: updatedBatch
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Send notification batch
// @route   POST /api/notification-batches/:id/send
// @access  Private (Admin only)
router.post('/:id/send', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { send_immediately = false } = req.body;

    const batch = await db('notification_batches')
      .where({ id })
      .first();

    if (!batch) {
      return res.status(404).json({
        success: false,
        error: 'Notification batch not found'
      });
    }

    if (batch.status !== 'draft' && batch.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        error: 'Batch can only be sent from draft or scheduled status'
      });
    }

    if (batch.total_recipients === 0) {
      return res.status(400).json({
        success: false,
        error: 'No recipients found for this batch'
      });
    }

    // Get template
    const template = await db('notification_templates')
      .where({ id: batch.template_id })
      .first();

    if (!template) {
      return res.status(400).json({
        success: false,
        error: 'Template not found'
      });
    }

    // Get target users
    let targetUsers = [];
    if (batch.target_criteria) {
      const criteria = JSON.parse(batch.target_criteria);
      let userQuery = db('users').select('id');
      
      if (criteria.user_type) {
        userQuery = userQuery.where('user_type', criteria.user_type);
      }
      
      if (criteria.university) {
        userQuery = userQuery.where('university', criteria.university);
      }
      
      if (criteria.skills && criteria.skills.length > 0) {
        userQuery = userQuery.where(function() {
          criteria.skills.forEach(skill => {
            this.orWhere('skills', 'like', `%${skill}%`);
          });
        });
      }
      
      if (criteria.location) {
        userQuery = userQuery.where('location', 'like', `%${criteria.location}%`);
      }

      targetUsers = await userQuery;
    }

    if (send_immediately) {
      // Update batch status
      await db('notification_batches')
        .where({ id })
        .update({
          status: 'sending',
          updated_at: new Date()
        });

      // Create notifications for all target users
      const notifications = targetUsers.map(user => ({
        id: uuidv4(),
        user_id: user.id,
        title: template.title_template,
        message: template.message_template,
        type: template.type,
        priority: template.priority,
        template_id: template.id,
        batch_id: batch.id,
        category_id: template.category_id,
        read: false,
        action_required: false,
        created_at: new Date(),
        updated_at: new Date()
      }));

      // Insert notifications in batches to avoid memory issues
      const batchSize = 100;
      for (let i = 0; i < notifications.length; i += batchSize) {
        const batch = notifications.slice(i, i + batchSize);
        await db('notifications').insert(batch);
      }

      // Update batch with final status
      await db('notification_batches')
        .where({ id })
        .update({
          status: 'sent',
          sent_count: notifications.length,
          sent_at: new Date(),
          updated_at: new Date()
        });

      res.status(200).json({
        success: true,
        message: `Batch sent successfully to ${notifications.length} recipients`,
        data: {
          batch_id: id,
          recipients: notifications.length,
          sent_at: new Date()
        }
      });
    } else {
      // Schedule the batch
      await db('notification_batches')
        .where({ id })
        .update({
          status: 'scheduled',
          updated_at: new Date()
        });

      res.status(200).json({
        success: true,
        message: 'Batch scheduled successfully',
        data: {
          batch_id: id,
          scheduled_at: batch.scheduled_at,
          recipients: targetUsers.length
        }
      });
    }
  } catch (error) {
    // Update batch status to failed if there was an error
    await db('notification_batches')
      .where({ id: req.params.id })
      .update({
        status: 'failed',
        updated_at: new Date()
      });

    next(error);
  }
});

// @desc    Cancel notification batch
// @route   POST /api/notification-batches/:id/cancel
// @access  Private (Admin only)
router.post('/:id/cancel', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;

    const batch = await db('notification_batches')
      .where({ id })
      .first();

    if (!batch) {
      return res.status(404).json({
        success: false,
        error: 'Notification batch not found'
      });
    }

    if (batch.status === 'sent') {
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel already sent batch'
      });
    }

    await db('notification_batches')
      .where({ id })
      .update({
        status: 'cancelled',
        updated_at: new Date()
      });

    res.status(200).json({
      success: true,
      message: 'Notification batch cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get batch statistics
// @route   GET /api/notification-batches/:id/stats
// @access  Private (Admin only)
router.get('/:id/stats', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;

    const batch = await db('notification_batches')
      .where({ id })
      .first();

    if (!batch) {
      return res.status(404).json({
        success: false,
        error: 'Notification batch not found'
      });
    }

    // Get detailed statistics for this batch
    const stats = await db('notifications')
      .where({ batch_id: id })
      .select(
        db.raw('COUNT(*) as total_sent'),
        db.raw('COUNT(CASE WHEN read = true THEN 1 END) as read_count'),
        db.raw('COUNT(CASE WHEN clicked_at IS NOT NULL THEN 1 END) as clicked_count'),
        db.raw('COUNT(CASE WHEN action_required = true THEN 1 END) as action_required_count'),
        db.raw('COUNT(CASE WHEN dismissed_at IS NOT NULL THEN 1 END) as dismissed_count')
      )
      .first();

    // Get daily breakdown
    const dailyStats = await db('notifications')
      .where({ batch_id: id })
      .select(
        db.raw('DATE(created_at) as date'),
        db.raw('COUNT(*) as sent'),
        db.raw('COUNT(CASE WHEN read = true THEN 1 END) as read'),
        db.raw('COUNT(CASE WHEN clicked_at IS NOT NULL THEN 1 END) as clicked')
      )
      .groupBy(db.raw('DATE(created_at)'))
      .orderBy('date', 'asc');

    // Calculate engagement rates
    const engagementRates = {
      read_rate: stats.total_sent > 0 ? 
        ((stats.read_count / stats.total_sent) * 100).toFixed(2) : 0,
      click_rate: stats.total_sent > 0 ? 
        ((stats.clicked_count / stats.total_sent) * 100).toFixed(2) : 0,
      action_completion_rate: stats.action_required_count > 0 ? 
        ((stats.clicked_count / stats.action_required_count) * 100).toFixed(2) : 0
    };

    res.status(200).json({
      success: true,
      data: {
        batch_info: batch,
        statistics: {
          ...stats,
          ...engagementRates
        },
        daily_breakdown: dailyStats
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete notification batch
// @route   DELETE /api/notification-batches/:id
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;

    const batch = await db('notification_batches')
      .where({ id })
      .first();

    if (!batch) {
      return res.status(404).json({
        success: false,
        error: 'Notification batch not found'
      });
    }

    if (batch.status === 'sent' || batch.status === 'sending') {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete sent or sending batch'
      });
    }

    // Delete associated notifications if they exist
    await db('notifications')
      .where({ batch_id: id })
      .del();

    await db('notification_batches')
      .where({ id })
      .del();

    res.status(200).json({
      success: true,
      message: 'Notification batch deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
