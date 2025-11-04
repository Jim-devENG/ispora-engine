/**
 * Health Routes (Phase 1.5)
 * Health check endpoint for Phase 1 routes
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * GET /api/v1/health
 * Returns { success: true, status: "ok" }
 */
router.get('/', async (req, res) => {
  try {
    // Add CORS headers
    const origin = req.headers.origin;
    const allowedOrigins = ['https://ispora.app', 'https://www.ispora.app', 'http://localhost:5173'];
    
    if (!origin || allowedOrigins.includes(origin)) {
      if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      } else if (!origin) {
        res.setHeader('Access-Control-Allow-Origin', '*');
      }
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    }

    // Check MongoDB connection with detailed status
    const { getConnectionStatus, healthCheck } = require('../config/database');
    const mongoStatus = getConnectionStatus();
    let mongoHealth = null;
    
    // Run health check if connected
    if (mongoStatus.isConnected) {
      try {
        mongoHealth = await healthCheck();
      } catch (healthError) {
        // Health check failed, but connection exists
        mongoHealth = {
          healthy: false,
          message: healthError.message
        };
      }
    }

    // Return Phase 1.5 format: { success: true, status: "ok" }
    const healthData = {
      success: true,
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      mongoDB: {
        status: mongoStatus.status,
        isConnected: mongoStatus.isConnected,
        readyState: mongoStatus.readyState,
        database: mongoStatus.database,
        host: mongoStatus.host,
        port: mongoStatus.port,
        health: mongoHealth
      }
    };

    // Log health check (reduced logging for production)
    if (process.env.NODE_ENV === 'development') {
      logger.info({
        mongoStatus,
        uptime: process.uptime(),
        userAgent: req.headers['user-agent']
      }, '✅ Phase 1.5 health check');
    }

    res.status(200).json(healthData);

  } catch (error) {
    // Add CORS headers even on error
    const origin = req.headers.origin;
    if (origin && (origin.includes('ispora.app') || origin.includes('localhost'))) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    logger.error({ error: error.message }, '❌ Health check error');

    // Return 200 OK even on error (for Render compatibility)
    res.status(200).json({
      success: true,
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      error: 'Health check had issues but service is running'
    });
  }
});

module.exports = router;

