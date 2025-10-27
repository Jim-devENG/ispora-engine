exports.up = function(knex) {
  return knex.schema.createTable('session_attendees', function(table) {
    table.uuid('id').primary();
    table.uuid('session_id').notNullable().references('id').inTable('project_sessions').onDelete('CASCADE');
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    
    // Attendance details
    table.boolean('attended').defaultTo(false);
    table.timestamp('joined_at').nullable();
    table.timestamp('left_at').nullable();
    table.integer('duration_minutes').nullable(); // Actual time spent in session
    
    // Role and permissions
    table.string('role', 20).defaultTo('participant'); // host, co-host, participant
    table.boolean('can_record').defaultTo(false);
    table.boolean('can_share_screen').defaultTo(false);
    table.boolean('can_chat').defaultTo(true);
    
    // Feedback and notes
    table.text('feedback').nullable();
    table.integer('rating').nullable(); // 1-5 scale
    table.text('notes').nullable();
    
    // Invitation details
    table.timestamp('invited_at').nullable();
    table.timestamp('responded_at').nullable();
    table.string('response_status', 20).defaultTo('pending'); // pending, accepted, declined, maybe
    
    table.timestamps(true, true);
    
    // Ensure unique user per session
    table.unique(['session_id', 'user_id']);
    
    // Indexes
    table.index('session_id');
    table.index('user_id');
    table.index('attended');
    table.index('response_status');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('session_attendees');
};
