exports.up = function(knex) {
  return knex.schema.createTable('impact_stories', function(table) {
    table.uuid('id').primary();
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('project_id').nullable().references('id').inTable('projects').onDelete('CASCADE');
    
    // Story details
    table.string('title', 200).notNullable();
    table.text('description').notNullable();
    table.text('summary').nullable(); // Short summary for cards
    table.string('category', 50).notNullable(); // education, health, economic, social, environment
    table.string('location', 100).nullable();
    
    // Impact details
    table.integer('beneficiaries_count').defaultTo(0);
    table.decimal('impact_score', 3, 1).nullable(); // 1.0-10.0 scale
    table.json('impact_metrics').nullable(); // Related metrics data
    table.json('outcomes').nullable(); // Measurable outcomes achieved
    
    // Media and content
    table.json('media_urls').nullable(); // Array of image/video URLs
    table.json('attachments').nullable(); // Additional documents
    table.string('featured_image_url').nullable();
    
    // Engagement
    table.integer('likes_count').defaultTo(0);
    table.integer('shares_count').defaultTo(0);
    table.integer('views_count').defaultTo(0);
    table.integer('comments_count').defaultTo(0);
    
    // Status and verification
    table.string('status', 20).defaultTo('draft'); // draft, published, featured, archived
    table.boolean('is_verified').defaultTo(false);
    table.uuid('verified_by').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('verified_at').nullable();
    table.text('verification_notes').nullable();
    
    // Visibility and sharing
    table.boolean('is_public').defaultTo(true);
    table.boolean('is_featured').defaultTo(false);
    table.boolean('allow_comments').defaultTo(true);
    table.json('tags').nullable(); // Array of tags
    table.json('related_stories').nullable(); // Related story IDs
    
    // Timeline
    table.date('story_date').nullable(); // When the impact occurred
    table.date('published_at').nullable();
    table.date('featured_at').nullable();
    
    // Additional metadata
    table.json('metadata').nullable(); // Additional story-specific data
    table.string('language', 10).defaultTo('en');
    
    table.timestamps(true, true);
    
    // Indexes
    table.index('user_id');
    table.index('project_id');
    table.index('category');
    table.index('status');
    table.index('is_public');
    table.index('is_featured');
    table.index('is_verified');
    table.index('published_at');
    table.index('created_at');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('impact_stories');
};
