const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/connection');
const config = require('../config');
const { authenticateToken } = require('../middleware/auth-clean');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, userType = 'student' } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, first name, and last name are required'
      });
    }

    // Check if user already exists
    const existingUser = await db('users').where({ email: email.toLowerCase() }).first();
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const userId = uuidv4();
    const userData = {
      id: userId,
      email: email.toLowerCase(),
      password_hash: passwordHash,
      first_name: firstName,
      last_name: lastName,
      user_type: userType,
      username: email.split('@')[0],
      is_verified: true,
      email_verified: true,
      profile_completed: false,
      status: 'active',
      created_at: new Date(),
      updated_at: new Date(),
    };

    await db('users').insert(userData);

    // Generate token
    const token = generateToken(userId);

    // Remove password from response
    const { password_hash, ...userResponse } = userData;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Find user
    const user = await db('users').where({ email: email.toLowerCase() }).first();
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Update last login
    await db('users').where({ id: user.id }).update({
      last_login: new Date(),
      is_online: true,
      updated_at: new Date(),
    });

    // Generate token
    const token = generateToken(user.id);
    console.log('🔍 Generated token for user:', {
      userId: user.id,
      userEmail: user.email,
      tokenLength: token.length,
      tokenPreview: token.substring(0, 50) + '...'
    });

    // Remove password from response
    const { password_hash, ...userResponse } = user;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const { password_hash, ...userResponse } = req.user;
    
    res.json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user data'
    });
  }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Update user status
    await db('users').where({ id: req.user.id }).update({
      is_online: false,
      updated_at: new Date(),
    });

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
});

// @desc    Debug route
// @route   GET /api/auth/debug
// @access  Public
router.get('/debug', async (req, res) => {
  try {
    // Test database connection
    await db.raw('SELECT 1');
    
    // Get user count
    const userCount = await db('users').count('id as count').first();
    
    // Get all users (without passwords)
    const users = await db('users').select('id', 'email', 'first_name', 'last_name', 'user_type', 'created_at');
    
    res.json({
      success: true,
      connected: true,
      userCount: userCount.count,
      users: users,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Debug route error:', error);
    res.json({
      success: false,
      connected: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
