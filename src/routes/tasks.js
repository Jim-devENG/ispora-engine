const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Mock tasks data for now
const mockTasks = [
  {
    id: 1,
    title: 'Complete project documentation',
    description: 'Write comprehensive documentation for the iSpora project',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2025-02-01',
    createdAt: '2025-01-25T10:00:00Z',
    updatedAt: '2025-01-25T10:00:00Z'
  },
  {
    id: 2,
    title: 'Implement user authentication',
    description: 'Set up JWT-based authentication system',
    status: 'completed',
    priority: 'high',
    dueDate: '2025-01-20',
    createdAt: '2025-01-15T09:00:00Z',
    updatedAt: '2025-01-20T15:30:00Z'
  },
  {
    id: 3,
    title: 'Design mobile responsive layout',
    description: 'Ensure the application works well on mobile devices',
    status: 'pending',
    priority: 'medium',
    dueDate: '2025-02-15',
    createdAt: '2025-01-22T14:00:00Z',
    updatedAt: '2025-01-22T14:00:00Z'
  }
];

// GET /api/tasks - Get all tasks
router.get('/', (req, res) => {
  try {
    logger.info('Fetching all tasks');
    res.json({
      success: true,
      tasks: mockTasks,
      total: mockTasks.length
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Error fetching tasks');
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tasks'
    });
  }
});

// GET /api/tasks/:id - Get task by ID
router.get('/:id', (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const task = mockTasks.find(t => t.id === taskId);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    logger.info({ taskId }, 'Fetching task by ID');
    res.json({
      success: true,
      task
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Error fetching task');
    res.status(500).json({
      success: false,
      error: 'Failed to fetch task'
    });
  }
});

// POST /api/tasks - Create new task
router.post('/', (req, res) => {
  try {
    const { title, description, priority = 'medium', dueDate } = req.body;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }
    
    const newTask = {
      id: mockTasks.length + 1,
      title,
      description: description || '',
      status: 'pending',
      priority,
      dueDate: dueDate || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockTasks.push(newTask);
    
    logger.info({ taskId: newTask.id, title }, 'Task created successfully');
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task: newTask
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Error creating task');
    res.status(500).json({
      success: false,
      error: 'Failed to create task'
    });
  }
});

// PUT /api/tasks/:id - Update task
router.put('/:id', (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const taskIndex = mockTasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    const { title, description, status, priority, dueDate } = req.body;
    const task = mockTasks[taskIndex];
    
    // Update task fields
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    
    task.updatedAt = new Date().toISOString();
    
    logger.info({ taskId }, 'Task updated successfully');
    res.json({
      success: true,
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Error updating task');
    res.status(500).json({
      success: false,
      error: 'Failed to update task'
    });
  }
});

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const taskIndex = mockTasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    const deletedTask = mockTasks.splice(taskIndex, 1)[0];
    
    logger.info({ taskId }, 'Task deleted successfully');
    res.json({
      success: true,
      message: 'Task deleted successfully',
      task: deletedTask
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Error deleting task');
    res.status(500).json({
      success: false,
      error: 'Failed to delete task'
    });
  }
});

module.exports = router;
