const db = require('./src/database/connection');

async function checkDatabase() {
  try {
    console.log('Checking database tables...');
    
    // Get all tables
    const tables = await db.raw("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('Tables found:', tables.map(r => r.name));
    
    // Check if key tables exist
    const keyTables = ['users', 'projects', 'opportunities', 'project_sessions', 'impact_feed'];
    
    for (const table of keyTables) {
      try {
        const count = await db(table).count('* as count').first();
        console.log(`${table}: ${count.count} records`);
      } catch (error) {
        console.log(`${table}: ERROR - ${error.message}`);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Database check failed:', error);
    process.exit(1);
  }
}

checkDatabase();
