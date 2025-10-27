const { v4: uuidv4 } = require('uuid');
const knex = require('knex');
const config = require('../knexfile');
const logger = require('../utils/logger');
const { validatePayload, sanitizePayload, ValidationError } = require('../utils/validation');

const db = knex(config.development);

// Create new project
const createProject = async (req, res) => {
  try {
    console.log('[DEBUG] Incoming payload:', req.body);

    // Validate required fields
    if (!req.body.title || !req.body.description) {
      console.error('[ERROR] Missing required fields:', {
        hasTitle: !!req.body.title,
        hasDescription: !!req.body.description
      });
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title and description are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    if (!req.user || !req.user.id) {
      console.error('[ERROR] Missing authentication:', { hasUser: !!req.user, hasUserId: !!req.user?.id });
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }
    
    // 🛡️ DevOps Guardian: Development fallback for missing category
    if (!req.body.category && process.env.NODE_ENV === 'development') {
      console.warn("⚠️ Missing category field on project creation. Assigning 'Uncategorized' as fallback.");
      req.body.category = 'Uncategorized';
    }
    
    // Validate and sanitize payload
    const validatedPayload = validatePayload(req.body, 'createProject');
    const sanitizedPayload = sanitizePayload(validatedPayload);
    
    const {
      title,
      description,
      type = 'academic',
      category = 'Uncategorized', // 🛡️ DevOps Guardian: Default fallback for missing category
      tags = [],
      objectives = '',
      teamMembers = [],
      diasporaPositions = [],
      priority = 'medium',
      university = '',
      mentorshipConnection = false,
      isPublic = true
    } = sanitizedPayload;

    // Create project
    const projectId = uuidv4();
    const projectData = {
      id: projectId,
      title,
      description,
      type,
      category,
      status: 'active',
      tags: JSON.stringify(tags),
      objectives,
      team_members: JSON.stringify(teamMembers),
      diaspora_positions: JSON.stringify(diasporaPositions),
      priority,
      university,
      mentorship_connection: mentorshipConnection,
      is_public: isPublic,
      created_by: req.user.id,
      created_at: new Date(),
      updated_at: new Date(),
      likes: 0,
      comments: 0,
      shares: 0
    };

    await db('projects').insert(projectData);

    // Create feed entry for the new project
    const feedEntryId = uuidv4();
    const feedEntryData = {
      id: feedEntryId,
      type: 'project',
      title: `New Project: ${title}`,
      description: description,
      category: category,
      metadata: JSON.stringify({
        project_id: projectId,
        action: 'created',
        priority: priority
      }),
      user_id: req.user.id,
      project_id: projectId,
      is_public: isPublic,
      created_at: new Date(),
      updated_at: new Date(),
      likes: 0,
      comments: 0,
      shares: 0
    };

    await db('feed_entries').insert(feedEntryData);

    console.log("✅ Project created successfully:", projectId);
    logger.info({ 
      projectId, 
      userId: req.user.id, 
      title 
    }, '✅ Project created successfully');

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: {
        ...projectData,
        tags: JSON.parse(projectData.tags),
        team_members: JSON.parse(projectData.team_members),
        diaspora_positions: JSON.parse(projectData.diaspora_positions)
      }
    });

  } catch (error) {
    console.error('[ERROR] Project creation failed:', error);
    console.error('[ERROR] Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });

    if (error instanceof ValidationError) {
      logger.warn({
        validationError: error.message,
        details: error.details,
        payload: req.body
      }, '❌ Project creation failed - validation error');
      return res.status(400).json({
        success: false,
        error: error.message,
        code: 'VALIDATION_ERROR',
        details: error.details
      });
    }

    // Handle database constraint errors
    if (error.code === 'SQLITE_CONSTRAINT' || error.code === '23505') {
      logger.error({
        error: error.message,
        code: error.code,
        payload: req.body
      }, '❌ Project creation failed - database constraint error');
      return res.status(400).json({
        success: false,
        error: 'Database constraint error. Please check your data.',
        code: 'CONSTRAINT_ERROR'
      });
    }

    logger.error({
      error: error.message,
      stack: error.stack,
      payload: req.body
    }, '❌ Project creation failed');

    res.status(500).json({
      success: false,
      error: error.message || 'Server error during project creation'
    });
  }
};

// Get all projects
const getProjects = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, type, search } = req.query;
    const offset = (page - 1) * limit;

    let query = db('projects')
      .select(
        'projects.*',
        'users.first_name',
        'users.last_name',
        'users.email as creator_email'
      )
      .leftJoin('users', 'projects.created_by', 'users.id')
      .where('projects.is_public', true)
      .orderBy('projects.created_at', 'desc');

    // Apply filters
    if (category) {
      query = query.where('projects.category', category);
    }

    if (type) {
      query = query.where('projects.type', type);
    }

    if (search) {
      query = query.where(function() {
        this.where('projects.title', 'like', `%${search}%`)
            .orWhere('projects.description', 'like', `%${search}%`);
      });
    }

    // Get total count for pagination
    const totalQuery = query.clone();
    const totalCount = await totalQuery.count('* as count').first();

    // Apply pagination
    const projects = await query.limit(limit).offset(offset);

    // Parse JSON fields
    const formattedProjects = projects.map(project => ({
      ...project,
      tags: JSON.parse(project.tags || '[]'),
      team_members: JSON.parse(project.team_members || '[]'),
      diaspora_positions: JSON.parse(project.diaspora_positions || '[]'),
      creator: {
        name: `${project.first_name} ${project.last_name}`,
        email: project.creator_email
      }
    }));

    logger.info({ 
      count: projects.length, 
      page, 
      limit 
    }, 'Projects retrieved successfully');

    res.json({
      success: true,
      data: formattedProjects,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount.count,
        pages: Math.ceil(totalCount.count / limit)
      }
    });

  } catch (error) {
    logger.error({ error: error.message }, 'Get projects failed');
    res.status(500).json({
      success: false,
      error: 'Server error fetching projects'
    });
  }
};

// Get single project
const getProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await db('projects')
      .select(
        'projects.*',
        'users.first_name',
        'users.last_name',
        'users.email as creator_email'
      )
      .leftJoin('users', 'projects.created_by', 'users.id')
      .where('projects.id', id)
      .first();

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Parse JSON fields
    const formattedProject = {
      ...project,
      tags: JSON.parse(project.tags || '[]'),
      team_members: JSON.parse(project.team_members || '[]'),
      diaspora_positions: JSON.parse(project.diaspora_positions || '[]'),
      creator: {
        name: `${project.first_name} ${project.last_name}`,
        email: project.creator_email
      }
    };

    logger.info({ projectId: id }, 'Project retrieved successfully');

    res.json({
      success: true,
      data: formattedProject
    });

  } catch (error) {
    logger.error({ error: error.message }, 'Get project failed');
    res.status(500).json({
      success: false,
      error: 'Server error fetching project'
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject
};
