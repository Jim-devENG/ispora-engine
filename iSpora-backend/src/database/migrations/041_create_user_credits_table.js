/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('user_credits', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    
    // Credit system
    table.integer('total_points').defaultTo(0);
    table.integer('current_level').defaultTo(1);
    table.integer('level_progress').defaultTo(0); // Percentage to next level
    table.integer('points_to_next_level').defaultTo(100);
    
    // Streak tracking
    table.integer('current_streak').defaultTo(0);
    table.integer('longest_streak').defaultTo(0);
    table.date('last_activity_date').nullable();
    
    // Statistics
    table.integer('monthly_points').defaultTo(0);
    table.integer('weekly_points').defaultTo(0);
    table.integer('total_contributions').defaultTo(0);
    table.integer('projects_launched').defaultTo(0);
    table.integer('mentorship_sessions').defaultTo(0);
    table.integer('opportunities_shared').defaultTo(0);
    table.integer('social_shares').defaultTo(0);
    table.integer('challenges_won').defaultTo(0);
    table.integer('referrals_successful').defaultTo(0);
    
    // Level configuration
    table.json('level_config').nullable(); // Store level requirements and rewards
    table.timestamp('last_level_up').nullable();
    
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Ensure one credit record per user
    table.unique(['user_id']);
    
    // Indexes
    table.index(['total_points']);
    table.index(['current_level']);
    table.index(['current_streak']);
    table.index(['monthly_points']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('user_credits');
};
