/**
 * 🔔 Ping/Uptime Route
 * Lightweight endpoint to keep Render instance awake and prevent cold starts
 */

const express = require('express');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * GET /api/ping
 * Lightweight ping endpoint to prevent cold starts
 * Returns HTTP 200 with minimal response
 */
router.get('/', (req, res) => {
  // Add CORS headers - allow no-origin for uptime monitoring
  const origin = req.headers.origin;
  const allowedOrigins = ['https://ispora.app', 'https://www.ispora.app', 'http://localhost:5173'];
  
  if (!origin || allowedOrigins.includes(origin)) {
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    } else if (!origin) {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
  }
  
  // Minimal response to keep instance alive
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;

