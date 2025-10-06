exports.up = function (knex) {
  return knex.schema
    .createTable('conversations', (table) => {
      table
        .uuid('id')
        .primary()
        .defaultTo(
          knex.raw(
            "(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))",
          ),
        );
      table.enu('type', ['direct', 'group', 'project']).defaultTo('direct');
      table.string('title');
      table.text('description');
      table.uuid('created_by').references('id').inTable('users').onDelete('CASCADE');
      table.uuid('project_id').references('id').inTable('projects').onDelete('CASCADE');
      table.timestamp('last_message_at');
      table.timestamps(true, true);

      // Indexes
      table.index(['created_by']);
      table.index(['project_id']);
      table.index(['last_message_at']);
    })
    .then(() => {
      return knex.schema.createTable('conversation_participants', (table) => {
        table
          .uuid('id')
          .primary()
          .defaultTo(
            knex.raw(
              "(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))",
            ),
          );
        table.uuid('conversation_id').references('id').inTable('conversations').onDelete('CASCADE');
        table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
        table.enu('role', ['admin', 'moderator', 'member']).defaultTo('member');
        table.timestamp('joined_at').defaultTo(knex.fn.now());
        table.timestamp('last_read_at');
        table.boolean('muted').defaultTo(false);
        table.timestamps(true, true);

        // Indexes
        table.index(['conversation_id']);
        table.index(['user_id']);
        table.unique(['conversation_id', 'user_id']);
      });
    })
    .then(() => {
      return knex.schema.createTable('messages', (table) => {
        table
          .uuid('id')
          .primary()
          .defaultTo(
            knex.raw(
              "(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))",
            ),
          );
        table.uuid('conversation_id').references('id').inTable('conversations').onDelete('CASCADE');
        table.uuid('sender_id').references('id').inTable('users').onDelete('CASCADE');
        table.text('content').notNullable();
        table.enu('type', ['text', 'image', 'file', 'system']).defaultTo('text');
        table.json('attachments'); // Array of attachment objects
        table.uuid('reply_to_id').references('id').inTable('messages').onDelete('SET NULL');
        table.boolean('edited').defaultTo(false);
        table.timestamp('edited_at');
        table.json('reactions'); // {emoji: [user_ids]}
        table.timestamps(true, true);

        // Indexes
        table.index(['conversation_id']);
        table.index(['sender_id']);
        table.index(['created_at']);
      });
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTable('messages')
    .then(() => knex.schema.dropTable('conversation_participants'))
    .then(() => knex.schema.dropTable('conversations'));
};
