const express = require('express');
const knex = require('../database/connection');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// Get applications for a specific opportunity (admin/owner only)
router.get('/opportunity/:opportunityId', protect, async (req, res) => {
  try {
    const { opportunityId } = req.params;
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    // Check if user owns the opportunity or is admin
    const opportunity = await knex('opportunities').where('id', opportunityId).first();

    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    if (opportunity.posted_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to view applications' });
    }

    let query = knex('opportunity_applications')
      .select(
        'opportunity_applications.*',
        'users.first_name',
        'users.last_name',
        'users.username',
        'users.email',
        'users.avatar_url',
        'users.title as user_title',
        'users.company as user_company',
        'users.location as user_location',
        'users.linkedin_url',
        'users.github_url',
      )
      .leftJoin('users', 'opportunity_applications.user_id', 'users.id')
      .where('opportunity_applications.opportunity_id', opportunityId);

    if (status) {
      query = query.where('opportunity_applications.status', status);
    }

    // Get total count
    const countQuery = query.clone().count('* as total');
    const [{ total }] = await countQuery;

    // Apply pagination and ordering
    const applications = await query
      .orderBy('opportunity_applications.applied_at', 'desc')
      .limit(limit)
      .offset(offset);

    // Transform the data
    const transformedApplications = applications.map((app) => ({
      id: app.id,
      opportunityId: app.opportunity_id,
      userId: app.user_id,
      status: app.status,
      coverLetter: app.cover_letter,
      documents: app.documents || [],
      notes: app.notes,
      appliedAt: app.applied_at,
      statusUpdatedAt: app.status_updated_at,
      feedback: app.feedback,
      interviewDetails: app.interview_details,
      user: {
        name: `${app.first_name || ''} ${app.last_name || ''}`.trim() || app.username,
        email: app.email,
        title: app.user_title,
        company: app.user_company,
        location: app.user_location,
        avatar: app.avatar_url,
        linkedinUrl: app.linkedin_url,
        githubUrl: app.github_url,
      },
    }));

    res.json({
      applications: transformedApplications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Get user's applications
router.get('/my-applications', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    let query = knex('opportunity_applications')
      .select(
        'opportunity_applications.*',
        'opportunities.title as opportunity_title',
        'opportunities.company as opportunity_company',
        'opportunities.type as opportunity_type',
        'opportunities.location as opportunity_location',
        'opportunities.remote as opportunity_remote',
        'opportunities.deadline as opportunity_deadline',
        'opportunities.application_link as opportunity_application_link',
      )
      .leftJoin('opportunities', 'opportunity_applications.opportunity_id', 'opportunities.id')
      .where('opportunity_applications.user_id', req.user.id)
      .where('opportunities.is_active', true);

    if (status) {
      query = query.where('opportunity_applications.status', status);
    }

    // Get total count
    const countQuery = query.clone().count('* as total');
    const [{ total }] = await countQuery;

    // Apply pagination and ordering
    const applications = await query
      .orderBy('opportunity_applications.applied_at', 'desc')
      .limit(limit)
      .offset(offset);

    // Transform the data
    const transformedApplications = applications.map((app) => ({
      id: app.id,
      opportunityId: app.opportunity_id,
      status: app.status,
      coverLetter: app.cover_letter,
      documents: app.documents || [],
      notes: app.notes,
      appliedAt: app.applied_at,
      statusUpdatedAt: app.status_updated_at,
      feedback: app.feedback,
      interviewDetails: app.interview_details,
      opportunity: {
        title: app.opportunity_title,
        company: app.opportunity_company,
        type: app.opportunity_type,
        location: app.opportunity_location,
        remote: app.opportunity_remote,
        deadline: app.opportunity_deadline,
        applicationLink: app.opportunity_application_link,
      },
    }));

    res.json({
      applications: transformedApplications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching user applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Apply to an opportunity
router.post('/apply', protect, async (req, res) => {
  try {
    const { opportunityId, coverLetter, documents = [], notes } = req.body;

    // Validate required fields
    if (!opportunityId) {
      return res.status(400).json({ error: 'Opportunity ID is required' });
    }

    // Check if opportunity exists and is active
    const opportunity = await knex('opportunities')
      .where('id', opportunityId)
      .where('is_active', true)
      .first();

    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found or inactive' });
    }

    // Check if user already applied
    const existingApplication = await knex('opportunity_applications')
      .where('opportunity_id', opportunityId)
      .where('user_id', req.user.id)
      .first();

    if (existingApplication) {
      return res.status(400).json({ error: 'You have already applied to this opportunity' });
    }

    // Create application
    const [application] = await knex('opportunity_applications')
      .insert({
        opportunity_id: opportunityId,
        user_id: req.user.id,
        cover_letter: coverLetter,
        documents: JSON.stringify(documents),
        notes: notes,
      })
      .returning('*');

    // Update opportunity applicants count
    await knex('opportunities').where('id', opportunityId).increment('applicants', 1);

    // Track analytics
    await knex('opportunity_analytics').insert({
      opportunity_id: opportunityId,
      event_type: 'apply',
      user_id: req.user.id,
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
    });

    res.status(201).json(application);
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ error: 'Failed to create application' });
  }
});

// Update application status (admin/owner only)
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, feedback, interviewDetails } = req.body;

    // Get application
    const application = await knex('opportunity_applications').where('id', id).first();

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Check if user owns the opportunity or is admin
    const opportunity = await knex('opportunities').where('id', application.opportunity_id).first();

    if (opportunity.posted_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update application status' });
    }

    // Validate status
    const validStatuses = [
      'applied',
      'under_review',
      'shortlisted',
      'interviewed',
      'accepted',
      'rejected',
      'withdrawn',
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Update application
    const updateData = {
      status,
      status_updated_at: knex.fn.now(),
      status_updated_by: req.user.id,
    };

    if (feedback) {
      updateData.feedback = feedback;
    }

    if (interviewDetails) {
      updateData.interview_details = JSON.stringify(interviewDetails);
    }

    const [updatedApplication] = await knex('opportunity_applications')
      .where('id', id)
      .update(updateData)
      .returning('*');

    res.json(updatedApplication);
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
});

// Withdraw application
router.put('/:id/withdraw', protect, async (req, res) => {
  try {
    const { id } = req.params;

    // Get application
    const application = await knex('opportunity_applications')
      .where('id', id)
      .where('user_id', req.user.id)
      .first();

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Update status to withdrawn
    const [updatedApplication] = await knex('opportunity_applications')
      .where('id', id)
      .update({
        status: 'withdrawn',
        status_updated_at: knex.fn.now(),
      })
      .returning('*');

    res.json(updatedApplication);
  } catch (error) {
    console.error('Error withdrawing application:', error);
    res.status(500).json({ error: 'Failed to withdraw application' });
  }
});

// Get application statistics
router.get('/stats/overview', protect, async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // User's application stats
    const userStats = await knex('opportunity_applications')
      .select('status')
      .count('* as count')
      .where('user_id', req.user.id)
      .where('applied_at', '>=', startDate)
      .groupBy('status');

    // Total applications by user
    const totalApplications = await knex('opportunity_applications')
      .count('* as total')
      .where('user_id', req.user.id)
      .first();

    // Recent applications
    const recentApplications = await knex('opportunity_applications')
      .select(
        'opportunity_applications.*',
        'opportunities.title as opportunity_title',
        'opportunities.company as opportunity_company',
      )
      .leftJoin('opportunities', 'opportunity_applications.opportunity_id', 'opportunities.id')
      .where('opportunity_applications.user_id', req.user.id)
      .where('opportunities.is_active', true)
      .orderBy('opportunity_applications.applied_at', 'desc')
      .limit(5);

    res.json({
      userStats,
      totalApplications: parseInt(totalApplications.total) || 0,
      recentApplications,
    });
  } catch (error) {
    console.error('Error fetching application stats:', error);
    res.status(500).json({ error: 'Failed to fetch application statistics' });
  }
});

module.exports = router;
