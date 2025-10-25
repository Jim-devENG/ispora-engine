const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
require('dotenv').config();

// Import database connection
const db = require('./database/connection');

// Import routes
const authRoutes = require('./routes/auth-clean');
const taskRoutes = require('./routes/tasks-clean');
const healthRoutes = require('./routes/health');
const feedRoutes = require('./routes/feed');

const app = express();
const httpServer = createServer(app);

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'https://ispora.app',
    process.env.FRONTEND_URL || 'https://ispora.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests
app.options('*', cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: {
    success: false,
    error: 'Too many requests, please try again later'
  }
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/feed', feedRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: err.message
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      code: 'UNAUTHORIZED'
    });
  }
  
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Database initialization
const initializeDatabase = async () => {
  try {
    console.log('🔧 Initializing database...');
    
    // Test database connection
    await db.raw('SELECT 1');
    console.log('✅ Database connection established');
    
    // Create essential tables if they don't exist
    const tables = [
      'users',
      'tasks',
      'projects',
      'sessions'
    ];
    
    for (const table of tables) {
      try {
        await db.schema.hasTable(table).then(async (exists) => {
          if (!exists) {
            console.log(`📋 Creating table: ${table}`);
            await db.schema.createTable(table, (t) => {
              t.uuid('id').primary();
              t.timestamp('created_at').defaultTo(db.fn.now());
              t.timestamp('updated_at').defaultTo(db.fn.now());
              
              if (table === 'users') {
                t.string('email').unique().notNullable();
                t.string('password_hash').notNullable();
                t.string('first_name').notNullable();
                t.string('last_name').notNullable();
                t.string('user_type').defaultTo('student');
                t.string('username');
                t.boolean('is_verified').defaultTo(false);
                t.boolean('email_verified').defaultTo(false);
                t.boolean('profile_completed').defaultTo(false);
                t.string('status').defaultTo('active');
                t.boolean('is_online').defaultTo(false);
                t.timestamp('last_login');
              }
              
              if (table === 'tasks') {
                t.uuid('user_id').notNullable();
                t.string('title').notNullable();
                t.text('description');
                t.string('priority').defaultTo('medium');
                t.string('status').defaultTo('pending');
                t.timestamp('due_date');
                t.foreign('user_id').references('id').inTable('users');
              }
            });
          }
        });
      } catch (error) {
        console.log(`⚠️ Table ${table} already exists or error:`, error.message);
      }
    }
    
    // Create demo user if it doesn't exist
    const demoUser = await db('users').where({ email: 'demo@ispora.com' }).first();
    if (!demoUser) {
      console.log('🔧 Creating demo user...');
      const bcrypt = require('bcryptjs');
      const { v4: uuidv4 } = require('uuid');
      
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash('demo123', salt);
      
      const userId = uuidv4();
      const userData = {
        id: userId,
        email: 'demo@ispora.com',
        password_hash: passwordHash,
        first_name: 'Demo',
        last_name: 'User',
        user_type: 'student',
        username: 'demo',
        is_verified: true,
        email_verified: true,
        profile_completed: true,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      };
      
      await db('users').insert(userData);
      console.log('✅ Demo user created successfully');
      console.log('📧 Email: demo@ispora.com');
      console.log('🔑 Password: demo123');
    } else {
      console.log('✅ Demo user already exists');
    }
    
    console.log('✅ Database initialization complete');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Initialize database
    await initializeDatabase();
    
    // Start HTTP server
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 Debug route: http://localhost:${PORT}/api/auth/debug`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Start the server
startServer();

module.exports = app;
