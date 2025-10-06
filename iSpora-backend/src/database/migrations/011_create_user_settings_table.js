exports.up = function (knex) {
  return knex.schema.createTable('user_settings', function (table) {
    table
      .uuid('id')
      .primary()
      .defaultTo(
        knex.raw(
          "(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))",
        ),
      );
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');

    // Privacy settings
    table.boolean('profile_visibility').defaultTo(true);
    table.boolean('show_email').defaultTo(false);
    table.boolean('show_phone').defaultTo(false);
    table.boolean('show_location').defaultTo(true);
    table.boolean('show_connections').defaultTo(true);
    table.boolean('show_activity').defaultTo(true);

    // Communication settings
    table.boolean('allow_direct_messages').defaultTo(true);
    table.boolean('allow_connection_requests').defaultTo(true);
    table.boolean('allow_project_invites').defaultTo(true);
    table.boolean('allow_opportunity_notifications').defaultTo(true);

    // Language and region
    table.string('language', 10).defaultTo('en');
    table.string('timezone', 50).defaultTo('UTC');
    table.string('date_format', 20).defaultTo('MM/DD/YYYY');
    table.string('time_format', 10).defaultTo('12h');

    // Theme and display
    table.string('theme', 20).defaultTo('light');
    table.boolean('compact_mode').defaultTo(false);
    table.boolean('show_online_status').defaultTo(true);

    // Email preferences
    table.boolean('email_notifications').defaultTo(true);
    table.boolean('email_weekly_digest').defaultTo(true);
    table.boolean('email_marketing').defaultTo(false);

    // Push notification preferences
    table.boolean('push_notifications').defaultTo(true);
    table.boolean('push_mentorship').defaultTo(true);
    table.boolean('push_projects').defaultTo(true);
    table.boolean('push_connections').defaultTo(true);
    table.boolean('push_opportunities').defaultTo(false);

    table.timestamps(true, true);

    // Ensure one settings record per user
    table.unique('user_id');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('user_settings');
};
