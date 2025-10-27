const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/connection');
const config = require('../config');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Generate JWT Token
const signToken = (id) => {
  return jwt.sign({ id }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

// Send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user.id);

  const options = {
    expires: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  // Remove password from output
  const userResponse = { ...user };
  delete userResponse.password_hash;

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    user: userResponse,
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, userType = 'student', username } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email, password, first name, and last name',
      });
    }

    // Check if user exists
    const existingUser = await db('users').where({ email }).first();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email',
      });
    }

    // Check username if provided
    if (username) {
      const existingUsername = await db('users').where({ username }).first();

      if (existingUsername) {
        return res.status(400).json({
          success: false,
          error: 'Username already taken',
        });
      }
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
      username: username || null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    await db('users').insert(userData);

    // Get created user
    const user = await db('users').where({ id: userId }).first();

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔍 Login attempt:', {
      email: email,
      passwordLength: password ? password.length : 0,
      timestamp: new Date().toISOString()
    });
    
    // Enhanced debugging as requested
    console.log("Email received:", email);
    console.log("Password received:", password ? `[${password.length} chars]` : 'null');

    // Validate email & password
    if (!email || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({
        success: false,
        error: 'Please provide an email and password',
      });
    }

    // Check for user
    console.log('🔍 Looking for user with email:', email.toLowerCase());
    const user = await db('users').where({ email: email.toLowerCase() }).first();
    
    if (!user) {
      console.log('❌ User not found in database');
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }
    
    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      hasPasswordHash: !!user.password_hash,
      passwordHashLength: user.password_hash ? user.password_hash.length : 0
    });
    
    // Enhanced debugging as requested
    console.log("User found:", user);

    // Check if password matches
    console.log('🔍 Comparing passwords...');
    const isMatch = await bcrypt.compare(password, user.password_hash);
    console.log('🔍 Password comparison result:', isMatch);
    
    // Enhanced debugging as requested
    console.log("Password match:", isMatch);
    console.log("Stored password hash:", user.password_hash ? `${user.password_hash.substring(0, 20)}...` : 'null');

    if (!isMatch) {
      console.log('❌ Password does not match');
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    console.log('✅ Password matches, updating last login...');
    // Update last login
    await db('users').where({ id: user.id }).update({
      last_login: new Date(),
      is_online: true,
      updated_at: new Date(),
    });

    // Get updated user
    const updatedUser = await db('users').where({ id: user.id }).first();
    console.log('✅ Login successful for user:', updatedUser.email);

    sendTokenResponse(updatedUser, 200, res);
  } catch (error) {
    console.error('❌ Login error:', error);
    next(error);
  }
});

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
router.post('/logout', protect, async (req, res, next) => {
  try {
    // Update user online status
    await db('users').where({ id: req.user.id }).update({
      is_online: false,
      updated_at: new Date(),
    });

    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: 'User logged out successfully',
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await db('users').where({ id: req.user.id }).first();

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Remove password from response
    const userResponse = { ...user };
    delete userResponse.password_hash;

    res.status(200).json({
      success: true,
      user: userResponse,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
router.put('/updatepassword', protect, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Please provide current and new password',
      });
    }

    // Get user with password
    const user = await db('users').where({ id: req.user.id }).first();

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Password is incorrect',
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update password
    await db('users').where({ id: req.user.id }).update({
      password_hash: passwordHash,
      updated_at: new Date(),
    });

    // Get updated user
    const updatedUser = await db('users').where({ id: req.user.id }).first();

    sendTokenResponse(updatedUser, 200, res);
  } catch (error) {
    next(error);
  }
});

// @desc    Debug route to test database connection
// @route   GET /api/debug
// @access  Public
router.get('/debug', async (req, res) => {
  try {
    console.log('🔍 Debug route hit - testing database connection...');
    
    // Test database connection
    await db.raw('SELECT 1');
    console.log('✅ Database connection successful');
    
    // Get user count
    const userCount = await db('users').count('id as count').first();
    console.log('📊 User count:', userCount.count);
    
    // Get all users (without passwords)
    const users = await db('users').select('id', 'email', 'first_name', 'last_name', 'user_type', 'created_at');
    console.log('👥 Users in database:', users.length);
    
    // Check for demo user specifically
    const demoUser = await db('users').where({ email: 'demo@ispora.com' }).first();
    
    res.json({
      connected: true,
      userCount: userCount.count,
      users: users,
      demoUser: demoUser ? {
        id: demoUser.id,
        email: demoUser.email,
        firstName: demoUser.first_name,
        lastName: demoUser.last_name,
        userType: demoUser.user_type,
        createdAt: demoUser.created_at
      } : null,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('❌ Debug route error:', err);
    res.json({
      connected: false,
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
