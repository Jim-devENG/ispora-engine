exports.up = function(knex) {
  return knex.schema.createTable('project_sessions', function(table) {
    table.uuid('id').primary();
    table.uuid('project_id').notNullable().references('id').inTable('projects').onDelete('CASCADE');
    table.uuid('created_by').notNullable().references('id').inTable('users').onDelete('CASCADE');
    
    // Session details
    table.string('title', 200).notNullable();
    table.text('description').nullable();
    table.timestamp('scheduled_date').notNullable();
    table.integer('duration_minutes').notNullable().defaultTo(60);
    table.string('status', 20).defaultTo('upcoming'); // upcoming, in-progress, completed, cancelled, rescheduled
    table.string('type', 20).notNullable(); // video, phone, in-person
    
    // Meeting details
    table.string('meeting_link', 500).nullable();
    table.string('meeting_id', 100).nullable();
    table.string('meeting_password', 50).nullable();
    table.text('location').nullable(); // For in-person meetings
    
    // Session content
    table.json('agenda').nullable(); // Array of agenda items
    table.text('notes').nullable();
    table.json('recordings').nullable(); // Array of recording objects
    table.json('materials').nullable(); // Array of shared materials
    
    // Settings
    table.boolean('is_public').defaultTo(false);
    table.boolean('allow_recordings').defaultTo(true);
    table.integer('max_participants').nullable();
    table.string('share_url', 200).nullable();
    table.json('tags').nullable();
    
    // Rescheduling
    table.timestamp('original_date').nullable();
    table.text('reschedule_reason').nullable();
    
    table.timestamps(true, true);
    
    // Indexes
    table.index('project_id');
    table.index('created_by');
    table.index('scheduled_date');
    table.index('status');
    table.index('type');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('project_sessions');
};
