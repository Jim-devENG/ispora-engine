exports.up = function(knex) {
  return knex.schema.createTable('feed_activities', table => {
    table.uuid('id').primary().defaultTo(knex.raw('(lower(hex(randomblob(4))) || \'-\' || lower(hex(randomblob(2))) || \'-4\' || substr(lower(hex(randomblob(2))),2) || \'-\' || substr(\'89ab\',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || \'-\' || lower(hex(randomblob(6))))'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.enu('type', [
      'project_created', 'project_updated', 'project_completed',
      'mentorship_started', 'mentorship_completed',
      'connection_made', 'skill_added', 'achievement_earned',
      'opportunity_posted', 'opportunity_applied',
      'session_completed', 'milestone_reached'
    ]).notNullable();
    table.string('title').notNullable();
    table.text('description');
    table.json('metadata'); // Additional data for the activity
    table.uuid('related_project_id').references('id').inTable('projects').onDelete('SET NULL');
    table.uuid('related_user_id').references('id').inTable('users').onDelete('SET NULL');
    table.integer('likes_count').defaultTo(0);
    table.integer('comments_count').defaultTo(0);
    table.json('tags'); // Array of tags
    table.boolean('is_pinned').defaultTo(false);
    table.enu('visibility', ['public', 'connections', 'private']).defaultTo('public');
    table.timestamps(true, true);
    
    // Indexes
    table.index(['user_id']);
    table.index(['type']);
    table.index(['created_at']);
    table.index(['visibility']);
  })
  .then(() => {
    return knex.schema.createTable('feed_likes', table => {
      table.uuid('id').primary().defaultTo(knex.raw('(lower(hex(randomblob(4))) || \'-\' || lower(hex(randomblob(2))) || \'-4\' || substr(lower(hex(randomblob(2))),2) || \'-\' || substr(\'89ab\',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || \'-\' || lower(hex(randomblob(6))))'));
      table.uuid('activity_id').references('id').inTable('feed_activities').onDelete('CASCADE');
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.timestamps(true, true);
      
      table.unique(['activity_id', 'user_id']);
      table.index(['activity_id']);
      table.index(['user_id']);
    });
  })
  .then(() => {
    return knex.schema.createTable('feed_comments', table => {
      table.uuid('id').primary().defaultTo(knex.raw('(lower(hex(randomblob(4))) || \'-\' || lower(hex(randomblob(2))) || \'-4\' || substr(lower(hex(randomblob(2))),2) || \'-\' || substr(\'89ab\',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || \'-\' || lower(hex(randomblob(6))))'));
      table.uuid('activity_id').references('id').inTable('feed_activities').onDelete('CASCADE');
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.text('content').notNullable();
      table.uuid('parent_id').references('id').inTable('feed_comments').onDelete('CASCADE');
      table.timestamps(true, true);
      
      table.index(['activity_id']);
      table.index(['user_id']);
      table.index(['parent_id']);
    });
  });
};

exports.down = function(knex) {
  return knex.schema
    .dropTable('feed_comments')
    .then(() => knex.schema.dropTable('feed_likes'))
    .then(() => knex.schema.dropTable('feed_activities'));
};
