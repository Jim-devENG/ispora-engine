exports.up = function(knex) {
  return knex.schema.createTable('project_members', table => {
    table.uuid('id').primary().defaultTo(knex.raw('(lower(hex(randomblob(4))) || \'-\' || lower(hex(randomblob(2))) || \'-4\' || substr(lower(hex(randomblob(2))),2) || \'-\' || substr(\'89ab\',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || \'-\' || lower(hex(randomblob(6))))'));
    table.uuid('project_id').references('id').inTable('projects').onDelete('CASCADE');
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.enu('role', ['owner', 'admin', 'mentor', 'member', 'contributor']).defaultTo('member');
    table.enu('status', ['active', 'invited', 'declined', 'removed']).defaultTo('invited');
    table.text('bio'); // Member bio for this project
    table.json('skills'); // Skills they bring to this project
    table.integer('hours_contributed').defaultTo(0);
    table.text('responsibilities');
    table.timestamp('joined_at');
    table.timestamp('last_active');
    table.timestamps(true, true);
    
    // Indexes
    table.index(['project_id']);
    table.index(['user_id']);
    table.index(['status']);
    table.unique(['project_id', 'user_id']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('project_members');
};
