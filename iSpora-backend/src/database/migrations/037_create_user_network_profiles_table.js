/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('user_network_profiles', function(table) {
    table.uuid('id').primary();
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.enum('role', ['mentor', 'professional', 'alumni', 'student', 'researcher', 'entrepreneur']).notNullable();
    table.integer('experience_years').defaultTo(0);
    table.json('skills').defaultTo('[]');
    table.json('expertise').defaultTo('[]');
    table.json('interests').defaultTo('[]');
    table.json('availability').defaultTo('{}'); // {mentoring: boolean, collaboration: boolean, etc.}
    table.json('open_to').defaultTo('[]'); // Array of strings for "Open To" tags
    table.json('achievements').defaultTo('[]'); // Array of achievement objects
    table.json('social_links').nullable(); // {linkedin, twitter, email, etc.}
    table.integer('response_rate').defaultTo(0); // Percentage
    table.boolean('is_public').defaultTo(true);
    table.boolean('show_online_status').defaultTo(true);
    table.boolean('allow_connection_requests').defaultTo(true);
    table.text('bio').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now();
    table.timestamp('updated_at').defaultTo(knex.fn.now();
    
    // Ensure one profile per user
    table.unique(['user_id']);
    
    // Indexes
    table.index(['role']);
    table.index(['experience_years']);
    table.index(['is_public']);
    table.index(['allow_connection_requests']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('user_network_profiles');
};
