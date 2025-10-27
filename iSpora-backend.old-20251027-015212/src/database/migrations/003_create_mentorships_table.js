exports.up = function (knex) {
  return knex.schema.createTable('mentorships', (table) => {
    table
      .uuid('id')
      .primary()
      .defaultTo(
        knex.raw(
          "(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))",
        ),
      );
    table.uuid('mentor_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('mentee_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('project_id').references('id').inTable('projects').onDelete('SET NULL');
    table
      .enu('status', ['requested', 'active', 'paused', 'completed', 'cancelled'])
      .defaultTo('requested');
    table
      .enu('type', ['project_based', 'career_guidance', 'skill_development', 'academic'])
      .defaultTo('project_based');
    table.date('start_date');
    table.date('end_date');
    table.text('goals'); // Mentorship goals
    table.json('meeting_schedule'); // Meeting frequency and schedule
    table.json('communication_preferences'); // Preferred communication methods
    table.text('mentor_notes'); // Private notes for mentor
    table.text('mentee_notes'); // Private notes for mentee
    table.integer('rating_by_mentor');
    table.integer('rating_by_mentee');
    table.text('feedback_by_mentor');
    table.text('feedback_by_mentee');
    table.timestamps(true, true);

    // Indexes
    table.index(['mentor_id']);
    table.index(['mentee_id']);
    table.index(['project_id']);
    table.index(['status']);
    table.unique(['mentor_id', 'mentee_id', 'project_id']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('mentorships');
};
