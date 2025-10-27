const knex = require('knex');
const config = require('./src/knexfile');

const db = knex(config.development);

async function runMigration() {
  try {
    console.log('Running migrations...');
    await db.migrate.latest();
    console.log('✅ Migrations completed');
    
    // Check tables again
    const usersExists = await db.schema.hasTable('users');
    console.log('Users table created:', usersExists ? '✅' : '❌');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await db.destroy();
  }
}

runMigration();
