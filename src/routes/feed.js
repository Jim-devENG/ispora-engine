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

// 🌐 SSE stream endpoint with proper CORS and headers
router.get('/stream', (req, res) => {
  // 🛡️ DevOps Guardian: Determine allowed origin based on request
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://ispora.app',
    'https://www.ispora.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:5173'
  ];
  
  const allowedOrigin = origin && allowedOrigins.includes(origin) 
    ? origin 
    : 'https://ispora.app'; // Default to production domain
  
  // Set SSE headers with proper CORS
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Cache-Control, Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'X-Accel-Buffering': 'no' // Disable nginx buffering for SSE
  });
  
  // Flush headers immediately
  res.flushHeaders();
  
  // Send initial connection message
  const connectedMessage = JSON.stringify({
    type: 'connected',
    message: 'Connected to feed stream',
    timestamp: new Date().toISOString()
  });
  res.write(`data: ${connectedMessage}\n\n`);
  
  // Send a welcome message after a short delay
  setTimeout(() => {
    const welcomeMessage = JSON.stringify({
      type: 'welcome',
      message: 'Welcome to iSpora feed stream',
      timestamp: new Date().toISOString()
    });
    res.write(`data: ${welcomeMessage}\n\n`);
  }, 1000);
  
  // Send heartbeat every 30 seconds to keep connection alive
  const heartbeat = setInterval(() => {
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
    } catch (error) {
      // Client disconnected, clear interval
      clearInterval(heartbeat);
      logger.info('SSE client disconnected during heartbeat');
    }
  }, 30000);
  
  // Handle client disconnect
  req.on('close', () => {
    clearInterval(heartbeat);
    logger.info('SSE client disconnected');
  });
  
  req.on('error', (error) => {
    clearInterval(heartbeat);
    logger.error({ error: error.message }, 'SSE connection error');
  });
});

module.exports = router;
