exports.up = function(knex) {
  return knex.schema.createTable('impact_measurements', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))'));
    table.uuid('metric_id').notNullable().references('id').inTable('impact_metrics').onDelete('CASCADE');
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    
    // Measurement details
    table.decimal('value', 15, 2).notNullable();
    table.string('unit', 50).nullable();
    table.date('measurement_date').notNullable();
    table.timestamp('recorded_at').defaultTo(knex.fn.now());
    
    // Data quality and source
    table.string('data_source', 100).nullable(); // How the data was collected
    table.string('collection_method', 100).nullable(); // Survey, observation, etc.
    table.text('notes').nullable(); // Additional context
    table.json('raw_data').nullable(); // Original data if available
    
    // Validation and verification
    table.boolean('is_verified').defaultTo(false);
    table.uuid('verified_by').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('verified_at').nullable();
    table.text('verification_notes').nullable();
    
    // Quality indicators
    table.integer('confidence_level').nullable(); // 1-5 scale
    table.string('data_quality', 20).nullable(); // high, medium, low
    table.boolean('is_estimate').defaultTo(false);
    table.decimal('margin_of_error', 5, 2).nullable(); // Percentage
    
    // Context and metadata
    table.json('context').nullable(); // Additional context data
    table.json('tags').nullable(); // Tags for categorization
    table.string('season', 20).nullable(); // For seasonal measurements
    table.string('period_type', 20).nullable(); // daily, weekly, monthly, yearly
    
    table.timestamps(true, true);
    
    // Indexes
    table.index('metric_id');
    table.index('user_id');
    table.index('measurement_date');
    table.index('recorded_at');
    table.index('is_verified');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('impact_measurements');
};
