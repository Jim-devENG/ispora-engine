exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.string('id').primary();
    table.string('email').unique().notNullable();
    table.string('password_hash').notNullable();
    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
    table.string('user_type').defaultTo('student');
    table.string('username').unique();
    table.boolean('is_verified').defaultTo(false);
    table.boolean('email_verified').defaultTo(false);
    table.boolean('profile_completed').defaultTo(false);
    table.string('status').defaultTo('active');
    table.boolean('is_online').defaultTo(false);
    table.timestamp('last_login');
    table.timestamps(true, true);
    
    // Indexes
    table.index('email');
    table.index('username');
    table.index('status');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
