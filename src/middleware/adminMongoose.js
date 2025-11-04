/**
 * Admin Middleware (Mongoose)
 * Phase 2: Verify user has admin role
 */

const logger = require('../utils/logger');

/**
 * Verify user has admin role
 * Must be used after verifyToken middleware
 */
const requireAdmin = (req, res, next) => {
  try {
    // Ensure verifyToken was called first (req.user should exist)
    if (!req.user) {
      const origin = req.headers.origin;
      const allowedOrigins = ['https://ispora.app', 'https://www.ispora.app', 'http://localhost:5173'];
      
      if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }
      
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'NO_TOKEN',
        message: 'Please log in first.'
      });
    }

    // Check if user has admin role
    // Roles can be an array: ['user', 'admin'] or userType can be 'admin'
    const roles = req.user.roles || [];
    const userType = req.user.userType;
    const isAdmin = roles.includes('admin') || userType === 'admin';

    if (!isAdmin) {
      logger.warn({ 
        userId: req.user._id?.toString() || req.user.id,
        email: req.user.email,
        roles,
        userType
      }, 'Non-admin user attempted to access admin route');

      const origin = req.headers.origin;
      const allowedOrigins = ['https://ispora.app', 'https://www.ispora.app', 'http://localhost:5173'];
      
      if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }

      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        code: 'FORBIDDEN',
        message: 'Admin access required. You do not have permission to access this resource.'
      });
    }

    logger.info({ 
      userId: req.user._id?.toString() || req.user.id,
      email: req.user.email
    }, '✅ Admin access granted');

    next();
  } catch (error) {
    logger.error({ error: error.message }, 'Error in admin middleware');
    
    const origin = req.headers.origin;
    const allowedOrigins = ['https://ispora.app', 'https://www.ispora.app', 'http://localhost:5173'];
    
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    return res.status(500).json({
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR',
      message: 'Please try again later.'
    });
  }
};

module.exports = {
  requireAdmin
};

