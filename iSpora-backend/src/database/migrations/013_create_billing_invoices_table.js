exports.up = function(knex) {
  return knex.schema.createTable('billing_invoices', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('lower(hex(randomblob(16)))'));
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
    
    // Payment details
    table.string('payment_method', 50).nullable();
    table.string('transaction_id', 100).nullable();
    table.text('notes').nullable();
    
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