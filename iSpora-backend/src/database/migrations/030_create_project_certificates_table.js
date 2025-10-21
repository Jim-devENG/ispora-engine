exports.up = function(knex) {
  return knex.schema.createTable('project_certificates', function(table) {
    table.uuid('id').primary();
    table.uuid('project_id').notNullable().references('id').inTable('projects').onDelete('CASCADE');
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('issued_by').notNullable().references('id').inTable('users').onDelete('CASCADE');
    
    // Certificate details
    table.string('title', 200).notNullable();
    table.text('description').nullable();
    table.string('type', 30).notNullable(); // completion, achievement, skill, participation
    table.string('level', 20).nullable(); // beginner, intermediate, advanced, expert
    table.string('status', 20).defaultTo('issued'); // issued, revoked, expired
    
    // Requirements and criteria
    table.text('requirements').nullable();
    table.json('criteria_met').nullable(); // Array of criteria that were met
    table.decimal('score', 5, 2).nullable(); // Final score if applicable
    table.decimal('passing_score', 5, 2).nullable();
    
    // Dates
    table.timestamp('issued_date').defaultTo(knex.fn.now();
    table.timestamp('expiry_date').nullable();
    table.timestamp('revoked_date').nullable();
    table.text('revocation_reason').nullable();
    
    // Certificate content
    table.string('certificate_url', 500).nullable(); // Link to generated certificate
    table.string('certificate_number', 100).nullable();
    table.text('certificate_text').nullable(); // Full certificate text
    table.json('metadata').nullable(); // Additional certificate data
    
    // Verification
    table.string('verification_code', 50).nullable(); // Unique verification code
    table.boolean('is_verified').defaultTo(false);
    table.timestamp('verified_at').nullable();
    table.string('verification_method', 50).nullable();
    
    // Sharing and visibility
    table.boolean('is_public').defaultTo(true);
    table.boolean('allow_sharing').defaultTo(true);
    table.json('shared_platforms').nullable(); // LinkedIn, etc.
    table.integer('share_count').defaultTo(0);
    
    // Skills and competencies
    table.json('skills_earned').nullable(); // Array of skills demonstrated
    table.json('competencies').nullable(); // Competency framework data
    table.integer('credits_earned').nullable(); // Academic or professional credits
    
    // Digital badge
    table.string('badge_url', 500).nullable();
    table.json('badge_metadata').nullable(); // Open Badges standard data
    
    table.timestamps(true, true);
    
    // Ensure unique certificate per user per project
    table.unique(['project_id', 'user_id', 'type']);
    
    // Indexes
    table.index('project_id');
    table.index('user_id');
    table.index('issued_by');
    table.index('type');
    table.index('status');
    table.index('issued_date');
    table.index('verification_code');
    table.index('is_public');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('project_certificates');
};
