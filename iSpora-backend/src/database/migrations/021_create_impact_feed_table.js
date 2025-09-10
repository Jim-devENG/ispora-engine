exports.up = function(knex) {
  return knex.schema.createTable('impact_feed', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('related_user_id').nullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('related_project_id').nullable().references('id').inTable('projects').onDelete('CASCADE');
    table.uuid('related_metric_id').nullable().references('id').inTable('impact_metrics').onDelete('CASCADE');
    table.uuid('related_story_id').nullable().references('id').inTable('impact_stories').onDelete('CASCADE');
    
    // Feed item details
    table.string('type', 50).notNullable(); // metric_created, metric_updated, story_published, milestone_reached, etc.
    table.string('title', 200).notNullable();
    table.text('description').nullable();
    table.text('summary').nullable(); // Short summary for feed display
    
    // Impact information
    table.string('impact_category', 50).nullable();
    table.decimal('impact_score', 3, 1).nullable();
    table.integer('beneficiaries_count').nullable();
    table.string('location', 100).nullable();
    
    // Engagement
    table.integer('likes_count').defaultTo(0);
    table.integer('shares_count').defaultTo(0);
    table.integer('comments_count').defaultTo(0);
    table.integer('views_count').defaultTo(0);
    
    // Visibility and status
    table.string('visibility', 20).defaultTo('public'); // public, connections, private
    table.boolean('is_featured').defaultTo(false);
    table.boolean('is_verified').defaultTo(false);
    table.boolean('is_pinned').defaultTo(false);
    table.string('status', 20).defaultTo('active'); // active, archived, hidden
    
    // Media and content
    table.string('featured_image_url').nullable();
    table.json('media_urls').nullable();
    table.json('tags').nullable();
    
    // Metadata
    table.json('metadata').nullable(); // Additional feed-specific data
    table.boolean('is_auto_generated').defaultTo(false);
    table.string('source', 50).nullable(); // manual, auto, system
    
    // Timeline
    table.timestamp('event_date').nullable(); // When the actual event occurred
    table.timestamp('published_at').defaultTo(knex.fn.now());
    table.timestamp('featured_at').nullable();
    
    table.timestamps(true, true);
    
    // Indexes
    table.index('user_id');
    table.index('related_user_id');
    table.index('related_project_id');
    table.index('type');
    table.index('impact_category');
    table.index('visibility');
    table.index('is_featured');
    table.index('is_verified');
    table.index('published_at');
    table.index('created_at');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('impact_feed');
};
