/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('referrals', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('referrer_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('referred_id').nullable().references('id').inTable('users').onDelete('SET NULL');
    
    // Referral details
    table.string('referral_code').notNullable();
    table.string('email').nullable(); // Email of referred person if not yet registered
    table.string('status').defaultTo('pending'); // pending, completed, expired, cancelled
    
    // Tracking
    table.string('source').nullable(); // social_media, email, direct_link, etc.
    table.string('campaign').nullable(); // Referral campaign name
    table.json('metadata').nullable(); // Additional referral data
    
    // Rewards
    table.integer('referrer_points').defaultTo(0);
    table.integer('referred_points').defaultTo(0);
    table.boolean('referrer_rewarded').defaultTo(false);
    table.boolean('referred_rewarded').defaultTo(false);
    table.timestamp('referrer_rewarded_at').nullable();
    table.timestamp('referred_rewarded_at').nullable();
    
    // Dates
    table.timestamp('referral_date').defaultTo(knex.fn.now());
    table.timestamp('completion_date').nullable();
    table.timestamp('expiry_date').nullable();
    
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Ensure unique referral code
    table.unique(['referral_code']);
    
    // Indexes
    table.index(['referrer_id']);
    table.index(['referred_id']);
    table.index(['referral_code']);
    table.index(['email']);
    table.index(['status']);
    table.index(['referral_date']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('referrals');
};
