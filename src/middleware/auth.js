const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../utils/logger');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      // 🛡️ DevOps Guardian: Add CORS headers to auth error response
      const origin = req.headers.origin;
      if (origin && origin.includes('ispora.app')) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }
      
      return res.status(401).json({
        success: false,
        error: 'Access token required',
        code: 'NO_TOKEN'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Validate token has required user ID
    if (!decoded.id) {
      logger.error({ decoded }, 'Token missing user ID');
      return res.status(401).json({
        success: false,
        error: 'Invalid token - missing user ID',
        code: 'INVALID_TOKEN'
      });
    }
    
    // Attach user info to request - ID is required, email is optional
    req.user = { 
      id: decoded.id,
      email: decoded.email || null
    };
    
    logger.info({ 
      userId: decoded.id, 
      email: decoded.email,
      hasEmail: !!decoded.email 
    }, '✅ Token verified successfully');
    
    next();
  } catch (error) {
    logger.error({ error: error.message }, 'Token verification failed');
    
    // 🛡️ DevOps Guardian: Add CORS headers to error response
    const origin = req.headers.origin;
    if (origin && origin.includes('ispora.app')) {
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

    return res.status(500).json({
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
