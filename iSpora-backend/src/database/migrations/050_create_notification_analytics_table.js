exports.up = function(knex) {
  return knex.schema.createTable('notification_analytics', table => {
    table.uuid('id').primary().defaultTo(knex.raw('(lower(hex(randomblob(4))) || \'-\' || lower(hex(randomblob(2))) || \'-4\' || substr(lower(hex(randomblob(2))),2) || \'-\' || substr(\'89ab\',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || \'-\' || lower(hex(randomblob(6))))'));
    table.uuid('notification_id').references('id').inTable('notifications').onDelete('CASCADE');
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('event_type').notNullable(); // sent, delivered, read, clicked, dismissed, etc.
    table.json('event_data'); // Additional event data
    table.string('user_agent');
    table.string('ip_address');
    table.timestamp('event_timestamp').defaultTo(knex.fn.now());
    table.timestamps(true, true);
    
    // Indexes
    table.index(['notification_id']);
    table.index(['user_id']);
    table.index(['event_type']);
    table.index(['event_timestamp']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('notification_analytics');
};
