exports.up = function (knex) {
  return Promise.all([
    // Add missing columns to users table
    knex.schema.alterTable('users', (table) => {
      table.boolean('is_verified').defaultTo(false);
    }),

    // Add missing columns to projects table
    knex.schema.alterTable('projects', (table) => {
      table.string('category');
      table.string('location');
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.alterTable('users', (table) => {
      table.dropColumn('is_verified');
    }),
    knex.schema.alterTable('projects', (table) => {
      table.dropColumn('category');
      table.dropColumn('location');
    }),
  ]);
};
