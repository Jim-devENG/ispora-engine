/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('user_badges', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('badge_id').notNullable().references('id').inTable('badges').onDelete('CASCADE');
    
    // Badge status
    table.boolean('earned').defaultTo(false);
    table.timestamp('earned_date').nullable();
    table.integer('progress').defaultTo(0); // Percentage progress if not earned
    
    // Award details
    table.uuid('awarded_by').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.text('award_reason').nullable();
    table.json('criteria_met').nullable(); // Which criteria were met
    
    // Display settings
    table.boolean('is_public').defaultTo(true);
    table.boolean('show_on_profile').defaultTo(true);
    table.integer('display_order').defaultTo(0);
    
    // Sharing
    table.boolean('shared').defaultTo(false);
    table.timestamp('shared_date').nullable();
    table.json('shared_platforms').nullable(); // Array of platforms shared on
    
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Ensure unique badge per user
    table.unique(['user_id', 'badge_id']);
    
    // Indexes
    table.index(['user_id']);
    table.index(['badge_id']);
    table.index(['earned']);
    table.index(['earned_date']);
    table.index(['is_public']);
    table.index(['show_on_profile']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('user_badges');
};
