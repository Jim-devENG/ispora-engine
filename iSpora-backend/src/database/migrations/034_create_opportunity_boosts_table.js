/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('opportunity_boosts', function(table) {
    table.uuid('id').primary();
    table.uuid('opportunity_id').notNullable().references('id').inTable('opportunities').onDelete('CASCADE');
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.integer('boost_amount').notNullable().defaultTo(1);
    table.text('boost_message').nullable();
    table.timestamp('boosted_at').defaultTo(knex.fn.now();
    table.timestamp('created_at').defaultTo(knex.fn.now();
    
    // Indexes
    table.index(['opportunity_id']);
    table.index(['user_id']);
    table.index(['boosted_at']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('opportunity_boosts');
};
