const express = require('express');
const { authenticateToken } = require('../middleware/auth-clean');
const db = require('../database/connection');

const router = express.Router();

// @desc    Get all tasks for user
// @route   GET /api/tasks
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const tasks = await db('tasks')
      .where({ user_id: req.user.id })
      .orderBy('created_at', 'desc');

    res.json({
      success: true,
      data: tasks,
      count: tasks.length
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get tasks'
    });
  }
});

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, priority = 'medium', due_date } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }

    const taskData = {
      id: require('uuid').v4(),
      user_id: req.user.id,
      title,
      description,
      priority,
      due_date,
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date(),
    };

    await db('tasks').insert(taskData);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: taskData
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create task'
    });
  }
});

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, due_date, status } = req.body;

    const task = await db('tasks')
      .where({ id, user_id: req.user.id })
      .first();

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    const updateData = {
      updated_at: new Date(),
    };

    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (priority) updateData.priority = priority;
    if (due_date) updateData.due_date = due_date;
    if (status) updateData.status = status;

    await db('tasks').where({ id }).update(updateData);

    res.json({
      success: true,
      message: 'Task updated successfully'
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update task'
    });
  }
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const task = await db('tasks')
      .where({ id, user_id: req.user.id })
      .first();

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    await db('tasks').where({ id }).del();

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete task'
    });
  }
});

module.exports = router;
