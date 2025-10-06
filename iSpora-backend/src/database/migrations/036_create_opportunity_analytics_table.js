/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('opportunity_analytics', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))'));
    table.uuid('opportunity_id').notNullable().references('id').inTable('opportunities').onDelete('CASCADE');
    table.string('event_type').notNullable(); // view, click, apply, save, boost, share
    table.uuid('user_id').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.string('ip_address').nullable();
    table.string('user_agent').nullable();
    table.string('referrer').nullable();
    table.json('metadata').nullable(); // Additional event data
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    // Indexes
    table.index(['opportunity_id']);
    table.index(['event_type']);
    table.index(['user_id']);
    table.index(['created_at']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('opportunity_analytics');
};
