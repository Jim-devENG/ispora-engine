const express = require('express');
const db = require('../database/connection');
const { protect } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// @desc    Get user's current subscription
// @route   GET /api/billing/subscription
// @access  Private
router.get('/subscription', protect, async (req, res, next) => {
  try {
    const subscription = await db('billing_subscriptions')
      .where({ user_id: req.user.id })
      .orderBy('created_at', 'desc')
      .first();

    if (!subscription) {
      // Create free subscription if none exists
      const freeSubscription = await createFreeSubscription(req.user.id);
      return res.status(200).json({
        success: true,
        data: freeSubscription
      });
    }

    res.status(200).json({
      success: true,
      data: subscription
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get user's billing history
// @route   GET /api/billing/invoices
// @access  Private
router.get('/invoices', protect, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    let query = db('billing_invoices')
      .where({ user_id: req.user.id });

    if (status) {
      query = query.where('status', status);
    }

    const invoices = await query
      .orderBy('created_at', 'desc')
      .limit(parseInt(limit))
      .offset(offset);

    const totalCount = await db('billing_invoices')
      .where({ user_id: req.user.id })
      .count('* as count')
      .first();

    res.status(200).json({
      success: true,
      count: invoices.length,
      total: parseInt(totalCount.count),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalCount.count / limit)
      },
      data: invoices
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get specific invoice
// @route   GET /api/billing/invoices/:id
// @access  Private
router.get('/invoices/:id', protect, async (req, res, next) => {
  try {
    const invoice = await db('billing_invoices')
      .where({ id: req.params.id, user_id: req.user.id })
      .first();

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }

    res.status(200).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create new subscription
// @route   POST /api/billing/subscription
// @access  Private
router.post('/subscription', protect, async (req, res, next) => {
  try {
    const {
      plan_name,
      plan_type,
      amount,
      currency = 'USD',
      payment_method,
      external_subscription_id
    } = req.body;

    // Validate required fields
    if (!plan_name || !plan_type || amount === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Plan name, type, and amount are required'
      });
    }

    // Calculate billing period
    const now = new Date();
    const periodStart = now;
    const periodEnd = new Date(now);
    
    if (plan_type === 'monthly') {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else if (plan_type === 'yearly') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else if (plan_type === 'lifetime') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 100); // Effectively lifetime
    }

    // Get plan features
    const planFeatures = getPlanFeatures(plan_name);

    // Cancel existing subscription if any
    await db('billing_subscriptions')
      .where({ user_id: req.user.id, status: 'active' })
      .update({ status: 'canceled' });

    // Create new subscription
    const subscription = await db('billing_subscriptions')
      .insert({
        user_id: req.user.id,
        plan_name,
        plan_type,
        amount,
        currency,
        current_period_start: periodStart,
        current_period_end: periodEnd,
        status: 'active',
        payment_method,
        external_subscription_id,
        ...planFeatures
      })
      .returning('*');

    // Create initial invoice
    const invoice = await createInvoice(req.user.id, subscription[0].id, {
      amount,
      currency,
      description: `${plan_name} subscription - ${plan_type}`,
      items: [{
        description: `${plan_name} subscription`,
        amount: amount,
        quantity: 1
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: {
        subscription: subscription[0],
        invoice
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update subscription
// @route   PUT /api/billing/subscription/:id
// @access  Private
router.put('/subscription/:id', protect, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { plan_name, plan_type, amount, status } = req.body;

    const subscription = await db('billing_subscriptions')
      .where({ id, user_id: req.user.id })
      .first();

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }

    const updateData = {};
    if (plan_name) updateData.plan_name = plan_name;
    if (plan_type) updateData.plan_type = plan_type;
    if (amount !== undefined) updateData.amount = amount;
    if (status) updateData.status = status;

    updateData.updated_at = new Date();

    // Update plan features if plan changed
    if (plan_name && plan_name !== subscription.plan_name) {
      const planFeatures = getPlanFeatures(plan_name);
      Object.assign(updateData, planFeatures);
    }

    await db('billing_subscriptions')
      .where({ id })
      .update(updateData);

    const updatedSubscription = await db('billing_subscriptions')
      .where({ id })
      .first();

    res.status(200).json({
      success: true,
      message: 'Subscription updated successfully',
      data: updatedSubscription
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Cancel subscription
// @route   POST /api/billing/subscription/:id/cancel
// @access  Private
router.post('/subscription/:id/cancel', protect, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cancel_at_period_end = true } = req.body;

    const subscription = await db('billing_subscriptions')
      .where({ id, user_id: req.user.id })
      .first();

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }

    const updateData = {
      status: cancel_at_period_end ? 'active' : 'canceled',
      cancel_at_period_end: cancel_at_period_end ? new Date() : null,
      updated_at: new Date()
    };

    await db('billing_subscriptions')
      .where({ id })
      .update(updateData);

    res.status(200).json({
      success: true,
      message: cancel_at_period_end 
        ? 'Subscription will be canceled at the end of the current period'
        : 'Subscription canceled immediately'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get available plans
// @route   GET /api/billing/plans
// @access  Public
router.get('/plans', async (req, res, next) => {
  try {
    const plans = [
      {
        name: 'free',
        display_name: 'Free',
        description: 'Perfect for getting started',
        monthly_price: 0,
        yearly_price: 0,
        features: {
          max_projects: 5,
          max_mentorships: 10,
          max_connections: 100,
          advanced_analytics: false,
          priority_support: false,
          custom_branding: false
        }
      },
      {
        name: 'premium',
        display_name: 'Premium',
        description: 'For active mentors and professionals',
        monthly_price: 19.99,
        yearly_price: 199.99,
        features: {
          max_projects: 25,
          max_mentorships: 50,
          max_connections: 500,
          advanced_analytics: true,
          priority_support: true,
          custom_branding: false
        }
      },
      {
        name: 'enterprise',
        display_name: 'Enterprise',
        description: 'For organizations and institutions',
        monthly_price: 99.99,
        yearly_price: 999.99,
        features: {
          max_projects: -1, // unlimited
          max_mentorships: -1, // unlimited
          max_connections: -1, // unlimited
          advanced_analytics: true,
          priority_support: true,
          custom_branding: true
        }
      }
    ];

    res.status(200).json({
      success: true,
      data: plans
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update payment method
// @route   PUT /api/billing/payment-method
// @access  Private
router.put('/payment-method', protect, async (req, res, next) => {
  try {
    const { payment_method, external_payment_method_id } = req.body;

    if (!payment_method) {
      return res.status(400).json({
        success: false,
        error: 'Payment method is required'
      });
    }

    // Update all active subscriptions
    await db('billing_subscriptions')
      .where({ user_id: req.user.id, status: 'active' })
      .update({
        payment_method,
        external_payment_method_id,
        updated_at: new Date()
      });

    res.status(200).json({
      success: true,
      message: 'Payment method updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Helper functions
async function createFreeSubscription(userId) {
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setFullYear(periodEnd.getFullYear() + 100); // Effectively lifetime

  const subscription = await db('billing_subscriptions')
    .insert({
      user_id: userId,
      plan_name: 'free',
      plan_type: 'lifetime',
      amount: 0,
      currency: 'USD',
      current_period_start: now,
      current_period_end: periodEnd,
      status: 'active',
      payment_method: 'free',
      max_projects: 5,
      max_mentorships: 10,
      max_connections: 100,
      advanced_analytics: false,
      priority_support: false,
      custom_branding: false
    })
    .returning('*');

  return subscription[0];
}

async function createInvoice(userId, subscriptionId, invoiceData) {
  const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  
  const invoice = await db('billing_invoices')
    .insert({
      user_id: userId,
      subscription_id: subscriptionId,
      invoice_number: invoiceNumber,
      amount: invoiceData.amount,
      total_amount: invoiceData.amount,
      currency: invoiceData.currency,
      status: 'paid', // Assuming immediate payment for simplicity
      due_date: new Date(),
      paid_at: new Date(),
      items: JSON.stringify(invoiceData.items)
    })
    .returning('*');

  return invoice[0];
}

function getPlanFeatures(planName) {
  const planFeatures = {
    free: {
      max_projects: 5,
      max_mentorships: 10,
      max_connections: 100,
      advanced_analytics: false,
      priority_support: false,
      custom_branding: false
    },
    premium: {
      max_projects: 25,
      max_mentorships: 50,
      max_connections: 500,
      advanced_analytics: true,
      priority_support: true,
      custom_branding: false
    },
    enterprise: {
      max_projects: -1, // unlimited
      max_mentorships: -1, // unlimited
      max_connections: -1, // unlimited
      advanced_analytics: true,
      priority_support: true,
      custom_branding: true
    }
  };

  return planFeatures[planName] || planFeatures.free;
}

module.exports = router;
