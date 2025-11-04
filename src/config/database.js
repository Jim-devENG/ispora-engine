/**
 * MongoDB Connection Configuration
 * Mongoose connection setup for Phase 1 implementation
 * 
 * Production-ready MongoDB configuration with:
 * - Connection pooling for performance
 * - Automatic reconnection on failure
 * - Health check monitoring
 * - Connection state management
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');

// MongoDB connection options - optimized for production
const mongoOptions = {
  maxPoolSize: 10, // Maximum number of connections in the pool
  minPoolSize: 2, // Minimum number of connections to maintain
  serverSelectionTimeoutMS: 10000, // How long to wait for server selection
  socketTimeoutMS: 45000, // How long to wait for socket operations
  connectTimeoutMS: 10000, // How long to wait for initial connection
  retryWrites: true, // Retry write operations on network errors
  retryReads: true, // Retry read operations on network errors
  family: 4 // Use IPv4, skip trying IPv6 (faster connection)
};

// Connection state
let isConnecting = false;
let connectionRetries = 0;
const MAX_RETRIES = 3;

/**
 * Connect to MongoDB with retry logic
 * @param {number} retries - Number of retry attempts (internal use)
 * @returns {Promise<void>}
 */
const connectDB = async (retries = 0) => {
  // Prevent multiple simultaneous connection attempts
  if (isConnecting) {
    logger.debug('MongoDB connection already in progress, waiting...');
    return new Promise((resolve, reject) => {
      const checkConnection = setInterval(() => {
        if (!isConnecting) {
          clearInterval(checkConnection);
          if (mongoose.connection.readyState === 1) {
            resolve();
          } else {
            reject(new Error('Connection attempt completed but not connected'));
          }
        }
      }, 100);
      setTimeout(() => {
        clearInterval(checkConnection);
        reject(new Error('Connection timeout while waiting'));
      }, 30000);
    });
  }

  // If already connected, return immediately
  if (mongoose.connection.readyState === 1) {
    logger.debug('MongoDB already connected');
    return;
  }

  isConnecting = true;

  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGO_URI or MONGODB_URI environment variable is required');
    }

    const uriDisplay = mongoUri.replace(/\/\/.*@/, '//***@'); // Hide credentials in logs
    
    console.log('🔗 Connecting to MongoDB...');
    console.log(`   URI: ${uriDisplay}`);
    console.log(`   Attempt: ${retries + 1}/${MAX_RETRIES + 1}`);
    
    logger.info({ 
      uri: uriDisplay, 
      attempt: retries + 1,
      maxRetries: MAX_RETRIES + 1
    }, 'MongoDB connection attempt');
    
    await mongoose.connect(mongoUri, mongoOptions);
    
    connectionRetries = 0; // Reset retry counter on success
    isConnecting = false;
    
    console.log('✅ MongoDB connected successfully');
    console.log(`   Database: ${mongoose.connection.db.databaseName}`);
    console.log(`   Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
    
    logger.info({ 
      uri: uriDisplay,
      database: mongoose.connection.db.databaseName,
      host: mongoose.connection.host,
      port: mongoose.connection.port
    }, 'MongoDB connected successfully');
    
    // Set up connection event handlers (only once)
    if (!mongoose.connection.listeners('error').length) {
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err.message);
        logger.error({ 
          error: err.message,
          name: err.name,
          code: err.code
        }, 'MongoDB connection error');
        isConnecting = false;
      });
      
      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB disconnected');
        logger.warn({ 
          readyState: mongoose.connection.readyState 
        }, 'MongoDB disconnected');
        isConnecting = false;
      });
      
      mongoose.connection.on('reconnected', () => {
        console.log('✅ MongoDB reconnected');
        logger.info('MongoDB reconnected');
        isConnecting = false;
      });

      mongoose.connection.on('connecting', () => {
        console.log('🔄 MongoDB connecting...');
        logger.info('MongoDB connecting');
      });
    }
    
  } catch (error) {
    isConnecting = false;
    connectionRetries = retries + 1;
    
    // Retry logic
    if (retries < MAX_RETRIES) {
      const waitTime = Math.min(1000 * Math.pow(2, retries), 10000); // Exponential backoff, max 10s
      console.warn(`⚠️ MongoDB connection failed (attempt ${retries + 1}/${MAX_RETRIES + 1}):`, error.message);
      console.log(`   Retrying in ${waitTime / 1000} seconds...`);
      
      logger.warn({ 
        error: error.message,
        attempt: retries + 1,
        maxRetries: MAX_RETRIES + 1,
        waitTime
      }, 'MongoDB connection failed, retrying');
      
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return connectDB(retries + 1); // Retry
    }
    
    // All retries exhausted
    console.error('❌ MongoDB connection failed after all retries:', error.message);
    logger.error({ 
      error: error.message,
      name: error.name,
      code: error.code,
      retries: connectionRetries
    }, 'MongoDB connection failed after all retries');
    
    // Don't exit process - let server.js handle it gracefully
    throw error;
  }
};

/**
 * Disconnect from MongoDB
 * @returns {Promise<void>}
 */
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected');
    logger.info('MongoDB disconnected');
  } catch (error) {
    console.error('❌ MongoDB disconnect error:', error.message);
    logger.error({ error: error.message }, 'MongoDB disconnect error');
  }
};

/**
 * Check if MongoDB is connected
 * @returns {boolean}
 */
const isConnected = () => {
  return mongoose.connection.readyState === 1;
};

/**
 * Get MongoDB connection status
 * @returns {object}
 */
const getConnectionStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  return {
    readyState: mongoose.connection.readyState,
    status: states[mongoose.connection.readyState] || 'unknown',
    isConnected: mongoose.connection.readyState === 1,
    host: mongoose.connection.host || null,
    port: mongoose.connection.port || null,
    database: mongoose.connection.db?.databaseName || null,
    retries: connectionRetries
  };
};

/**
 * Health check for MongoDB connection
 * @returns {Promise<object>}
 */
const healthCheck = async () => {
  try {
    if (!isConnected()) {
      return {
        healthy: false,
        status: 'disconnected',
        message: 'MongoDB is not connected',
        readyState: mongoose.connection.readyState
      };
    }

    // Try a simple operation to verify connection
    await mongoose.connection.db.admin().ping();
    
    return {
      healthy: true,
      status: 'connected',
      message: 'MongoDB connection is healthy',
      database: mongoose.connection.db.databaseName,
      host: mongoose.connection.host,
      port: mongoose.connection.port
    };
  } catch (error) {
    return {
      healthy: false,
      status: 'error',
      message: error.message,
      readyState: mongoose.connection.readyState
    };
  }
};

module.exports = {
  connectDB,
  disconnectDB,
  isConnected,
  getConnectionStatus,
  healthCheck,
  mongoose
};

