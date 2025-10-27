exports.up = function(knex) {
  return knex.schema.createTable('projects', function(table) {
    table.string('id').primary();
    table.string('title').notNullable();
    table.text('description');
    table.string('type').defaultTo('academic');
    table.string('category');
    table.string('status').defaultTo('active');
    table.text('tags'); // JSON string
    table.text('objectives');
    table.text('team_members'); // JSON string
    table.text('diaspora_positions'); // JSON string
    table.string('priority').defaultTo('medium');
    table.string('university');
    table.boolean('mentorship_connection').defaultTo(false);
    table.boolean('is_public').defaultTo(true);
    table.string('created_by').notNullable();
    table.integer('likes').defaultTo(0);
    table.integer('comments').defaultTo(0);
    table.integer('shares').defaultTo(0);
    table.timestamps(true, true);
    
    // Foreign key
    table.foreign('created_by').references('id').inTable('users').onDelete('CASCADE');
    
    // Indexes
    table.index('created_by');
    table.index('status');
    table.index('is_public');
    table.index('created_at');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('projects');
};
