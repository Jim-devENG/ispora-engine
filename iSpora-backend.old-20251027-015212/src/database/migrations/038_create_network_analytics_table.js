/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('network_analytics', function(table) {
    table.uuid('id').primary();
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('event_type').notNullable(); // profile_view, connection_request, message_sent, etc.
    table.uuid('related_user_id').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.string('ip_address').nullable();
    table.string('user_agent').nullable();
    table.json('metadata').nullable(); // Additional event data
    table.timestamp('created_at').defaultTo(knex.fn.now();
    
    // Indexes
    table.index(['user_id']);
    table.index(['event_type']);
    table.index(['related_user_id']);
    table.index(['created_at']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('network_analytics');
};
