const knex = require('knex');
const config = require('./src/knexfile');

const db = knex(config.development);

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test connection
    await db.raw('SELECT 1');
    console.log('✅ Database connection successful');
    
    // Check tables
    const usersExists = await db.schema.hasTable('users');
    const projectsExists = await db.schema.hasTable('projects');
    const feedExists = await db.schema.hasTable('feed_entries');
    const sessionsExists = await db.schema.hasTable('sessions');
    
    console.log('Tables status:');
    console.log('- users:', usersExists ? '✅' : '❌');
    console.log('- projects:', projectsExists ? '✅' : '❌');
    console.log('- feed_entries:', feedExists ? '✅' : '❌');
    console.log('- sessions:', sessionsExists ? '✅' : '❌');
    
    // Test queries
    if (usersExists) {
      const userCount = await db('users').count('* as count');
      console.log('Users count:', userCount[0].count);
      
      const demoUser = await db('users').where('email', 'demo@ispora.app').first();
      console.log('Demo user found:', demoUser ? '✅' : '❌');
    }
    
    if (projectsExists) {
      const projectCount = await db('projects').count('* as count');
      console.log('Projects count:', projectCount[0].count);
    }
    
    if (feedExists) {
      const feedCount = await db('feed_entries').count('* as count');
      console.log('Feed entries count:', feedCount[0].count);
    }
    
    console.log('✅ Database test completed successfully');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  } finally {
    await db.destroy();
  }
}

testDatabase();
