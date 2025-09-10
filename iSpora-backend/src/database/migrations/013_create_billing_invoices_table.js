exports.up = function(knex) {
  return knex.schema.createTable('billing_invoices', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('subscription_id').nullable().references('id').inTable('billing_subscriptions').onDelete('SET NULL');
    
    // Invoice details
    table.string('invoice_number', 50).notNullable().unique();
    table.decimal('amount', 10, 2).notNullable();
    table.decimal('tax_amount', 10, 2).defaultTo(0);
    table.decimal('total_amount', 10, 2).notNullable();
    table.string('currency', 3).defaultTo('USD');
    
    // Status and dates
    table.string('status', 20).notNullable().defaultTo('pending'); // pending, paid, failed, refunded
    table.timestamp('due_date').notNullable();
    table.timestamp('paid_at').nullable();
    
    // External references
    table.string('external_invoice_id', 100).nullable(); // Stripe invoice ID
    table.string('payment_intent_id', 100).nullable(); // Stripe payment intent ID
    
    // Invoice items (stored as JSON for flexibility)
    table.json('items').nullable();
    
    // Billing address
    table.string('billing_name').nullable();
    table.string('billing_email').nullable();
    table.text('billing_address').nullable();
    table.string('billing_city').nullable();
    table.string('billing_state').nullable();
    table.string('billing_country').nullable();
    table.string('billing_postal_code').nullable();
    
    table.timestamps(true, true);
    
    // Indexes
    table.index('user_id');
    table.index('subscription_id');
    table.index('status');
    table.index('due_date');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('billing_invoices');
};
