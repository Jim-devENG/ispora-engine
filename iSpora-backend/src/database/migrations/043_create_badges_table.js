/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('badges', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))'));
    
    // Badge details
    table.string('name').notNullable();
    table.text('description').notNullable();
    table.string('icon_name').notNullable(); // Lucide icon name
    table.string('color').notNullable(); // CSS color class
    table.string('text_color').notNullable();
    table.string('bg_color').notNullable();
    table.string('border_color').notNullable();
    
    // Requirements
    table.text('requirement').notNullable();
    table.integer('points_required').defaultTo(0);
    table.json('criteria').notNullable(); // Array of criteria objects
    
    // Badge properties
    table.enum('rarity', ['common', 'uncommon', 'rare', 'epic', 'legendary']).defaultTo('common');
    table.boolean('is_active').defaultTo(true);
    table.boolean('is_automatic').defaultTo(true); // Auto-awarded or manual
    table.integer('sort_order').defaultTo(0);
    
    // Category and tags
    table.string('category').nullable(); // builder, innovator, connector, etc.
    table.json('tags').nullable(); // Array of tags
    
    // Visual elements
    table.string('badge_url').nullable(); // URL to badge image
    table.json('badge_metadata').nullable(); // Additional badge data
    
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Indexes
    table.index(['rarity']);
    table.index(['category']);
    table.index(['is_active']);
    table.index(['is_automatic']);
    table.index(['sort_order']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('badges');
};
