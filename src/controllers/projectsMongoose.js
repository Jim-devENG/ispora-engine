/**
 * Projects Controller (Mongoose)
 * Phase 1: Projects CRUD with objectives normalization
 */

const Project = require('../models/Project');
const ProjectUpdate = require('../models/ProjectUpdate');
const logger = require('../utils/logger');

/**
 * Create a new project
 * Normalizes objectives: accepts string or array, stores as array
 */
const createProject = async (req, res) => {
  try {
    const {
      title,
      description,
      objectives, // Frontend sends string, we normalize to array
      type = 'academic',
      category = 'Uncategorized',
      tags = [],
      teamMembers = [],
      diasporaPositions = [],
      priority = 'medium',
      university = '',
      mentorshipConnection = false,
      isPublic = true,
      visibility = 'public'
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

    // 🔑 CRITICAL: Normalize objectives from string to array
    // Frontend sends objectives as string, but we store as array
    let normalizedObjectives = [];
    
    if (objectives) {
      if (Array.isArray(objectives)) {
        // If already array, validate and trim each item
        normalizedObjectives = objectives
          .map(obj => String(obj).trim())
          .filter(obj => obj.length > 0);
      } else if (typeof objectives === 'string') {
        // If string, split by newline OR comma, trim, filter empty
        normalizedObjectives = objectives
          .split(/\n|,/) // Split by newline or comma
          .map(obj => obj.trim())
          .filter(obj => obj.length > 0);
      } else {
        // If something else, convert to string first
        normalizedObjectives = [String(objectives).trim()].filter(obj => obj.length > 0);
      }
    }
    // If objectives is null/undefined, normalizedObjectives stays as empty array

    // Get user from authenticated request (Mongoose document)
    const ownerId = req.user._id;

    // Create project
    const project = new Project({
      owner: ownerId,
      title: title.trim(),
      description: description ? description.trim() : undefined,
      objectives: normalizedObjectives, // Stored as array (canonical format)
      type,
      category: category || 'Uncategorized',
      tags: Array.isArray(tags) ? tags : [],
      teamMembers: Array.isArray(teamMembers) ? teamMembers : [],
      diasporaPositions: Array.isArray(diasporaPositions) ? diasporaPositions : [],
      priority,
      university: university ? university.trim() : undefined,
      mentorshipConnection: Boolean(mentorshipConnection),
      isPublic: Boolean(isPublic),
      visibility: visibility || 'public'
    });

    // Save project (pre-save hook will ensure objectives is array)
    await project.save();

    // Populate owner (creator) for response
    await project.populate('owner', 'name email firstName lastName');

    logger.info({
      projectId: project._id.toString(),
      userId: ownerId.toString(),
      title: project.title
    }, '✅ Project created successfully');

    // Format response with creator info
    const responseProject = project.toJSON();
    responseProject.creator = {
      id: project.owner._id.toString(),
      email: project.owner.email || null,
      name: project.owner.name || project.owner.fullName || project.owner.email || 'Unknown',
      first_name: project.owner.firstName || null,
      last_name: project.owner.lastName || null
    };

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: responseProject
    });

  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, '❌ Project creation failed');

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

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: 'Duplicate project',
        code: 'DUPLICATE_PROJECT',
        message: 'A project with this identifier already exists'
      });
    }

    // Generic server error
    res.status(500).json({
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR',
      message: 'Failed to create project. Please try again later.'
    });
  }
};

/**
 * Get all projects (public)
 * Supports pagination
 */
const getProjects = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build query - only public projects by default
    const query = { visibility: 'public', isPublic: true };

    // Apply filters if provided
    if (req.query.type) {
      query.type = req.query.type;
    }
    if (req.query.category) {
      query.category = req.query.category;
    }
    if (req.query.owner) {
      query.owner = req.query.owner;
    }

    // Get projects with pagination
    const [projects, total] = await Promise.all([
      Project.find(query)
        .populate('owner', 'name email firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(), // Use lean() for better performance
      Project.countDocuments(query)
    ]);

    // Format projects for response
    const formattedProjects = projects.map(project => {
      const formatted = { ...project };
      formatted.creator = {
        id: project.owner._id.toString(),
        email: project.owner.email || null,
        name: project.owner.name || project.owner.email || 'Unknown',
        first_name: project.owner.firstName || null,
        last_name: project.owner.lastName || null
      };
      delete formatted.owner;
      return formatted;
    });

    res.status(200).json({
      success: true,
      data: formattedProjects,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error({ error: error.message }, '❌ Failed to get projects');

    res.status(500).json({
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR',
      message: 'Failed to retrieve projects. Please try again later.'
    });
  }
};

/**
 * Get project by ID
 */
const getProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id)
      .populate('owner', 'name email firstName lastName')
      .lean();

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
        code: 'NOT_FOUND',
        message: 'The requested project could not be found'
      });
    }

    // Format response with creator info
    const formattedProject = { ...project };
    formattedProject.creator = {
      id: project.owner._id.toString(),
      email: project.owner.email || null,
      name: project.owner.name || project.owner.email || 'Unknown',
      first_name: project.owner.firstName || null,
      last_name: project.owner.lastName || null
    };
    delete formattedProject.owner;

    res.status(200).json({
      success: true,
      data: formattedProject
    });

  } catch (error) {
    logger.error({ error: error.message, projectId: req.params.id }, '❌ Failed to get project');

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
      message: 'Failed to retrieve project. Please try again later.'
    });
  }
};

/**
 * Get project updates
 * Protected route - returns updates for user's projects if mine=true
 */
const getProjectUpdates = async (req, res) => {
  try {
    const { mine = 'false' } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // 🔑 CRITICAL: If mine=true, only return updates for projects owned by user
    let query = {};
    
    if (mine === 'true' || mine === true) {
      // Get user ID from authenticated request
      const userId = req.user._id;
      
      // Find all projects owned by user
      const userProjects = await Project.find({ owner: userId }).select('_id').lean();
      const projectIds = userProjects.map(p => p._id);
      
      if (projectIds.length === 0) {
        // User has no projects, return empty array
        return res.status(200).json({
          success: true,
          data: [],
          meta: {
            page,
            limit,
            total: 0,
            totalPages: 0
          }
        });
      }
      
      // Query updates for user's projects only
      query.projectId = { $in: projectIds };
    }

    // Get updates with pagination
    const [updates, total] = await Promise.all([
      ProjectUpdate.find(query)
        .populate('projectId', 'title owner')
        .populate('author', 'name email firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ProjectUpdate.countDocuments(query)
    ]);

    // Format updates for response
    const formattedUpdates = updates.map(update => {
      const formatted = { ...update };
      
      // Include project info if available
      if (update.projectId) {
        formatted.project = {
          id: update.projectId._id.toString(),
          title: update.projectId.title || 'Untitled Project'
        };
      }
      
      // Include author info if available
      if (update.author) {
        formatted.author = {
          id: update.author._id.toString(),
          email: update.author.email || null,
          name: update.author.name || update.author.email || 'Unknown',
          first_name: update.author.firstName || null,
          last_name: update.author.lastName || null
        };
      }
      
      // Rename timestamp field for frontend compatibility
      formatted.timestamp = formatted.createdAt;
      
      return formatted;
    });

    res.status(200).json({
      success: true,
      data: formattedUpdates,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error({ error: error.message }, '❌ Failed to get project updates');

    res.status(500).json({
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR',
      message: 'Failed to retrieve project updates. Please try again later.'
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  getProjectUpdates
};

