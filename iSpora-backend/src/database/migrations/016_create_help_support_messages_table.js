exports.up = function(knex) {
  return knex.schema.createTable('help_support_messages', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))'));
    table.uuid('ticket_id').notNullable().references('id').inTable('help_support_tickets').onDelete('CASCADE');
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    
    // Message details
    table.text('message').notNullable();
    table.string('message_type', 20).notNullable().defaultTo('text'); // text, system, internal_note
    table.boolean('is_internal').defaultTo(false); // Internal notes not visible to user
    
    // Attachments
    table.json('attachments').nullable(); // Array of file URLs
    
    // Message metadata
    table.boolean('is_read').defaultTo(false);
    table.timestamp('read_at').nullable();
    
    table.timestamps(true, true);
    
    // Indexes
    table.index('ticket_id');
    table.index('user_id');
    table.index('created_at');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('help_support_messages');
};
