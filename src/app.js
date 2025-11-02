/**
 * 🛡️ iSpora Backend - Main Express Application
 * Production-grade Express.js server with proper middleware ordering and error handling
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan'); // HTTP request logger for development
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');
const healthCache = require('./middleware/healthCache');

// Import routes
const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const feedRoutes = require('./routes/feed');
const taskRoutes = require('./routes/tasks');
const placeholderRoutes = require('./routes/placeholder');
const logsRoutes = require('./routes/logs');
const sessionsRoutes = require('./routes/sessions'); // New sessions route

const app = express();

// ============================================================================
// SECURITY MIDDLEWARE - Must be first
// ============================================================================

// Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable for API
  crossOriginEmbedderPolicy: false
}));

// ============================================================================
// CORS CONFIGURATION - Allow no-origin requests for Render health checks
// ============================================================================

const allowedOrigins = [
  'https://ispora.app',
  'https://www.ispora.app',
  'http://localhost:5173'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (Render health checks, server-to-server calls)
    if (!origin) {
      console.log('[CORS] ✅ Allowed: No origin (Render health check or server-to-server)');
      return callback(null, true);
    }
    
    // Strictly check against allowed origins
    if (allowedOrigins.includes(origin)) {
      console.log(`[CORS] ✅ Allowed: ${origin}`);
      return callback(null, true);
    } else {
      // Explicitly reject unknown origins
      console.error(`[CORS] ❌ Blocked: ${origin} not in allowed list`);
      console.error(`[CORS] Allowed origins: ${allowedOrigins.join(', ')}`);
      return callback(new Error(`CORS: Origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
    'x-render-health-check'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  optionsSuccessStatus: 200,
  preflightContinue: false,
  maxAge: 86400 // Cache preflight requests for 24 hours
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Global OPTIONS handler for preflight requests
app.options('*', cors(corsOptions));

// ============================================================================
// REQUEST LOGGING - Development only
// ============================================================================

// Morgan for HTTP request logging (development only)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Custom request logger (always enabled)
app.use(requestLogger);

// ============================================================================
// RATE LIMITING - Protect API from abuse
// ============================================================================

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Maximum 200 requests per window
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(15 * 60) // 15 minutes in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for health checks and Render monitoring
  skip: (req) => {
    const path = req.path;
    const userAgent = req.headers['user-agent'] || '';
    const renderHealthCheck = req.headers['x-render-health-check'];
    
    // Skip for health check routes
    const healthPaths = [
      '/api/health',
      '/api/health/',
      '/healthz',
      '/health'
    ];
    
    if (healthPaths.includes(path)) {
      return true;
    }
    
    // Skip for Render health check headers and user agents
    if (renderHealthCheck === 'true' || 
        userAgent.includes('Render') || 
        userAgent.includes('health-check') ||
        userAgent.includes('uptime') ||
        userAgent.includes('monitoring')) {
      return true;
    }
    
    // Skip for OPTIONS requests (CORS preflight)
    if (req.method === 'OPTIONS') {
      return true;
    }
    
    return false;
  },
  keyGenerator: (req) => {
    return `${req.ip}-${req.headers['user-agent'] || 'unknown'}`;
  }
});

app.use('/api/', limiter);

// ============================================================================
// BODY PARSING - Must be before routes
// ============================================================================

// JSON body parser
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    // Log large payloads for monitoring
    if (buf.length > 1024 * 1024) { // 1MB
      console.warn(`🚨 Large payload detected: ${buf.length} bytes from ${req.ip}`);
    }
  }
}));

// URL-encoded body parser
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb',
  parameterLimit: 1000 // Prevent DoS via too many parameters
}));

// ============================================================================
// CONNECTION OPTIMIZATION
// ============================================================================

app.use((req, res, next) => {
  // Enable keep-alive for better connection reuse
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Keep-Alive', 'timeout=5, max=1000');
  
  // Add cache headers for static responses
  if (req.path.includes('/health') || req.path.includes('/healthz')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  next();
});

// ============================================================================
// HEALTH CHECK ROUTES - Must be early for Render monitoring
// ============================================================================

// Health check caching (before health routes)
app.use('/api/health', healthCache);

// Mount health routes
app.use('/api/health', healthRoutes);
app.use('/healthz', healthRoutes);

// ============================================================================
// API ROUTES
// ============================================================================

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/placeholder', placeholderRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/sessions', sessionsRoutes); // Sessions route

// ============================================================================
// 404 HANDLER - Must be before error handler
// ============================================================================

app.use('*', (req, res) => {
  // Add CORS headers to 404 responses
  const origin = req.headers.origin;
  if (!origin || allowedOrigins.includes(origin)) {
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
  }
  
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// ERROR HANDLER - Must be last
// ============================================================================

app.use(errorHandler);

module.exports = app;
