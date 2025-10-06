exports.up = function(knex) {
  return knex.schema.createTable('learning_content', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))'));
    table.uuid('project_id').notNullable().references('id').inTable('projects').onDelete('CASCADE');
    table.uuid('created_by').notNullable().references('id').inTable('users').onDelete('CASCADE');
    
    // Content details
    table.string('title', 200).notNullable();
    table.text('description').nullable();
    table.string('type', 30).notNullable(); // video, document, quiz, assignment, recording, link
    table.string('category', 30).notNullable(); // orientation, skills, reflections, tools, recordings
    table.string('status', 20).defaultTo('ready'); // processing, ready, failed, archived
    
    // File and media details
    table.string('file_url', 500).nullable();
    table.string('thumbnail_url', 500).nullable();
    table.string('original_filename', 200).nullable();
    table.string('mime_type', 100).nullable();
    table.integer('file_size').nullable(); // in bytes
    table.integer('duration_seconds').nullable(); // for videos/audio
    
    // Content metadata
    table.text('transcript').nullable(); // For videos/audio
    table.json('tags').nullable();
    table.json('metadata').nullable(); // Additional content-specific data
    table.string('language', 10).defaultTo('en');
    
    // Access and permissions
    table.boolean('is_public').defaultTo(false);
    table.boolean('requires_completion').defaultTo(false);
    table.integer('access_level').defaultTo(1); // 1=all members, 2=mentors only, 3=admins only
    table.json('access_restrictions').nullable(); // Specific user/role restrictions
    
    // Progress tracking
    table.integer('total_views').defaultTo(0);
    table.integer('completion_count').defaultTo(0);
    table.decimal('average_rating', 3, 2).nullable();
    table.integer('rating_count').defaultTo(0);
    
    // Organization
    table.integer('sort_order').defaultTo(0);
    table.uuid('parent_content_id').nullable().references('id').inTable('learning_content').onDelete('SET NULL');
    table.string('folder_path', 500).nullable(); // For organizing content
    
    // External content
    table.string('external_url', 500).nullable(); // For links to external resources
    table.string('external_platform', 50).nullable(); // youtube, vimeo, etc.
    table.string('external_id', 100).nullable(); // External platform ID
    
    table.timestamps(true, true);
    
    // Indexes
    table.index('project_id');
    table.index('created_by');
    table.index('type');
    table.index('category');
    table.index('status');
    table.index('is_public');
    table.index('parent_content_id');
    table.index('created_at');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('learning_content');
};
