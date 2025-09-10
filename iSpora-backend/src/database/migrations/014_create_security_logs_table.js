exports.up = function(knex) {
  return knex.schema.createTable('security_logs', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').nullable().references('id').inTable('users').onDelete('CASCADE');
    
    // Event details
    table.string('event_type', 50).notNullable(); // login, logout, password_change, 2fa_enabled, etc.
    table.string('event_category', 30).notNullable(); // authentication, authorization, data_access, etc.
    table.string('severity', 20).notNullable().defaultTo('info'); // info, warning, error, critical
    
    // Request details
    table.string('ip_address', 45).nullable();
    table.string('user_agent', 500).nullable();
    table.string('country', 2).nullable();
    table.string('city', 100).nullable();
    
    // Event metadata
    table.json('metadata').nullable(); // Additional event-specific data
    table.text('description').nullable();
    table.boolean('success').defaultTo(true);
    
    // Device and session info
    table.string('device_id', 100).nullable();
    table.string('session_id', 100).nullable();
    
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    // Indexes for efficient querying
    table.index('user_id');
    table.index('event_type');
    table.index('event_category');
    table.index('severity');
    table.index('created_at');
    table.index(['user_id', 'created_at']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('security_logs');
};
