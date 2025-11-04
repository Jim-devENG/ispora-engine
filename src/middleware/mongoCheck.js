/**
 * MongoDB Connection Check Middleware
 * Ensures MongoDB is available before allowing Phase 1/2/3 route access
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Middleware to check if MongoDB is connected
 * Returns 503 Service Unavailable if MongoDB is not connected
 */
const requireMongoDB = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    // MongoDB is not connected
    const origin = req.headers.origin;
    const allowedOrigins = ['https://ispora.app', 'https://www.ispora.app', 'http://localhost:5173'];

    if (!origin || allowedOrigins.includes(origin)) {
      if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      } else if (!origin) {
        res.setHeader('Access-Control-Allow-Origin', '*');
      }
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    }

    logger.warn({
      readyState: mongoose.connection.readyState,
      path: req.path,
      method: req.method
    }, 'MongoDB not available for Phase 1/2/3 route');

    return res.status(503).json({
      success: false,
      error: 'Service temporarily unavailable',
      code: 'MONGO_NOT_AVAILABLE',
      message: 'MongoDB connection is not available. Please ensure MONGO_URI environment variable is set and MongoDB is running.',
      timestamp: new Date().toISOString()
    });
  }

  // MongoDB is connected, proceed
  next();
};

/**
 * Optional MongoDB check - returns info but doesn't block
 */
const checkMongoDB = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    // Attach MongoDB status to request for handlers to use
    req.mongoAvailable = false;
  } else {
    req.mongoAvailable = true;
  }
  next();
};

module.exports = {
  requireMongoDB,
  checkMongoDB
};

