const express = require('express');
const db = require('../database/connection');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @desc    Get feed items (projects, opportunities, activities)
// @route   GET /api/feed
// @access  Public
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const offset = (page - 1) * limit;

    // Get projects
    const projects = await db('projects as p')
      .select([
        'p.id',
        'p.title',
        'p.description',
        'p.status',
        'p.created_at',
        'p.updated_at',
        'p.category',
        'p.location',
        'p.tags',
        'u.first_name as author_first_name',
        'u.last_name as author_last_name',
        'u.username as author_username',
        'u.avatar_url as author_avatar'
      ])
      .join('users as u', 'p.creator_id', 'u.id')
      .where('p.is_public', true)
      .orderBy('p.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    // Get opportunities
    const opportunities = await db('opportunities as o')
      .select([
        'o.id',
        'o.title',
        'o.description',
        'o.status',
        'o.created_at',
        'o.updated_at',
        'o.category',
        'o.location',
        'o.tags',
        'u.first_name as author_first_name',
        'u.last_name as author_last_name',
        'u.username as author_username',
        'u.avatar_url as author_avatar'
      ])
      .join('users as u', 'o.creator_id', 'u.id')
      .where('o.is_public', true)
      .orderBy('o.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    // Get mentorship activities
    const mentorshipActivities = await db('mentorship_sessions as ms')
      .select([
        'ms.id',
        'ms.title',
        'ms.description',
        'ms.status',
        'ms.created_at',
        'ms.updated_at',
        'ms.category',
        'ms.location',
        'u.first_name as author_first_name',
        'u.last_name as author_last_name',
        'u.username as author_username',
        'u.avatar_url as author_avatar'
      ])
      .join('users as u', 'ms.mentor_id', 'u.id')
      .where('ms.is_public', true)
      .orderBy('ms.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    // Combine all feed items
    const feedItems = [
      ...projects.map(project => ({
        id: project.id,
        type: 'project',
        title: project.title,
        description: project.description,
        status: project.status,
        category: project.category,
        location: project.location,
        tags: project.tags ? JSON.parse(project.tags) : [],
        authorName: `${project.author_first_name} ${project.author_last_name}`,
        authorAvatar: project.author_avatar,
        timestamp: project.created_at,
        likes: 0, // Will be calculated separately
        comments: 0, // Will be calculated separately
        isPublic: true
      })),
      ...opportunities.map(opportunity => ({
        id: opportunity.id,
        type: 'opportunity',
        title: opportunity.title,
        description: opportunity.description,
        status: opportunity.status,
        category: opportunity.category,
        location: opportunity.location,
        tags: opportunity.tags ? JSON.parse(opportunity.tags) : [],
        authorName: `${opportunity.author_first_name} ${opportunity.author_last_name}`,
        authorAvatar: opportunity.author_avatar,
        timestamp: opportunity.created_at,
        likes: 0,
        comments: 0,
        isPublic: true
      })),
      ...mentorshipActivities.map(activity => ({
        id: activity.id,
        type: 'mentorship',
        title: activity.title,
        description: activity.description,
        status: activity.status,
        category: activity.category,
        location: activity.location,
        tags: [],
        authorName: `${activity.author_first_name} ${activity.author_last_name}`,
        authorAvatar: activity.author_avatar,
        timestamp: activity.created_at,
        likes: 0,
        comments: 0,
        isPublic: true
      }))
    ];

    // Sort by timestamp (most recent first)
    feedItems.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      success: true,
      data: feedItems,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: feedItems.length
      }
    });

  } catch (error) {
    console.error('Feed error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feed items',
      error: error.message
    });
  }
});

// @desc    Get feed item by ID
// @route   GET /api/feed/:id
// @access  Public
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Try to find in projects first
    let feedItem = await db('projects as p')
      .select([
        'p.id',
        'p.title',
        'p.description',
        'p.status',
        'p.created_at',
        'p.updated_at',
        'p.category',
        'p.location',
        'p.tags',
        'u.first_name as author_first_name',
        'u.last_name as author_last_name',
        'u.username as author_username',
        'u.avatar_url as author_avatar'
      ])
      .join('users as u', 'p.creator_id', 'u.id')
      .where('p.id', id)
      .where('p.is_public', true)
      .first();

    if (feedItem) {
      feedItem.type = 'project';
      feedItem.authorName = `${feedItem.author_first_name} ${feedItem.author_last_name}`;
      feedItem.tags = feedItem.tags ? JSON.parse(feedItem.tags) : [];
      feedItem.timestamp = feedItem.created_at;
    } else {
      // Try opportunities
      feedItem = await db('opportunities as o')
        .select([
          'o.id',
          'o.title',
          'o.description',
          'o.status',
          'o.created_at',
          'o.updated_at',
          'o.category',
          'o.location',
          'o.tags',
          'u.first_name as author_first_name',
          'u.last_name as author_last_name',
          'u.username as author_username',
          'u.avatar_url as author_avatar'
        ])
        .join('users as u', 'o.creator_id', 'u.id')
        .where('o.id', id)
        .where('o.is_public', true)
        .first();

      if (feedItem) {
        feedItem.type = 'opportunity';
        feedItem.authorName = `${feedItem.author_first_name} ${feedItem.author_last_name}`;
        feedItem.tags = feedItem.tags ? JSON.parse(feedItem.tags) : [];
        feedItem.timestamp = feedItem.created_at;
      }
    }

    if (!feedItem) {
      return res.status(404).json({
        success: false,
        message: 'Feed item not found'
      });
    }

    res.json({
      success: true,
      data: feedItem
    });

  } catch (error) {
    console.error('Feed item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feed item',
      error: error.message
    });
  }
});

module.exports = router;
