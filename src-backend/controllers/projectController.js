const { v4: uuidv4 } = require('uuid');
const knex = require('knex');
const config = require('../knexfile');
const logger = require('../utils/logger');

const db = knex(config.development);

// Create new project
const createProject = async (req, res) => {
  try {
    const {
      title,
      description,
      type = 'academic',
      category = 'general',
      tags = [],
      objectives = '',
      teamMembers = [],
      diasporaPositions = [],
      priority = 'medium',
      university = '',
      mentorshipConnection = false,
      isPublic = true
    } = req.body;

    // Validation
    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Project title is required'
      });
    }

    if (!description) {
      return res.status(400).json({
        success: false,
        error: 'Project description is required'
      });
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

    logger.info({ 
      projectId, 
      userId: req.user.id, 
      title 
    }, 'Project created successfully');

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
    logger.error({ error: error.message }, 'Project creation failed');
    res.status(500).json({
      success: false,
      error: 'Server error during project creation'
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
