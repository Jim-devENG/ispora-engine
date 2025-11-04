/**
 * Tasks Controller (Mongoose)
 * Phase 1: Tasks CRUD integrated with MongoDB
 */

const Task = require('../models/Task');
const Project = require('../models/Project');
const notificationService = require('../services/notificationService');
const logger = require('../utils/logger');

/**
 * Create a new task
 * Protected route - requires authentication
 */
const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      projectId,
      assignee,
      status = 'todo',
      priority = 'medium',
      dueDate,
      tags = []
    } = req.body;

    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        code: 'INVALID_PAYLOAD',
        message: 'Title is required'
      });
    }

    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        code: 'INVALID_PAYLOAD',
        message: 'Project ID is required'
      });
    }

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
        code: 'NOT_FOUND',
        message: 'The specified project does not exist'
      });
    }

    // 🔑 SECURITY: Verify user owns the project (only project owner can create tasks)
    const userId = req.user._id;
    if (project.owner.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Permission denied',
        code: 'FORBIDDEN',
        message: 'You do not have permission to create tasks for this project'
      });
    }

    // Create task
    const task = new Task({
      title: title.trim(),
      description: description ? description.trim() : undefined,
      projectId: project._id,
      assignee: assignee || undefined,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      tags: Array.isArray(tags) ? tags : []
    });

    await task.save();

    // Populate references for response
    await task.populate('projectId', 'title owner');
    if (task.assignee) {
      await task.populate('assignee', 'name email firstName lastName');
    }

    logger.info({
      taskId: task._id.toString(),
      projectId: project._id.toString(),
      userId: userId.toString(),
      title: task.title
    }, '✅ Task created successfully');

    // Phase 2: Create notification for assignee (if task is assigned)
    if (task.assignee) {
      try {
        const project = await Project.findById(task.projectId);
        const creator = req.user;

        await notificationService.createNotification({
          userId: task.assignee,
          type: 'task_assigned',
          title: `New task assigned: ${task.title}`,
          message: `${creator.name || creator.email || 'Someone'} assigned you a task in ${project?.title || 'a project'}`,
          relatedId: task._id,
          relatedType: 'Task',
          metadata: {
            taskId: task._id.toString(),
            projectId: project?._id?.toString(),
            projectTitle: project?.title,
            taskTitle: task.title,
            dueDate: task.dueDate
          }
        });
      } catch (notifError) {
        // Log error but don't fail task creation
        logger.error({ 
          error: notifError.message, 
          taskId: task._id.toString() 
        }, 'Failed to create notification for task assignment');
      }
    }

    // Format response
    const responseTask = task.toJSON();
    if (responseTask.assigneeUser) {
      responseTask.assignee = {
        id: task.assignee._id.toString(),
        email: task.assignee.email || null,
        name: task.assignee.name || task.assignee.email || 'Unknown',
        first_name: task.assignee.firstName || null,
        last_name: task.assignee.lastName || null
      };
      delete responseTask.assigneeUser;
    }

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: responseTask
    });

  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, '❌ Task creation failed');

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        code: 'INVALID_PAYLOAD',
        message: messages
      });
    }

    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID',
        code: 'INVALID_ID',
        message: 'The provided ID is invalid'
      });
    }

    // Generic server error
    res.status(500).json({
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR',
      message: 'Failed to create task. Please try again later.'
    });
  }
};

/**
 * Get tasks for a project
 * Public/protected based on project visibility
 */
const getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Verify project exists
    const project = await Project.findById(projectId).select('owner visibility isPublic');
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
        code: 'NOT_FOUND',
        message: 'The specified project does not exist'
      });
    }

    // 🔑 SECURITY: Check project visibility
    // If project is private, require authentication and ownership
    if (project.visibility === 'private' || !project.isPublic) {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'NO_TOKEN',
          message: 'This project is private. Please log in to view tasks.'
        });
      }

      const userId = req.user._id;
      if (project.owner.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Permission denied',
          code: 'FORBIDDEN',
          message: 'You do not have permission to view tasks for this project'
        });
      }
    }

    // Build query
    const query = { projectId: project._id };

    // Apply filters if provided
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.assignee) {
      query.assignee = req.query.assignee;
    }

    // Get tasks with pagination
    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate('assignee', 'name email firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Task.countDocuments(query)
    ]);

    // Format tasks for response
    const formattedTasks = tasks.map(task => {
      const formatted = { ...task };
      if (task.assignee) {
        formatted.assignee = {
          id: task.assignee._id.toString(),
          email: task.assignee.email || null,
          name: task.assignee.name || task.assignee.email || 'Unknown',
          first_name: task.assignee.firstName || null,
          last_name: task.assignee.lastName || null
        };
      }
      return formatted;
    });

    res.status(200).json({
      success: true,
      data: formattedTasks,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error({ error: error.message, projectId: req.params.projectId }, '❌ Failed to get project tasks');

    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid project ID',
        code: 'INVALID_ID',
        message: 'The provided project ID is invalid'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR',
      message: 'Failed to retrieve tasks. Please try again later.'
    });
  }
};

/**
 * Update task status
 * Protected route - requires authentication
 */
const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!status || !['todo', 'doing', 'done'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        code: 'INVALID_PAYLOAD',
        message: 'Status must be one of: todo, doing, done'
      });
    }

    // Get task
    const task = await Task.findById(id).populate('projectId', 'owner');
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
        code: 'NOT_FOUND',
        message: 'The specified task does not exist'
      });
    }

    // 🔑 SECURITY: Verify user owns the project (only project owner can update tasks)
    const userId = req.user._id;
    if (task.projectId.owner.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Permission denied',
        code: 'FORBIDDEN',
        message: 'You do not have permission to update this task'
      });
    }

    // Update task status
    task.status = status;
    
    // If status is 'done', set completedDate
    if (status === 'done' && !task.completedDate) {
      task.completedDate = new Date();
    }
    // If status is not 'done', clear completedDate
    if (status !== 'done' && task.completedDate) {
      task.completedDate = undefined;
    }

    const wasDone = task.completedDate !== undefined;
    await task.save();
    const isNowDone = task.status === 'done';

    // Populate references for response
    if (task.assignee) {
      await task.populate('assignee', 'name email firstName lastName');
    }

    // Phase 2: Create notification when task is completed (status changed to 'done')
    if (isNowDone && !wasDone && task.assignee) {
      try {
        const project = await Project.findById(task.projectId);
        const updater = req.user;

        await notificationService.createNotification({
          userId: task.assignee,
          type: 'task_completed',
          title: `Task completed: ${task.title}`,
          message: `${updater.name || updater.email || 'Someone'} marked "${task.title}" as completed`,
          relatedId: task._id,
          relatedType: 'Task',
          metadata: {
            taskId: task._id.toString(),
            projectId: project?._id?.toString(),
            projectTitle: project?.title,
            taskTitle: task.title
          }
        });

        // Also notify project owner if task assignee is not the owner
        if (project && project.owner.toString() !== task.assignee.toString()) {
          await notificationService.createNotification({
            userId: project.owner,
            type: 'task_completed',
            title: `Task completed in ${project.title}`,
            message: `Task "${task.title}" has been completed by ${task.assignee?.name || task.assignee?.email || 'the assignee'}`,
            relatedId: task._id,
            relatedType: 'Task',
            metadata: {
              taskId: task._id.toString(),
              projectId: project._id.toString(),
              projectTitle: project.title,
              taskTitle: task.title,
              completedBy: task.assignee._id.toString()
            }
          });
        }
      } catch (notifError) {
        // Log error but don't fail task update
        logger.error({ 
          error: notifError.message, 
          taskId: task._id.toString() 
        }, 'Failed to create notification for task completion');
      }
    }

    logger.info({
      taskId: task._id.toString(),
      userId: userId.toString(),
      status: task.status
    }, '✅ Task status updated successfully');

    // Format response
    const responseTask = task.toJSON();
    if (responseTask.assigneeUser) {
      responseTask.assignee = {
        id: task.assignee._id.toString(),
        email: task.assignee.email || null,
        name: task.assignee.name || task.assignee.email || 'Unknown',
        first_name: task.assignee.firstName || null,
        last_name: task.assignee.lastName || null
      };
      delete responseTask.assigneeUser;
    }

    res.status(200).json({
      success: true,
      message: 'Task status updated successfully',
      data: responseTask
    });

  } catch (error) {
    logger.error({ error: error.message, taskId: req.params.id }, '❌ Failed to update task status');

    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid task ID',
        code: 'INVALID_ID',
        message: 'The provided task ID is invalid'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR',
      message: 'Failed to update task status. Please try again later.'
    });
  }
};

module.exports = {
  createTask,
  getProjectTasks,
  updateTaskStatus
};

