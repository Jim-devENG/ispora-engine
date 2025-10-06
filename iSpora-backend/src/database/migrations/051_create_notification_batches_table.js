exports.up = function (knex) {
  return knex.schema.createTable('notification_batches', (table) => {
    table
      .uuid('id')
      .primary()
      .defaultTo(
        knex.raw(
          "(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))",
        ),
      );
    table.string('batch_name').notNullable();
    table
      .string('template_id')
      .references('id')
      .inTable('notification_templates')
      .onDelete('SET NULL');
    table.json('target_criteria'); // Criteria for selecting target users
    table.integer('total_recipients').defaultTo(0);
    table.integer('sent_count').defaultTo(0);
    table.integer('delivered_count').defaultTo(0);
    table.integer('read_count').defaultTo(0);
    table.integer('clicked_count').defaultTo(0);
    table
      .enu('status', ['draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled'])
      .defaultTo('draft');
    table.timestamp('scheduled_at');
    table.timestamp('sent_at');
    table.json('batch_metadata'); // Additional batch information
    table.timestamps(true, true);

    // Indexes
    table.index(['batch_name']);
    table.index(['template_id']);
    table.index(['status']);
    table.index(['scheduled_at']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('notification_batches');
};
