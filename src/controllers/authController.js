const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const knex = require('knex');
const config = require('../knexfile');
const logger = require('../utils/logger');

// 🛡️ DevOps Guardian: Use environment-appropriate database config
const dbConfig = process.env.NODE_ENV === 'production' 
  ? (config.production || config.development)
  : config.development;

const db = knex(dbConfig);

// Generate JWT token
const generateToken = (userId, email = null) => {
  const payload = { id: userId };
  // Include email in token if provided (for better user lookup)
  if (email) {
    payload.email = email;
  }
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || config.jwt?.secret || 'fallback-secret-change-in-production',
    { expiresIn: process.env.JWT_EXPIRES_IN || config.jwt?.expiresIn || '7d' }
  );
};

// Register user
const register = async (req, res) => {
  try {
    console.log('🔍 Auth registration debugging:', {
      hasEmail: !!req.body.email,
      hasPassword: !!req.body.password,
      hasFirstName: !!req.body.firstName,
      hasLastName: !!req.body.lastName,
      userType: req.body.userType
    });

    const { email, password, firstName, lastName, userType = 'student' } = req.body;

    // Enhanced validation with specific field checks
    const missingFields = [];
    if (!email) missingFields.push('email');
    if (!password) missingFields.push('password');
    if (!firstName) missingFields.push('firstName');
    if (!lastName) missingFields.push('lastName');

    if (missingFields.length > 0) {
      console.error('❌ Missing required fields:', missingFields);
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`,
        code: 'MISSING_REQUIRED_FIELDS',
        missingFields: missingFields
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
        code: 'INVALID_EMAIL'
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long',
        code: 'PASSWORD_TOO_SHORT'
      });
    }

    if (password.length > 128) {
      return res.status(400).json({
        success: false,
        error: 'Password must be less than 128 characters',
        code: 'PASSWORD_TOO_LONG'
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

    // Generate token with user info
    const token = generateToken(userId, email.toLowerCase());

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
    console.log('🔍 Auth login debugging:', {
      hasEmail: !!req.body.email,
      hasPassword: !!req.body.password,
      email: req.body.email
    });

    const { email, password } = req.body;

    // Enhanced validation
    const missingFields = [];
    if (!email) missingFields.push('email');
    if (!password) missingFields.push('password');

    if (missingFields.length > 0) {
      console.error('❌ Missing required fields for login:', missingFields);
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`,
        code: 'MISSING_REQUIRED_FIELDS',
        missingFields: missingFields
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
        code: 'INVALID_EMAIL'
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

    // Generate token with user info
    const token = generateToken(user.id, user.email);

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
