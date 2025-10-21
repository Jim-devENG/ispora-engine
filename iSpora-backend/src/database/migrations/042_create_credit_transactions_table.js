/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('credit_transactions', function(table) {
    table.uuid('id').primary();
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    
    // Transaction details
    table.string('transaction_type').notNullable(); // earned, spent, bonus, penalty, transfer
    table.string('activity_type').notNullable(); // project_launch, mentorship, social_share, etc.
    table.integer('points').notNullable(); // Can be positive or negative
    table.string('description').notNullable();
    
    // Related entities
    table.uuid('related_project_id').nullable().references('id').inTable('projects').onDelete('SET NULL');
    table.uuid('related_user_id').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.uuid('related_opportunity_id').nullable().references('id').inTable('opportunities').onDelete('SET NULL');
    table.uuid('related_badge_id').nullable(); // Will reference badges table
    
    // Metadata
    table.json('metadata').nullable(); // Additional transaction data
    table.string('source').nullable(); // system, admin, referral, etc.
    table.boolean('is_bonus').defaultTo(false);
    table.boolean('is_penalty').defaultTo(false);
    
    // Level impact
    table.integer('level_before').nullable();
    table.integer('level_after').nullable();
    table.boolean('level_up').defaultTo(false);
    
    table.timestamp('created_at').defaultTo(knex.fn.now();
    
    // Indexes
    table.index(['user_id']);
    table.index(['transaction_type']);
    table.index(['activity_type']);
    table.index(['points']);
    table.index(['created_at']);
    table.index(['related_project_id']);
    table.index(['related_user_id']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('credit_transactions');
};
