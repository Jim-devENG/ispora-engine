const db = require('./src/database/connection');

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test connection
    await db.raw('SELECT 1');
    console.log('✅ Database connection successful');
    
    // Check tables
    const tables = await db.raw("SELECT name FROM sqlite_master WHERE type='table'");
    const tableNames = tables.map(r => r.name);
    
    console.log('Available tables:', tableNames);
    
    // Check if essential tables exist
    const essentialTables = ['users', 'projects', 'project_sessions', 'impact_feed', 'session_attendees'];
    const missingTables = essentialTables.filter(table => !tableNames.includes(table));
    
    if (missingTables.length === 0) {
      console.log('✅ All essential tables exist');
    } else {
      console.log('❌ Missing tables:', missingTables);
    }
    
    // Test a simple query on projects table
    if (tableNames.includes('projects')) {
      const projectCount = await db('projects').count('* as count').first();
      console.log(`📊 Projects table has ${projectCount.count} records`);
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    db.destroy();
  }
}

testDatabase();
