/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('opportunities', function(table) {
    table.uuid('id').primary();
    table.string('title').notNullable();
    table.enum('type', [
      'scholarship', 
      'job', 
      'internship', 
      'fellowship', 
      'accelerator', 
      'grant', 
      'event', 
      'community', 
      'others'
    ]).notNullable();
    table.string('company').notNullable();
    table.string('location').notNullable();
    table.boolean('remote').defaultTo(false);
    table.text('description').notNullable();
    table.json('requirements').defaultTo('[]');
    table.json('benefits').defaultTo('[]');
    table.json('amount').nullable(); // {value, currency, type}
    table.string('duration').nullable();
    table.string('commitment').nullable();
    table.uuid('posted_by').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('university').nullable();
    table.json('tags').defaultTo('[]');
    table.integer('applicants').defaultTo(0);
    table.date('deadline').nullable();
    table.date('event_date').nullable();
    table.timestamp('posted_date').defaultTo(knex.fn.now();
    table.boolean('featured').defaultTo(false);
    table.boolean('urgent').defaultTo(false);
    table.integer('boost').defaultTo(0);
    table.enum('experience_level', ['entry', 'mid', 'senior', 'any']).defaultTo('any');
    table.string('category').nullable();
    table.json('eligibility').defaultTo('[]');
    table.string('application_link').nullable();
    table.integer('comments').defaultTo(0);
    table.text('full_description').nullable();
    table.json('application_process').defaultTo('[]');
    table.json('contact_info').nullable(); // {email, phone, website}
    table.boolean('is_active').defaultTo(true);
    table.boolean('is_verified').defaultTo(false);
    table.timestamp('verified_at').nullable();
    table.uuid('verified_by').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('created_at').defaultTo(knex.fn.now();
    table.timestamp('updated_at').defaultTo(knex.fn.now();
    
    // Indexes for better performance
    table.index(['type']);
    table.index(['location']);
    table.index(['remote']);
    table.index(['featured']);
    table.index(['urgent']);
    table.index(['deadline']);
    table.index(['posted_date']);
    table.index(['is_active']);
    table.index(['is_verified']);
    table.index(['experience_level']);
    table.index(['category']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('opportunities');
};
