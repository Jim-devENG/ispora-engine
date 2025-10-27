const express = require('express');
const knex = require('../database/connection');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Get user's saved opportunities
router.get('/my-saves', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const query = knex('opportunity_saves')
      .select(
        'opportunity_saves.*',
        'opportunities.title',
        'opportunities.type',
        'opportunities.company',
        'opportunities.location',
        'opportunities.remote',
        'opportunities.description',
        'opportunities.amount',
        'opportunities.deadline',
        'opportunities.posted_date',
        'opportunities.featured',
        'opportunities.urgent',
        'opportunities.boost',
        'opportunities.applicants',
        'opportunities.tags',
        'users.first_name',
        'users.last_name',
        'users.username',
        'users.title as user_title',
        'users.company as user_company',
        'users.avatar_url',
        'users.is_verified as user_verified',
      )
      .leftJoin('opportunities', 'opportunity_saves.opportunity_id', 'opportunities.id')
      .leftJoin('users', 'opportunities.posted_by', 'users.id')
      .where('opportunity_saves.user_id', req.user.id)
      .where('opportunities.is_active', true);

    // Get total count
    const countQuery = query.clone().count('* as total');
    const [{ total }] = await countQuery;

    // Apply pagination and ordering
    const saves = await query
      .orderBy('opportunity_saves.saved_at', 'desc')
      .limit(limit)
      .offset(offset);

    // Transform the data
    const transformedSaves = saves.map((save) => ({
      id: save.id,
      savedAt: save.saved_at,
      opportunity: {
        id: save.opportunity_id,
        title: save.title,
        type: save.type,
        company: save.company,
        location: save.location,
        remote: save.remote,
        description: save.description,
        amount: save.amount,
        deadline: save.deadline,
        postedDate: save.posted_date,
        featured: save.featured,
        urgent: save.urgent,
        boost: save.boost,
        applicants: save.applicants,
        tags: save.tags || [],
        postedBy: {
          name: `${save.first_name || ''} ${save.last_name || ''}`.trim() || save.username,
          title: save.user_title,
          company: save.user_company,
          avatar: save.avatar_url,
          isVerified: save.user_verified,
        },
      },
    }));

    res.json({
      saves: transformedSaves,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching saved opportunities:', error);
    res.status(500).json({ error: 'Failed to fetch saved opportunities' });
  }
});

// Save an opportunity
router.post('/save', protect, async (req, res) => {
  try {
    const { opportunityId } = req.body;

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

    // Check if already saved
    const existingSave = await knex('opportunity_saves')
      .where('opportunity_id', opportunityId)
      .where('user_id', req.user.id)
      .first();

    if (existingSave) {
      return res.status(400).json({ error: 'Opportunity already saved' });
    }

    // Save the opportunity
    const [save] = await knex('opportunity_saves')
      .insert({
        opportunity_id: opportunityId,
        user_id: req.user.id,
      })
      .returning('*');

    // Track analytics
    await knex('opportunity_analytics').insert({
      opportunity_id: opportunityId,
      event_type: 'save',
      user_id: req.user.id,
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
    });

    res.status(201).json(save);
  } catch (error) {
    console.error('Error saving opportunity:', error);
    res.status(500).json({ error: 'Failed to save opportunity' });
  }
});

// Unsave an opportunity
router.delete('/unsave/:opportunityId', protect, async (req, res) => {
  try {
    const { opportunityId } = req.params;

    const deleted = await knex('opportunity_saves')
      .where('opportunity_id', opportunityId)
      .where('user_id', req.user.id)
      .del();

    if (deleted === 0) {
      return res.status(404).json({ error: 'Save not found' });
    }

    res.json({ message: 'Opportunity unsaved successfully' });
  } catch (error) {
    console.error('Error unsaving opportunity:', error);
    res.status(500).json({ error: 'Failed to unsave opportunity' });
  }
});

// Check if opportunity is saved by user
router.get('/check/:opportunityId', protect, async (req, res) => {
  try {
    const { opportunityId } = req.params;

    const save = await knex('opportunity_saves')
      .where('opportunity_id', opportunityId)
      .where('user_id', req.user.id)
      .first();

    res.json({ isSaved: !!save });
  } catch (error) {
    console.error('Error checking save status:', error);
    res.status(500).json({ error: 'Failed to check save status' });
  }
});

// Get save statistics for user
router.get('/stats', protect, async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Total saves
    const totalSaves = await knex('opportunity_saves')
      .count('* as total')
      .where('user_id', req.user.id)
      .first();

    // Recent saves
    const recentSaves = await knex('opportunity_saves')
      .count('* as total')
      .where('user_id', req.user.id)
      .where('saved_at', '>=', startDate)
      .first();

    // Saves by type
    const savesByType = await knex('opportunity_saves')
      .select('opportunities.type')
      .count('* as count')
      .leftJoin('opportunities', 'opportunity_saves.opportunity_id', 'opportunities.id')
      .where('opportunity_saves.user_id', req.user.id)
      .where('opportunities.is_active', true)
      .groupBy('opportunities.type');

    res.json({
      totalSaves: parseInt(totalSaves.total) || 0,
      recentSaves: parseInt(recentSaves.total) || 0,
      savesByType,
    });
  } catch (error) {
    console.error('Error fetching save statistics:', error);
    res.status(500).json({ error: 'Failed to fetch save statistics' });
  }
});

module.exports = router;
