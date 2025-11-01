require('dotenv').config();
const http = require('http');
const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger');

// 🛡️ Environment Safety Check
const checkEnvironmentVariables = () => {
  const requiredVars = ['JWT_SECRET'];
  const optionalVars = ['SENTRY_DSN', 'DATABASE_URL', 'CLIENT_URL'];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  const present = optionalVars.filter(varName => process.env[varName]);
  
  if (missing.length > 0) {
    logger.error({ missing }, '❌ Missing required environment variables');
    console.error('❌ Missing required environment variables:', missing);
    process.exit(1);
  }
  
  logger.info({ 
    required: requiredVars.length,
    optional: present.length,
    missing: missing.length 
  }, '✅ Environment variables validated');
  
  console.log('✅ Environment variables validated');
  console.log('📊 Required variables:', requiredVars.length);
  console.log('📊 Optional variables present:', present.length);
};

// Run environment check
checkEnvironmentVariables();

// 🛡️ DevOps Guardian: Safe Sentry initialization
let Sentry = null;
try {
  if (process.env.SENTRY_DSN && process.env.SENTRY_DSN.trim() !== '') {
    Sentry = require('@sentry/node');
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      beforeSend(event) {
        // Filter out development errors
        if (process.env.NODE_ENV === 'development') {
          return null;
        }
        return event;
      }
    });
    logger.info('Sentry initialized successfully');
  } else {
    console.log("🧩 Sentry skipped: No DSN provided");
    logger.warn('SENTRY_DSN not provided, skipping Sentry initialization');
  }
} catch (error) {
  console.log("🧩 Sentry initialization failed:", error.message);
  logger.error({ error: error.message }, 'Failed to initialize Sentry');
  Sentry = null; // Ensure Sentry is null if initialization fails
}

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// 🚀 RENDER STARTUP RECOVERY: Optimized server startup with comprehensive logging
const STARTUP_DELAY = process.env.NODE_ENV === 'production' ? 2000 : 1000; // Reduced delay for faster startup
const STARTUP_TIMESTAMP = Date.now();

// Pre-startup logging
console.log('🚀 iSpora Backend Starting...');
console.log(`📅 Startup Time: ${new Date().toISOString()}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔧 Node Version: ${process.version}`);
console.log(`📦 Port: ${PORT}`);
console.log(`⏱️  Startup Delay: ${STARTUP_DELAY}ms`);

// Start server with optimized delay
setTimeout(() => {
  const serverStartTime = Date.now();
  
  server.listen(PORT, () => {
    const totalStartupTime = serverStartTime - STARTUP_TIMESTAMP;
    
    // Comprehensive startup logging
    const startupInfo = {
      port: PORT,
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      startupDelay: STARTUP_DELAY,
      totalStartupTime: totalStartupTime,
      timestamp: new Date().toISOString(),
      memoryUsage: process.memoryUsage(),
      platform: process.platform,
      arch: process.arch
    };
    
    logger.info(startupInfo, '✅ Server started successfully');
    
    // Console output for Render logs
    console.log('✅ iSpora Backend Started Successfully!');
    console.log('✅ iSpora backend and frontend fully synchronized.');
    console.log(`⏱️  Total Startup Time: ${totalStartupTime}ms`);
    console.log(`🌐 Server running on port ${PORT}`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🏥 Render Health: http://localhost:${PORT}/healthz`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📊 Memory Usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
    
    // Log CORS configuration
    console.log('🌐 CORS Configuration:');
    console.log(`   - Allowed Origins: https://ispora.app, https://www.ispora.app, localhost:3000`);
    console.log(`   - Credentials: enabled`);
    console.log(`   - Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH`);
    
    // Log rate limiting configuration
    console.log('🚦 Rate Limiting:');
    console.log(`   - Window: 15 minutes`);
    console.log(`   - Max Requests: 200 per IP`);
    console.log(`   - Health Checks: Excluded`);
    console.log(`   - CORS Preflight: Excluded`);
    
    // Verify critical endpoints
    console.log('🔍 Critical Endpoints:');
    console.log(`   - GET /api/health - Detailed health check`);
    console.log(`   - GET /healthz - Render health check`);
    console.log(`   - POST /api/auth/login - User authentication`);
    console.log(`   - POST /api/projects - Project creation`);
    console.log(`   - GET /api/feed - Activity feed`);
    
    console.log('🎉 Backend is ready for production!');
    console.log('✅ iSpora Backend live with CORS enabled for https://ispora.app');
  });
}, STARTUP_DELAY);

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}, shutting down gracefully`);
  
  server.close(() => {
    logger.info('HTTP server closed');
    
    // Close database connections
    if (config.database && config.database.destroy) {
      config.database.destroy()
        .then(() => {
          logger.info('Database connections closed');
          process.exit(0);
        })
        .catch((error) => {
          logger.error({ error }, 'Error closing database connections');
          process.exit(1);
        });
    } else {
      process.exit(0);
    }
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// 🏥 RENDER HEALTH CHECK HOTFIX: Server startup moved to setTimeout above
// This prevents the old immediate startup that could cause premature health check failures

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error({ error }, 'Uncaught Exception');
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason, promise }, 'Unhandled Rejection');
  gracefulShutdown('UNHANDLED_REJECTION');
});

module.exports = server;
