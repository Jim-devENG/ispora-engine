/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('opportunity_saves', function(table) {
    table.uuid('id').primary();
    table.uuid('opportunity_id').notNullable().references('id').inTable('opportunities').onDelete('CASCADE');
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.timestamp('saved_at').defaultTo(knex.fn.now();
    table.timestamp('created_at').defaultTo(knex.fn.now();
    
    // Ensure one save per user per opportunity
    table.unique(['opportunity_id', 'user_id']);
    
    // Indexes
    table.index(['opportunity_id']);
    table.index(['user_id']);
    table.index(['saved_at']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('opportunity_saves');
};
