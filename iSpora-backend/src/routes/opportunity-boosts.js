const express = require('express');
const knex = require('../database/connection');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Boost an opportunity
router.post('/boost', protect, async (req, res) => {
  try {
    const { opportunityId, boostAmount = 1, boostMessage } = req.body;

    if (!opportunityId) {
      return res.status(400).json({ error: 'Opportunity ID is required' });
    }

    if (boostAmount < 1 || boostAmount > 10) {
      return res.status(400).json({ error: 'Boost amount must be between 1 and 10' });
    }

    // Check if opportunity exists and is active
    const opportunity = await knex('opportunities')
      .where('id', opportunityId)
      .where('is_active', true)
      .first();

    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found or inactive' });
    }

    // Check if user is trying to boost their own opportunity
    if (opportunity.posted_by === req.user.id) {
      return res.status(400).json({ error: 'Cannot boost your own opportunity' });
    }

    // Create boost record
    const [boost] = await knex('opportunity_boosts')
      .insert({
        opportunity_id: opportunityId,
        user_id: req.user.id,
        boost_amount: boostAmount,
        boost_message: boostMessage
      })
      .returning('*');

    // Update opportunity boost count
    await knex('opportunities')
      .where('id', opportunityId)
      .increment('boost', boostAmount);

    // Track analytics
    await knex('opportunity_analytics').insert({
      opportunity_id: opportunityId,
      event_type: 'boost',
      user_id: req.user.id,
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      metadata: JSON.stringify({ boost_amount: boostAmount })
    });

    res.status(201).json(boost);
  } catch (error) {
    console.error('Error boosting opportunity:', error);
    res.status(500).json({ error: 'Failed to boost opportunity' });
  }
});

// Get boosts for an opportunity
router.get('/opportunity/:opportunityId', async (req, res) => {
  try {
    const { opportunityId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const query = knex('opportunity_boosts')
      .select(
        'opportunity_boosts.*',
        'users.first_name',
        'users.last_name',
        'users.username',
        'users.avatar_url'
      )
      .leftJoin('users', 'opportunity_boosts.user_id', 'users.id')
      .where('opportunity_boosts.opportunity_id', opportunityId);

    // Get total count
    const countQuery = query.clone().count('* as total');
    const [{ total }] = await countQuery;

    // Apply pagination and ordering
    const boosts = await query
      .orderBy('opportunity_boosts.boosted_at', 'desc')
      .limit(limit)
      .offset(offset);

    // Transform the data
    const transformedBoosts = boosts.map(boost => ({
      id: boost.id,
      opportunityId: boost.opportunity_id,
      userId: boost.user_id,
      boostAmount: boost.boost_amount,
      boostMessage: boost.boost_message,
      boostedAt: boost.boosted_at,
      user: {
        name: `${boost.first_name || ''} ${boost.last_name || ''}`.trim() || boost.username,
        avatar: boost.avatar_url
      }
    }));

    res.json({
      boosts: transformedBoosts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching boosts:', error);
    res.status(500).json({ error: 'Failed to fetch boosts' });
  }
});

// Get user's boost history
router.get('/my-boosts', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const query = knex('opportunity_boosts')
      .select(
        'opportunity_boosts.*',
        'opportunities.title as opportunity_title',
        'opportunities.company as opportunity_company',
        'opportunities.type as opportunity_type',
        'opportunities.location as opportunity_location'
      )
      .leftJoin('opportunities', 'opportunity_boosts.opportunity_id', 'opportunities.id')
      .where('opportunity_boosts.user_id', req.user.id)
      .where('opportunities.is_active', true);

    // Get total count
    const countQuery = query.clone().count('* as total');
    const [{ total }] = await countQuery;

    // Apply pagination and ordering
    const boosts = await query
      .orderBy('opportunity_boosts.boosted_at', 'desc')
      .limit(limit)
      .offset(offset);

    // Transform the data
    const transformedBoosts = boosts.map(boost => ({
      id: boost.id,
      opportunityId: boost.opportunity_id,
      boostAmount: boost.boost_amount,
      boostMessage: boost.boost_message,
      boostedAt: boost.boosted_at,
      opportunity: {
        title: boost.opportunity_title,
        company: boost.opportunity_company,
        type: boost.opportunity_type,
        location: boost.opportunity_location
      }
    }));

    res.json({
      boosts: transformedBoosts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching user boosts:', error);
    res.status(500).json({ error: 'Failed to fetch user boosts' });
  }
});

// Get boost statistics
router.get('/stats', protect, async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Total boosts given
    const totalBoosts = await knex('opportunity_boosts')
      .count('* as total')
      .where('user_id', req.user.id)
      .first();

    // Total boost amount given
    const totalBoostAmount = await knex('opportunity_boosts')
      .sum('boost_amount as total')
      .where('user_id', req.user.id)
      .first();

    // Recent boosts
    const recentBoosts = await knex('opportunity_boosts')
      .count('* as total')
      .where('user_id', req.user.id)
      .where('boosted_at', '>=', startDate)
      .first();

    // Boosts by type
    const boostsByType = await knex('opportunity_boosts')
      .select('opportunities.type')
      .count('* as count')
      .sum('opportunity_boosts.boost_amount as total_amount')
      .leftJoin('opportunities', 'opportunity_boosts.opportunity_id', 'opportunities.id')
      .where('opportunity_boosts.user_id', req.user.id)
      .where('opportunities.is_active', true)
      .groupBy('opportunities.type');

    res.json({
      totalBoosts: parseInt(totalBoosts.total) || 0,
      totalBoostAmount: parseInt(totalBoostAmount.total) || 0,
      recentBoosts: parseInt(recentBoosts.total) || 0,
      boostsByType
    });
  } catch (error) {
    console.error('Error fetching boost statistics:', error);
    res.status(500).json({ error: 'Failed to fetch boost statistics' });
  }
});

// Get top boosted opportunities
router.get('/top-boosted', async (req, res) => {
  try {
    const { limit = 10, period = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const topBoosted = await knex('opportunities')
      .select(
        'opportunities.id',
        'opportunities.title',
        'opportunities.type',
        'opportunities.company',
        'opportunities.location',
        'opportunities.boost',
        'opportunities.posted_date',
        'users.first_name',
        'users.last_name',
        'users.username',
        'users.avatar_url'
      )
      .leftJoin('users', 'opportunities.posted_by', 'users.id')
      .where('opportunities.is_active', true)
      .where('opportunities.boost', '>', 0)
      .where('opportunities.posted_date', '>=', startDate)
      .orderBy('opportunities.boost', 'desc')
      .limit(parseInt(limit));

    // Transform the data
    const transformedTopBoosted = topBoosted.map(opp => ({
      id: opp.id,
      title: opp.title,
      type: opp.type,
      company: opp.company,
      location: opp.location,
      boost: opp.boost,
      postedDate: opp.posted_date,
      postedBy: {
        name: `${opp.first_name || ''} ${opp.last_name || ''}`.trim() || opp.username,
        avatar: opp.avatar_url
      }
    }));

    res.json(transformedTopBoosted);
  } catch (error) {
    console.error('Error fetching top boosted opportunities:', error);
    res.status(500).json({ error: 'Failed to fetch top boosted opportunities' });
  }
});

module.exports = router;
