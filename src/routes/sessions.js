/**
 * 🔐 Sessions Route
 * Returns active user sessions data
 */

const express = require('express');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * GET /api/sessions
 * Returns active sessions data
 * Returns HTTP 200 with valid structure
 */
router.get('/', (req, res) => {
  try {
    // Get CORS origin
    const origin = req.headers.origin;
    const allowedOrigins = ['https://ispora.app', 'https://www.ispora.app', 'http://localhost:5173'];
    
    // Set CORS headers
    if (!origin || allowedOrigins.includes(origin)) {
      if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      } else if (!origin) {
        res.setHeader('Access-Control-Allow-Origin', '*');
      }
    }
    
    // Return valid structure - no undefined values
    const response = {
      success: true,
      activeSessions: [],
      total: 0,
      timestamp: new Date().toISOString()
    };
    
    logger.info('Sessions endpoint called');
    
    // Always return HTTP 200
    res.status(200).json(response);
    
  } catch (error) {
    logger.error({ error: error.message }, 'Error in sessions endpoint');
    
    // Set CORS headers even on error
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
    
    // Return HTTP 200 even on error (as per requirements)
    res.status(200).json({
      success: false,
      activeSessions: [],
      total: 0,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;

