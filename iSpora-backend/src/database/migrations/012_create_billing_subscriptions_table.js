exports.up = function(knex) {
  return knex.schema.createTable('billing_subscriptions', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    
    // Subscription details
    table.string('plan_name', 50).notNullable(); // free, premium, enterprise
    table.string('plan_type', 20).notNullable(); // monthly, yearly, lifetime
    table.decimal('amount', 10, 2).notNullable().defaultTo(0);
    table.string('currency', 3).defaultTo('USD');
    
    // Billing cycle
    table.timestamp('current_period_start').notNullable();
    table.timestamp('current_period_end').notNullable();
    table.timestamp('cancel_at_period_end').nullable();
    
    // Status
    table.string('status', 20).notNullable().defaultTo('active'); // active, canceled, past_due, unpaid
    table.string('payment_method', 50).nullable(); // stripe, paypal, etc.
    table.string('external_subscription_id', 100).nullable(); // Stripe subscription ID
    
    // Features and limits
    table.integer('max_projects').defaultTo(5);
    table.integer('max_mentorships').defaultTo(10);
    table.integer('max_connections').defaultTo(100);
    table.boolean('advanced_analytics').defaultTo(false);
    table.boolean('priority_support').defaultTo(false);
    table.boolean('custom_branding').defaultTo(false);
    
    table.timestamps(true, true);
    
    // Index for user lookups
    table.index('user_id');
    table.index('status');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('billing_subscriptions');
};
