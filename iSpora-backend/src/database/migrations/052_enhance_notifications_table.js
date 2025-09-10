exports.up = function(knex) {
  return knex.schema.alterTable('notifications', table => {
    // Add new columns for enhanced functionality
    table.string('category_id').references('id').inTable('notification_categories').onDelete('SET NULL');
    table.string('template_id').references('id').inTable('notification_templates').onDelete('SET NULL');
    table.uuid('batch_id').references('id').inTable('notification_batches').onDelete('SET NULL');
    table.json('metadata'); // Enhanced metadata for notifications
    table.boolean('action_required').defaultTo(false);
    table.string('avatar_url'); // Avatar for notification display
    table.string('related_entity_type'); // Type of related entity (project, opportunity, etc.)
    table.uuid('related_entity_id'); // ID of related entity
    table.json('action_data'); // Enhanced action data structure
    table.timestamp('read_at'); // When notification was read
    table.timestamp('clicked_at'); // When notification was clicked
    table.timestamp('dismissed_at'); // When notification was dismissed
    table.integer('click_count').defaultTo(0); // Number of times clicked
    table.boolean('is_archived').defaultTo(false); // Archive status
    table.string('source'); // Source of notification (system, user, automated, etc.)
    
    // Add indexes for new columns
    table.index(['category_id']);
    table.index(['template_id']);
    table.index(['batch_id']);
    table.index(['action_required']);
    table.index(['related_entity_type', 'related_entity_id']);
    table.index(['read_at']);
    table.index(['is_archived']);
    table.index(['source']);
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('notifications', table => {
    // Remove the added columns
    table.dropColumn('category_id');
    table.dropColumn('template_id');
    table.dropColumn('batch_id');
    table.dropColumn('metadata');
    table.dropColumn('action_required');
    table.dropColumn('avatar_url');
    table.dropColumn('related_entity_type');
    table.dropColumn('related_entity_id');
    table.dropColumn('action_data');
    table.dropColumn('read_at');
    table.dropColumn('clicked_at');
    table.dropColumn('dismissed_at');
    table.dropColumn('click_count');
    table.dropColumn('is_archived');
    table.dropColumn('source');
  });
};
