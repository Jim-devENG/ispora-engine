exports.up = function(knex) {
  return knex.schema.createTable('security_logs', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('lower(hex(randomblob(16)))'));
    table.uuid('user_id').nullable().references('id').inTable('users').onDelete('CASCADE');
    
    // Event details
    table.string('event_type', 50).notNullable(); // login, logout, password_change, 2fa_enabled, etc.
    table.string('event_category', 30).notNullable(); // authentication, authorization, data_access, etc.
    table.string('severity', 20).notNullable().defaultTo('info'); // info, warning, error, critical
    
    // Request details
    table.string('ip_address', 45).nullable(); // IPv4 or IPv6
    table.string('user_agent', 500).nullable();
    table.string('session_id', 100).nullable();
    
    // Event context
    table.text('description').nullable();
    table.json('metadata').nullable(); // Additional event data
    table.string('resource', 100).nullable(); // What resource was accessed
    
    // Location and device info
    table.string('country', 2).nullable(); // ISO country code
    table.string('city', 100).nullable();
    table.string('device_type', 50).nullable(); // mobile, desktop, tablet
    table.string('browser', 50).nullable();
    table.string('os', 50).nullable();
    
    // Risk assessment
    table.boolean('is_suspicious').defaultTo(false);
    table.integer('risk_score').defaultTo(0); // 0-100
    table.text('risk_factors').nullable(); // JSON array of risk factors
    
    table.timestamps(true, true);
    
    // Indexes for performance
    table.index('user_id');
    table.index('event_type');
    table.index('event_category');
    table.index('severity');
    table.index('ip_address');
    table.index('created_at');
    table.index(['user_id', 'created_at']);
    table.index(['event_type', 'created_at']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('security_logs');
};