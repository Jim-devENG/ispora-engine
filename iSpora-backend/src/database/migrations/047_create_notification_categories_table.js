exports.up = function(knex) {
  return knex.schema.createTable('notification_categories', table => {
    table.uuid('id').primary().defaultTo(knex.raw('(lower(hex(randomblob(4))) || \'-\' || lower(hex(randomblob(2))) || \'-4\' || substr(lower(hex(randomblob(2))),2) || \'-\' || substr(\'89ab\',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || \'-\' || lower(hex(randomblob(6))))'));
    table.string('name').notNullable().unique();
    table.string('display_name').notNullable();
    table.text('description');
    table.string('icon').defaultTo('bell');
    table.string('color').defaultTo('#3b82f6');
    table.boolean('is_active').defaultTo(true);
    table.integer('sort_order').defaultTo(0);
    table.timestamps(true, true);
    
    // Indexes
    table.index(['name']);
    table.index(['is_active']);
    table.index(['sort_order']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('notification_categories');
};
