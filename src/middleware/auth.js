/**
 * 🔐 Authentication Middleware
 * Verifies JWT tokens and ensures user exists in database
 */

const jwt = require('jsonwebtoken');
const knex = require('knex');
const config = require('../knexfile');
const logger = require('../utils/logger');

// Database configuration
const dbConfig = process.env.NODE_ENV === 'production' 
  ? (config.production || config.development)
  : config.development;

const db = knex(dbConfig);

/**
 * Verify JWT token and ensure user exists in database
 * NO FALLBACKS - User must exist or request is rejected
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      // Add CORS headers to error response
      const origin = req.headers.origin;
      const allowedOrigins = ['https://ispora.app', 'https://www.ispora.app', 'http://localhost:5173'];
      
      if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }
      
      return res.status(401).json({
        success: false,
        error: 'Access token required',
        code: 'NO_TOKEN',
        message: 'Please log in again.'
      });
    }

    // Verify JWT token
    const jwtSecret = process.env.JWT_SECRET || config.jwt?.secret;
    if (!jwtSecret) {
      logger.error('JWT_SECRET not configured');
      const origin = req.headers.origin;
      const allowedOrigins = ['https://ispora.app', 'https://www.ispora.app', 'http://localhost:5173'];
      
      if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }
      
      return res.status(500).json({
        success: false,
        error: 'Server configuration error',
        code: 'SERVER_ERROR'
      });
    }
    
    const decoded = jwt.verify(token, jwtSecret);
    
    // Validate token has required user ID
    if (!decoded.id) {
      logger.error({ decoded }, 'Token missing user ID');
      
      const origin = req.headers.origin;
      const allowedOrigins = ['https://ispora.app', 'https://www.ispora.app', 'http://localhost:5173'];
      
      if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }
      
      return res.status(401).json({
        success: false,
        error: 'Invalid token - missing user ID',
        code: 'INVALID_TOKEN',
        message: 'Please log in again.'
      });
    }
    
    // 🔑 CRITICAL: Verify user exists in database - NO FALLBACKS
    // This is the root cause of "User not found" errors
    const user = await db('users').where('id', decoded.id).first();
    
    if (!user) {
      logger.error({ userId: decoded.id, email: decoded.email }, 'User not found in database');
      
      const origin = req.headers.origin;
      const allowedOrigins = ['https://ispora.app', 'https://www.ispora.app', 'http://localhost:5173'];
      
      if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }
      
      return res.status(401).json({
        success: false,
        error: 'User not found. Please log in again.',
        code: 'USER_NOT_FOUND',
        message: 'Your session is invalid. Please log in again.'
      });
    }
    
    // Attach complete user info to request
    req.user = { 
      id: user.id,
      email: user.email || decoded.email || null,
      firstName: user.first_name || null,
      lastName: user.last_name || null
    };
    
    logger.info({ 
      userId: user.id, 
      email: user.email,
      hasEmail: !!user.email 
    }, '✅ Token verified and user authenticated');
    
    next();
  } catch (error) {
    logger.error({ error: error.message, name: error.name }, 'Token verification failed');
    
    // Add CORS headers to error response
    const origin = req.headers.origin;
    const allowedOrigins = ['https://ispora.app', 'https://www.ispora.app', 'http://localhost:5173'];
    
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        code: 'INVALID_TOKEN',
        message: 'Please log in again.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        code: 'TOKEN_EXPIRED',
        message: 'Your session has expired. Please log in again.'
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Authentication error',
      code: 'AUTH_ERROR',
      message: 'Please log in again.'
    });
  }
};

module.exports = {
  authenticateToken
};
