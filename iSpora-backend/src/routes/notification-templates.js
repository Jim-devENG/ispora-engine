const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const db = require('../database/connection');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// @desc    Get all notification templates
// @route   GET /api/notification-templates
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const { 
      type, 
      category_id, 
      active_only = true,
      page = 1,
      limit = 20
    } = req.query;

    const offset = (page - 1) * limit;

    let query = db('notification_templates as nt')
      .select([
        'nt.*',
        'nc.name as category_name',
        'nc.display_name as category_display_name',
        'nc.color as category_color'
      ])
      .leftJoin('notification_categories as nc', 'nt.category_id', 'nc.id')
      .orderBy('nt.name', 'asc');

    // Apply filters
    if (type) {
      query = query.where('nt.type', type);
    }

    if (category_id) {
      query = query.where('nt.category_id', category_id);
    }

    if (active_only === 'true') {
      query = query.where('nt.is_active', true);
    }

    const templates = await query
      .limit(parseInt(limit))
      .offset(offset);

    // Get total count for pagination
    const totalCount = await query.clone().count('* as count').first();

    res.status(200).json({
      success: true,
      count: templates.length,
      total: totalCount.count,
      page: parseInt(page),
      limit: parseInt(limit),
      data: templates
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single notification template
// @route   GET /api/notification-templates/:id
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const { id } = req.params;

    const template = await db('notification_templates as nt')
      .select([
        'nt.*',
        'nc.name as category_name',
        'nc.display_name as category_display_name',
        'nc.color as category_color'
      ])
      .leftJoin('notification_categories as nc', 'nt.category_id', 'nc.id')
      .where('nt.id', id)
      .first();

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Notification template not found'
      });
    }

    res.status(200).json({
      success: true,
      data: template
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create notification template
// @route   POST /api/notification-templates
// @access  Private (Admin only)
router.post('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const {
      name,
      type,
      category_id,
      title_template,
      message_template,
      variables,
      default_metadata,
      priority = 'medium',
      is_active = true
    } = req.body;

    // Validate required fields
    if (!name || !type || !title_template || !message_template) {
      return res.status(400).json({
        success: false,
        error: 'Name, type, title_template, and message_template are required'
      });
    }

    // Check if template name already exists
    const existingTemplate = await db('notification_templates')
      .where({ name })
      .first();

    if (existingTemplate) {
      return res.status(400).json({
        success: false,
        error: 'Template name already exists'
      });
    }

    // Validate category exists if provided
    if (category_id) {
      const category = await db('notification_categories')
        .where({ id: category_id })
        .first();

      if (!category) {
        return res.status(400).json({
          success: false,
          error: 'Invalid category_id'
        });
      }
    }

    const template = {
      id: uuidv4(),
      name,
      type,
      category_id,
      title_template,
      message_template,
      variables: variables ? JSON.stringify(variables) : null,
      default_metadata: default_metadata ? JSON.stringify(default_metadata) : null,
      priority,
      is_active,
      created_at: new Date(),
      updated_at: new Date()
    };

    await db('notification_templates').insert(template);

    // Fetch the created template with category info
    const createdTemplate = await db('notification_templates as nt')
      .select([
        'nt.*',
        'nc.name as category_name',
        'nc.display_name as category_display_name',
        'nc.color as category_color'
      ])
      .leftJoin('notification_categories as nc', 'nt.category_id', 'nc.id')
      .where('nt.id', template.id)
      .first();

    res.status(201).json({
      success: true,
      message: 'Notification template created successfully',
      data: createdTemplate
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update notification template
// @route   PUT /api/notification-templates/:id
// @access  Private (Admin only)
router.put('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      type,
      category_id,
      title_template,
      message_template,
      variables,
      default_metadata,
      priority,
      is_active
    } = req.body;

    const template = await db('notification_templates')
      .where({ id })
      .first();

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Notification template not found'
      });
    }

    // Check if new name conflicts with existing template
    if (name && name !== template.name) {
      const existingTemplate = await db('notification_templates')
        .where({ name })
        .where('id', '!=', id)
        .first();

      if (existingTemplate) {
        return res.status(400).json({
          success: false,
          error: 'Template name already exists'
        });
      }
    }

    // Validate category exists if provided
    if (category_id) {
      const category = await db('notification_categories')
        .where({ id: category_id })
        .first();

      if (!category) {
        return res.status(400).json({
          success: false,
          error: 'Invalid category_id'
        });
      }
    }

    const updateData = {
      ...(name && { name }),
      ...(type && { type }),
      ...(category_id !== undefined && { category_id }),
      ...(title_template && { title_template }),
      ...(message_template && { message_template }),
      ...(variables !== undefined && { variables: variables ? JSON.stringify(variables) : null }),
      ...(default_metadata !== undefined && { default_metadata: default_metadata ? JSON.stringify(default_metadata) : null }),
      ...(priority && { priority }),
      ...(is_active !== undefined && { is_active }),
      updated_at: new Date()
    };

    await db('notification_templates')
      .where({ id })
      .update(updateData);

    const updatedTemplate = await db('notification_templates as nt')
      .select([
        'nt.*',
        'nc.name as category_name',
        'nc.display_name as category_display_name',
        'nc.color as category_color'
      ])
      .leftJoin('notification_categories as nc', 'nt.category_id', 'nc.id')
      .where('nt.id', id)
      .first();

    res.status(200).json({
      success: true,
      message: 'Notification template updated successfully',
      data: updatedTemplate
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete notification template
// @route   DELETE /api/notification-templates/:id
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;

    const template = await db('notification_templates')
      .where({ id })
      .first();

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Notification template not found'
      });
    }

    // Check if template is being used by notifications
    const notificationCount = await db('notifications')
      .where({ template_id: id })
      .count('* as count')
      .first();

    if (notificationCount.count > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete template that is being used by notifications'
      });
    }

    await db('notification_templates')
      .where({ id })
      .del();

    res.status(200).json({
      success: true,
      message: 'Notification template deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Test notification template
// @route   POST /api/notification-templates/:id/test
// @access  Private (Admin only)
router.post('/:id/test', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { test_data = {} } = req.body;

    const template = await db('notification_templates')
      .where({ id })
      .first();

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Notification template not found'
      });
    }

    // Simple template rendering function
    const renderTemplate = (template, data) => {
      let rendered = template;
      Object.keys(data).forEach(key => {
        const placeholder = `{{${key}}}`;
        rendered = rendered.replace(new RegExp(placeholder, 'g'), data[key] || '');
      });
      return rendered;
    };

    const renderedTitle = renderTemplate(template.title_template, test_data);
    const renderedMessage = renderTemplate(template.message_template, test_data);

    res.status(200).json({
      success: true,
      data: {
        original_title: template.title_template,
        original_message: template.message_template,
        rendered_title: renderedTitle,
        rendered_message: renderedMessage,
        test_data
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get template usage statistics
// @route   GET /api/notification-templates/:id/stats
// @access  Private
router.get('/:id/stats', protect, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { period = '30d' } = req.query;

    // Calculate date range based on period
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const stats = await db('notifications')
      .where({ template_id: id })
      .where('created_at', '>=', startDate)
      .select(
        db.raw('COUNT(*) as total_notifications'),
        db.raw('COUNT(CASE WHEN read = true THEN 1 END) as read_count'),
        db.raw('COUNT(CASE WHEN read = false THEN 1 END) as unread_count'),
        db.raw('COUNT(CASE WHEN action_required = true THEN 1 END) as action_required_count'),
        db.raw('COUNT(CASE WHEN clicked_at IS NOT NULL THEN 1 END) as clicked_count')
      )
      .first();

    res.status(200).json({
      success: true,
      data: {
        period,
        start_date: startDate,
        end_date: now,
        ...stats
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
