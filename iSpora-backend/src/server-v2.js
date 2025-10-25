const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const db = require('./database/connection');
const { v4: uuidv4 } = require('uuid');

// Import Auth Layer v2 routes
const authRoutes = require('./routes/auth-v2');
const projectRoutes = require('./routes/projects-v2');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'https://ispora.app',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  }
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  });
});

// Mount Auth Layer v2 routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Server error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Database initialization
const initializeDatabase = async () => {
  try {
    console.log('🔧 Auth v2 - Initializing database...');
    
    // Test database connection
    await db.raw('SELECT 1');
    console.log('✅ Auth v2 - Database connection established');
    
    // Create essential tables if they don't exist
    const tables = ['users', 'projects'];
    
    for (const table of tables) {
      try {
        await db.schema.hasTable(table).then(async (exists) => {
          if (!exists) {
            console.log(`📋 Auth v2 - Creating table: ${table}`);
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
              
              if (table === 'projects') {
                t.string('title').notNullable();
                t.text('description');
                t.string('type').defaultTo('academic');
                t.string('category');
                t.string('status').defaultTo('active');
                t.text('tags');
                t.text('objectives');
                t.text('team_members');
                t.text('diaspora_positions');
                t.string('priority').defaultTo('medium');
                t.string('university');
                t.boolean('mentorship_connection').defaultTo(false);
                t.boolean('is_public').defaultTo(true);
                t.uuid('created_by').notNullable();
                t.foreign('created_by').references('id').inTable('users');
              }
            });
          }
        });
      } catch (error) {
        console.log(`⚠️ Auth v2 - Table ${table} already exists or error:`, error.message);
      }
    }
    
    // Create demo user if it doesn't exist
    const demoUser = await db('users').where({ email: 'demo@ispora.com' }).first();
    if (!demoUser) {
      console.log('🔧 Auth v2 - Creating demo user...');
      const bcrypt = require('bcryptjs');
      
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
      console.log('✅ Auth v2 - Demo user created successfully');
      console.log('📧 Email: demo@ispora.com');
      console.log('🔑 Password: demo123');
    } else {
      console.log('✅ Auth v2 - Demo user already exists');
    }
    
    console.log('✅ Auth v2 - Database initialization complete');
  } catch (error) {
    console.error('❌ Auth v2 - Database initialization failed:', error);
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
      console.log(`🚀 Auth v2 - Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 Auth routes: http://localhost:${PORT}/api/auth`);
      console.log(`🔗 Project routes: http://localhost:${PORT}/api/projects`);
    });
  } catch (error) {
    console.error('❌ Auth v2 - Failed to start server:', error);
    process.exit(1);
  }
};

const httpServer = http.createServer(app);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 Auth v2 - SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    console.log('✅ Auth v2 - Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🔄 Auth v2 - SIGINT received, shutting down gracefully');
  httpServer.close(() => {
    console.log('✅ Auth v2 - Process terminated');
    process.exit(0);
  });
});

startServer();
