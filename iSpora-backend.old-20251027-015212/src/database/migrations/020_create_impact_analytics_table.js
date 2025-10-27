exports.up = function(knex) {
  return knex.schema.createTable('impact_analytics', function(table) {
    table.uuid('id').primary();
    table.uuid('user_id').nullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('project_id').nullable().references('id').inTable('projects').onDelete('CASCADE');
    
    // Analytics period
    table.date('period_start').notNullable();
    table.date('period_end').notNullable();
    table.string('period_type', 20).notNullable(); // daily, weekly, monthly, quarterly, yearly
    table.string('analytics_type', 50).notNullable(); // user_impact, project_impact, global_impact
    
    // Aggregated metrics
    table.integer('total_metrics').defaultTo(0);
    table.integer('active_metrics').defaultTo(0);
    table.integer('completed_metrics').defaultTo(0);
    table.integer('total_stories').defaultTo(0);
    table.integer('published_stories').defaultTo(0);
    table.integer('verified_stories').defaultTo(0);
    
    // Impact scores and ratings
    table.decimal('average_impact_score', 3, 1).nullable();
    table.decimal('total_impact_score', 10, 2).nullable();
    table.integer('impact_rating').nullable(); // 1-5 scale
    
    // Beneficiaries and reach
    table.integer('total_beneficiaries').defaultTo(0);
    table.integer('unique_beneficiaries').defaultTo(0);
    table.integer('geographic_reach').defaultTo(0); // Number of locations
    
    // Engagement metrics
    table.integer('total_views').defaultTo(0);
    table.integer('total_likes').defaultTo(0);
    table.integer('total_shares').defaultTo(0);
    table.integer('total_comments').defaultTo(0);
    table.decimal('engagement_rate', 5, 2).nullable(); // Percentage
    
    // Category breakdown
    table.json('category_breakdown').nullable(); // Impact by category
    table.json('geographic_breakdown').nullable(); // Impact by location
    table.json('timeline_data').nullable(); // Time-series data
    
    // Trends and comparisons
    table.decimal('growth_rate', 5, 2).nullable(); // Percentage change
    table.decimal('previous_period_score', 3, 1).nullable();
    table.json('trend_analysis').nullable(); // Trend data and insights
    
    // Quality metrics
    table.decimal('verification_rate', 5, 2).nullable(); // Percentage of verified content
    table.decimal('data_quality_score', 3, 1).nullable(); // 1-10 scale
    table.integer('high_quality_stories').defaultTo(0);
    
    // Generated insights
    table.text('key_insights').nullable(); // AI-generated insights
    table.json('recommendations').nullable(); // Improvement recommendations
    table.json('achievements').nullable(); // Notable achievements
    
    table.timestamps(true, true);
    
    // Indexes
    table.index('user_id');
    table.index('project_id');
    table.index('period_start');
    table.index('period_end');
    table.index('period_type');
    table.index('analytics_type');
    table.index('created_at');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('impact_analytics');
};
