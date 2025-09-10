exports.up = function(knex) {
  return knex.schema.createTable('sessions', table => {
    table.uuid('id').primary().defaultTo(knex.raw('(lower(hex(randomblob(4))) || \'-\' || lower(hex(randomblob(2))) || \'-4\' || substr(lower(hex(randomblob(2))),2) || \'-\' || substr(\'89ab\',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || \'-\' || lower(hex(randomblob(6))))'));
    table.string('title').notNullable();
    table.text('description');
    table.uuid('host_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('mentorship_id').references('id').inTable('mentorships').onDelete('SET NULL');
    table.uuid('project_id').references('id').inTable('projects').onDelete('SET NULL');
    table.enu('type', ['mentorship', 'project', 'workshop', 'interview', 'presentation']).defaultTo('mentorship');
    table.datetime('scheduled_start');
    table.datetime('scheduled_end');
    table.datetime('actual_start');
    table.datetime('actual_end');
    table.enu('status', ['scheduled', 'live', 'completed', 'cancelled']).defaultTo('scheduled');
    table.string('meeting_url');
    table.string('meeting_id');
    table.string('meeting_password');
    table.json('attendees'); // Array of user IDs
    table.json('agenda'); // Array of agenda items
    table.text('notes');
    table.json('recording_url');
    table.json('shared_resources'); // Files/links shared during session
    table.integer('max_participants').defaultTo(10);
    table.boolean('recording_enabled').defaultTo(false);
    table.boolean('waiting_room_enabled').defaultTo(true);
    table.timestamps(true, true);
    
    // Indexes
    table.index(['host_id']);
    table.index(['mentorship_id']);
    table.index(['project_id']);
    table.index(['status']);
    table.index(['scheduled_start']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('sessions');
};
