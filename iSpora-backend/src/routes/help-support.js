const express = require('express');
const db = require('../database/connection');
const { protect, authorize } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// @desc    Get help and support dashboard
// @route   GET /api/help-support
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    // Get user's tickets
    const userTickets = await db('help_support_tickets')
      .where({ user_id: req.user.id })
      .orderBy('created_at', 'desc')
      .limit(5);

    // Get ticket counts by status
    const ticketStats = await db('help_support_tickets')
      .where({ user_id: req.user.id })
      .select('status')
      .count('* as count')
      .groupBy('status');

    // Get FAQ categories
    const faqCategories = await getFAQCategories();

    res.status(200).json({
      success: true,
      data: {
        recent_tickets: userTickets,
        ticket_stats: ticketStats,
        faq_categories: faqCategories
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get support tickets
// @route   GET /api/help-support/tickets
// @access  Private
router.get('/tickets', protect, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, category, priority } = req.query;
    const offset = (page - 1) * limit;

    let query = db('help_support_tickets')
      .where({ user_id: req.user.id });

    if (status) {
      query = query.where('status', status);
    }

    if (category) {
      query = query.where('category', category);
    }

    if (priority) {
      query = query.where('priority', priority);
    }

    const tickets = await query
      .orderBy('created_at', 'desc')
      .limit(parseInt(limit))
      .offset(offset);

    const totalCount = await db('help_support_tickets')
      .where({ user_id: req.user.id })
      .count('* as count')
      .first();

    res.status(200).json({
      success: true,
      count: tickets.length,
      total: parseInt(totalCount.count),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalCount.count / limit)
      },
      data: tickets
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get specific ticket
// @route   GET /api/help-support/tickets/:id
// @access  Private
router.get('/tickets/:id', protect, async (req, res, next) => {
  try {
    const ticket = await db('help_support_tickets')
      .where({ id: req.params.id, user_id: req.user.id })
      .first();

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    // Get ticket messages
    const messages = await db('help_support_messages')
      .select([
        'hsm.*',
        'u.first_name',
        'u.last_name',
        'u.avatar_url'
      ])
      .leftJoin('users as u', 'hsm.user_id', 'u.id')
      .where('hsm.ticket_id', req.params.id)
      .orderBy('hsm.created_at', 'asc');

    res.status(200).json({
      success: true,
      data: {
        ticket,
        messages
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create new support ticket
// @route   POST /api/help-support/tickets
// @access  Private
router.post('/tickets', protect, async (req, res, next) => {
  try {
    const {
      subject,
      description,
      category,
      priority = 'medium',
      attachments = [],
      tags = []
    } = req.body;

    if (!subject || !description || !category) {
      return res.status(400).json({
        success: false,
        error: 'Subject, description, and category are required'
      });
    }

    // Generate ticket number
    const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Get browser and device info from request
    const browserInfo = req.get('User-Agent');
    const deviceInfo = req.get('X-Device-Info') || 'Unknown';

    const ticket = await db('help_support_tickets')
      .insert({
        user_id: req.user.id,
        ticket_number: ticketNumber,
        subject,
        description,
        category,
        priority,
        attachments: JSON.stringify(attachments),
        tags: JSON.stringify(tags),
        browser_info: browserInfo,
        device_info: deviceInfo
      })
      .returning('*');

    // Create initial message
    await db('help_support_messages')
      .insert({
        ticket_id: ticket[0].id,
        user_id: req.user.id,
        message: description,
        message_type: 'text'
      });

    res.status(201).json({
      success: true,
      message: 'Support ticket created successfully',
      data: ticket[0]
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Add message to ticket
// @route   POST /api/help-support/tickets/:id/messages
// @access  Private
router.post('/tickets/:id/messages', protect, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message, attachments = [] } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Verify ticket belongs to user
    const ticket = await db('help_support_tickets')
      .where({ id, user_id: req.user.id })
      .first();

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    // Add message
    const newMessage = await db('help_support_messages')
      .insert({
        ticket_id: id,
        user_id: req.user.id,
        message,
        message_type: 'text',
        attachments: JSON.stringify(attachments)
      })
      .returning('*');

    // Update ticket status if it was resolved/closed
    if (ticket.status === 'resolved' || ticket.status === 'closed') {
      await db('help_support_tickets')
        .where({ id })
        .update({
          status: 'open',
          updated_at: new Date()
        });
    }

    res.status(201).json({
      success: true,
      message: 'Message added successfully',
      data: newMessage[0]
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update ticket
// @route   PUT /api/help-support/tickets/:id
// @access  Private
router.put('/tickets/:id', protect, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { subject, priority, tags } = req.body;

    const ticket = await db('help_support_tickets')
      .where({ id, user_id: req.user.id })
      .first();

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    const updateData = {};
    if (subject) updateData.subject = subject;
    if (priority) updateData.priority = priority;
    if (tags) updateData.tags = JSON.stringify(tags);

    updateData.updated_at = new Date();

    await db('help_support_tickets')
      .where({ id })
      .update(updateData);

    const updatedTicket = await db('help_support_tickets')
      .where({ id })
      .first();

    res.status(200).json({
      success: true,
      message: 'Ticket updated successfully',
      data: updatedTicket
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Rate ticket satisfaction
// @route   POST /api/help-support/tickets/:id/rate
// @access  Private
router.post('/tickets/:id/rate', protect, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, feedback } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }

    const ticket = await db('help_support_tickets')
      .where({ id, user_id: req.user.id })
      .first();

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    await db('help_support_tickets')
      .where({ id })
      .update({
        satisfaction_rating: rating,
        satisfaction_feedback: feedback,
        updated_at: new Date()
      });

    res.status(200).json({
      success: true,
      message: 'Rating submitted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get FAQ categories and questions
// @route   GET /api/help-support/faq
// @access  Public
router.get('/faq', async (req, res, next) => {
  try {
    const { category } = req.query;

    const faqCategories = await getFAQCategories();
    
    if (category) {
      const categoryData = faqCategories.find(cat => cat.slug === category);
      if (!categoryData) {
        return res.status(404).json({
          success: false,
          error: 'FAQ category not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: categoryData
      });
    }

    res.status(200).json({
      success: true,
      data: faqCategories
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Search FAQ
// @route   GET /api/help-support/faq/search
// @access  Public
router.get('/faq/search', async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const faqCategories = await getFAQCategories();
    const searchResults = [];

    faqCategories.forEach(category => {
      category.questions.forEach(question => {
        if (question.question.toLowerCase().includes(q.toLowerCase()) ||
            question.answer.toLowerCase().includes(q.toLowerCase())) {
          searchResults.push({
            category: category.name,
            category_slug: category.slug,
            ...question
          });
        }
      });
    });

    res.status(200).json({
      success: true,
      count: searchResults.length,
      data: searchResults
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get contact information
// @route   GET /api/help-support/contact
// @access  Public
router.get('/contact', async (req, res, next) => {
  try {
    const contactInfo = {
      email: 'support@aspora.com',
      phone: '+1 (555) 123-4567',
      address: {
        street: '123 Innovation Drive',
        city: 'San Francisco',
        state: 'CA',
        zip: '94105',
        country: 'United States'
      },
      hours: {
        monday_friday: '9:00 AM - 6:00 PM PST',
        saturday: '10:00 AM - 4:00 PM PST',
        sunday: 'Closed'
      },
      social_media: {
        twitter: '@AsporaSupport',
        linkedin: 'linkedin.com/company/aspora',
        facebook: 'facebook.com/aspora'
      }
    };

    res.status(200).json({
      success: true,
      data: contactInfo
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Submit contact form
// @route   POST /api/help-support/contact
// @access  Public
router.post('/contact', async (req, res, next) => {
  try {
    const {
      name,
      email,
      subject,
      message,
      category = 'general'
    } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, subject, and message are required'
      });
    }

    // In a real app, you would send an email or create a ticket
    // For now, we'll just return success
    res.status(200).json({
      success: true,
      message: 'Contact form submitted successfully. We will get back to you soon.'
    });
  } catch (error) {
    next(error);
  }
});

// Admin routes for support staff
// @desc    Get all tickets (admin)
// @route   GET /api/help-support/admin/tickets
// @access  Private (Admin)
router.get('/admin/tickets', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, category, priority, assigned_to } = req.query;
    const offset = (page - 1) * limit;

    let query = db('help_support_tickets as hst')
      .select([
        'hst.*',
        'u.first_name',
        'u.last_name',
        'u.email',
        'assigned.first_name as assigned_first_name',
        'assigned.last_name as assigned_last_name'
      ])
      .leftJoin('users as u', 'hst.user_id', 'u.id')
      .leftJoin('users as assigned', 'hst.assigned_to', 'assigned.id');

    if (status) query = query.where('hst.status', status);
    if (category) query = query.where('hst.category', category);
    if (priority) query = query.where('hst.priority', priority);
    if (assigned_to) query = query.where('hst.assigned_to', assigned_to);

    const tickets = await query
      .orderBy('hst.created_at', 'desc')
      .limit(parseInt(limit))
      .offset(offset);

    const totalCount = await db('help_support_tickets')
      .count('* as count')
      .first();

    res.status(200).json({
      success: true,
      count: tickets.length,
      total: parseInt(totalCount.count),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalCount.count / limit)
      },
      data: tickets
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Assign ticket (admin)
// @route   PUT /api/help-support/admin/tickets/:id/assign
// @access  Private (Admin)
router.put('/admin/tickets/:id/assign', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { assigned_to } = req.body;

    const ticket = await db('help_support_tickets')
      .where({ id })
      .first();

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    await db('help_support_tickets')
      .where({ id })
      .update({
        assigned_to,
        updated_at: new Date()
      });

    res.status(200).json({
      success: true,
      message: 'Ticket assigned successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Helper functions
async function getFAQCategories() {
  // In a real app, this would come from a database
  return [
    {
      name: 'Getting Started',
      slug: 'getting-started',
      description: 'Learn how to get started with Aspora',
      questions: [
        {
          id: 1,
          question: 'How do I create an account?',
          answer: 'You can create an account by clicking the "Sign Up" button on our homepage and following the registration process.'
        },
        {
          id: 2,
          question: 'What is the difference between Diaspora and Local user types?',
          answer: 'Diaspora users are professionals living abroad who want to mentor youth back home. Local users are students and young professionals seeking mentorship and opportunities.'
        }
      ]
    },
    {
      name: 'Account & Profile',
      slug: 'account-profile',
      description: 'Manage your account and profile settings',
      questions: [
        {
          id: 3,
          question: 'How do I update my profile information?',
          answer: 'Go to your profile page and click the "Edit Profile" button to update your information.'
        },
        {
          id: 4,
          question: 'Can I change my user type after registration?',
          answer: 'Yes, you can switch between Diaspora and Local user types at any time from your settings.'
        }
      ]
    },
    {
      name: 'Mentorship',
      slug: 'mentorship',
      description: 'Everything about mentorship features',
      questions: [
        {
          id: 5,
          question: 'How do I find a mentor?',
          answer: 'Use the search function to find mentors by expertise, location, or other criteria. Send connection requests to start mentorship relationships.'
        },
        {
          id: 6,
          question: 'What are the expectations for mentors?',
          answer: 'Mentors should be committed to helping mentees grow professionally and personally through regular communication and guidance.'
        }
      ]
    },
    {
      name: 'Projects',
      slug: 'projects',
      description: 'Working with projects and collaborations',
      questions: [
        {
          id: 7,
          question: 'How do I create a project?',
          answer: 'Go to the Projects section and click "Create New Project" to start your own initiative.'
        },
        {
          id: 8,
          question: 'Can I join multiple projects?',
          answer: 'Yes, you can join multiple projects based on your subscription plan limits.'
        }
      ]
    },
    {
      name: 'Billing & Subscriptions',
      slug: 'billing',
      description: 'Payment and subscription information',
      questions: [
        {
          id: 9,
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit cards, PayPal, and bank transfers.'
        },
        {
          id: 10,
          question: 'Can I cancel my subscription anytime?',
          answer: 'Yes, you can cancel your subscription at any time from your billing settings.'
        }
      ]
    }
  ];
}

module.exports = router;
