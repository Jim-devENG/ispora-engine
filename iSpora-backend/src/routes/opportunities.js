const express = require('express');
const knex = require('../database/connection');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// Get all opportunities with filtering, sorting, and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      location,
      remote,
      experience_level,
      category,
      featured,
      urgent,
      search,
      sort_by = 'posted_date',
      sort_order = 'desc',
      min_amount,
      max_amount,
      deadline_after,
      deadline_before
    } = req.query;

    const offset = (page - 1) * limit;
    
    let query = knex('opportunities')
      .select(
        'opportunities.*',
        'users.first_name',
        'users.last_name',
        'users.username',
        'users.title as user_title',
        'users.company as user_company',
        'users.avatar_url',
        'users.is_verified as user_verified'
      )
      .leftJoin('users', 'opportunities.posted_by', 'users.id')
      .where('opportunities.is_active', true);

    // Apply filters
    if (type && type !== 'all') {
      query = query.where('opportunities.type', type);
    }

    if (location && location !== 'All Locations') {
      query = query.where('opportunities.location', 'ilike', `%${location}%`);
    }

    if (remote !== undefined) {
      query = query.where('opportunities.remote', remote === 'true');
    }

    if (experience_level && experience_level !== 'All Levels') {
      query = query.where('opportunities.experience_level', experience_level);
    }

    if (category) {
      query = query.where('opportunities.category', 'ilike', `%${category}%`);
    }

    if (featured !== undefined) {
      query = query.where('opportunities.featured', featured === 'true');
    }

    if (urgent !== undefined) {
      query = query.where('opportunities.urgent', urgent === 'true');
    }

    if (search) {
      query = query.where(function() {
        this.where('opportunities.title', 'ilike', `%${search}%`)
          .orWhere('opportunities.description', 'ilike', `%${search}%`)
          .orWhere('opportunities.company', 'ilike', `%${search}%`)
          .orWhere('opportunities.tags', 'ilike', `%${search}%`);
      });
    }

    if (min_amount) {
      query = query.whereRaw("(amount->>'value')::numeric >= ?", [min_amount]);
    }

    if (max_amount) {
      query = query.whereRaw("(amount->>'value')::numeric <= ?", [max_amount]);
    }

    if (deadline_after) {
      query = query.where('opportunities.deadline', '>=', deadline_after);
    }

    if (deadline_before) {
      query = query.where('opportunities.deadline', '<=', deadline_before);
    }

    // Apply sorting
    const validSortFields = ['posted_date', 'deadline', 'boost', 'applicants', 'title'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'posted_date';
    const sortDirection = sort_order === 'asc' ? 'asc' : 'desc';
    
    query = query.orderBy(`opportunities.${sortField}`, sortDirection);

    // Get total count for pagination
    const countQuery = query.clone().count('* as total');
    const [{ total }] = await countQuery;
    
    // Apply pagination
    const opportunities = await query.limit(limit).offset(offset);

    // Transform the data to match frontend expectations
    const transformedOpportunities = opportunities.map(opp => ({
      id: opp.id,
      title: opp.title,
      type: opp.type,
      company: opp.company,
      location: opp.location,
      remote: opp.remote,
      description: opp.description,
      requirements: opp.requirements || [],
      benefits: opp.benefits || [],
      amount: opp.amount,
      duration: opp.duration,
      commitment: opp.commitment,
      postedBy: {
        name: `${opp.first_name || ''} ${opp.last_name || ''}`.trim() || opp.username,
        title: opp.user_title,
        company: opp.user_company,
        avatar: opp.avatar_url,
        isVerified: opp.user_verified
      },
      university: opp.university,
      tags: opp.tags || [],
      applicants: opp.applicants,
      deadline: opp.deadline,
      eventDate: opp.event_date,
      postedDate: opp.posted_date,
      featured: opp.featured,
      urgent: opp.urgent,
      boost: opp.boost,
      experienceLevel: opp.experience_level,
      category: opp.category,
      eligibility: opp.eligibility || [],
      applicationLink: opp.application_link,
      comments: opp.comments,
      fullDescription: opp.full_description,
      applicationProcess: opp.application_process || [],
      contactInfo: opp.contact_info
    }));

    res.json({
      opportunities: transformedOpportunities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    res.status(500).json({ error: 'Failed to fetch opportunities' });
  }
});

// Get a single opportunity by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const opportunity = await knex('opportunities')
      .select(
        'opportunities.*',
        'users.first_name',
        'users.last_name',
        'users.username',
        'users.title as user_title',
        'users.company as user_company',
        'users.avatar_url',
        'users.is_verified as user_verified'
      )
      .leftJoin('users', 'opportunities.posted_by', 'users.id')
      .where('opportunities.id', id)
      .where('opportunities.is_active', true)
      .first();

    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    // Track view analytics
    await knex('opportunity_analytics').insert({
      opportunity_id: id,
      event_type: 'view',
      user_id: req.user?.id || null,
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      referrer: req.get('Referer')
    });

    // Transform the data
    const transformedOpportunity = {
      id: opportunity.id,
      title: opportunity.title,
      type: opportunity.type,
      company: opportunity.company,
      location: opportunity.location,
      remote: opportunity.remote,
      description: opportunity.description,
      requirements: opportunity.requirements || [],
      benefits: opportunity.benefits || [],
      amount: opportunity.amount,
      duration: opportunity.duration,
      commitment: opportunity.commitment,
      postedBy: {
        name: `${opportunity.first_name || ''} ${opportunity.last_name || ''}`.trim() || opportunity.username,
        title: opportunity.user_title,
        company: opportunity.user_company,
        avatar: opportunity.avatar_url,
        isVerified: opportunity.user_verified
      },
      university: opportunity.university,
      tags: opportunity.tags || [],
      applicants: opportunity.applicants,
      deadline: opportunity.deadline,
      eventDate: opportunity.event_date,
      postedDate: opportunity.posted_date,
      featured: opportunity.featured,
      urgent: opportunity.urgent,
      boost: opportunity.boost,
      experienceLevel: opportunity.experience_level,
      category: opportunity.category,
      eligibility: opportunity.eligibility || [],
      applicationLink: opportunity.application_link,
      comments: opportunity.comments,
      fullDescription: opportunity.full_description,
      applicationProcess: opportunity.application_process || [],
      contactInfo: opportunity.contact_info,
      isVerified: opportunity.is_verified
    };

    res.json(transformedOpportunity);
  } catch (error) {
    console.error('Error fetching opportunity:', error);
    res.status(500).json({ error: 'Failed to fetch opportunity' });
  }
});

// Create a new opportunity
router.post('/', protect, async (req, res) => {
  try {
    const {
      title,
      type,
      company,
      location,
      remote = false,
      description,
      requirements = [],
      benefits = [],
      amount,
      duration,
      commitment,
      university,
      tags = [],
      deadline,
      eventDate,
      experienceLevel = 'any',
      category,
      eligibility = [],
      applicationLink,
      fullDescription,
      applicationProcess = [],
      contactInfo
    } = req.body;

    // Validate required fields
    if (!title || !type || !company || !location || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [opportunity] = await knex('opportunities')
      .insert({
        title,
        type,
        company,
        location,
        remote,
        description,
        requirements: JSON.stringify(requirements),
        benefits: JSON.stringify(benefits),
        amount: amount ? JSON.stringify(amount) : null,
        duration,
        commitment,
        posted_by: req.user.id,
        university,
        tags: JSON.stringify(tags),
        deadline,
        event_date: eventDate,
        experience_level: experienceLevel,
        category,
        eligibility: JSON.stringify(eligibility),
        application_link: applicationLink,
        full_description: fullDescription,
        application_process: JSON.stringify(applicationProcess),
        contact_info: contactInfo ? JSON.stringify(contactInfo) : null
      })
      .returning('*');

    res.status(201).json(opportunity);
  } catch (error) {
    console.error('Error creating opportunity:', error);
    res.status(500).json({ error: 'Failed to create opportunity' });
  }
});

// Update an opportunity
router.put('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if user owns the opportunity or is admin
    const opportunity = await knex('opportunities')
      .where('id', id)
      .first();

    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    if (opportunity.posted_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this opportunity' });
    }

    // Prepare update data
    const allowedFields = [
      'title', 'type', 'company', 'location', 'remote', 'description',
      'requirements', 'benefits', 'amount', 'duration', 'commitment',
      'university', 'tags', 'deadline', 'event_date', 'experience_level',
      'category', 'eligibility', 'application_link', 'full_description',
      'application_process', 'contact_info', 'featured', 'urgent'
    ];

    const updateFields = {};
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        if (['requirements', 'benefits', 'tags', 'eligibility', 'application_process'].includes(field)) {
          updateFields[field] = JSON.stringify(updateData[field]);
        } else if (field === 'amount' && updateData[field]) {
          updateFields[field] = JSON.stringify(updateData[field]);
        } else if (field === 'contact_info' && updateData[field]) {
          updateFields[field] = JSON.stringify(updateData[field]);
        } else {
          updateFields[field] = updateData[field];
        }
      }
    });

    updateFields.updated_at = knex.fn.now();

    const [updatedOpportunity] = await knex('opportunities')
      .where('id', id)
      .update(updateFields)
      .returning('*');

    res.json(updatedOpportunity);
  } catch (error) {
    console.error('Error updating opportunity:', error);
    res.status(500).json({ error: 'Failed to update opportunity' });
  }
});

// Delete an opportunity
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user owns the opportunity or is admin
    const opportunity = await knex('opportunities')
      .where('id', id)
      .first();

    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    if (opportunity.posted_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this opportunity' });
    }

    // Soft delete by setting is_active to false
    await knex('opportunities')
      .where('id', id)
      .update({ is_active: false, updated_at: knex.fn.now() });

    res.json({ message: 'Opportunity deleted successfully' });
  } catch (error) {
    console.error('Error deleting opportunity:', error);
    res.status(500).json({ error: 'Failed to delete opportunity' });
  }
});

// Get opportunity statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;

    const stats = await knex('opportunity_analytics')
      .select('event_type')
      .count('* as count')
      .where('opportunity_id', id)
      .groupBy('event_type');

    const applications = await knex('opportunity_applications')
      .count('* as total')
      .where('opportunity_id', id)
      .first();

    const saves = await knex('opportunity_saves')
      .count('* as total')
      .where('opportunity_id', id)
      .first();

    const boosts = await knex('opportunity_boosts')
      .sum('boost_amount as total')
      .where('opportunity_id', id)
      .first();

    res.json({
      analytics: stats,
      applications: parseInt(applications.total) || 0,
      saves: parseInt(saves.total) || 0,
      boosts: parseInt(boosts.total) || 0
    });
  } catch (error) {
    console.error('Error fetching opportunity stats:', error);
    res.status(500).json({ error: 'Failed to fetch opportunity statistics' });
  }
});

module.exports = router;