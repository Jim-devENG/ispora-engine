const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const db = require('../database/connection');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// @desc    Get all notification categories
// @route   GET /api/notification-categories
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const { active_only = true } = req.query;

    let query = db('notification_categories')
      .select('*')
      .orderBy('sort_order', 'asc')
      .orderBy('name', 'asc');

    if (active_only === 'true') {
      query = query.where('is_active', true);
    }

    const categories = await query;

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single notification category
// @route   GET /api/notification-categories/:id
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await db('notification_categories').where({ id }).first();

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Notification category not found',
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create notification category
// @route   POST /api/notification-categories
// @access  Private (Admin only)
router.post('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const {
      name,
      display_name,
      description,
      icon,
      color,
      is_active = true,
      sort_order = 0,
    } = req.body;

    // Validate required fields
    if (!name || !display_name) {
      return res.status(400).json({
        success: false,
        error: 'Name and display_name are required',
      });
    }

    // Check if category name already exists
    const existingCategory = await db('notification_categories').where({ name }).first();

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        error: 'Category name already exists',
      });
    }

    const category = {
      id: uuidv4(),
      name,
      display_name,
      description,
      icon: icon || 'bell',
      color: color || '#3b82f6',
      is_active,
      sort_order,
      created_at: new Date(),
      updated_at: new Date(),
    };

    await db('notification_categories').insert(category);

    res.status(201).json({
      success: true,
      message: 'Notification category created successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update notification category
// @route   PUT /api/notification-categories/:id
// @access  Private (Admin only)
router.put('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, display_name, description, icon, color, is_active, sort_order } = req.body;

    const category = await db('notification_categories').where({ id }).first();

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Notification category not found',
      });
    }

    // Check if new name conflicts with existing category
    if (name && name !== category.name) {
      const existingCategory = await db('notification_categories')
        .where({ name })
        .where('id', '!=', id)
        .first();

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          error: 'Category name already exists',
        });
      }
    }

    const updateData = {
      ...(name && { name }),
      ...(display_name && { display_name }),
      ...(description !== undefined && { description }),
      ...(icon && { icon }),
      ...(color && { color }),
      ...(is_active !== undefined && { is_active }),
      ...(sort_order !== undefined && { sort_order }),
      updated_at: new Date(),
    };

    await db('notification_categories').where({ id }).update(updateData);

    const updatedCategory = await db('notification_categories').where({ id }).first();

    res.status(200).json({
      success: true,
      message: 'Notification category updated successfully',
      data: updatedCategory,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete notification category
// @route   DELETE /api/notification-categories/:id
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await db('notification_categories').where({ id }).first();

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Notification category not found',
      });
    }

    // Check if category is being used by notifications
    const notificationCount = await db('notifications')
      .where({ category_id: id })
      .count('* as count')
      .first();

    if (notificationCount.count > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete category that is being used by notifications',
      });
    }

    await db('notification_categories').where({ id }).del();

    res.status(200).json({
      success: true,
      message: 'Notification category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get category statistics
// @route   GET /api/notification-categories/:id/stats
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
      .where({ category_id: id })
      .where('created_at', '>=', startDate)
      .select(
        db.raw('COUNT(*) as total_notifications'),
        db.raw('COUNT(CASE WHEN read = true THEN 1 END) as read_count'),
        db.raw('COUNT(CASE WHEN read = false THEN 1 END) as unread_count'),
        db.raw('COUNT(CASE WHEN action_required = true THEN 1 END) as action_required_count'),
        db.raw('COUNT(CASE WHEN clicked_at IS NOT NULL THEN 1 END) as clicked_count'),
      )
      .first();

    res.status(200).json({
      success: true,
      data: {
        period,
        start_date: startDate,
        end_date: now,
        ...stats,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
