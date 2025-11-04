/**
 * Test Helper
 * Common utilities for Phase 3 tests
 */

const mongoose = require('mongoose');

/**
 * Helper function to check if MongoDB is available and skip test if not
 */
const skipIfNoMongoDB = () => {
  if (process.env.SKIP_TESTS === 'true' || mongoose.connection.readyState === 0) {
    return true; // Skip test
  }
  return false;
};

/**
 * Helper function to setup MongoDB connection with proper error handling
 */
const setupMongoDB = async (MONGO_TEST_URI) => {
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(MONGO_TEST_URI, {
        serverSelectionTimeoutMS: 5000
      });
    } catch (error) {
      console.warn('⚠️ MongoDB not available for tests. Skipping tests.');
      console.warn('   Set MONGO_TEST_URI environment variable or start MongoDB locally.');
      process.env.SKIP_TESTS = 'true';
      throw error;
    }
  }
};

/**
 * Helper function to cleanup MongoDB connection
 */
const cleanupMongoDB = async (...models) => {
  if (process.env.SKIP_TESTS === 'true') {
    return; // Skip cleanup if tests were skipped
  }
  try {
    if (mongoose.connection.readyState !== 0) {
      // Delete all test data
      for (const Model of models) {
        if (Model && typeof Model.deleteMany === 'function') {
          await Model.deleteMany({});
        }
      }
      await mongoose.connection.close();
    }
  } catch (error) {
    // Silently ignore cleanup errors if connection is already closed
    if (mongoose.connection.readyState !== 0) {
      console.error('Error cleaning up test database:', error.message);
    }
  }
};

module.exports = {
  skipIfNoMongoDB,
  setupMongoDB,
  cleanupMongoDB
};

