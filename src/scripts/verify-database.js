/**
 * 🛡️ Database Verification Script
 * Runs on server startup to verify database is set up correctly
 */

require('dotenv').config();
const knex = require('knex');
const config = require('../knexfile');
const logger = require('../utils/logger');

const dbConfig = process.env.NODE_ENV === 'production' 
  ? (config.production || config.development)
  : config.development;

const db = knex(dbConfig);

async function verifyDatabase() {
  console.log('🔍 Verifying database setup...');
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Database: ${dbConfig.client}`);
  
  try {
    // 1. Test connection
    await db.raw('SELECT 1');
    console.log('✅ Database connection successful');
    
    // 2. Check if critical tables exist
    const tables = ['users', 'projects', 'feed_entries'];
    const missingTables = [];
    
    for (const tableName of tables) {
      try {
        if (dbConfig.client === 'sqlite3') {
          const result = await db.raw(`
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name=?
          `, [tableName]);
          if (result.length === 0) {
            missingTables.push(tableName);
          } else {
            console.log(`✅ Table '${tableName}' exists`);
          }
        } else {
          const result = await db.raw(`
            SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name = ?
            );
          `, [tableName]);
          if (!result.rows[0]?.exists) {
            missingTables.push(tableName);
          } else {
            console.log(`✅ Table '${tableName}' exists`);
          }
        }
      } catch (error) {
        missingTables.push(tableName);
        console.error(`❌ Error checking table '${tableName}':`, error.message);
      }
    }
    
    if (missingTables.length > 0) {
      console.error('❌ Missing critical tables:', missingTables.join(', '));
      console.error('⚠️  Migrations may not have run. Run: npm run migrate');
      logger.error({ missingTables }, 'Missing database tables');
      await db.destroy();
      process.exit(1);
    }
    
    // 3. Check migration status
    try {
      const migrations = await db('knex_migrations').select('name').orderBy('migration_time', 'desc');
      console.log(`✅ Migrations table exists (${migrations.length} migrations run)`);
    } catch (error) {
      console.error('❌ Migrations table does not exist');
      console.error('⚠️  Run migrations: npm run migrate');
      logger.error({ error: error.message }, 'Migrations table missing');
      await db.destroy();
      process.exit(1);
    }
    
    console.log('✅ Database verification complete');
    logger.info('Database verification successful');
    
  } catch (error) {
    console.error('❌ Database verification failed:', error.message);
    logger.error({ error: error.message }, 'Database verification failed');
    await db.destroy();
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

// Run verification
verifyDatabase();

