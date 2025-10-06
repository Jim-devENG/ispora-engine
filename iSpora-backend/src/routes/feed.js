const express = require('express');
const db = require('../database/connection');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @desc    Get feed items (projects, opportunities, activities)
// @route   GET /api/feed
// @access  Public
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
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
        'u.avatar_url as author_avatar',
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
        'o.type',
        'o.created_at',
        'o.updated_at',
        'o.company',
        'o.location',
        'u.first_name as author_first_name',
        'u.last_name as author_last_name',
        'u.username as author_username',
        'u.avatar_url as author_avatar',
      ])
      .leftJoin('users as u', 'o.posted_by', 'u.id')
      .where('o.is_active', true)
      .orderBy('o.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    // Sessions (public/upcoming or recent)
    let sessions = [];
    try {
      sessions = await db('project_sessions as s')
        .select([
          's.id',
          's.project_id',
          's.title',
          's.description',
          's.scheduled_date',
          's.duration_minutes',
          's.type',
          's.is_public',
          'u.first_name as author_first_name',
          'u.last_name as author_last_name',
          'u.username as author_username',
          'u.avatar_url as author_avatar',
          'p.title as project_title',
        ])
        .leftJoin('users as u', 's.created_by', 'u.id')
        .leftJoin('projects as p', 's.project_id', 'p.id')
        .where('s.is_public', true)
        .orderBy('s.scheduled_date', 'desc')
        .limit(limit)
        .offset(offset);
    } catch (_) {}

    // Impact stories (public)
    let impact = [];
    try {
      impact = await db('impact_feed as if')
        .select([
          'if.id',
          'if.title',
          'if.summary',
          'if.impact_category',
          'if.published_at',
          'u.first_name as author_first_name',
          'u.last_name as author_last_name',
          'u.username as author_username',
          'u.avatar_url as author_avatar',
          'p.title as project_title',
        ])
        .leftJoin('users as u', 'if.user_id', 'u.id')
        .leftJoin('projects as p', 'if.related_project_id', 'p.id')
        .where('if.visibility', 'public')
        .andWhere('if.status', 'active')
        .orderBy('if.published_at', 'desc')
        .limit(limit)
        .offset(offset);
    } catch (_) {}

    // Research outputs (public learning content)
    let research = [];
    try {
      research = await db('learning_content as lc')
        .select([
          'lc.id',
          'lc.project_id',
          'lc.title',
          'lc.description',
          'lc.type',
          'lc.created_at',
          'u.first_name as author_first_name',
          'u.last_name as author_last_name',
          'u.username as author_username',
          'u.avatar_url as author_avatar',
          'p.title as project_title',
        ])
        .leftJoin('projects as p', 'lc.project_id', 'p.id')
        .leftJoin('users as u', 'p.creator_id', 'u.id')
        .where('lc.is_public', true)
        .orderBy('lc.created_at', 'desc')
        .limit(limit)
        .offset(offset);
    } catch (_) {}

    // Badges/achievements (public announcements)
    let badges = [];
    try {
      badges = await db('badges as b')
        .select([
          'b.id',
          'b.title',
          'b.description',
          'b.created_at',
          'ub.user_id',
          'u.first_name as author_first_name',
          'u.last_name as author_last_name',
          'u.username as author_username',
          'u.avatar_url as author_avatar',
        ])
        .leftJoin('user_badges as ub', 'b.id', 'ub.badge_id')
        .leftJoin('users as u', 'ub.user_id', 'u.id')
        .where('b.is_public_announcement', true)
        .orderBy('b.created_at', 'desc')
        .limit(limit)
        .offset(offset);
    } catch (_) {}

    // Combine all feed items
    const feedItems = [
      ...projects.map((project) => ({
        id: project.id,
        type: 'project',
        title: project.title,
        description: project.description,
        status: project.status,
        category: project.category,
        location: project.location,
        tags: (() => { try { return project.tags ? JSON.parse(project.tags) : []; } catch { return []; } })(),
        authorName: `${project.author_first_name} ${project.author_last_name}`,
        authorAvatar: project.author_avatar,
        timestamp: project.created_at,
        likes: 0, // Will be calculated separately
        comments: 0, // Will be calculated separately
        isPublic: true,
      })),
      ...opportunities.map((opportunity) => ({
        id: opportunity.id,
        type: 'opportunity',
        title: opportunity.title,
        description: opportunity.description,
        status: opportunity.type,
        category: opportunity.company,
        location: opportunity.location,
        tags: [],
        authorName: `${opportunity.author_first_name} ${opportunity.author_last_name}`,
        authorAvatar: opportunity.author_avatar,
        timestamp: opportunity.created_at,
        likes: 0,
        comments: 0,
        isPublic: true,
      })),
      ...sessions.map((s) => ({
        id: s.id,
        type: 'session',
        title: s.title,
        description: s.description,
        status: s.type,
        category: s.project_title || 'Session',
        location: '',
        tags: [],
        authorName: `${s.author_first_name || ''} ${s.author_last_name || ''}`.trim(),
        authorAvatar: s.author_avatar,
        timestamp: s.scheduled_date,
        likes: 0,
        comments: 0,
        isPublic: true,
      })),
      ...impact.map((i) => ({
        id: i.id,
        type: 'impact',
        title: i.title,
        description: i.summary,
        status: i.impact_category,
        category: i.project_title || 'Impact',
        location: '',
        tags: [],
        authorName: `${i.author_first_name || ''} ${i.author_last_name || ''}`.trim(),
        authorAvatar: i.author_avatar,
        timestamp: i.published_at,
        likes: 0,
        comments: 0,
        isPublic: true,
      })),
      ...research.map((r) => ({
        id: r.id,
        type: 'research',
        title: r.title,
        description: r.description,
        status: r.type,
        category: r.project_title || 'Research',
        location: '',
        tags: [],
        authorName: `${r.author_first_name || ''} ${r.author_last_name || ''}`.trim(),
        authorAvatar: r.author_avatar,
        timestamp: r.created_at,
        likes: 0,
        comments: 0,
        isPublic: true,
      })),
      ...badges.map((b) => ({
        id: b.id,
        type: 'badge',
        title: b.title,
        description: b.description,
        status: 'achievement',
        category: 'Badge',
        location: '',
        tags: [],
        authorName: `${b.author_first_name || ''} ${b.author_last_name || ''}`.trim(),
        authorAvatar: b.author_avatar,
        timestamp: b.created_at,
        likes: 0,
        comments: 0,
        isPublic: true,
      })),
    ];

    // Sort by timestamp (most recent first)
    feedItems.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      success: true,
      data: feedItems,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: feedItems.length,
      },
    });
  } catch (error) {
    console.error('Feed error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feed items',
      error: error.message,
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
        'u.avatar_url as author_avatar',
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
          'u.avatar_url as author_avatar',
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
        message: 'Feed item not found',
      });
    }

    res.json({
      success: true,
      data: feedItem,
    });
  } catch (error) {
    console.error('Feed item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feed item',
      error: error.message,
    });
  }
});

module.exports = router;
