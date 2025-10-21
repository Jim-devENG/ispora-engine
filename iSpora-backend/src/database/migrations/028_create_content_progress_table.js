exports.up = function(knex) {
  return knex.schema.createTable('content_progress', function(table) {
    table.uuid('id').primary();
    table.uuid('content_id').notNullable().references('id').inTable('learning_content').onDelete('CASCADE');
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    
    // Progress details
    table.integer('progress_percentage').defaultTo(0);
    table.integer('time_spent_seconds').defaultTo(0);
    table.timestamp('started_at').nullable();
    table.timestamp('completed_at').nullable();
    table.timestamp('last_accessed_at').defaultTo(knex.fn.now();
    
    // Completion status
    table.boolean('is_completed').defaultTo(false);
    table.boolean('is_bookmarked').defaultTo(false);
    table.integer('rating').nullable(); // 1-5 scale
    table.text('feedback').nullable();
    
    // Video/audio specific
    table.integer('last_position_seconds').nullable(); // Last watched position
    table.integer('total_watch_time_seconds').defaultTo(0);
    table.integer('play_count').defaultTo(0);
    
    // Quiz/assignment specific
    table.integer('attempts_count').defaultTo(0);
    table.integer('best_score').nullable();
    table.integer('latest_score').nullable();
    table.json('quiz_responses').nullable(); // Store quiz answers
    table.json('assignment_submission').nullable(); // Assignment submission data
    
    // Notes and annotations
    table.json('notes').nullable(); // Array of timestamped notes
    table.json('bookmarks').nullable(); // Array of timestamped bookmarks
    table.json('highlights').nullable(); // For text-based content
    
    table.timestamps(true, true);
    
    // Ensure unique user per content
    table.unique(['content_id', 'user_id']);
    
    // Indexes
    table.index('content_id');
    table.index('user_id');
    table.index('is_completed');
    table.index('last_accessed_at');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('content_progress');
};
