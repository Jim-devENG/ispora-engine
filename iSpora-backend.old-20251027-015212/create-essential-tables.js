const db = require('./src/database/connection');

async function createEssentialTables() {
  try {
    console.log('Creating essential database tables...');
    
    // Test database connection first
    await db.raw('SELECT 1');
    console.log('✅ Database connection successful');
    
    // Check if tables exist
    const tables = await db.raw("SELECT name FROM sqlite_master WHERE type='table'");
    const existingTables = tables.map(r => r.name);
    
    console.log('Existing tables:', existingTables);
    
    // Create users table if it doesn't exist
    if (!existingTables.includes('users')) {
      console.log('Creating users table...');
      try {
        await db.schema.createTable('users', function(table) {
          table.uuid('id').primary();
          table.string('email', 255).notNullable().unique();
          table.string('password_hash', 255).notNullable();
          table.string('first_name', 100).notNullable();
          table.string('last_name', 100).notNullable();
          table.string('username', 50).notNullable().unique();
          table.string('avatar_url', 500).nullable();
          table.string('role', 20).defaultTo('user');
          table.boolean('is_verified').defaultTo(false);
          table.boolean('is_active').defaultTo(true);
          table.timestamps(true, true);
          
          table.index('email');
          table.index('username');
        });
        console.log('✅ Created users table');
      } catch (error) {
        console.log('⚠️ Users table creation failed (might already exist):', error.message);
      }
    } else {
      console.log('✅ Users table already exists');
    }
    
    // Create projects table if it doesn't exist
    if (!existingTables.includes('projects')) {
      console.log('Creating projects table...');
      try {
        await db.schema.createTable('projects', function(table) {
          table.uuid('id').primary();
          table.uuid('creator_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
          table.string('title', 200).notNullable();
          table.text('description').nullable();
          table.text('detailed_description').nullable();
          table.string('type', 50).defaultTo('academic');
          table.string('status', 20).defaultTo('active');
          table.json('tags').nullable();
          table.boolean('is_public').defaultTo(true);
          table.date('start_date').nullable();
          table.date('end_date').nullable();
          table.timestamps(true, true);
          
          table.index('creator_id');
          table.index('status');
          table.index('is_public');
        });
        console.log('✅ Created projects table');
      } catch (error) {
        console.log('⚠️ Projects table creation failed (might already exist):', error.message);
      }
    } else {
      console.log('✅ Projects table already exists');
    }
    
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
    }
    
    console.log('✅ All essential tables created successfully!');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    process.exit(1);
  } finally {
    db.destroy();
  }
}

createEssentialTables();
