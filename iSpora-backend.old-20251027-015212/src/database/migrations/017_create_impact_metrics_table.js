exports.up = function(knex) {
  return knex.schema.createTable('impact_metrics', function(table) {
    table.uuid('id').primary();
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('project_id').nullable().references('id').inTable('projects').onDelete('CASCADE');
    
    // Metric details
    table.string('name', 100).notNullable();
    table.text('description').nullable();
    table.string('category', 50).notNullable(); // education, health, economic, social, environment, technology
    table.string('type', 30).notNullable(); // quantitative, qualitative, mixed
    table.string('unit', 50).nullable(); // people, hours, percentage, dollars, etc.
    
    // Measurement details
    table.decimal('baseline_value', 15, 2).nullable();
    table.decimal('target_value', 15, 2).nullable();
    table.decimal('current_value', 15, 2).nullable();
    table.decimal('achieved_value', 15, 2).nullable();
    
    // Status and tracking
    table.string('status', 20).defaultTo('active'); // active, completed, paused, archived
    table.date('measurement_date').nullable();
    table.date('target_date').nullable();
    table.date('completion_date').nullable();
    
    // Additional metadata
    table.json('measurement_method').nullable(); // How the metric is measured
    table.json('data_sources').nullable(); // Sources of data
    table.json('tags').nullable(); // Array of tags for categorization
    table.boolean('is_public').defaultTo(false);
    table.boolean('is_verified').defaultTo(false);
    table.uuid('verified_by').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('verified_at').nullable();
    
    // Impact assessment
    table.integer('impact_score').nullable(); // 1-10 scale
    table.text('impact_description').nullable();
    table.json('beneficiaries').nullable(); // Who benefits from this metric
    
    table.timestamps(true, true);
    
    // Indexes
    table.index('user_id');
    table.index('project_id');
    table.index('category');
    table.index('status');
    table.index('is_public');
    table.index('created_at');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('impact_metrics');
};
