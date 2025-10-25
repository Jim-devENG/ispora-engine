const jwt = require('jsonwebtoken');
const db = require('../database/connection');

// Auth Layer v2 - Clean authentication middleware
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    console.log('🔍 Auth v2 - Middleware check:', {
      hasAuthHeader: !!authHeader,
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token'
    });

    if (!token) {
      console.log('❌ Auth v2 - No token provided');
      return res.status(401).json({
        success: false,
        error: 'Access token required',
        code: 'NO_TOKEN'
      });
    }

    // Verify JWT token
    console.log('🔍 Auth v2 - Verifying token with secret:', process.env.JWT_SECRET ? 'Secret exists' : 'No secret');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Auth v2 - Token decoded successfully:', { 
      id: decoded.id, 
      email: decoded.email, 
      exp: decoded.exp 
    });
    
    // Get user from database to ensure they still exist
    console.log('🔍 Auth v2 - Looking for user with ID:', decoded.id);
    const user = await db('users').where({ id: decoded.id }).first();
    console.log('🔍 Auth v2 - User lookup result:', user ? `User found: ${user.email}` : 'User not found');
    
    if (!user) {
      console.log('❌ Auth v2 - User not found in database');
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
        code: 'USER_NOT_FOUND'
      });
    }

    // Attach user to request
    req.user = user;
    console.log('✅ Auth v2 - Authentication successful for user:', user.email);
    next();
  } catch (error) {
    console.log('❌ Auth v2 - Auth middleware error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
        code: 'TOKEN_EXPIRED'
      });
    }

    console.error('❌ Auth v2 - Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication error',
      code: 'AUTH_ERROR'
    });
  }
};

module.exports = { authMiddleware };
