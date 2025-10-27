const express = require('express');
const { authenticateToken, optionalAuth } = require('../middleware/auth-clean');
const db = require('../database/connection');

const router = express.Router();

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    console.log('🔍 Projects requested');
    
    // Get projects from database or return sample data
    let projects = [];
    
    try {
      // Try to get real projects from database
      const dbProjects = await db('projects')
        .select('id', 'title', 'description', 'type', 'category', 'status', 'tags', 'created_at', 'created_by')
        .where('status', 'active')
        .orderBy('created_at', 'desc')
        .limit(20);
      
      projects = dbProjects.map(project => ({
        id: project.id,
        title: project.title,
        description: project.description,
        type: project.type,
        category: project.category,
        status: project.status,
        tags: project.tags ? JSON.parse(project.tags) : [],
        createdAt: project.created_at,
        createdBy: project.created_by,
        likes: 0,
        comments: 0,
        shares: 0
      }));
    } catch (error) {
      console.log('⚠️ Using sample project data');
      // Fallback to sample data
      projects = [
        {
          id: '1',
          title: 'Sample Project',
          description: 'This is a sample project for testing',
          type: 'academic',
          category: 'education',
          status: 'active',
          tags: ['sample', 'test'],
          createdAt: new Date().toISOString(),
          createdBy: 'demo-user-id',
          likes: 5,
          comments: 2,
          shares: 1
        }
      ];
    }
    
    res.json({
      success: true,
      data: projects,
      count: projects.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Get projects error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get projects'
    });
  }
});

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Project creation requested');
    const {
      title,
      description,
      type = 'academic',
      category,
      tags = [],
      media = [],
      collaborators = [],
      objectives,
      teamMembers,
      diasporaPositions,
      priority,
      university,
      mentorshipConnection,
      isPublic = true
    } = req.body;

    // Validation
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        error: 'Title and description are required'
      });
    }

    console.log('📝 Creating project:', {
      title,
      type,
      category,
      tags: tags.length,
      createdBy: req.user.id
    });

    // Create project data
    const projectId = require('uuid').v4();
    const projectData = {
      id: projectId,
      title,
      description,
      type,
      category: category || 'general',
      status: 'active',
      tags: JSON.stringify(tags),
      media: JSON.stringify(media),
      collaborators: JSON.stringify(collaborators),
      objectives: objectives || '',
      team_members: JSON.stringify(teamMembers || []),
      diaspora_positions: JSON.stringify(diasporaPositions || []),
      priority: priority || 'medium',
      university: university || '',
      mentorship_connection: mentorshipConnection || '',
      is_public: isPublic,
      created_by: req.user.id,
      created_at: new Date(),
      updated_at: new Date()
    };

    // Save to database
    await db('projects').insert(projectData);

    // Return created project (without sensitive data)
    const createdProject = {
      id: projectData.id,
      title: projectData.title,
      description: projectData.description,
      type: projectData.type,
      category: projectData.category,
      status: projectData.status,
      tags: JSON.parse(projectData.tags),
      media: JSON.parse(projectData.media),
      collaborators: JSON.parse(projectData.collaborators),
      objectives: projectData.objectives,
      teamMembers: JSON.parse(projectData.team_members),
      diasporaPositions: JSON.parse(projectData.diaspora_positions),
      priority: projectData.priority,
      university: projectData.university,
      mentorshipConnection: projectData.mentorship_connection,
      isPublic: projectData.is_public,
      createdBy: projectData.created_by,
      createdAt: projectData.created_at,
      likes: 0,
      comments: 0,
      shares: 0
    };

    console.log('✅ Project created successfully:', projectData.id);

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: createdProject
    });

  } catch (error) {
    console.error('❌ Create project error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create project'
    });
  }
});

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 Project requested:', id);
    
    const project = await db('projects')
      .where({ id, status: 'active' })
      .first();
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    const projectData = {
      id: project.id,
      title: project.title,
      description: project.description,
      type: project.type,
      category: project.category,
      status: project.status,
      tags: project.tags ? JSON.parse(project.tags) : [],
      media: project.media ? JSON.parse(project.media) : [],
      collaborators: project.collaborators ? JSON.parse(project.collaborators) : [],
      objectives: project.objectives,
      teamMembers: project.team_members ? JSON.parse(project.team_members) : [],
      diasporaPositions: project.diaspora_positions ? JSON.parse(project.diaspora_positions) : [],
      priority: project.priority,
      university: project.university,
      mentorshipConnection: project.mentorship_connection,
      isPublic: project.is_public,
      createdBy: project.created_by,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
      likes: 0,
      comments: 0,
      shares: 0
    };

    res.json({
      success: true,
      data: projectData
    });
  } catch (error) {
    console.error('❌ Get project error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get project'
    });
  }
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    console.log('🔍 Project update requested:', id);
    
    // Check if project exists and user owns it
    const project = await db('projects')
      .where({ id, created_by: req.user.id })
      .first();
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found or access denied'
      });
    }

    // Prepare update data
    const allowedFields = [
      'title', 'description', 'type', 'category', 'tags', 'media',
      'collaborators', 'objectives', 'team_members', 'diaspora_positions',
      'priority', 'university', 'mentorship_connection', 'is_public'
    ];
    
    const updateFields = {};
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        if (['tags', 'media', 'collaborators', 'team_members', 'diaspora_positions'].includes(field)) {
          updateFields[field] = JSON.stringify(updateData[field]);
        } else {
          updateFields[field] = updateData[field];
        }
      }
    });
    
    updateFields.updated_at = new Date();

    await db('projects').where({ id }).update(updateFields);

    console.log('✅ Project updated successfully:', id);

    res.json({
      success: true,
      message: 'Project updated successfully'
    });
  } catch (error) {
    console.error('❌ Update project error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update project'
    });
  }
});

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 Project deletion requested:', id);
    
    // Check if project exists and user owns it
    const project = await db('projects')
      .where({ id, created_by: req.user.id })
      .first();
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found or access denied'
      });
    }

    // Soft delete by setting status to 'deleted'
    await db('projects').where({ id }).update({
      status: 'deleted',
      updated_at: new Date()
    });

    console.log('✅ Project deleted successfully:', id);

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete project error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete project'
    });
  }
});

module.exports = router;