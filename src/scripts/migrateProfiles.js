/**
 * Phase 3 Migration Script
 * Creates Profile documents for existing users
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/database');
const User = require('../models/User');
const Profile = require('../models/Profile');
const logger = require('../utils/logger');

const runMigration = async () => {
  await connectDB();
  logger.info('Starting Phase 3 migration: Creating profiles for existing users...');

  try {
    // Get all users
    const users = await User.find({}).select('_id name email firstName lastName username avatar').lean();
    logger.info(`Found ${users.length} users to migrate`);

    let createdCount = 0;
    let existingCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        // Check if profile already exists
        const existingProfile = await Profile.findOne({ userId: user._id });
        
        if (existingProfile) {
          existingCount++;
          logger.debug(`Profile already exists for user: ${user.email || user._id.toString()}`);
          continue;
        }

        // Create profile from user data
        const profileData = {
          userId: user._id,
          displayName: user.name || user.firstName || user.email || 'User',
          bio: '',
          title: '',
          location: '',
          skills: [],
          socials: {
            twitter: '',
            linkedin: '',
            website: ''
          },
          avatarUrl: user.avatar || '',
          coverUrl: '',
          visibility: 'public',
          completed: false
        };

        await Profile.create(profileData);
        createdCount++;
        logger.info(`✅ Created profile for user: ${user.email || user._id.toString()}`);
      } catch (error) {
        errorCount++;
        logger.error({ 
          error: error.message, 
          userId: user._id.toString(),
          email: user.email 
        }, 'Failed to create profile for user');
      }
    }

    logger.info('Phase 3 migration completed successfully.');
    logger.info(`Summary: ${createdCount} created, ${existingCount} already existed, ${errorCount} errors`);
  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, 'Phase 3 migration failed');
    process.exit(1);
  } finally {
    await disconnectDB();
  }
};

if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('✅ Phase 3 migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Phase 3 migration failed:', error);
      process.exit(1);
    });
}

module.exports = { runMigration };

