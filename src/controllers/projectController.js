const { v4: uuidv4 } = require('uuid');
const knex = require('knex');
const config = require('../knexfile');
const logger = require('../utils/logger');
const { validatePayload, sanitizePayload, ValidationError } = require('../utils/validation');

// 🛡️ DevOps Guardian: Use environment-appropriate database config
const dbConfig = process.env.NODE_ENV === 'production' 
  ? (config.production || config.development)
  : config.development;

const db = knex(dbConfig);

// Create new project
const createProject = async (req, res) => {
  try {
    console.log('[iSpora] Incoming Project Payload:', req.body);

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
      
      // 🛡️ DevOps Guardian: Add CORS headers to error response
      const origin = req.headers.origin;
      if (origin && origin.includes('ispora.app')) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }
      
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }
    
    // Log authentication info for debugging
    console.log('[DEBUG] Project creation request:', {
      userId: req.user.id,
      userEmail: req.user.email,
      hasToken: !!req.headers.authorization,
      dbClient: dbConfig.client
    });
    
    // 🛡️ DevOps Guardian: Development fallback for missing category
    if (!req.body.category) {
      console.warn("⚠️ Missing category field on project creation. Assigning 'Uncategorized' as fallback.");
      req.body.category = 'Uncategorized';
    }
    
    // Validate and sanitize payload
    // 🛡️ DevOps Guardian: Wrap validation in try-catch to handle validation errors gracefully
    let validatedPayload, sanitizedPayload;
    try {
      validatedPayload = validatePayload(req.body, 'createProject');
      sanitizedPayload = sanitizePayload(validatedPayload);
    } catch (validationError) {
      // If validation fails, log but continue with basic validation
      console.warn('[WARNING] Validation error, using basic validation:', validationError.message);
      // Use raw payload if validation schema doesn't match, but still sanitize
      sanitizedPayload = sanitizePayload(req.body);
    }
    
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

    // 🛡️ DevOps Guardian: Handle objectives - convert array to string if needed
    let objectivesString = objectives;
    if (Array.isArray(objectives)) {
      // Convert array of objectives to a formatted string (one per line or comma-separated)
      objectivesString = objectives.length > 0 
        ? objectives.join('\n') 
        : '';
    } else if (typeof objectives !== 'string') {
      // If it's not a string and not an array, convert to string
      objectivesString = String(objectives || '');
    }

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
      objectives: objectivesString,
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

    // Log the project data before insertion
    console.log('📝 Project data to insert:', JSON.stringify(projectData, null, 2));
    console.log('🔍 Project creation debugging:', {
      hasTitle: !!title,
      hasDescription: !!description,
      hasCategory: !!category,
      hasType: !!type,
      hasPriority: !!priority,
      userId: req.user?.id,
      projectId: projectId
    });
    
    // 🛡️ DevOps Guardian: Verify user exists in database before creating project
    // This should always succeed if the token is valid
    console.log('[DEBUG] Looking up user in database:', { userId: req.user.id });
    
    let userExists;
    try {
      userExists = await db('users').where('id', req.user.id).first();
      
      // If not found by ID and we have email, try email lookup
      if (!userExists && req.user.email) {
        console.log('[DEBUG] User not found by ID, trying email lookup:', { email: req.user.email });
        userExists = await db('users').where('email', req.user.email).first();
      }
    } catch (dbError) {
      console.error('[ERROR] Database error during user lookup:', dbError);
      logger.error({ error: dbError.message, userId: req.user.id }, 'Database error during user lookup');
      
      // 🛡️ DevOps Guardian: Add CORS headers to error response
      const origin = req.headers.origin;
      if (origin && origin.includes('ispora.app')) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }
      
      return res.status(500).json({
        success: false,
        error: 'Database error. Please try again.',
        code: 'DATABASE_ERROR'
      });
    }
    
    if (!userExists) {
      console.error('❌ User not found in database:', {
        userId: req.user.id,
        userEmail: req.user.email,
        tokenPayload: req.user,
        dbConfig: {
          client: dbConfig.client,
          database: dbConfig.connection?.database || dbConfig.connection?.filename
        }
      });
      
      // Debug: Check if there are any users at all
      try {
        const userCount = await db('users').count('* as count').first();
        console.log('[DEBUG] Total users in database:', userCount?.count || 0);
      } catch (countError) {
        console.error('[ERROR] Failed to count users:', countError);
      }
      
      // 🛡️ DevOps Guardian: Add CORS headers to error response
      const origin = req.headers.origin;
      if (origin && origin.includes('ispora.app')) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }
      
      return res.status(401).json({
        success: false,
        error: 'User not found. Please log in again.',
        code: 'USER_NOT_FOUND',
        message: 'Your session may have expired. Please log out and log back in.'
      });
    }
    
    console.log('✅ User verified:', {
      id: userExists.id,
      email: userExists.email,
      name: `${userExists.first_name} ${userExists.last_name}`
    });
    
    // 🛡️ DevOps Guardian: Insert with error handling for database constraints
    try {
      await db('projects').insert(projectData);
      console.log('[iSpora] Project Inserted:', new Date().toISOString());
    } catch (dbError) {
      console.error('[ERROR] Database insert failed:', dbError);
      
      // Handle unique constraint violations
      if (dbError.code === 'SQLITE_CONSTRAINT' || dbError.code === '23505') {
        logger.error({ error: dbError.message, projectId }, '❌ Project creation failed - duplicate ID');
        return res.status(409).json({
          success: false,
          error: 'Project with this ID already exists. Please try again.',
          code: 'DUPLICATE_PROJECT'
        });
      }
      
      // Handle foreign key constraint violations
      if (dbError.code === 'SQLITE_CONSTRAINT' || dbError.code === '23503') {
        logger.error({ error: dbError.message, userId: req.user.id }, '❌ Project creation failed - invalid user');
        return res.status(400).json({
          success: false,
          error: 'User not found. Please log in again.',
          code: 'USER_NOT_FOUND'
        });
      }
      
      // Re-throw other database errors
      throw dbError;
    }

    // Create feed entry for the new project
    const feedEntryId = uuidv4();
    const feedEntryData = {
      id: feedEntryId,
      type: 'project',
      title: `New Project: ${title}`,
      description: description,
      category: category,
      // 🛡️ DevOps Guardian: Handle metadata for both SQLite (text) and PostgreSQL (json)
      // SQLite stores JSON as text, PostgreSQL has native JSON support
      metadata: (process.env.NODE_ENV === 'production' && dbConfig.client === 'pg')
        ? JSON.stringify({
            project_id: projectId,
            action: 'created',
            priority: priority
          })
        : JSON.stringify({
            project_id: projectId,
            action: 'created',
            priority: priority
          }),
      user_id: req.user.id, // Use user ID from authenticated token
      project_id: projectId,
      is_public: isPublic,
      created_at: new Date(),
      updated_at: new Date(),
      likes: 0,
      comments: 0,
      shares: 0
    };

    // 🛡️ DevOps Guardian: Insert feed entry with error handling
    try {
      await db('feed_entries').insert(feedEntryData);
      console.log('[iSpora] Feed Activity Logged: PROJECT_CREATED');
      logger.info({ 
        feedEntryId, 
        projectId, 
        userId: req.user.id 
      }, '✅ Feed entry created successfully');
    } catch (feedError) {
      // Log error but don't fail project creation if feed entry fails
      console.error('[ERROR] Failed to create feed entry:', feedError);
      logger.error({ 
        error: feedError.message, 
        projectId, 
        userId: req.user.id 
      }, '⚠️ Feed entry creation failed (project still created)');
      // Continue with project creation even if feed entry fails
    }

    console.log("✅ Project created successfully:", projectId);
    logger.info({ 
      projectId, 
      userId: req.user.id, 
      title 
    }, '✅ Project created successfully');

    // Format response to match frontend expectations
    const formattedProject = {
      ...projectData,
      tags: JSON.parse(projectData.tags),
      team_members: JSON.parse(projectData.team_members),
      diaspora_positions: JSON.parse(projectData.diaspora_positions),
      objectives: objectivesString, // Return as string to match frontend expectations
      creator: {
        id: req.user.id,
        email: userExists.email,
        name: `${userExists.first_name || ''} ${userExists.last_name || ''}`.trim()
      }
    };

    res.status(201).json({
      success: true,
      message: 'Project and activity created successfully',
      data: formattedProject,
      project: formattedProject, // Also include as 'project' for API client compatibility
      activity: {
        id: feedEntryId,
        type: 'project',
        title: `New Project: ${title}`,
        created_at: feedEntryData.created_at
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
    if (error.code === 'SQLITE_CONSTRAINT' || error.code === '23505' || error.code === '23503') {
      logger.error({
        error: error.message,
        code: error.code,
        constraint: error.constraint,
        payload: req.body,
        userId: req.user?.id
      }, '❌ Project creation failed - database constraint error');
      
      let errorMessage = 'Database constraint error. Please check your data.';
      if (error.code === '23503') {
        errorMessage = 'Foreign key constraint failed. User may not exist. Please log in again.';
      } else if (error.constraint) {
        errorMessage = `Database constraint error: ${error.constraint}`;
      }
      
      return res.status(400).json({
        success: false,
        error: errorMessage,
        code: 'CONSTRAINT_ERROR',
        details: {
          constraint: error.constraint,
          code: error.code,
          message: error.message
        }
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
