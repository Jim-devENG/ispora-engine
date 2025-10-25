const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/connection');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      type = 'academic',
      category = 'general',
      tags = [],
      objectives = [],
      teamMembers = [],
      diasporaPositions = [],
      priority = 'medium',
      university = '',
      mentorshipConnection = false,
      isPublic = true
    } = req.body;

    console.log('🔍 Projects v2 - Create project request:', {
      title,
      type,
      category,
      createdBy: req.user.id,
      userEmail: req.user.email
    });

    // Validation
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        error: 'Title and description are required'
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
      tags: JSON.stringify(tags),
      objectives: JSON.stringify(objectives),
      team_members: JSON.stringify(teamMembers),
      diaspora_positions: JSON.stringify(diasporaPositions),
      priority,
      university,
      mentorship_connection: mentorshipConnection,
      is_public: isPublic,
      created_by: req.user.id,
      status: 'active',
      created_at: new Date(),
      updated_at: new Date(),
    };

    await db('projects').insert(projectData);

    console.log('✅ Projects v2 - Project created successfully:', { projectId, title });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project: {
        id: projectData.id,
        title: projectData.title,
        description: projectData.description,
        type: projectData.type,
        category: projectData.category,
        tags: JSON.parse(projectData.tags),
        objectives: JSON.parse(projectData.objectives),
        teamMembers: JSON.parse(projectData.team_members),
        diasporaPositions: JSON.parse(projectData.diaspora_positions),
        priority: projectData.priority,
        university: projectData.university,
        mentorshipConnection: projectData.mentorship_connection,
        isPublic: projectData.is_public,
        createdBy: projectData.created_by,
        status: projectData.status,
        createdAt: projectData.created_at,
        updatedAt: projectData.updated_at
      }
    });
  } catch (error) {
    console.error('❌ Projects v2 - Create project error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create project'
    });
  }
});

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('🔍 Projects v2 - Get projects request:', { userId: req.user.id });

    const projects = await db('projects')
      .where({ created_by: req.user.id })
      .orderBy('created_at', 'desc');

    const formattedProjects = projects.map(project => ({
      id: project.id,
      title: project.title,
      description: project.description,
      type: project.type,
      category: project.category,
      tags: JSON.parse(project.tags || '[]'),
      objectives: JSON.parse(project.objectives || '[]'),
      teamMembers: JSON.parse(project.team_members || '[]'),
      diasporaPositions: JSON.parse(project.diaspora_positions || '[]'),
      priority: project.priority,
      university: project.university,
      mentorshipConnection: project.mentorship_connection,
      isPublic: project.is_public,
      createdBy: project.created_by,
      status: project.status,
      createdAt: project.created_at,
      updatedAt: project.updated_at
    }));

    console.log('✅ Projects v2 - Retrieved projects:', { count: formattedProjects.length });

    res.json({
      success: true,
      projects: formattedProjects,
      count: formattedProjects.length
    });
  } catch (error) {
    console.error('❌ Projects v2 - Get projects error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get projects'
    });
  }
});

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 Projects v2 - Get project request:', { projectId: id, userId: req.user.id });

    const project = await db('projects')
      .where({ id, created_by: req.user.id })
      .first();

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    const formattedProject = {
      id: project.id,
      title: project.title,
      description: project.description,
      type: project.type,
      category: project.category,
      tags: JSON.parse(project.tags || '[]'),
      objectives: JSON.parse(project.objectives || '[]'),
      teamMembers: JSON.parse(project.team_members || '[]'),
      diasporaPositions: JSON.parse(project.diaspora_positions || '[]'),
      priority: project.priority,
      university: project.university,
      mentorshipConnection: project.mentorship_connection,
      isPublic: project.is_public,
      createdBy: project.created_by,
      status: project.status,
      createdAt: project.created_at,
      updatedAt: project.updated_at
    };

    console.log('✅ Projects v2 - Retrieved project:', { projectId: id, title: project.title });

    res.json({
      success: true,
      project: formattedProject
    });
  } catch (error) {
    console.error('❌ Projects v2 - Get project error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get project'
    });
  }
});

module.exports = router;
