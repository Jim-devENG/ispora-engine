exports.up = function(knex) {
  return knex.schema.createTable('task_comments', function(table) {
    table.uuid('id').primary();
    table.uuid('task_id').notNullable().references('id').inTable('project_tasks').onDelete('CASCADE');
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('parent_comment_id').nullable().references('id').inTable('task_comments').onDelete('CASCADE');
    
    // Comment content
    table.text('content').notNullable();
    table.string('type', 20).defaultTo('comment'); // comment, status_update, mention, system
    table.boolean('is_internal').defaultTo(false); // Internal comments not visible to all
    
    // Mentions and notifications
    table.json('mentions').nullable(); // Array of user IDs mentioned
    table.boolean('notify_assignee').defaultTo(false);
    table.boolean('notify_creator').defaultTo(false);
    
    // Attachments
    table.json('attachments').nullable(); // Array of file objects
    
    // Status updates
    table.string('old_status', 20).nullable();
    table.string('new_status', 20).nullable();
    table.string('old_priority', 10).nullable();
    table.string('new_priority', 10).nullable();
    
    // Engagement
    table.integer('likes_count').defaultTo(0);
    table.boolean('is_edited').defaultTo(false);
    table.timestamp('edited_at').nullable();
    
    table.timestamps(true, true);
    
    // Indexes
    table.index('task_id');
    table.index('user_id');
    table.index('parent_comment_id');
    table.index('type');
    table.index('created_at');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('task_comments');
};
