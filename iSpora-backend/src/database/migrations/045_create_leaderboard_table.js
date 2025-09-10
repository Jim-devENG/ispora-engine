/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('leaderboard', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    
    // Leaderboard data
    table.integer('rank').notNullable();
    table.integer('points').notNullable();
    table.integer('level').notNullable();
    table.integer('badges_count').defaultTo(0);
    
    // Change tracking
    table.enum('change_direction', ['up', 'down', 'same']).defaultTo('same');
    table.integer('change_value').defaultTo(0); // How many positions changed
    table.integer('previous_rank').nullable();
    table.integer('previous_points').nullable();
    
    // Time period
    table.enum('period', ['daily', 'weekly', 'monthly', 'all_time']).defaultTo('all_time');
    table.date('period_date').nullable(); // For daily/weekly/monthly leaderboards
    
    // Statistics
    table.integer('monthly_points').defaultTo(0);
    table.integer('weekly_points').defaultTo(0);
    table.integer('daily_points').defaultTo(0);
    
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Indexes
    table.index(['rank']);
    table.index(['points']);
    table.index(['level']);
    table.index(['period']);
    table.index(['period_date']);
    table.index(['change_direction']);
    table.unique(['user_id', 'period', 'period_date']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('leaderboard');
};
