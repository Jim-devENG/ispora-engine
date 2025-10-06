exports.up = function (knex) {
  return knex.schema.createTable('users', (table) => {
    table
      .uuid('id')
      .primary()
      .defaultTo(
        knex.raw(
          "(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))",
        ),
      );
    table.string('email').unique().notNullable();
    table.string('password_hash').notNullable();
    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
    table.string('username').unique();
    table.string('title');
    table.string('company');
    table.string('location');
    table.text('bio');
    table.string('avatar_url');
    table.string('linkedin_url');
    table.string('github_url');
    table.string('website_url');
    table.enu('user_type', ['student', 'mentor', 'organization', 'admin']).defaultTo('student');
    table.enu('status', ['active', 'inactive', 'suspended']).defaultTo('active');
    table.boolean('email_verified').defaultTo(false);
    table.boolean('profile_completed').defaultTo(false);
    table.boolean('is_online').defaultTo(false);
    table.timestamp('last_login');
    table.json('skills'); // Array of skills
    table.json('interests'); // Array of interests
    table.json('education'); // Array of education objects
    table.json('experience'); // Array of experience objects
    table.json('preferences'); // User preferences object
    table.timestamps(true, true);

    // Indexes
    table.index(['email']);
    table.index(['username']);
    table.index(['user_type']);
    table.index(['status']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('users');
};
