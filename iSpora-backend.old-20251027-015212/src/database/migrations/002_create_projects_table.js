exports.up = function (knex) {
  return knex.schema.createTable('projects', (table) => {
    table
      .uuid('id')
      .primary()
      .defaultTo(
        knex.raw(
          "(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))",
        ),
      );
    table.string('title').notNullable();
    table.text('description');
    table.text('detailed_description');
    table.uuid('creator_id').references('id').inTable('users').onDelete('CASCADE');
    table.enu('status', ['draft', 'active', 'paused', 'completed', 'cancelled']).defaultTo('draft');
    table.enu('type', ['academic', 'professional', 'personal', 'research']).defaultTo('academic');
    table.enu('difficulty_level', ['beginner', 'intermediate', 'advanced']).defaultTo('beginner');
    table.date('start_date');
    table.date('end_date');
    table.date('deadline');
    table.integer('max_participants').defaultTo(1);
    table.integer('current_participants').defaultTo(0);
    table.boolean('is_public').defaultTo(true);
    table.boolean('requires_approval').defaultTo(false);
    table.string('cover_image_url');
    table.json('tags'); // Array of tags
    table.json('skills_required'); // Array of required skills
    table.json('learning_objectives'); // Array of learning objectives
    table.json('resources'); // Array of resource objects
    table.json('deliverables'); // Array of deliverable objects
    table.decimal('budget', 10, 2);
    table.string('currency', 3).defaultTo('USD');
    table.integer('estimated_hours');
    table.timestamps(true, true);

    // Indexes
    table.index(['creator_id']);
    table.index(['status']);
    table.index(['type']);
    table.index(['start_date']);
    table.index(['is_public']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('projects');
};
