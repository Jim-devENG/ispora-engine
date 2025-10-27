exports.up = function(knex) {
  return knex.schema.createTable('feed_entries', function(table) {
    table.string('id').primary();
    table.string('type').notNullable(); // 'project', 'activity', 'session', etc.
    table.string('title').notNullable();
    table.text('description');
    table.string('category');
    table.json('metadata'); // Flexible JSON for different entry types
    table.string('user_id').notNullable();
    table.string('project_id'); // Optional reference to project
    table.boolean('is_public').defaultTo(true);
    table.integer('likes').defaultTo(0);
    table.integer('comments').defaultTo(0);
    table.integer('shares').defaultTo(0);
    table.timestamps(true, true);
    
    // Foreign keys
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.foreign('project_id').references('id').inTable('projects').onDelete('CASCADE');
    
    // Indexes
    table.index('type');
    table.index('user_id');
    table.index('project_id');
    table.index('is_public');
    table.index('created_at');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('feed_entries');
};
