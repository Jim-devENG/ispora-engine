/**
 * Auth Routes (Mongoose) - Skeleton
 * Phase 1: Basic auth endpoints
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

/**
 * Generate JWT token
 */
const generateToken = (userId, email) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  
  return jwt.sign(
    { id: userId.toString(), email },
    jwtSecret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, firstName, lastName, userType = 'student', username } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        code: 'INVALID_PAYLOAD',
        message: 'Name, email, and password are required'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        code: 'INVALID_PAYLOAD',
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User already exists',
        code: 'DUPLICATE_USER',
        message: 'An account with this email already exists'
      });
    }

    // Hash password
    const passwordHash = await User.hashPassword(password);

    // Create user
    const user = new User({
      name,
      email: email.toLowerCase(),
      passwordHash,
      firstName: firstName || name.split(' ')[0] || '',
      lastName: lastName || name.split(' ').slice(1).join(' ') || '',
      userType,
      username
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id, user.email);

    logger.info({ userId: user._id.toString(), email: user.email }, '✅ User registered successfully');

    // Format user response (passwordHash excluded by model transform)
    const userResponse = user.toJSON();

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      data: {
        token,
        user: userResponse
      }
    });

  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, '❌ Registration failed');

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        code: 'INVALID_PAYLOAD',
        message: messages
      });
    }

    // Handle duplicate key errors (unique index)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        error: `Duplicate ${field}`,
        code: 'DUPLICATE_USER',
        message: `An account with this ${field} already exists`
      });
    }

    // Generic server error
    res.status(500).json({
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR',
      message: 'Failed to register user. Please try again later.'
    });
  }
});

/**
 * POST /api/auth/login
 * Login user and issue JWT token
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        code: 'INVALID_PAYLOAD',
        message: 'Email and password are required'
      });
    }

    // Find user by email (include passwordHash for comparison)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate token
    const token = generateToken(user._id, user.email);

    logger.info({ userId: user._id.toString(), email: user.email }, '✅ User logged in successfully');

    // Format user response (passwordHash excluded by model transform)
    const userResponse = user.toJSON();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      data: {
        token,
        user: userResponse
      }
    });

  } catch (error) {
    logger.error({ error: error.message }, '❌ Login failed');

    res.status(500).json({
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR',
      message: 'Failed to login. Please try again later.'
    });
  }
});

module.exports = router;

