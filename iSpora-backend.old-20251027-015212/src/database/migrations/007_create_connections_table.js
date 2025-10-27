exports.up = function (knex) {
  return knex.schema.createTable('connections', (table) => {
    table
      .uuid('id')
      .primary()
      .defaultTo(
        knex.raw(
          "(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))",
        ),
      );
    table.uuid('requester_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('receiver_id').references('id').inTable('users').onDelete('CASCADE');
    table.enu('status', ['pending', 'accepted', 'declined', 'blocked']).defaultTo('pending');
    table.text('message'); // Optional message with connection request
    table.text('purpose'); // Purpose of connection
    table.timestamp('responded_at');
    table.timestamps(true, true);

    // Indexes
    table.index(['requester_id']);
    table.index(['receiver_id']);
    table.index(['status']);
    table.unique(['requester_id', 'receiver_id']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('connections');
};
