/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('opportunity_applications', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('opportunity_id').notNullable().references('id').inTable('opportunities').onDelete('CASCADE');
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.enum('status', ['applied', 'under_review', 'shortlisted', 'interviewed', 'accepted', 'rejected', 'withdrawn']).defaultTo('applied');
    table.text('cover_letter').nullable();
    table.json('documents').defaultTo('[]'); // Resume, portfolio, etc.
    table.text('notes').nullable();
    table.timestamp('applied_at').defaultTo(knex.fn.now());
    table.timestamp('status_updated_at').defaultTo(knex.fn.now());
    table.uuid('status_updated_by').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.text('feedback').nullable();
    table.json('interview_details').nullable(); // Interview schedule, notes, etc.
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Ensure one application per user per opportunity
    table.unique(['opportunity_id', 'user_id']);
    
    // Indexes
    table.index(['opportunity_id']);
    table.index(['user_id']);
    table.index(['status']);
    table.index(['applied_at']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('opportunity_applications');
};
