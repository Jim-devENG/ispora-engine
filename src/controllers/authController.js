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

    // Check if user already exists - normalize email
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await db('users').where({ email: normalizedEmail }).first();
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email already exists. Please log in instead.',
        code: 'USER_ALREADY_EXISTS'
      });
    }

    // 🛡️ DevOps Guardian: Hash password with bcrypt
    const saltRounds = 12;
    console.log('🔍 [REGISTER] Hashing password with bcrypt (salt rounds:', saltRounds, ')...');
    const passwordHash = await bcrypt.hash(password, saltRounds);
    console.log('✅ [REGISTER] Password hashed successfully:', {
      hashLength: passwordHash.length,
      hashPreview: passwordHash.substring(0, 20) + '...'
    });

    // Create user with normalized email
    const userId = uuidv4();
    const userData = {
      id: userId,
      email: normalizedEmail,
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

    // 🛡️ DevOps Guardian: Verify database connection before inserting
    try {
      await db.raw('SELECT 1');
      console.log('✅ [REGISTER] Database connection verified');
    } catch (dbError) {
      console.error('❌ [REGISTER] Database connection failed:', dbError.message);
      logger.error({ error: dbError.message }, 'Database connection failed during registration');
      return res.status(500).json({
        success: false,
        error: 'Database connection error. Please try again.',
        msg: 'Database connection failed'
      });
    }
    
    await db('users').insert(userData);
    console.log('✅ [REGISTER] User inserted into database:', {
      userId,
      email: normalizedEmail
    });
    
    // 🛡️ DevOps Guardian: Verify user was actually created
    const createdUser = await db('users').where({ id: userId }).first();
    if (!createdUser) {
      console.error('❌ [REGISTER] User was not found after insertion');
      logger.error({ userId, email: normalizedEmail }, 'User not found after registration');
      return res.status(500).json({
        success: false,
        error: 'Registration failed. User was not created.',
        msg: 'Registration failed'
      });
    }
    console.log('✅ [REGISTER] User verified in database after creation');

    // Generate token with user info
    const token = generateToken(userId, normalizedEmail);
    console.log('✅ [REGISTER] JWT token generated:', {
      userId,
      tokenLength: token.length
    });

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
    console.error('❌ [REGISTER] Unexpected error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    logger.error({ error: error.message, stack: error.stack }, 'Registration failed');
    
    // 🛡️ DevOps Guardian: Add CORS headers to error response
    const origin = req.headers.origin;
    if (origin && origin.includes('ispora.app')) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    
    res.status(500).json({
      success: false,
      msg: 'Server error during registration. Please try again.',
      error: 'Server error during registration'
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    // 🛡️ DevOps Guardian: Enhanced logging for login debugging
    console.log('🔍 [LOGIN] Incoming request body:', {
      hasEmail: !!req.body.email,
      hasPassword: !!req.body.password,
      email: req.body.email,
      passwordLength: req.body.password ? req.body.password.length : 0,
      timestamp: new Date().toISOString()
    });
    console.log('🔍 [LOGIN] Full request body:', JSON.stringify({
      email: req.body.email,
      password: req.body.password ? `[${req.body.password.length} chars]` : null
    }));

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

    // Check for user - ensure email is normalized to lowercase and trimmed
    const normalizedEmail = email.toLowerCase().trim();
    
    console.log('🔍 [LOGIN] Looking up user with normalized email:', normalizedEmail);
    
    // 🛡️ DevOps Guardian: Verify database connection before querying
    try {
      // Test database connection
      await db.raw('SELECT 1');
      console.log('✅ [LOGIN] Database connection verified');
    } catch (dbError) {
      console.error('❌ [LOGIN] Database connection failed:', dbError.message);
      logger.error({ error: dbError.message }, 'Database connection failed during login');
      return res.status(500).json({
        success: false,
        msg: 'Database connection error. Please try again.',
        error: 'Database connection failed'
      });
    }
    
    const user = await db('users').where({ email: normalizedEmail }).first();
    
    if (!user) {
      logger.warn({ email: normalizedEmail }, 'Login failed: User not found');
      console.log('❌ [LOGIN] User not found in database:', {
        providedEmail: email,
        normalizedEmail,
        userFound: false
      });
      
      // 🛡️ DevOps Guardian: Add CORS headers to error response
      const origin = req.headers.origin;
      if (origin && origin.includes('ispora.app')) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }
      
      return res.status(401).json({
        success: false,
        msg: 'Invalid email or password',
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    console.log('✅ [LOGIN] User found in database:', {
      userId: user.id,
      userEmail: user.email,
      emailMatch: user.email === normalizedEmail,
      hasPasswordHash: !!user.password_hash,
      passwordHashLength: user.password_hash ? user.password_hash.length : 0
    });

    // 🛡️ DevOps Guardian: Verify password hash exists
    if (!user.password_hash) {
      console.error('❌ [LOGIN] User has no password hash:', { userId: user.id, email: user.email });
      logger.error({ userId: user.id, email: user.email }, 'User has no password hash');
      return res.status(500).json({
        success: false,
        msg: 'Account setup error. Please contact support.',
        error: 'Password hash missing'
      });
    }

    // Check password using bcrypt.compare
    console.log('🔍 [LOGIN] Comparing password with bcrypt...');
    const isMatch = await bcrypt.compare(password, user.password_hash);
    console.log('🔍 [LOGIN] Password comparison result:', isMatch);
    
    if (!isMatch) {
      logger.warn({ email: normalizedEmail }, 'Login failed: Invalid password');
      console.log('❌ [LOGIN] Password does not match');
      
      // 🛡️ DevOps Guardian: Add CORS headers to error response
      const origin = req.headers.origin;
      if (origin && origin.includes('ispora.app')) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }
      
      return res.status(401).json({
        success: false,
        msg: 'Invalid email or password',
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    console.log('✅ [LOGIN] Password verified successfully');

    // Generate token with user info
    const token = generateToken(user.id, user.email);
    console.log('✅ [LOGIN] JWT token generated:', {
      userId: user.id,
      tokenLength: token.length,
      tokenPreview: token.substring(0, 20) + '...'
    });

    // Update last login
    await db('users').where({ id: user.id }).update({ 
      last_login: new Date(), 
      updated_at: new Date() 
    });
    console.log('✅ [LOGIN] Last login timestamp updated');

    // Remove password hash from response
    const { password_hash, ...userResponse } = user;

    logger.info({ userId: user.id, email }, 'User logged in successfully');
    console.log('✅ [LOGIN] Login successful - returning response:', {
      userId: user.id,
      userEmail: user.email,
      hasToken: !!token
    });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('❌ [LOGIN] Unexpected error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    logger.error({ error: error.message, stack: error.stack }, 'Login failed');
    
    // 🛡️ DevOps Guardian: Add CORS headers to error response
    const origin = req.headers.origin;
    if (origin && origin.includes('ispora.app')) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    
    res.status(500).json({
      success: false,
      msg: 'Server error during login. Please try again.',
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

// Logout user
const logout = async (req, res) => {
  try {
    // Update last logout time if user is authenticated
    if (req.user && req.user.id) {
      await db('users').where({ id: req.user.id }).update({ 
        updated_at: new Date() 
      });
      logger.info({ userId: req.user.id }, 'User logged out');
    }
    
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Logout failed');
    // Even if there's an error, logout should succeed client-side
    res.json({
      success: true,
      message: 'Logout successful'
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  logout
};
