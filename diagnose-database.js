/**
 * 🩺 Database Diagnostic Script
 * This script checks:
 * 1. Database connection
 * 2. Table existence
 * 3. Data in tables
 * 4. Migration status
 */

require('dotenv').config();
const knex = require('knex');
const config = require('./src/knexfile');

// Determine which config to use
const dbConfig = process.env.NODE_ENV === 'production' 
  ? (config.production || config.development)
  : config.development;

console.log('🔍 Database Diagnostic Tool');
console.log('='.repeat(60));
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Database Client: ${dbConfig.client}`);
console.log(`Database Connection: ${dbConfig.client === 'sqlite3' ? dbConfig.connection.filename : (dbConfig.connection.database || 'PostgreSQL')}`);
console.log('='.repeat(60));

const db = knex(dbConfig);

async function diagnoseDatabase() {
  try {
    // 1. Test database connection
    console.log('\n📡 Testing database connection...');
    await db.raw('SELECT 1');
    console.log('✅ Database connection successful');

    // 2. Check if tables exist
    console.log('\n📋 Checking table existence...');
    const tables = ['users', 'projects', 'feed_entries', 'sessions'];
    
    for (const tableName of tables) {
      try {
        if (dbConfig.client === 'sqlite3') {
          // SQLite way to check if table exists
          const result = await db.raw(`
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name=?
          `, [tableName]);
          const exists = result.length > 0;
          console.log(`   ${exists ? '✅' : '❌'} Table '${tableName}': ${exists ? 'EXISTS' : 'MISSING'}`);
        } else {
          // PostgreSQL way
          const result = await db.raw(`
            SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name = ?
            );
          `, [tableName]);
          const exists = result.rows[0]?.exists || false;
          console.log(`   ${exists ? '✅' : '❌'} Table '${tableName}': ${exists ? 'EXISTS' : 'MISSING'}`);
        }
      } catch (error) {
        console.log(`   ❌ Error checking table '${tableName}':`, error.message);
      }
    }

    // 3. Check data in each table
    console.log('\n📊 Checking data in tables...');
    
    for (const tableName of tables) {
      try {
        const count = await db(tableName).count('* as count').first();
        const countNum = dbConfig.client === 'sqlite3' 
          ? count.count 
          : parseInt(count.count);
        console.log(`   📦 Table '${tableName}': ${countNum} records`);
        
        // If there are records, show a sample
        if (countNum > 0 && countNum <= 10) {
          const sample = await db(tableName).select('*').limit(3);
          console.log(`      Sample:`, JSON.stringify(sample, null, 2).substring(0, 200));
        }
      } catch (error) {
        if (error.message.includes('does not exist') || error.message.includes('no such table')) {
          console.log(`   ⚠️  Table '${tableName}': DOES NOT EXIST`);
        } else {
          console.log(`   ❌ Error querying '${tableName}':`, error.message);
        }
      }
    }

    // 4. Check migration status
    console.log('\n🔄 Checking migration status...');
    try {
      const migrations = await db('knex_migrations').select('*').orderBy('migration_time', 'desc').limit(5);
      console.log(`   ✅ Migrations table exists`);
      console.log(`   📦 Total migrations run: ${migrations.length}`);
      if (migrations.length > 0) {
        console.log('   Recent migrations:');
        migrations.forEach(m => {
          console.log(`      - ${m.name} (${new Date(m.migration_time).toISOString()})`);
        });
      }
    } catch (error) {
      if (error.message.includes('does not exist') || error.message.includes('no such table')) {
        console.log('   ❌ Migrations table does not exist - migrations may not have been run');
      } else {
        console.log(`   ❌ Error checking migrations:`, error.message);
      }
    }

    // 5. Check for recent projects
    console.log('\n🎯 Checking for recent projects...');
    try {
      const recentProjects = await db('projects')
        .select('id', 'title', 'created_at', 'created_by')
        .orderBy('created_at', 'desc')
        .limit(5);
      
      if (recentProjects.length > 0) {
        console.log(`   ✅ Found ${recentProjects.length} recent projects:`);
        recentProjects.forEach(p => {
          console.log(`      - ${p.title} (${p.id}) - Created: ${p.created_at}`);
        });
      } else {
        console.log('   ⚠️  No projects found in database');
      }
    } catch (error) {
      console.log(`   ❌ Error checking projects:`, error.message);
    }

    // 6. Check for recent feed entries
    console.log('\n📰 Checking for recent feed entries...');
    try {
      const recentFeed = await db('feed_entries')
        .select('id', 'type', 'title', 'created_at', 'user_id')
        .orderBy('created_at', 'desc')
        .limit(5);
      
      if (recentFeed.length > 0) {
        console.log(`   ✅ Found ${recentFeed.length} recent feed entries:`);
        recentFeed.forEach(f => {
          console.log(`      - ${f.title} (${f.type}) - Created: ${f.created_at}`);
        });
      } else {
        console.log('   ⚠️  No feed entries found in database');
      }
    } catch (error) {
      console.log(`   ❌ Error checking feed entries:`, error.message);
    }

    // 7. Check for users
    console.log('\n👥 Checking for users...');
    try {
      const users = await db('users')
        .select('id', 'email', 'first_name', 'last_name', 'created_at')
        .orderBy('created_at', 'desc')
        .limit(5);
      
      if (users.length > 0) {
        console.log(`   ✅ Found ${users.length} users:`);
        users.forEach(u => {
          console.log(`      - ${u.email} (${u.first_name} ${u.last_name}) - Created: ${u.created_at}`);
        });
      } else {
        console.log('   ⚠️  No users found in database');
      }
    } catch (error) {
      console.log(`   ❌ Error checking users:`, error.message);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Diagnosis complete');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Database diagnostic failed:');
    console.error('   Error:', error.message);
    console.error('   Stack:', error.stack?.split('\n').slice(0, 5).join('\n'));
  } finally {
    await db.destroy();
  }
}

diagnoseDatabase();

