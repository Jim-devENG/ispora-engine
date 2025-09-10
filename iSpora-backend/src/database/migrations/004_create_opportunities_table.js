exports.up = function(knex) {
  return knex.schema.createTable('opportunities', table => {
    table.uuid('id').primary().defaultTo(knex.raw('(lower(hex(randomblob(4))) || \'-\' || lower(hex(randomblob(2))) || \'-4\' || substr(lower(hex(randomblob(2))),2) || \'-\' || substr(\'89ab\',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || \'-\' || lower(hex(randomblob(6))))'));
    table.string('title').notNullable();
    table.enu('type', ['scholarship', 'job', 'internship', 'fellowship', 'accelerator', 'grant', 'event', 'community', 'others']).notNullable();
    table.string('company').notNullable();
    table.string('location');
    table.boolean('remote').defaultTo(false);
    table.text('description');
    table.text('full_description');
    table.json('requirements'); // Array of requirements
    table.json('benefits'); // Array of benefits
    table.json('amount'); // {value, currency, type}
    table.string('duration');
    table.string('commitment');
    table.uuid('posted_by').references('id').inTable('users').onDelete('CASCADE');
    table.string('university');
    table.json('tags'); // Array of tags
    table.integer('applicants').defaultTo(0);
    table.date('deadline');
    table.date('event_date');
    table.boolean('featured').defaultTo(false);
    table.boolean('urgent').defaultTo(false);
    table.integer('boost').defaultTo(0);
    table.enu('experience_level', ['entry', 'mid', 'senior', 'any']).defaultTo('any');
    table.string('category');
    table.json('eligibility'); // Array of eligibility criteria
    table.string('application_link');
    table.integer('comments_count').defaultTo(0);
    table.json('application_process'); // Array of application steps
    table.json('contact_info'); // {email, phone, website}
    table.enu('status', ['active', 'inactive', 'expired']).defaultTo('active');
    table.timestamps(true, true);
    
    // Indexes
    table.index(['posted_by']);
    table.index(['type']);
    table.index(['status']);
    table.index(['deadline']);
    table.index(['featured']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('opportunities');
};
