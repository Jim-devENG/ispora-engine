const express = require('express');
const knex = require('../database/connection');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// Track opportunity analytics event
router.post('/track', async (req, res) => {
  try {
    const { opportunityId, eventType, metadata } = req.body;

    if (!opportunityId || !eventType) {
      return res.status(400).json({ error: 'Opportunity ID and event type are required' });
    }

    const validEventTypes = ['view', 'click', 'apply', 'save', 'boost', 'share', 'comment'];
    if (!validEventTypes.includes(eventType)) {
      return res.status(400).json({ error: 'Invalid event type' });
    }

    // Check if opportunity exists
    const opportunity = await knex('opportunities')
      .where('id', opportunityId)
      .where('is_active', true)
      .first();

    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    // Create analytics record
    await knex('opportunity_analytics').insert({
      opportunity_id: opportunityId,
      event_type: eventType,
      user_id: req.user?.id || null,
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      referrer: req.get('Referer'),
      metadata: metadata ? JSON.stringify(metadata) : null,
    });

    res.status(201).json({ message: 'Event tracked successfully' });
  } catch (error) {
    console.error('Error tracking analytics:', error);
    res.status(500).json({ error: 'Failed to track analytics' });
  }
});

// Get analytics for an opportunity (owner/admin only)
router.get('/opportunity/:opportunityId', protect, async (req, res) => {
  try {
    const { opportunityId } = req.params;
    const { period = '30', groupBy = 'day' } = req.query; // days

    // Check if user owns the opportunity or is admin
    const opportunity = await knex('opportunities').where('id', opportunityId).first();

    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    if (opportunity.posted_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to view analytics' });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get event counts by type
    const eventCounts = await knex('opportunity_analytics')
      .select('event_type')
      .count('* as count')
      .where('opportunity_id', opportunityId)
      .where('created_at', '>=', startDate)
      .groupBy('event_type');

    // Get time series data
    let timeSeriesQuery;
    if (groupBy === 'hour') {
      timeSeriesQuery = knex('opportunity_analytics')
        .select(
          knex.raw("DATE_TRUNC('hour', created_at) as period"),
          'event_type',
          knex.raw('COUNT(*) as count'),
        )
        .where('opportunity_id', opportunityId)
        .where('created_at', '>=', startDate)
        .groupBy('period', 'event_type')
        .orderBy('period', 'asc');
    } else if (groupBy === 'week') {
      timeSeriesQuery = knex('opportunity_analytics')
        .select(
          knex.raw("DATE_TRUNC('week', created_at) as period"),
          'event_type',
          knex.raw('COUNT(*) as count'),
        )
        .where('opportunity_id', opportunityId)
        .where('created_at', '>=', startDate)
        .groupBy('period', 'event_type')
        .orderBy('period', 'asc');
    } else {
      timeSeriesQuery = knex('opportunity_analytics')
        .select(
          knex.raw("DATE_TRUNC('day', created_at) as period"),
          'event_type',
          knex.raw('COUNT(*) as count'),
        )
        .where('opportunity_id', opportunityId)
        .where('created_at', '>=', startDate)
        .groupBy('period', 'event_type')
        .orderBy('period', 'asc');
    }

    const timeSeries = await timeSeriesQuery;

    // Get top referrers
    const topReferrers = await knex('opportunity_analytics')
      .select('referrer')
      .count('* as count')
      .where('opportunity_id', opportunityId)
      .where('created_at', '>=', startDate)
      .whereNotNull('referrer')
      .groupBy('referrer')
      .orderBy('count', 'desc')
      .limit(10);

    // Get user engagement
    const userEngagement = await knex('opportunity_analytics')
      .select('user_id')
      .count('* as event_count')
      .where('opportunity_id', opportunityId)
      .where('created_at', '>=', startDate)
      .whereNotNull('user_id')
      .groupBy('user_id')
      .orderBy('event_count', 'desc')
      .limit(10);

    res.json({
      eventCounts,
      timeSeries,
      topReferrers,
      userEngagement,
      period: parseInt(period),
      groupBy,
    });
  } catch (error) {
    console.error('Error fetching opportunity analytics:', error);
    res.status(500).json({ error: 'Failed to fetch opportunity analytics' });
  }
});

// Get platform-wide analytics (admin only)
router.get('/platform', protect, authorize('admin'), async (req, res) => {
  try {
    const { period = '30', groupBy = 'day' } = req.query; // days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get total events by type
    const totalEvents = await knex('opportunity_analytics')
      .select('event_type')
      .count('* as count')
      .where('created_at', '>=', startDate)
      .groupBy('event_type');

    // Get time series data
    let timeSeriesQuery;
    if (groupBy === 'hour') {
      timeSeriesQuery = knex('opportunity_analytics')
        .select(knex.raw("DATE_TRUNC('hour', created_at) as period"), knex.raw('COUNT(*) as count'))
        .where('created_at', '>=', startDate)
        .groupBy('period')
        .orderBy('period', 'asc');
    } else if (groupBy === 'week') {
      timeSeriesQuery = knex('opportunity_analytics')
        .select(knex.raw("DATE_TRUNC('week', created_at) as period"), knex.raw('COUNT(*) as count'))
        .where('created_at', '>=', startDate)
        .groupBy('period')
        .orderBy('period', 'asc');
    } else {
      timeSeriesQuery = knex('opportunity_analytics')
        .select(knex.raw("DATE_TRUNC('day', created_at) as period"), knex.raw('COUNT(*) as count'))
        .where('created_at', '>=', startDate)
        .groupBy('period')
        .orderBy('period', 'asc');
    }

    const timeSeries = await timeSeriesQuery;

    // Get top opportunities by engagement
    const topOpportunities = await knex('opportunity_analytics')
      .select('opportunity_id')
      .count('* as engagement_count')
      .where('created_at', '>=', startDate)
      .groupBy('opportunity_id')
      .orderBy('engagement_count', 'desc')
      .limit(10);

    // Get opportunity details for top opportunities
    const topOpportunityDetails = await knex('opportunities')
      .select('id', 'title', 'company', 'type', 'location')
      .whereIn(
        'id',
        topOpportunities.map((o) => o.opportunity_id),
      )
      .where('is_active', true);

    // Get user activity
    const userActivity = await knex('opportunity_analytics')
      .select('user_id')
      .count('* as activity_count')
      .where('created_at', '>=', startDate)
      .whereNotNull('user_id')
      .groupBy('user_id')
      .orderBy('activity_count', 'desc')
      .limit(10);

    res.json({
      totalEvents,
      timeSeries,
      topOpportunities: topOpportunityDetails,
      userActivity,
      period: parseInt(period),
      groupBy,
    });
  } catch (error) {
    console.error('Error fetching platform analytics:', error);
    res.status(500).json({ error: 'Failed to fetch platform analytics' });
  }
});

// Get user analytics
router.get('/user', protect, async (req, res) => {
  try {
    const { period = '30' } = req.query; // days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get user's activity by event type
    const userActivity = await knex('opportunity_analytics')
      .select('event_type')
      .count('* as count')
      .where('user_id', req.user.id)
      .where('created_at', '>=', startDate)
      .groupBy('event_type');

    // Get user's most engaged opportunities
    const topEngagedOpportunities = await knex('opportunity_analytics')
      .select('opportunity_id')
      .count('* as engagement_count')
      .where('user_id', req.user.id)
      .where('created_at', '>=', startDate)
      .groupBy('opportunity_id')
      .orderBy('engagement_count', 'desc')
      .limit(5);

    // Get opportunity details
    const opportunityDetails = await knex('opportunities')
      .select('id', 'title', 'company', 'type', 'location')
      .whereIn(
        'id',
        topEngagedOpportunities.map((o) => o.opportunity_id),
      )
      .where('is_active', true);

    // Get daily activity
    const dailyActivity = await knex('opportunity_analytics')
      .select(knex.raw("DATE_TRUNC('day', created_at) as date"), knex.raw('COUNT(*) as count'))
      .where('user_id', req.user.id)
      .where('created_at', '>=', startDate)
      .groupBy('date')
      .orderBy('date', 'asc');

    res.json({
      userActivity,
      topEngagedOpportunities: opportunityDetails,
      dailyActivity,
      period: parseInt(period),
    });
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({ error: 'Failed to fetch user analytics' });
  }
});

// Get opportunity performance metrics
router.get('/performance/:opportunityId', protect, async (req, res) => {
  try {
    const { opportunityId } = req.params;
    const { period = '30' } = req.query; // days

    // Check if user owns the opportunity or is admin
    const opportunity = await knex('opportunities').where('id', opportunityId).first();

    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    if (opportunity.posted_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to view performance metrics' });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get conversion funnel data
    const funnelData = await knex('opportunity_analytics')
      .select('event_type')
      .count('* as count')
      .where('opportunity_id', opportunityId)
      .where('created_at', '>=', startDate)
      .whereIn('event_type', ['view', 'click', 'apply', 'save'])
      .groupBy('event_type');

    // Get engagement rate
    const totalViews = await knex('opportunity_analytics')
      .count('* as count')
      .where('opportunity_id', opportunityId)
      .where('event_type', 'view')
      .where('created_at', '>=', startDate)
      .first();

    const totalEngagements = await knex('opportunity_analytics')
      .count('* as count')
      .where('opportunity_id', opportunityId)
      .whereIn('event_type', ['click', 'apply', 'save', 'boost', 'comment'])
      .where('created_at', '>=', startDate)
      .first();

    const engagementRate =
      totalViews.count > 0 ? ((totalEngagements.count / totalViews.count) * 100).toFixed(2) : 0;

    // Get geographic distribution
    const geographicData = await knex('opportunity_analytics')
      .select('metadata')
      .where('opportunity_id', opportunityId)
      .where('created_at', '>=', startDate)
      .whereNotNull('metadata');

    res.json({
      funnelData,
      engagementRate: parseFloat(engagementRate),
      totalViews: parseInt(totalViews.count) || 0,
      totalEngagements: parseInt(totalEngagements.count) || 0,
      geographicData,
      period: parseInt(period),
    });
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({ error: 'Failed to fetch performance metrics' });
  }
});

module.exports = router;
