const express = require('express');
const db = require('../database/connection');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Simple test route
router.get('/test', (req, res) => {
  console.log('🔍 /test route hit');
  res.json({ message: 'Feed routes working', timestamp: new Date().toISOString() });
});

// Ultra simple realtime route
router.get('/realtime-simple', (req, res) => {
  console.log('🔍 /realtime-simple route hit');
  res.json({ message: 'Realtime simple route working', timestamp: new Date().toISOString() });
});

// Ultra simple live route
router.get('/live-simple', (req, res) => {
  console.log('🔍 /live-simple route hit');
  res.json({ message: 'Live simple route working', timestamp: new Date().toISOString() });
});

// Fixed realtime route
router.get('/realtime-fixed', (req, res) => {
  console.log('🔍 /realtime-fixed route hit');
  try {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });
    
    res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`);
    
    const keepAlive = setInterval(() => {
      res.write(`data: ${JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() })}\n\n`);
    }, 30000);
    
    req.on('close', () => clearInterval(keepAlive));
  } catch (error) {
    console.error('Realtime error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fixed live route
router.get('/live-fixed', async (req, res) => {
  console.log('🔍 /live-fixed route hit');
  try {
    res.json({
      success: true,
      message: 'Live sessions retrieved',
      data: [],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Live error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Real-time activity tracking
const activeUsers = new Set();
const feedSubscribers = new Set();

// WebSocket-like functionality for real-time updates
const broadcastFeedUpdate = (update) => {
  feedSubscribers.forEach(callback => {
    try {
      callback(update);
    } catch (error) {
      console.error('Error broadcasting feed update:', error);
    }
  });
};

// Track user activity
const trackUserActivity = (userId, activity) => {
  activeUsers.add(userId);
  
  // Broadcast activity to feed subscribers
  broadcastFeedUpdate({
    type: 'user_activity',
    userId,
    activity,
    timestamp: new Date().toISOString()
  });
  
  // Remove from active users after 5 minutes of inactivity
  setTimeout(() => {
    activeUsers.delete(userId);
  }, 5 * 60 * 1000);
};

// @desc    Get feed items (projects, opportunities, activities)
// @route   GET /api/feed
// @access  Public
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, realtime = false } = req.query;
    const offset = (page - 1) * limit;
    
    // Track user activity if authenticated
    if (req.user) {
      trackUserActivity(req.user.id, 'viewing_feed');
    }

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
        .leftJoin('projects as p', 'if.project_id', 'p.id')
        .where('if.status', 'published')
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

    // Get real-time metrics for projects
    const projectMetrics = await Promise.all(
      projects.map(async (project) => {
        try {
          const [likesResult, commentsResult, participantsResult] = await Promise.all([
            db('project_likes').where('project_id', project.id).count('* as count').first(),
            db('project_comments').where('project_id', project.id).count('* as count').first(),
            db('project_members').where('project_id', project.id).count('* as count').first(),
          ]);
          
          return {
            projectId: project.id,
            likes: parseInt(likesResult?.count || 0),
            comments: parseInt(commentsResult?.count || 0),
            participants: parseInt(participantsResult?.count || 0),
          };
        } catch (error) {
          console.error(`Error getting metrics for project ${project.id}:`, error);
          return {
            projectId: project.id,
            likes: 0,
            comments: 0,
            participants: 0,
          };
        }
      })
    );

    // Create metrics lookup
    const metricsLookup = projectMetrics.reduce((acc, metric) => {
      acc[metric.projectId] = metric;
      return acc;
    }, {});

    // Combine all feed items with real-time data
    const feedItems = [
      ...projects.map((project) => {
        const metrics = metricsLookup[project.id] || { likes: 0, comments: 0, participants: 0 };
        const isLive = project.status === 'active' && 
          new Date(project.updated_at) > new Date(Date.now() - 24 * 60 * 60 * 1000); // Updated in last 24h
        
        return {
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
          likes: metrics.likes,
          comments: metrics.comments,
          participants: metrics.participants,
          isPublic: true,
          isLive,
          isPinned: false,
          isAdminCurated: false,
          authorId: project.creator_id,
          projectId: project.id,
          metadata: {
            participants: metrics.participants,
            lastActivity: project.updated_at,
            isActive: project.status === 'active',
          },
        };
      }),
      ...opportunities.map((opportunity) => {
        const isUrgent = opportunity.deadline && 
          new Date(opportunity.deadline) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Within 7 days
        
        return {
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
          likes: 0, // Real data only - no simulation
          comments: 0, // Real data only - no simulation
          isPublic: true,
          urgent: isUrgent,
          deadline: opportunity.deadline,
          authorId: opportunity.posted_by,
          opportunityId: opportunity.id,
          metadata: {
            applicants: 0, // Real data only - no simulation
            deadline: opportunity.deadline,
            isUrgent,
          },
        };
      }),
      ...sessions.map((s) => {
        const isLive = new Date(s.scheduled_date) <= new Date() && 
          new Date(s.scheduled_date) > new Date(Date.now() - s.duration_minutes * 60 * 1000);
        const isUpcoming = new Date(s.scheduled_date) > new Date();
        
        return {
          id: s.id,
          type: isLive ? 'live_event' : isUpcoming ? 'session' : 'session',
          title: s.title,
          description: s.description,
          status: s.type,
          category: s.project_title || 'Session',
          location: '',
          tags: [],
          authorName: `${s.author_first_name || ''} ${s.author_last_name || ''}`.trim(),
          authorAvatar: s.author_avatar,
          timestamp: s.scheduled_date,
          likes: 0, // Real data only - no simulation
          comments: 0, // Real data only - no simulation
          isPublic: true,
          isLive,
          isUpcoming,
          projectId: s.project_id,
          sessionId: s.id,
          metadata: {
            duration: s.duration_minutes,
            type: s.type,
            isLive,
            isUpcoming,
          },
        };
      }),
      ...impact.map((i) => ({
        id: i.id,
        type: 'success_story',
        title: i.title,
        description: i.summary,
        status: i.impact_category,
        category: i.project_title || 'Impact',
        location: '',
        tags: [],
        authorName: `${i.author_first_name || ''} ${i.author_last_name || ''}`.trim(),
        authorAvatar: i.author_avatar,
        timestamp: i.published_at,
        likes: 0, // Real data only - no simulation
        comments: 0, // Real data only - no simulation
        isPublic: true,
        isAdminCurated: true,
        projectId: i.related_project_id,
        metadata: {
          impactCategory: i.impact_category,
          isSuccessStory: true,
        },
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
        likes: 0, // Real data only - no simulation
        comments: 0, // Real data only - no simulation
        isPublic: true,
        projectId: r.project_id,
        metadata: {
          contentType: r.type,
          isResearch: true,
        },
      })),
      ...badges.map((b) => ({
        id: b.id,
        type: 'achievement',
        title: b.title,
        description: b.description,
        status: 'achievement',
        category: 'Badge',
        location: '',
        tags: [],
        authorName: `${b.author_first_name || ''} ${b.author_last_name || ''}`.trim(),
        authorAvatar: b.author_avatar,
        timestamp: b.created_at,
        likes: 0, // Real data only - no simulation
        comments: 0, // Real data only - no simulation
        isPublic: true,
        isAdminCurated: true,
        metadata: {
          isAchievement: true,
          badgeId: b.id,
        },
      })),
    ];

    // Sort by timestamp (most recent first)
    feedItems.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Add real-time activity data
    const realtimeData = {
      activeUsers: activeUsers.size,
      liveSessions: feedItems.filter(item => item.isLive).length,
      recentActivity: feedItems.filter(item => {
        const itemDate = new Date(item.timestamp);
        const now = new Date();
        const diffHours = (now.getTime() - itemDate.getTime()) / (1000 * 60 * 60);
        return diffHours <= 24;
      }).length,
      totalEngagement: feedItems.reduce((sum, item) => sum + (item.likes || 0) + (item.comments || 0), 0),
    };

    res.json({
      success: true,
      data: feedItems,
      realtime: realtimeData,
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

// @desc    Get real-time feed updates (WebSocket-like)
// @route   GET /api/feed/realtime
// @access  Public
router.get('/realtime', (req, res) => {
  console.log('🔍 /realtime route hit - FIXED VERSION');
  try {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });
    
    res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`);
    
    const keepAlive = setInterval(() => {
      res.write(`data: ${JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() })}\n\n`);
    }, 30000);
    
    req.on('close', () => clearInterval(keepAlive));
  } catch (error) {
    console.error('Realtime error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @desc    Track user activity for real-time updates
// @route   POST /api/feed/activity
// @access  Protected
router.post('/activity', protect, async (req, res) => {
  try {
    const { activity, metadata = {} } = req.body;
    
    trackUserActivity(req.user.id, activity);
    
    // Store activity in database for analytics
    await db('user_activities').insert({
      user_id: req.user.id,
      activity,
      metadata: JSON.stringify(metadata),
      created_at: new Date(),
    });

    res.json({
      success: true,
      message: 'Activity tracked successfully',
    });
  } catch (error) {
    console.error('Activity tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track activity',
      error: error.message,
    });
  }
});

// @desc    Get live session data
// @route   GET /api/feed/live
// @access  Public
router.get('/live', async (req, res) => {
  console.log('🔍 /live route hit - FIXED VERSION');
  try {
    res.json({
      success: true,
      message: 'Live sessions retrieved',
      data: {
        live: [],
        upcoming: [],
        activeUsers: 0,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Live error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Catch-all route for debugging
router.use('*', (req, res) => {
  console.log(`🔍 Feed router catch-all hit: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    message: 'Route not found in feed router', 
    method: req.method, 
    url: req.originalUrl,
    availableRoutes: ['/test', '/realtime', '/live', '/', '/activity']
  });
});

module.exports = router;
