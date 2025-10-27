const db = require('./src/database/connection');

async function setupTables() {
  try {
    console.log('Setting up database tables...');
    
    // Check if tables exist
    const tables = await db.raw("SELECT name FROM sqlite_master WHERE type='table'");
    const existingTables = tables.map(r => r.name);
    
    console.log('Existing tables:', existingTables);
    
    // Create project_sessions table if it doesn't exist
    if (!existingTables.includes('project_sessions')) {
      console.log('Creating project_sessions table...');
      await db.schema.createTable('project_sessions', function(table) {
        table.uuid('id').primary();
        table.uuid('project_id').notNullable().references('id').inTable('projects').onDelete('CASCADE');
        table.uuid('created_by').notNullable().references('id').inTable('users').onDelete('CASCADE');
        table.string('title', 200).notNullable();
        table.text('description').nullable();
        table.timestamp('scheduled_date').notNullable();
        table.integer('duration_minutes').defaultTo(60);
        table.string('type', 50).defaultTo('meeting');
        table.boolean('is_public').defaultTo(false);
        table.string('meeting_link', 500).nullable();
        table.string('status', 20).defaultTo('scheduled');
        table.timestamps(true, true);
        
        table.index('project_id');
        table.index('created_by');
        table.index('scheduled_date');
      });
      console.log('✅ Created project_sessions table');
    } else {
      console.log('✅ project_sessions table already exists');
    }
    
    // Create impact_feed table if it doesn't exist
    if (!existingTables.includes('impact_feed')) {
      console.log('Creating impact_feed table...');
      await db.schema.createTable('impact_feed', function(table) {
        table.uuid('id').primary();
        table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
        table.uuid('project_id').nullable().references('id').inTable('projects').onDelete('SET NULL');
        table.string('title', 200).notNullable();
        table.text('summary').nullable();
        table.text('description').nullable();
        table.string('impact_category', 50).notNullable();
        table.string('location', 100).nullable();
        table.integer('people_impacted').nullable();
        table.decimal('monetary_impact', 15, 2).nullable();
        table.json('metrics').nullable();
        table.string('status', 20).defaultTo('draft');
        table.timestamp('published_at').nullable();
        table.timestamps(true, true);
        
        table.index('user_id');
        table.index('project_id');
        table.index('impact_category');
        table.index('status');
        table.index('published_at');
      });
      console.log('✅ Created impact_feed table');
    } else {
      console.log('✅ impact_feed table already exists');
    }
    
    // Create session_attendees table if it doesn't exist
    if (!existingTables.includes('session_attendees')) {
      console.log('Creating session_attendees table...');
      await db.schema.createTable('session_attendees', function(table) {
        table.uuid('id').primary();
        table.uuid('session_id').notNullable().references('id').inTable('project_sessions').onDelete('CASCADE');
        table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
        table.string('status', 20).defaultTo('invited');
        table.timestamp('responded_at').nullable();
        table.timestamp('attended_at').nullable();
        table.timestamps(true, true);
        
        table.unique(['session_id', 'user_id']);
        table.index('session_id');
        table.index('user_id');
      });
      console.log('✅ Created session_attendees table');
    } else {
      console.log('✅ session_attendees table already exists');
    }
    
    console.log('✅ Database setup complete!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
}

setupTables();
