const knex = require('knex');
const config = require('../knexfile');
const logger = require('../utils/logger');
const { validatePayload, sanitizePayload, ValidationError } = require('../utils/validation');

const db = knex(config.development);

// Get feed entries
const getFeed = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, category } = req.query;
    const offset = (page - 1) * limit;

    let query = db('feed_entries')
      .select(
        'feed_entries.*',
        'users.first_name',
        'users.last_name',
        'users.email as author_email',
        'projects.title as project_title'
      )
      .leftJoin('users', 'feed_entries.user_id', 'users.id')
      .leftJoin('projects', 'feed_entries.project_id', 'projects.id')
      .where('feed_entries.is_public', true)
      .orderBy('feed_entries.created_at', 'desc');

    // Apply filters
    if (type) {
      query = query.where('feed_entries.type', type);
    }

    if (category) {
      query = query.where('feed_entries.category', category);
    }

    // Get total count for pagination
    const totalQuery = query.clone();
    const totalCount = await totalQuery.count('* as count').first();

    // Apply pagination
    const feedEntries = await query.limit(limit).offset(offset);

    // Parse JSON fields and format response
    const formattedEntries = feedEntries.map(entry => ({
      id: entry.id,
      type: entry.type,
      title: entry.title,
      description: entry.description,
      category: entry.category,
      metadata: JSON.parse(entry.metadata || '{}'),
      author: {
        name: `${entry.first_name} ${entry.last_name}`,
        email: entry.author_email
      },
      project: entry.project_title ? {
        title: entry.project_title,
        id: entry.project_id
      } : null,
      likes: entry.likes,
      comments: entry.comments,
      shares: entry.shares,
      created_at: entry.created_at,
      updated_at: entry.updated_at
    }));

    logger.info({ 
      count: feedEntries.length, 
      page, 
      limit 
    }, 'Feed entries retrieved successfully');

    res.json({
      success: true,
      data: formattedEntries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount.count,
        pages: Math.ceil(totalCount.count / limit)
      }
    });

  } catch (error) {
    logger.error({ error: error.message }, 'Get feed failed');
    res.status(500).json({
      success: false,
      error: 'Server error fetching feed'
    });
  }
};

// Track activity
const trackActivity = async (req, res) => {
  try {
    console.log('[DEBUG] Incoming payload:', req.body);

    // Simple validation
    if (!req.body.type || !req.body.title) {
      console.error('[ERROR] Missing required fields');
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: type and title are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    // Get user ID - use demo user for now
    const userId = '00000000-0000-0000-0000-000000000001';

    // Create simple activity entry
    const activityId = require('uuid').v4();
    const activityData = {
      id: activityId,
      type: req.body.type,
      title: req.body.title,
      description: req.body.description || '',
      category: req.body.category || 'general',
      metadata: JSON.stringify(req.body.metadata || {}),
      user_id: userId,
      project_id: req.body.projectId || null,
      is_public: true,
      created_at: new Date(),
      updated_at: new Date(),
      likes: 0,
      comments: 0,
      shares: 0
    };

    // Insert activity data
    await db('feed_entries').insert(activityData);

    console.log("✅ Activity tracked successfully:", activityId);

    res.status(201).json({
      success: true,
      message: 'Activity tracked successfully',
      data: {
        id: activityId,
        type: req.body.type,
        title: req.body.title,
        created_at: activityData.created_at
      }
    });

  } catch (error) {
    console.error('[ERROR] Activity tracking failed:', error);
    console.error('[ERROR] Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });

    res.status(500).json({
      success: false,
      error: error.message || 'Server error tracking activity'
    });
  }
};

// Get active sessions (stub)
const getSessions = async (req, res) => {
  try {
    // This is a stub implementation
    // In a real application, you would track active user sessions
    const sessions = [
      {
        id: 'session-1',
        user: 'Demo User',
        activity: 'Viewing projects',
        last_seen: new Date().toISOString(),
        location: 'New York, NY'
      },
      {
        id: 'session-2',
        user: 'Admin User',
        activity: 'Managing content',
        last_seen: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        location: 'San Francisco, CA'
      }
    ];

    logger.info({ count: sessions.length }, 'Active sessions retrieved');

    res.json({
      success: true,
      data: sessions,
      count: sessions.length
    });

  } catch (error) {
    logger.error({ error: error.message }, 'Get sessions failed');
    res.status(500).json({
      success: false,
      error: 'Server error fetching sessions'
    });
  }
};

module.exports = {
  getFeed,
  trackActivity,
  getSessions
};
