exports.up = function(knex) {
  return knex.schema.createTable('help_support_tickets', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('assigned_to').nullable().references('id').inTable('users').onDelete('SET NULL');
    
    // Ticket details
    table.string('ticket_number', 20).notNullable().unique();
    table.string('subject', 200).notNullable();
    table.text('description').notNullable();
    table.string('category', 50).notNullable(); // technical, billing, account, feature_request, bug_report
    table.string('priority', 20).notNullable().defaultTo('medium'); // low, medium, high, urgent
    table.string('status', 20).notNullable().defaultTo('open'); // open, in_progress, waiting_for_user, resolved, closed
    
    // Additional info
    table.string('browser_info', 200).nullable();
    table.string('device_info', 200).nullable();
    table.json('attachments').nullable(); // Array of file URLs
    table.json('tags').nullable(); // Array of tags for categorization
    
    // Resolution
    table.text('resolution').nullable();
    table.timestamp('resolved_at').nullable();
    table.timestamp('closed_at').nullable();
    
    // Satisfaction rating
    table.integer('satisfaction_rating').nullable(); // 1-5 stars
    table.text('satisfaction_feedback').nullable();
    
    table.timestamps(true, true);
    
    // Indexes
    table.index('user_id');
    table.index('assigned_to');
    table.index('status');
    table.index('priority');
    table.index('category');
    table.index('created_at');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('help_support_tickets');
};
