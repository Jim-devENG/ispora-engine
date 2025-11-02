/**
 * 🧪 Pre-Deployment Test Suite
 * Tests critical functionality before deploying to production
 */

require('dotenv').config();
const knex = require('knex');
const config = require('./src/knexfile');
const logger = require('./src/utils/logger');

// Determine which config to use
const dbConfig = process.env.NODE_ENV === 'production' 
  ? (config.production || config.development)
  : config.development;

console.log('🧪 Pre-Deployment Test Suite');
console.log('='.repeat(60));
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Database Client: ${dbConfig.client}`);
console.log(`Database: ${dbConfig.client === 'sqlite3' ? dbConfig.connection.filename : (dbConfig.connection.database || 'PostgreSQL')}`);
console.log('='.repeat(60));

const db = knex(dbConfig);

// Test results
const testResults = {
  databaseConnection: false,
  tablesExist: false,
  migrationsRun: false,
  canCreateUser: false,
  canCreateProject: false,
  canCreateFeedEntry: false,
  canQueryFeed: false,
  canQueryProjects: false
};

let testUserId = null;
let testProjectId = null;
let testFeedEntryId = null;

async function runTests() {
  try {
    // Test 1: Database Connection
    console.log('\n📡 Test 1: Database Connection');
    try {
      await db.raw('SELECT 1');
      testResults.databaseConnection = true;
      console.log('   ✅ Database connection successful');
    } catch (error) {
      console.log('   ❌ Database connection failed:', error.message);
      throw new Error('Database connection test failed');
    }

    // Test 2: Tables Exist
    console.log('\n📋 Test 2: Tables Exist');
    const tables = ['users', 'projects', 'feed_entries', 'sessions'];
    let allTablesExist = true;
    
    for (const tableName of tables) {
      try {
        if (dbConfig.client === 'sqlite3') {
          const result = await db.raw(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`, [tableName]);
          if (result.length === 0) {
            allTablesExist = false;
            console.log(`   ❌ Table '${tableName}' does not exist`);
          } else {
            console.log(`   ✅ Table '${tableName}' exists`);
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
            allTablesExist = false;
            console.log(`   ❌ Table '${tableName}' does not exist`);
          } else {
            console.log(`   ✅ Table '${tableName}' exists`);
          }
        }
      } catch (error) {
        allTablesExist = false;
        console.log(`   ❌ Error checking table '${tableName}':`, error.message);
      }
    }
    
    testResults.tablesExist = allTablesExist;
    if (!allTablesExist) {
      throw new Error('Some tables are missing. Run migrations: npm run migrate');
    }

    // Test 3: Migrations Run
    console.log('\n🔄 Test 3: Migrations Status');
    try {
      const migrations = await db('knex_migrations').select('name').orderBy('migration_time', 'desc');
      if (migrations.length >= 4) {
        testResults.migrationsRun = true;
        console.log(`   ✅ Migrations table exists (${migrations.length} migrations run)`);
      } else {
        console.log(`   ⚠️  Only ${migrations.length} migrations found (expected at least 4)`);
      }
    } catch (error) {
      console.log('   ❌ Migrations table does not exist or error:', error.message);
      throw new Error('Migrations check failed');
    }

    // Test 4: Create Test User
    console.log('\n👤 Test 4: Create Test User');
    try {
      const bcrypt = require('bcrypt');
      const { v4: uuidv4 } = require('uuid');
      const testEmail = `test-deploy-${Date.now()}@ispora.test`;
      const testPassword = 'TestPassword123!';
      
      // Check if test user exists (cleanup)
      await db('users').where('email', 'like', 'test-deploy-%@ispora.test').del();
      
      const userId = uuidv4();
      const passwordHash = await bcrypt.hash(testPassword, 12);
      
      await db('users').insert({
        id: userId,
        email: testEmail,
        password_hash: passwordHash,
        first_name: 'Test',
        last_name: 'User',
        user_type: 'student',
        username: `test${Date.now()}`,
        is_verified: true,
        email_verified: true,
        profile_completed: false,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      });
      
      // Verify user was created
      const createdUser = await db('users').where('id', userId).first();
      if (createdUser) {
        testResults.canCreateUser = true;
        testUserId = userId;
        console.log(`   ✅ Test user created: ${testEmail}`);
      } else {
        console.log('   ❌ Test user was not found after creation');
      }
    } catch (error) {
      console.log('   ❌ Failed to create test user:', error.message);
    }

    // Test 5: Create Test Project
    console.log('\n📝 Test 5: Create Test Project');
    if (!testUserId) {
      console.log('   ⚠️  Skipping - no test user available');
    } else {
      try {
        const { v4: uuidv4 } = require('uuid');
        const projectId = uuidv4();
        const projectTitle = `Test Project ${Date.now()}`;
        
        await db('projects').insert({
          id: projectId,
          title: projectTitle,
          description: 'Test project for deployment verification',
          type: 'academic',
          category: 'test',
          status: 'active',
          tags: JSON.stringify(['test', 'deployment']),
          objectives: 'Test objectives',
          team_members: JSON.stringify([]),
          diaspora_positions: JSON.stringify([]),
          priority: 'medium',
          university: 'Test University',
          mentorship_connection: false,
          is_public: true,
          created_by: testUserId,
          created_at: new Date(),
          updated_at: new Date(),
          likes: 0,
          comments: 0,
          shares: 0
        });
        
        // Verify project was created
        const createdProject = await db('projects').where('id', projectId).first();
        if (createdProject) {
          testResults.canCreateProject = true;
          testProjectId = projectId;
          console.log(`   ✅ Test project created: ${projectTitle}`);
        } else {
          console.log('   ❌ Test project was not found after creation');
        }
      } catch (error) {
        console.log('   ❌ Failed to create test project:', error.message);
        console.log('   Error details:', error.code, error.constraint);
      }
    }

    // Test 6: Create Test Feed Entry
    console.log('\n📰 Test 6: Create Test Feed Entry');
    if (!testUserId) {
      console.log('   ⚠️  Skipping - no test user available');
    } else {
      try {
        const { v4: uuidv4 } = require('uuid');
        const feedEntryId = uuidv4();
        
        const metadata = JSON.stringify({
          project_id: testProjectId,
          action: 'created',
          priority: 'medium'
        });
        
        await db('feed_entries').insert({
          id: feedEntryId,
          type: 'project',
          title: 'Test Feed Entry',
          description: 'Test feed entry for deployment verification',
          category: 'test',
          metadata: metadata, // Stored as TEXT
          user_id: testUserId,
          project_id: testProjectId,
          is_public: true,
          created_at: new Date(),
          updated_at: new Date(),
          likes: 0,
          comments: 0,
          shares: 0
        });
        
        // Verify feed entry was created
        const createdFeed = await db('feed_entries').where('id', feedEntryId).first();
        if (createdFeed) {
          testResults.canCreateFeedEntry = true;
          testFeedEntryId = feedEntryId;
          console.log(`   ✅ Test feed entry created`);
          
          // Test metadata parsing
          try {
            const parsed = typeof createdFeed.metadata === 'string' 
              ? JSON.parse(createdFeed.metadata) 
              : createdFeed.metadata;
            console.log(`   ✅ Metadata parsed successfully:`, parsed);
          } catch (parseError) {
            console.log(`   ⚠️  Metadata parsing warning:`, parseError.message);
          }
        } else {
          console.log('   ❌ Test feed entry was not found after creation');
        }
      } catch (error) {
        console.log('   ❌ Failed to create test feed entry:', error.message);
        console.log('   Error details:', error.code, error.constraint);
      }
    }

    // Test 7: Query Feed
    console.log('\n📥 Test 7: Query Feed');
    try {
      const feedEntries = await db('feed_entries')
        .where('is_public', true)
        .orderBy('created_at', 'desc')
        .limit(10);
      
      if (feedEntries.length > 0) {
        testResults.canQueryFeed = true;
        console.log(`   ✅ Feed query successful (${feedEntries.length} entries)`);
      } else {
        console.log('   ⚠️  Feed query returned no entries');
      }
    } catch (error) {
      console.log('   ❌ Failed to query feed:', error.message);
    }

    // Test 8: Query Projects
    console.log('\n📥 Test 8: Query Projects');
    try {
      const projects = await db('projects')
        .where('is_public', true)
        .orderBy('created_at', 'desc')
        .limit(10);
      
      if (projects.length > 0) {
        testResults.canQueryProjects = true;
        console.log(`   ✅ Projects query successful (${projects.length} projects)`);
      } else {
        console.log('   ⚠️  Projects query returned no entries');
      }
    } catch (error) {
      console.log('   ❌ Failed to query projects:', error.message);
    }

    // Cleanup Test Data
    console.log('\n🧹 Cleaning up test data...');
    try {
      if (testFeedEntryId) {
        await db('feed_entries').where('id', testFeedEntryId).del();
        console.log('   ✅ Test feed entry deleted');
      }
      if (testProjectId) {
        await db('projects').where('id', testProjectId).del();
        console.log('   ✅ Test project deleted');
      }
      if (testUserId) {
        await db('users').where('id', testUserId).del();
        console.log('   ✅ Test user deleted');
      }
    } catch (error) {
      console.log('   ⚠️  Cleanup warning:', error.message);
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Results Summary:');
    console.log('='.repeat(60));
    
    const totalTests = Object.keys(testResults).length;
    const passedTests = Object.values(testResults).filter(r => r === true).length;
    const failedTests = totalTests - passedTests;
    
    Object.entries(testResults).forEach(([test, passed]) => {
      const status = passed ? '✅ PASSED' : '❌ FAILED';
      console.log(`   ${test.replace(/([A-Z])/g, ' $1').trim()}: ${status}`);
    });
    
    console.log('='.repeat(60));
    console.log(`   Passed: ${passedTests}/${totalTests} tests`);
    
    if (passedTests === totalTests) {
      console.log('\n✅ All tests PASSED! Safe to deploy.');
      process.exit(0);
    } else {
      console.log(`\n❌ ${failedTests} test(s) failed. Do NOT deploy until fixed.`);
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    console.error('   Stack:', error.stack?.split('\n').slice(0, 5).join('\n'));
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

// Run tests
runTests();

