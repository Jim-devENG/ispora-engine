exports.up = function (knex) {
  return knex.schema.createTable('notification_actions', (table) => {
    table
      .uuid('id')
      .primary()
      .defaultTo(
        knex.raw(
          "(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))",
        ),
      );
    table.uuid('notification_id').references('id').inTable('notifications').onDelete('CASCADE');
    table.string('action_type').notNullable(); // click, dismiss, mark_read, navigate, etc.
    table.string('action_label');
    table.string('action_url');
    table.json('action_params'); // Additional parameters for the action
    table.boolean('is_primary').defaultTo(false);
    table.integer('sort_order').defaultTo(0);
    table.timestamps(true, true);

    // Indexes
    table.index(['notification_id']);
    table.index(['action_type']);
    table.index(['is_primary']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('notification_actions');
};
