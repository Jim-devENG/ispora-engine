require('dotenv').config();
const http = require('http');
const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger');

// Initialize Sentry (optional)
let Sentry;
try {
  if (process.env.SENTRY_DSN) {
    Sentry = require('@sentry/node');
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0
    });
    logger.info('Sentry initialized successfully');
  } else {
    logger.warn('SENTRY_DSN not provided, skipping Sentry initialization');
  }
} catch (error) {
  logger.error({ error: error.message }, 'Failed to initialize Sentry');
}

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

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

// Start server
server.listen(PORT, () => {
  logger.info({
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version
  }, 'Server started successfully');
  
  logger.info(`Health check available at: http://localhost:${PORT}/api/health`);
});

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
