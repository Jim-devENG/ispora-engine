exports.up = function(knex) {
  return knex.schema.createTable('sessions', function(table) {
    table.string('id').primary();
    table.string('user_id').notNullable();
    table.string('session_token').unique().notNullable();
    table.string('ip_address');
    table.string('user_agent');
    table.boolean('is_active').defaultTo(true);
    table.timestamp('expires_at').notNullable();
    table.timestamp('last_activity');
    table.timestamps(true, true);
    
    // Foreign key
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    
    // Indexes
    table.index('user_id');
    table.index('session_token');
    table.index('is_active');
    table.index('expires_at');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('sessions');
};
