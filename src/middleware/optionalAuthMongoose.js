/**
 * Optional Authentication Middleware (Mongoose)
 * Phase 2.1: Attempts to authenticate user but doesn't fail if token is missing
 * Used for public routes that optionally accept authentication
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Optional JWT token verification
 * If token is present and valid, attach user to request
 * If token is missing or invalid, continue without req.user (anonymous)
 */
const optionalVerifyToken = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers['authorization'];
    
    // If no auth header, continue as anonymous
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }
    
    const token = authHeader.split(' ')[1]; // Extract token after "Bearer "

    // Verify JWT_SECRET is configured
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      logger.warn('JWT_SECRET not configured, skipping optional auth');
      req.user = null;
      return next();
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (jwtError) {
      // Invalid token - continue as anonymous
      req.user = null;
      return next();
    }

    // Extract user ID from decoded token
    const userId = decoded.id || decoded._id;

    if (!userId) {
      req.user = null;
      return next();
    }

    // Try to find user by MongoDB _id
    let user = null;
    try {
      if (userId.match(/^[0-9a-fA-F]{24}$/)) {
        user = await User.findById(userId);
      }
      
      // If not found, try by email (fallback)
      if (!user && decoded.email) {
        user = await User.findOne({ email: decoded.email });
      }
    } catch (dbError) {
      logger.error({ error: dbError.message, userId }, 'Database error while finding user');
      req.user = null;
      return next();
    }

    // If user found, attach to request
    if (user) {
      req.user = user;
      logger.debug({ userId: user._id.toString(), email: user.email }, 'Optional auth: User authenticated');
    } else {
      req.user = null;
      logger.debug({ userId }, 'Optional auth: User not found, continuing as anonymous');
    }

    next();
  } catch (error) {
    logger.error({ error: error.message }, 'Error in optional token verification');
    // On error, continue as anonymous
    req.user = null;
    next();
  }
};

module.exports = {
  optionalVerifyToken
};

