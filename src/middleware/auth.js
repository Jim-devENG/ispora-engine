/**
 * 🔐 Authentication Middleware
 * Verifies JWT tokens and ensures user exists in database
 * Returns clear error codes: TOKEN_EXPIRED, INVALID_TOKEN, USER_NOT_FOUND
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
 * Clear error codes for frontend handling
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers['authorization'];
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
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
    
    const token = authHeader.split(' ')[1]; // Extract token after "Bearer "

    // Verify JWT_SECRET is configured
    const jwtSecret = process.env.JWT_SECRET;
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
        code: 'SERVER_ERROR',
        message: 'Server configuration error. Please contact support.'
      });
    }
    
    // Verify JWT token - this will throw TokenExpiredError or JsonWebTokenError
    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (jwtError) {
      // Handle JWT verification errors explicitly
      const origin = req.headers.origin;
      const allowedOrigins = ['https://ispora.app', 'https://www.ispora.app', 'http://localhost:5173'];
      
      if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }
      
      if (jwtError.name === 'TokenExpiredError') {
        logger.warn({ error: jwtError.message }, 'Token expired');
        return res.status(401).json({
          success: false,
          error: 'Session expired',
          code: 'TOKEN_EXPIRED',
          message: 'Your session has expired. Please log in again.'
        });
      }
      
      if (jwtError.name === 'JsonWebTokenError') {
        logger.warn({ error: jwtError.message }, 'Invalid token');
        return res.status(401).json({
          success: false,
          error: 'Invalid token',
          code: 'INVALID_TOKEN',
          message: 'Please log in again.'
        });
      }
      
      // Generic JWT error
      logger.error({ error: jwtError.message, name: jwtError.name }, 'Token verification failed');
      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
        code: 'INVALID_TOKEN',
        message: 'Please log in again.'
      });
    }
    
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
    // If token is valid but user doesn't exist, it's an expired/invalid session
    const user = await db('users').where('id', decoded.id).first();
    
    if (!user) {
      logger.error({ userId: decoded.id, email: decoded.email }, 'User not found in database - session expired');
      
      const origin = req.headers.origin;
      const allowedOrigins = ['https://ispora.app', 'https://www.ispora.app', 'http://localhost:5173'];
      
      if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }
      
      // Return "Session expired" instead of "User not found" to prevent confusion
      return res.status(401).json({
        success: false,
        error: 'Session expired',
        code: 'TOKEN_EXPIRED',
        message: 'Your session has expired. Please log in again.'
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
    logger.error({ error: error.message, name: error.name }, 'Unexpected error in token verification');
    
    // Add CORS headers to error response
    const origin = req.headers.origin;
    const allowedOrigins = ['https://ispora.app', 'https://www.ispora.app', 'http://localhost:5173'];
    
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    
    // Generic authentication error
    return res.status(401).json({
      success: false,
      error: 'Authentication error',
      code: 'AUTH_ERROR',
      message: 'Please log in again.'
    });
  }
};

// Alias for backward compatibility
const verifyToken = authenticateToken;

module.exports = {
  authenticateToken,
  verifyToken // Export as alias
};
