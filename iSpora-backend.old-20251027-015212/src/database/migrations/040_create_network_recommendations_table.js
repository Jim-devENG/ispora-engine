/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('network_recommendations', function(table) {
    table.uuid('id').primary();
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('recommended_user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('recommendation_type').notNullable(); // mutual_connections, similar_interests, same_university, etc.
    table.decimal('score', 5, 2).notNullable(); // Recommendation score 0-100
    table.json('reasons').defaultTo('[]'); // Array of reasons for recommendation
    table.boolean('is_dismissed').defaultTo(false);
    table.timestamp('dismissed_at').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now();
    table.timestamp('updated_at').defaultTo(knex.fn.now();
    
    // Ensure one recommendation per user pair
    table.unique(['user_id', 'recommended_user_id']);
    
    // Indexes
    table.index(['user_id']);
    table.index(['recommended_user_id']);
    table.index(['recommendation_type']);
    table.index(['score']);
    table.index(['is_dismissed']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('network_recommendations');
};
