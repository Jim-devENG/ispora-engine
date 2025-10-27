const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../database/connection');

// Protect routes
const protect = async (req, res, next) => {
  let token;

  console.log('🔍 Auth middleware - Headers:', {
    authorization: req.headers.authorization,
    'x-dev-key': req.headers['x-dev-key'],
    origin: req.headers.origin,
    userAgent: req.headers['user-agent']?.substring(0, 50)
  });

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('🔍 Token extracted:', token ? `${token.substring(0, 20)}...` : 'No token');
  }

  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route',
    });
  }

  try {
    // Verify token
    console.log('🔍 Verifying token with secret:', config.jwt.secret ? 'Secret exists' : 'No secret');
    const decoded = jwt.verify(token, config.jwt.secret);
    console.log('✅ Token decoded successfully:', { id: decoded.id, exp: decoded.exp });

    // Get user from database
    const user = await db('users').where({ id: decoded.id }).first();
    console.log('🔍 User lookup result:', user ? `User found: ${user.email}` : 'User not found');

    if (!user) {
      console.log('❌ User not found in database');
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route',
      });
    }

    req.user = user;
    console.log('✅ Auth successful for user:', user.email);
    next();
  } catch (error) {
    console.log('❌ Token verification failed:', error.message);
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route',
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.user_type)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.user_type} is not authorized to access this route`,
      });
    }
    next();
  };
};

// Optional auth - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await db('users').where({ id: decoded.id }).first();

      if (user) {
        req.user = user;
      }
    } catch (error) {
      // Token is invalid, but we don't fail the request
      req.user = null;
    }
  }

  next();
};

// Require admin access
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route',
    });
  }

  if (req.user.user_type !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required',
    });
  }

  next();
};

module.exports = {
  protect,
  authorize,
  optionalAuth,
  requireAdmin,
};
