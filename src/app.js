const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
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

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for API
  crossOriginEmbedderPolicy: false
}));

// 🌐 PRODUCTION CORS CONFIGURATION: Strictly allow only https://ispora.app and http://localhost:5173
// NO WILDCARDS - NO UNSAFE DEFAULTS
const allowedOrigins = [
  'https://ispora.app',
  'http://localhost:5173'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Log all CORS requests for debugging
    console.log(`[CORS] Request from origin: ${origin || 'no-origin'}`);
    
    // Reject requests with no origin (security)
    if (!origin) {
      console.warn(`[CORS] ❌ Blocked: No origin provided`);
      return callback(new Error('CORS: Origin required'));
    }
    
    // Strictly check against allowed origins only
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

app.use(cors(corsOptions));

// 🚦 RENDER RATE LIMIT RECOVERY: Optimized rate limiting for production stability
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Increased limit for production stability
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(15 * 60) // 15 minutes in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  // 🏥 Comprehensive exclusions for health checks and Render
  skip: (req) => {
    const path = req.path;
    const userAgent = req.headers['user-agent'] || '';
    const renderHealthCheck = req.headers['x-render-health-check'];
    
    // Skip rate limiting for health check routes
    const healthPaths = [
      '/api/health',
      '/api/health/',
      '/api/health/healthz',
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
  // Add connection pooling and keep-alive support
  keyGenerator: (req) => {
    // Use IP + User-Agent for better rate limiting
    return `${req.ip}-${req.headers['user-agent'] || 'unknown'}`;
  }
});

app.use('/api/', limiter);

// 🔗 RENDER CONNECTION RECOVERY: Connection pooling and keep-alive optimization
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

// Body parsing middleware with optimized limits
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    // Log large payloads for monitoring
    if (buf.length > 1024 * 1024) { // 1MB
      console.warn(`🚨 Large payload detected: ${buf.length} bytes from ${req.ip}`);
    }
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb',
  parameterLimit: 1000 // Prevent DoS via too many parameters
}));

// Enhanced request logging with observability
app.use(requestLogger);

// Health check caching (before health routes)
app.use('/api/health', healthCache);

// 🏥 RENDER HEALTH CHECK HOTFIX: Mount health routes
// Mount at /api/health for detailed health checks
app.use('/api/health', healthRoutes);

// Mount healthz at root level for Render health checks
app.use('/healthz', healthRoutes);

// 🌐 PRODUCTION CORS: Global OPTIONS handler for preflight requests
app.options('*', cors(corsOptions));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/placeholder', placeholderRoutes);
app.use('/api/logs', logsRoutes);

// 🚨 PRODUCTION 404 HANDLER: CORS-compliant error responses
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;
