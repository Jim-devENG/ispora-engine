exports.up = function (knex) {
  return knex.schema.createTable('notifications', (table) => {
    table
      .uuid('id')
      .primary()
      .defaultTo(
        knex.raw(
          "(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))",
        ),
      );
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('title').notNullable();
    table.text('message').notNullable();
    table
      .enu('type', ['connection', 'mentorship', 'project', 'opportunity', 'system', 'achievement'])
      .notNullable();
    table.enu('priority', ['low', 'medium', 'high', 'urgent']).defaultTo('medium');
    table.boolean('read').defaultTo(false);
    table.json('action_data'); // Additional data for actions
    table.string('action_url'); // URL for notification action
    table.uuid('related_user_id').references('id').inTable('users').onDelete('SET NULL');
    table.uuid('related_project_id').references('id').inTable('projects').onDelete('SET NULL');
    table
      .uuid('related_mentorship_id')
      .references('id')
      .inTable('mentorships')
      .onDelete('SET NULL');
    table.timestamp('expires_at');
    table.timestamps(true, true);

    // Indexes
    table.index(['user_id']);
    table.index(['type']);
    table.index(['read']);
    table.index(['created_at']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('notifications');
};
