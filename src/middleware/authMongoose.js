/**
 * Authentication Middleware (Mongoose)
 * Phase 1: JWT token verification for Mongoose-based routes
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Verify JWT token and attach user to request
 * Returns clear error codes: TOKEN_EXPIRED, INVALID_TOKEN, NO_TOKEN
 */
const verifyToken = async (req, res, next) => {
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
        message: 'No token provided. Please log in again.'
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
    if (!decoded.id && !decoded.userId) {
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
    
    // 🔑 CRITICAL: Verify user exists in MongoDB - NO FALLBACKS
    // Extract user ID from token (support both 'id' and 'userId')
    const userId = decoded.id || decoded.userId;
    
    // Try to find user by MongoDB _id first, then by email
    let user = null;
    try {
      // Try MongoDB ObjectId if it looks like one
      if (userId.match(/^[0-9a-fA-F]{24}$/)) {
        user = await User.findById(userId).select('+passwordHash'); // Include passwordHash for comparison if needed
      }
      
      // If not found, try by email (fallback for migration compatibility)
      if (!user && decoded.email) {
        user = await User.findOne({ email: decoded.email }).select('+passwordHash');
      }
    } catch (dbError) {
      logger.error({ error: dbError.message, userId }, 'Database error while finding user');
      
      const origin = req.headers.origin;
      const allowedOrigins = ['https://ispora.app', 'https://www.ispora.app', 'http://localhost:5173'];
      
      if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }
      
      return res.status(500).json({
        success: false,
        error: 'Database error',
        code: 'SERVER_ERROR',
        message: 'Please try again later.'
      });
    }
    
    if (!user) {
      logger.error({ userId, email: decoded.email }, 'User not found in database - session expired');
      
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
    
    // Attach user document to request (Mongoose document)
    req.user = user;
    
    // Also attach formatted user for compatibility
    req.userData = {
      id: user._id.toString(),
      email: user.email || decoded.email || null,
      firstName: user.firstName || null,
      lastName: user.lastName || null,
      name: user.name || user.fullName || user.email || 'Unknown'
    };
    
    logger.info({ 
      userId: user._id.toString(), 
      email: user.email,
      hasEmail: !!user.email 
    }, '✅ Token verified and user found successfully');
    
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

module.exports = {
  verifyToken
};

