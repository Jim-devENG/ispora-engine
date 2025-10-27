const knex = require('knex');
const config = require('./src/knexfile');

const db = knex(config.development);

async function checkTables() {
  try {
    // Check if tables exist
    const usersExists = await db.schema.hasTable('users');
    const projectsExists = await db.schema.hasTable('projects');
    const feedExists = await db.schema.hasTable('feed_entries');
    const sessionsExists = await db.schema.hasTable('sessions');
    
    console.log('Tables status:');
    console.log('- users:', usersExists ? '✅' : '❌');
    console.log('- projects:', projectsExists ? '✅' : '❌');
    console.log('- feed_entries:', feedExists ? '✅' : '❌');
    console.log('- sessions:', sessionsExists ? '✅' : '❌');
    
    if (usersExists) {
      const userCount = await db('users').count('* as count');
      console.log('Users count:', userCount[0].count);
    }
    
  } catch (error) {
    console.error('Error checking tables:', error.message);
  } finally {
    await db.destroy();
  }
}

checkTables();
