const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const knex = require('knex');
const config = require('../knexfile');
const logger = require('../utils/logger');

const db = knex(config.development);

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'fallback-secret-change-in-production',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Register user
const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, userType = 'student' } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, first name, and last name are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
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
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const userId = uuidv4();
    const userData = {
      id: userId,
      email: email.toLowerCase(),
      password_hash: passwordHash,
      first_name: firstName,
      last_name: lastName,
      user_type: userType,
      username: `${firstName.toLowerCase()}${lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}`,
      is_verified: true, // Auto-verify for simplicity
      email_verified: true,
      profile_completed: false,
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    };

    await db('users').insert(userData);

    // Generate token
    const token = generateToken(userId);

    // Remove password hash from response
    const { password_hash, ...userResponse } = userData;

    logger.info({ userId, email }, 'User registered successfully');

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: userResponse
    });

  } catch (error) {
    logger.error({ error: error.message }, 'Registration failed');
    res.status(500).json({
      success: false,
      error: 'Server error during registration'
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Check for user
    const user = await db('users').where({ email: email.toLowerCase() }).first();
    if (!user) {
      logger.warn({ email }, 'Login failed: User not found');
      return res.status(400).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      logger.warn({ email }, 'Login failed: Invalid password');
      return res.status(400).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user.id);

    // Update last login
    await db('users').where({ id: user.id }).update({ 
      last_login: new Date(), 
      updated_at: new Date() 
    });

    // Remove password hash from response
    const { password_hash, ...userResponse } = user;

    logger.info({ userId: user.id, email }, 'User logged in successfully');

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse
    });

  } catch (error) {
    logger.error({ error: error.message }, 'Login failed');
    res.status(500).json({
      success: false,
      error: 'Server error during login'
    });
  }
};

// Get current user
const getMe = async (req, res) => {
  try {
    const user = await db('users').where({ id: req.user.id }).first();
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    const { password_hash, ...userResponse } = user;
    
    logger.info({ userId: user.id }, 'User profile retrieved');
    
    res.json({ 
      success: true, 
      user: userResponse 
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Get user profile failed');
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};

module.exports = {
  register,
  login,
  getMe
};
