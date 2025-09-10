/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('user_online_status', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.boolean('is_online').defaultTo(false);
    table.timestamp('last_seen').defaultTo(knex.fn.now());
    table.string('status_message').nullable(); // Custom status like "Available for mentoring"
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Ensure one status per user
    table.unique(['user_id']);
    
    // Indexes
    table.index(['is_online']);
    table.index(['last_seen']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('user_online_status');
};
