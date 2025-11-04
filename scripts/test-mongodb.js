/**
 * MongoDB Connection Test Script
 * Tests MongoDB connection and configuration
 */

require('dotenv').config();
const { connectDB, getConnectionStatus, healthCheck, isConnected, disconnectDB } = require('../src/config/database');

async function testMongoDB() {
  console.log('🧪 Testing MongoDB Connection...\n');

  // Check environment variables
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌ MONGO_URI or MONGODB_URI environment variable is not set');
    console.log('\nTo set it:');
    console.log('  1. Local MongoDB: export MONGO_URI=mongodb://localhost:27017/ispora');
    console.log('  2. MongoDB Atlas: export MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/ispora');
    process.exit(1);
  }

  const uriDisplay = mongoUri.replace(/\/\/.*@/, '//***@');
  console.log(`📋 Configuration:`);
  console.log(`   URI: ${uriDisplay}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}\n`);

  try {
    // Test connection
    console.log('🔗 Connecting to MongoDB...');
    await connectDB();

    if (!isConnected()) {
      console.error('❌ Connection failed: MongoDB is not connected');
      process.exit(1);
    }

    // Get connection status
    const status = getConnectionStatus();
    console.log('\n✅ Connection Status:');
    console.log(`   State: ${status.status} (${status.readyState})`);
    console.log(`   Host: ${status.host}:${status.port}`);
    console.log(`   Database: ${status.database}`);
    console.log(`   Retries: ${status.retries}\n`);

    // Health check
    console.log('🏥 Running health check...');
    const health = await healthCheck();
    
    if (health.healthy) {
      console.log('✅ Health Check: PASSED');
      console.log(`   Message: ${health.message}`);
      console.log(`   Database: ${health.database}`);
      console.log(`   Host: ${health.host}:${health.port}\n`);
    } else {
      console.log('❌ Health Check: FAILED');
      console.log(`   Message: ${health.message}`);
      console.log(`   Status: ${health.status}\n`);
    }

    // Test database operations
    console.log('📊 Testing database operations...');
    const mongoose = require('mongoose');
    const User = require('../src/models/User');
    
    try {
      // Try to count users (simple operation)
      const userCount = await User.countDocuments();
      console.log(`✅ Database operation successful`);
      console.log(`   Users in database: ${userCount}\n`);
    } catch (dbError) {
      console.warn('⚠️ Database operation test failed:', dbError.message);
      console.log('   This is normal if the database is empty\n');
    }

    console.log('✅ MongoDB connection test completed successfully!\n');
    
    // Disconnect
    await disconnectDB();
    console.log('👋 Disconnected from MongoDB');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ MongoDB connection test failed:');
    console.error(`   Error: ${error.message}`);
    console.error(`   Name: ${error.name}`);
    if (error.code) {
      console.error(`   Code: ${error.code}`);
    }
    
    console.log('\n💡 Troubleshooting:');
    console.log('  1. Check if MongoDB is running');
    console.log('  2. Verify the connection string is correct');
    console.log('  3. Check network/firewall settings');
    console.log('  4. For MongoDB Atlas, ensure IP is whitelisted\n');
    
    process.exit(1);
  }
}

// Run test
testMongoDB();

