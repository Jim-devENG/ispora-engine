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

// SSE stream endpoint
router.get('/stream', (req, res) => {
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Send initial connection message
  res.write('data: {"type":"connected","message":"Connected to feed stream"}\n\n');

  // Send heartbeat every 30 seconds
  const heartbeat = setInterval(() => {
    res.write('data: {"type":"ping","timestamp":"' + new Date().toISOString() + '"}\n\n');
  }, 30000);

  // Handle client disconnect
  req.on('close', () => {
    clearInterval(heartbeat);
    logger.info('SSE client disconnected');
  });

  // Send a welcome message
  setTimeout(() => {
    res.write('data: {"type":"welcome","message":"Welcome to iSpora feed stream"}\n\n');
  }, 1000);
});

module.exports = router;
