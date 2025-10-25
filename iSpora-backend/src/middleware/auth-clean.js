const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../database/connection');

// Clean authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    console.log('🔍 Auth middleware - Headers:', {
      authorization: authHeader,
      token: token ? `${token.substring(0, 20)}...` : 'No token'
    });

    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({
        success: false,
        error: 'Access token required',
        code: 'NO_TOKEN'
      });
    }

    // Verify JWT token
    console.log('🔍 Verifying token with secret:', config.jwt.secret ? 'Secret exists' : 'No secret');
    const decoded = jwt.verify(token, config.jwt.secret);
    console.log('✅ Token decoded successfully:', { id: decoded.id, exp: decoded.exp });
    
    // Get user from database
    console.log('🔍 Looking for user with ID:', decoded.id);
    const user = await db('users').where({ id: decoded.id }).first();
    console.log('🔍 User lookup result:', user ? `User found: ${user.email}` : 'User not found');
    
    if (!user) {
      console.log('❌ User not found in database');
      return res.status(401).json({
        success: false,
        error: 'Invalid token - user not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Attach user to request
    req.user = user;
    console.log('✅ Auth successful for user:', user.email);
    next();
  } catch (error) {
    console.log('❌ Auth middleware error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication error',
      code: 'AUTH_ERROR'
    });
  }
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await db('users').where({ id: decoded.id }).first();
      
      if (user) {
        req.user = user;
      }
    }
  } catch (error) {
    // Silently fail for optional auth
    req.user = null;
  }
  
  next();
};

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!roles.includes(req.user.user_type)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Required roles: ${roles.join(', ')}`,
        code: 'INSUFFICIENT_ROLE'
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  optionalAuth,
  authorize
};
