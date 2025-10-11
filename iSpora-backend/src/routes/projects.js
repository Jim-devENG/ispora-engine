const express = require('express');
const db = require('../database/connection');
const { protect, optionalAuth } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// @desc    Get projects (public, or mine when requested)
// @route   GET /api/projects
// @access  Public (optionally personalized when authenticated)
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, type, status, tags, difficulty, mine } = req.query;

    const offset = (page - 1) * limit;

    let query = db('projects as p')
      .select([
        'p.*',
        'u.first_name as creator_first_name',
        'u.last_name as creator_last_name',
        'u.username as creator_username',
        'u.avatar_url as creator_avatar',
      ])
      .join('users as u', 'p.creator_id', 'u.id');

    // If requesting only my projects and we have an authenticated user, return all their projects
    if (mine === 'true' && req.user && req.user.id) {
      query = query.where('p.creator_id', req.user.id);
    } else {
      // Otherwise show only public projects
      query = query.where('p.is_public', true);
    }

    if (status) {
      query = query.where('p.status', status);
    }

    if (search) {
      query = query.where(function () {
        this.where('p.title', 'like', `%${search}%`).orWhere(
          'p.description',
          'like',
          `%${search}%`,
        );
      });
    }

    if (type) {
      query = query.where('p.type', type);
    }

    if (difficulty) {
      query = query.where('p.difficulty_level', difficulty);
    }

    if (tags) {
      const tagsArray = tags.split(',');
      query = query.where(function () {
        tagsArray.forEach((tag) => {
          this.orWhere('p.tags', 'like', `%${tag.trim()}%`);
        });
      });
    }

    const projects = await query
      .limit(parseInt(limit))
      .offset(offset)
      .orderBy('p.created_at', 'desc');

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const project = await db('projects as p')
      .select([
        'p.*',
        'u.first_name as creator_first_name',
        'u.last_name as creator_last_name',
        'u.username as creator_username',
        'u.avatar_url as creator_avatar',
        'u.title as creator_title',
      ])
      .join('users as u', 'p.creator_id', 'u.id')
      .where('p.id', req.params.id)
      .first();

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
router.post('/', protect, async (req, res, next) => {
  try {
    // Validate required fields
    if (!req.body.title) {
      return res.status(400).json({
        success: false,
        error: 'Title is required',
      });
    }

    const projectData = {
      id: uuidv4(),
      creator_id: req.user.id,
      title: req.body.title,
      description: req.body.description || '',
      detailed_description: req.body.detailed_description || '',
      type: req.body.type || 'academic',
      status: req.body.status || 'draft',
      tags: req.body.tags || [],
      is_public: req.body.is_public !== undefined ? req.body.is_public : true,
      start_date: req.body.start_date || null,
      end_date: req.body.end_date || null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    console.log('Creating project with data:', projectData);

    await db('projects').insert(projectData);

    const project = await db('projects as p')
      .select([
        'p.*',
        'u.first_name as creator_first_name',
        'u.last_name as creator_last_name',
        'u.username as creator_username',
        'u.avatar_url as creator_avatar',
      ])
      .join('users as u', 'p.creator_id', 'u.id')
      .where('p.id', projectData.id)
      .first();

    console.log('Project created successfully:', project);

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error('Error creating project:', error);
    next(error);
  }
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
router.put('/:id', protect, async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await db('projects').where({ id }).first();

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    // Check if user owns the project or is admin
    if (project.creator_id !== req.user.id && req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this project',
      });
    }

    const updateData = {
      ...req.body,
      updated_at: new Date(),
    };

    delete updateData.id;
    delete updateData.creator_id;
    delete updateData.created_at;

    await db('projects').where({ id }).update(updateData);

    const updatedProject = await db('projects as p')
      .select([
        'p.*',
        'u.first_name as creator_first_name',
        'u.last_name as creator_last_name',
        'u.username as creator_username',
        'u.avatar_url as creator_avatar',
      ])
      .join('users as u', 'p.creator_id', 'u.id')
      .where('p.id', id)
      .first();

    res.status(200).json({
      success: true,
      data: updatedProject,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
