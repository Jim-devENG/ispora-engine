exports.up = function(knex) {
  return knex.schema.createTable('project_messages', function(table) {
    table.uuid('id').primary();
    table.uuid('project_id').notNullable().references('id').inTable('projects').onDelete('CASCADE');
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('reply_to_id').nullable().references('id').inTable('project_messages').onDelete('CASCADE');
    
    // Message content
    table.text('content').notNullable();
    table.string('type', 20).defaultTo('text'); // text, voice, file, image, system
    table.string('channel', 30).defaultTo('general'); // general, announcements, specific topics
    
    // Voice message details
    table.integer('duration_seconds').nullable(); // For voice messages
    table.string('voice_url', 500).nullable();
    
    // File attachments
    table.string('file_url', 500).nullable();
    table.string('file_name', 200).nullable();
    table.string('file_type', 50).nullable();
    table.integer('file_size').nullable(); // in bytes
    
    // Message metadata
    table.json('mentions').nullable(); // Array of user IDs mentioned
    table.json('reactions').nullable(); // Object with emoji as keys and user arrays as values
    table.boolean('is_edited').defaultTo(false);
    table.timestamp('edited_at').nullable();
    table.boolean('is_pinned').defaultTo(false);
    table.timestamp('pinned_at').nullable();
    table.uuid('pinned_by').nullable().references('id').inTable('users').onDelete('SET NULL');
    
    // Threading
    table.uuid('thread_id').nullable(); // For message threads
    table.integer('thread_position').nullable(); // Position in thread
    
    // Read status
    table.json('read_by').nullable(); // Object with user IDs and read timestamps
    
    table.timestamps(true, true);
    
    // Indexes
    table.index('project_id');
    table.index('user_id');
    table.index('channel');
    table.index('type');
    table.index('thread_id');
    table.index('created_at');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('project_messages');
};
