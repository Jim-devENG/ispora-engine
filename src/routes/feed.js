const express = require('express');
const { getFeed, trackActivity, getSessions } = require('../controllers/feedController');
const { authenticateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Public routes
router.get('/', getFeed);
router.get('/sessions', getSessions);

// Optional authentication for activity tracking
router.post('/activity', (req, res, next) => {
  // Make authentication optional for activity tracking
  // If no token provided, req.user will be undefined
  next();
}, trackActivity);

// 🌐 SSE stream endpoint with proper CORS, headers, and explicit error handling
router.get('/stream', (req, res) => {
  // 🛡️ DevOps Guardian: Strictly validate origin - NO DEFAULTS
  const origin = req.headers.origin;
  const allowedOrigins = ['https://ispora.app', 'http://localhost:5173'];
  
  if (!origin || !allowedOrigins.includes(origin)) {
    console.error(`[SSE] ❌ CORS blocked: ${origin || 'no-origin'}`);
    console.error(`[SSE] Allowed origins: ${allowedOrigins.join(', ')}`);
    res.status(403).json({
      success: false,
      error: 'CORS: Origin not allowed for SSE stream',
      allowedOrigins
    });
    return;
  }
  
  console.log(`[SSE] ✅ Connection established from: ${origin}`);
  
  // Set SSE headers with proper CORS - explicit, no defaults
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': origin, // Use validated origin only
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Cache-Control, Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'X-Accel-Buffering': 'no' // Disable nginx buffering for SSE
  });
  
  // Flush headers immediately
  res.flushHeaders();
  console.log('[SSE] Headers flushed, connection ready');
  
  // Declare heartbeat variable for cleanup
  let heartbeat = null;
  
  // Send initial connection message
  try {
    const connectedMessage = JSON.stringify({
      type: 'connected',
      message: 'Connected to feed stream',
      timestamp: new Date().toISOString()
    });
    res.write(`data: ${connectedMessage}\n\n`);
    res.flush && res.flush();
    console.log('[SSE] Connection message sent');
  } catch (error) {
    console.error('[SSE] ❌ Error sending connection message:', error.message);
    if (heartbeat) clearInterval(heartbeat);
    return;
  }
  
  // Send a welcome message after a short delay
  setTimeout(() => {
    try {
      const welcomeMessage = JSON.stringify({
        type: 'welcome',
        message: 'Welcome to iSpora feed stream',
        timestamp: new Date().toISOString()
      });
      res.write(`data: ${welcomeMessage}\n\n`);
      res.flush && res.flush();
      console.log('[SSE] Welcome message sent');
    } catch (error) {
      console.error('[SSE] ❌ Error sending welcome message:', error.message);
      if (heartbeat) clearInterval(heartbeat);
    }
  }, 1000);
  
  // Send heartbeat every 20 seconds (as requested) to keep connection alive (Render may idle)
  heartbeat = setInterval(() => {
    const pingMessage = JSON.stringify({
      type: 'ping',
      timestamp: new Date().toISOString()
    });
    
    try {
      res.write(`data: ${pingMessage}\n\n`);
      // Flush the response to ensure data is sent immediately
      if (typeof res.flush === 'function') {
        res.flush();
      }
      console.log('[SSE] Ping sent');
    } catch (error) {
      // Explicit error handling - log and clear
      console.error('[SSE] ❌ Error sending ping:', error.message);
      clearInterval(heartbeat);
      logger.error({ error: error.message }, 'SSE heartbeat failed');
    }
  }, 20000); // 20 seconds as requested
  
  // Handle client disconnect - explicit logging
  req.on('close', () => {
    console.log('[SSE] Client disconnected');
    clearInterval(heartbeat);
    logger.info('SSE client disconnected');
  });
  
  req.on('error', (error) => {
    console.error('[SSE] ❌ Connection error:', error.message);
    clearInterval(heartbeat);
    logger.error({ error: error.message }, 'SSE connection error');
  });
  
  // Handle response errors
  res.on('error', (error) => {
    console.error('[SSE] ❌ Response error:', error.message);
    clearInterval(heartbeat);
    logger.error({ error: error.message }, 'SSE response error');
  });
});

module.exports = router;
