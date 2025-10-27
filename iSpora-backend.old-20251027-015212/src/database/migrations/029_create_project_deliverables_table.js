exports.up = function(knex) {
  return knex.schema.createTable('project_deliverables', function(table) {
    table.uuid('id').primary();
    table.uuid('project_id').notNullable().references('id').inTable('projects').onDelete('CASCADE');
    table.uuid('created_by').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('assigned_to').nullable().references('id').inTable('users').onDelete('SET NULL');
    
    // Deliverable details
    table.string('title', 200).notNullable();
    table.text('description').nullable();
    table.string('type', 30).notNullable(); // document, presentation, code, design, report, video, etc.
    table.string('status', 20).defaultTo('pending'); // pending, in-progress, submitted, reviewed, approved, rejected
    
    // Requirements and specifications
    table.text('requirements').nullable();
    table.text('acceptance_criteria').nullable();
    table.json('specifications').nullable(); // Technical specifications
    table.string('format', 50).nullable(); // PDF, DOCX, MP4, etc.
    table.integer('max_file_size_mb').nullable();
    
    // Dates and deadlines
    table.timestamp('assigned_date').defaultTo(knex.fn.now();
    table.timestamp('due_date').nullable();
    table.timestamp('submitted_date').nullable();
    table.timestamp('reviewed_date').nullable();
    
    // Submission details
    table.string('submission_url', 500).nullable();
    table.string('submission_filename', 200).nullable();
    table.integer('submission_file_size').nullable();
    table.string('submission_mime_type', 100).nullable();
    table.text('submission_notes').nullable();
    
    // Review and feedback
    table.uuid('reviewed_by').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.text('reviewer_feedback').nullable();
    table.integer('review_score').nullable(); // 1-10 scale
    table.json('review_criteria_scores').nullable(); // Detailed scoring
    table.boolean('requires_revision').defaultTo(false);
    table.text('revision_notes').nullable();
    
    // Version control
    table.integer('version').defaultTo(1);
    table.uuid('parent_deliverable_id').nullable().references('id').inTable('project_deliverables').onDelete('SET NULL');
    table.json('version_history').nullable(); // Array of version details
    
    // Additional metadata
    table.json('tags').nullable();
    table.json('custom_fields').nullable();
    table.boolean('is_template').defaultTo(false);
    table.boolean('is_mandatory').defaultTo(true);
    table.integer('weight').defaultTo(1); // For weighted grading
    
    table.timestamps(true, true);
    
    // Indexes
    table.index('project_id');
    table.index('created_by');
    table.index('assigned_to');
    table.index('status');
    table.index('type');
    table.index('due_date');
    table.index('reviewed_by');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('project_deliverables');
};
