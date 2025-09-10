exports.up = function(knex) {
  return knex.schema.createTable('project_tasks', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('project_id').notNullable().references('id').inTable('projects').onDelete('CASCADE');
    table.uuid('created_by').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('assigned_to').nullable().references('id').inTable('users').onDelete('SET NULL');
    
    // Task details
    table.string('title', 200).notNullable();
    table.text('description').nullable();
    table.string('status', 20).defaultTo('todo'); // todo, in-progress, done, cancelled
    table.string('priority', 10).defaultTo('medium'); // low, medium, high, urgent
    table.string('type', 30).nullable(); // task, milestone, bug, feature, research
    
    // Dates
    table.timestamp('assigned_date').defaultTo(knex.fn.now());
    table.timestamp('due_date').nullable();
    table.timestamp('completed_date').nullable();
    table.timestamp('started_date').nullable();
    
    // Progress and estimation
    table.integer('progress_percentage').defaultTo(0);
    table.integer('estimated_hours').nullable();
    table.integer('actual_hours').nullable();
    
    // Task hierarchy
    table.uuid('parent_task_id').nullable().references('id').inTable('project_tasks').onDelete('SET NULL');
    table.integer('sort_order').defaultTo(0);
    
    // Additional metadata
    table.json('tags').nullable();
    table.json('custom_fields').nullable(); // For project-specific fields
    table.boolean('is_milestone').defaultTo(false);
    table.boolean('is_blocked').defaultTo(false);
    table.text('blocking_reason').nullable();
    
    // Dependencies
    table.json('dependencies').nullable(); // Array of task IDs this task depends on
    
    table.timestamps(true, true);
    
    // Indexes
    table.index('project_id');
    table.index('created_by');
    table.index('assigned_to');
    table.index('status');
    table.index('priority');
    table.index('due_date');
    table.index('parent_task_id');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('project_tasks');
};
