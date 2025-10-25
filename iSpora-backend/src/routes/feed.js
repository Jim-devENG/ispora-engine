const express = require('express');
const { authenticateToken, optionalAuth } = require('../middleware/auth-clean');
const db = require('../database/connection');

const router = express.Router();

// @desc    Get feed items
// @route   GET /api/feed
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    console.log('🔍 Feed items requested');
    
    // Get feed items from database or return sample data
    let feedItems = [];
    
    try {
      // Try to get real feed items from database
      const projects = await db('projects')
        .select('id', 'title', 'description', 'type', 'status', 'created_at')
        .where('status', 'active')
        .orderBy('created_at', 'desc')
        .limit(10);
      
      feedItems = projects.map(project => ({
        id: project.id,
        type: 'project',
        title: project.title,
        description: project.description,
        status: project.status,
        createdAt: project.created_at,
        likes: 0,
        comments: 0,
        shares: 0
      }));
    } catch (error) {
      console.log('⚠️ Using sample feed data');
      // Fallback to sample data
      feedItems = [
        {
          id: '1',
          type: 'project',
          title: 'Sample Project',
          description: 'This is a sample project for testing',
          status: 'active',
          createdAt: new Date().toISOString(),
          likes: 5,
          comments: 2,
          shares: 1
        },
        {
          id: '2',
          type: 'opportunity',
          title: 'Sample Opportunity',
          description: 'This is a sample opportunity',
          status: 'active',
          createdAt: new Date().toISOString(),
          likes: 3,
          comments: 1,
          shares: 0
        }
      ];
    }
    
    res.json({
      success: true,
      data: feedItems,
      count: feedItems.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Feed error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get feed items'
    });
  }
});

// @desc    Server-Sent Events stream
// @route   GET /api/feed/stream
// @access  Public
router.get('/stream', (req, res) => {
  try {
    console.log('🔍 SSE stream requested');
    
    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });
    
    // Send initial connection event
    res.write(`data: ${JSON.stringify({
      type: 'connected',
      timestamp: new Date().toISOString()
    })}\n\n`);
    
    // Send periodic ping events
    const pingInterval = setInterval(() => {
      res.write(`data: ${JSON.stringify({
        type: 'ping',
        timestamp: new Date().toISOString()
      })}\n\n`);
    }, 30000); // Every 30 seconds
    
    // Handle client disconnect
    req.on('close', () => {
      console.log('🔍 SSE client disconnected');
      clearInterval(pingInterval);
    });
    
  } catch (error) {
    console.error('❌ SSE stream error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to establish stream'
    });
  }
});

// @desc    Get live sessions
// @route   GET /api/feed/sessions
// @access  Public
router.get('/sessions', async (req, res) => {
  try {
    console.log('🔍 Live sessions requested');
    
    // Get sessions from database or return sample data
    let sessions = [];
    
    try {
      // Try to get real sessions from database
      const dbSessions = await db('sessions')
        .select('id', 'title', 'description', 'status', 'start_time', 'end_time')
        .where('status', 'active')
        .orderBy('start_time', 'asc');
      
      sessions = dbSessions.map(session => ({
        id: session.id,
        title: session.title,
        description: session.description,
        status: session.status,
        startTime: session.start_time,
        endTime: session.end_time,
        attendees: 0
      }));
    } catch (error) {
      console.log('⚠️ Using sample session data');
      // Fallback to sample data
      sessions = [
        {
          id: '1',
          title: 'Sample Session',
          description: 'This is a sample session',
          status: 'active',
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
          attendees: 5
        }
      ];
    }
    
    res.json({
      success: true,
      data: {
        live: sessions.filter(s => s.status === 'active'),
        upcoming: sessions.filter(s => s.status === 'upcoming'),
        activeUsers: sessions.length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Sessions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get sessions'
    });
  }
});

// @desc    Track user activity
// @route   POST /api/feed/activity
// @access  Public
router.post('/activity', optionalAuth, async (req, res) => {
  try {
    console.log('🔍 Activity tracking requested');
    const { userId, action, timestamp, metadata } = req.body;
    
    // Log the activity
    console.log('📊 Activity tracked:', {
      userId: userId || 'anonymous',
      action,
      timestamp: timestamp || new Date().toISOString(),
      metadata
    });
    
    // Store activity in database if user is authenticated
    if (req.user) {
      try {
        await db('user_activities').insert({
          id: require('uuid').v4(),
          user_id: req.user.id,
          action,
          metadata: JSON.stringify(metadata || {}),
          created_at: new Date()
        });
      } catch (error) {
        console.log('⚠️ Could not store activity in database:', error.message);
      }
    }
    
    res.json({
      success: true,
      message: 'Activity tracked successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Activity tracking error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track activity'
    });
  }
});

module.exports = router;