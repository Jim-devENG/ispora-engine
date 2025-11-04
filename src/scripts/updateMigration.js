/**
 * Phase 2.1: Migration Script
 * Creates default NotificationPreference for existing users
 * Creates OpportunityMetrics documents for existing Opportunities
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/database');
const User = require('../models/User');
const Opportunity = require('../models/Opportunity');
const NotificationPreference = require('../models/NotificationPreference');
const OpportunityMetrics = require('../models/OpportunityMetrics');
const logger = require('../utils/logger');

/**
 * Migration: Create default preferences for existing users
 */
const migrateUserPreferences = async () => {
  try {
    console.log('👤 Migrating user notification preferences...');

    const users = await User.find({}).select('_id email');
    let created = 0;
    let skipped = 0;

    for (const user of users) {
      // Check if preference already exists
      const existing = await NotificationPreference.findOne({ userId: user._id });

      if (!existing) {
        // Create default preference
        const preference = new NotificationPreference({
          userId: user._id,
          preferences: {
            categories: {
              project: true,
              task: true,
              opportunity: true,
              system: true
            },
            delivery: {
              realtime: true,
              email: false
            },
            mutedUntil: null
          }
        });

        await preference.save();
        created++;
        console.log(`✅ Created preferences for user: ${user.email || user._id}`);
      } else {
        skipped++;
      }
    }

    console.log(`\n📊 User Preferences Migration Summary:`);
    console.log(`   Created: ${created}`);
    console.log(`   Skipped (already exist): ${skipped}`);
    console.log(`   Total users: ${users.length}`);

    return { created, skipped, total: users.length };
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

/**
 * Migration: Create metrics for existing opportunities
 */
const migrateOpportunityMetrics = async () => {
  try {
    console.log('\n📈 Migrating opportunity metrics...');

    const opportunities = await Opportunity.find({}).select('_id title');
    let created = 0;
    let skipped = 0;

    for (const opportunity of opportunities) {
      // Check if metrics already exist
      const existing = await OpportunityMetrics.findOne({ opportunityId: opportunity._id });

      if (!existing) {
        // Create default metrics
        const metrics = new OpportunityMetrics({
          opportunityId: opportunity._id,
          views: 0,
          applies: 0,
          bookmarks: 0,
          shares: 0,
          lastUpdated: opportunity.createdAt || new Date()
        });

        await metrics.save();
        created++;
        console.log(`✅ Created metrics for opportunity: ${opportunity.title}`);
      } else {
        skipped++;
      }
    }

    console.log(`\n📊 Opportunity Metrics Migration Summary:`);
    console.log(`   Created: ${created}`);
    console.log(`   Skipped (already exist): ${skipped}`);
    console.log(`   Total opportunities: ${opportunities.length}`);

    return { created, skipped, total: opportunities.length };
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

/**
 * Run all migrations
 */
const runMigrations = async () => {
  try {
    console.log('🌱 Starting Phase 2.1 migrations...\n');

    // Connect to MongoDB
    await connectDB();
    console.log('✅ Connected to MongoDB\n');

    // Run migrations
    const userPrefsResult = await migrateUserPreferences();
    const oppMetricsResult = await migrateOpportunityMetrics();

    // Summary
    console.log('\n📊 Migration Summary:');
    console.log(`   User Preferences: ${userPrefsResult.created} created, ${userPrefsResult.skipped} skipped`);
    console.log(`   Opportunity Metrics: ${oppMetricsResult.created} created, ${oppMetricsResult.skipped} skipped`);

    console.log('\n✅ Phase 2.1 migrations completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    // Disconnect from MongoDB
    await disconnectDB();
    console.log('✅ Disconnected from MongoDB');
  }
};

// Run migrations if called directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = {
  runMigrations,
  migrateUserPreferences,
  migrateOpportunityMetrics
};

