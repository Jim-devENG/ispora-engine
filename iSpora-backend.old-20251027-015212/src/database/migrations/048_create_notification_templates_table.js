exports.up = function (knex) {
  return knex.schema.createTable('notification_templates', (table) => {
    table
      .uuid('id')
      .primary()
      .defaultTo(
        knex.raw(
          "(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))",
        ),
      );
    table.string('name').notNullable().unique();
    table.string('type').notNullable(); // project, mentorship, message, system, opportunity
    table
      .string('category_id')
      .references('id')
      .inTable('notification_categories')
      .onDelete('SET NULL');
    table.string('title_template').notNullable();
    table.text('message_template').notNullable();
    table.json('variables'); // Available template variables
    table.json('default_metadata'); // Default metadata structure
    table.enu('priority', ['low', 'medium', 'high', 'urgent']).defaultTo('medium');
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);

    // Indexes
    table.index(['name']);
    table.index(['type']);
    table.index(['category_id']);
    table.index(['is_active']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('notification_templates');
};
