const knex = require('knex');
const config = require('./src/knexfile');

console.log('Testing database connection...');

const db = knex(config.development);

async function testConnection() {
  try {
    // Test connection
    await db.raw('SELECT 1');
    console.log('✅ Database connection successful');
    
    // Check if tables exist
    const tables = await db.schema.hasTable('users');
    console.log('Users table exists:', tables);
    
    // Run migrations if needed
    if (!tables) {
      console.log('Running migrations...');
      await db.migrate.latest();
      console.log('✅ Migrations completed');
    }
    
    // Test a simple query
    const result = await db.raw('SELECT 1 as test');
    console.log('✅ Test query successful:', result);
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  } finally {
    await db.destroy();
  }
}

testConnection();
