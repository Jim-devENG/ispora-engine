const express = require('express');
const knex = require('../database/connection');
const { protect } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// Generate referral code
router.post('/generate-code', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { campaign, source } = req.body;

    // Generate unique referral code
    const referralCode = generateReferralCode(userId);

    // Check if code already exists
    const existingCode = await knex('referrals').where('referral_code', referralCode).first();

    if (existingCode) {
      return res.status(400).json({ error: 'Referral code already exists' });
    }

    // Create referral record
    const referral = await knex('referrals')
      .insert({
        referrer_id: userId,
        referral_code: referralCode,
        source: source || 'direct',
        campaign: campaign || 'default',
        status: 'pending',
      })
      .returning('*');

    res.json({
      referralCode,
      referralUrl: `${process.env.FRONTEND_URL || 'https://ispora.com'}/signup?ref=${referralCode}`,
      referral: referral[0],
    });
  } catch (error) {
    console.error('Error generating referral code:', error);
    res.status(500).json({ error: 'Failed to generate referral code' });
  }
});

// Get user's referrals
router.get('/my-referrals', protect, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    let query = knex('referrals as r')
      .select(
        'r.*',
        'u.first_name',
        'u.last_name',
        'u.username',
        'u.avatar_url',
        'u.email',
        'u.created_at as user_joined_date',
      )
      .leftJoin('users as u', 'r.referred_id', 'u.id')
      .where('r.referrer_id', userId)
      .orderBy('r.referral_date', 'desc');

    if (status) {
      query = query.where('r.status', status);
    }

    // Get total count
    const countQuery = query.clone().count('* as total');
    const [{ total }] = await countQuery;

    // Apply pagination
    const referrals = await query.limit(limit).offset(offset);

    const transformedReferrals = referrals.map((referral) => ({
      id: referral.id,
      referralCode: referral.referral_code,
      email: referral.email,
      status: referral.status,
      source: referral.source,
      campaign: referral.campaign,
      referralDate: referral.referral_date,
      completionDate: referral.completion_date,
      expiryDate: referral.expiry_date,
      referrerPoints: referral.referrer_points,
      referredPoints: referral.referred_points,
      referrerRewarded: referral.referrer_rewarded,
      referredRewarded: referral.referred_rewarded,
      referredUser: referral.referred_id
        ? {
            id: referral.referred_id,
            name: `${referral.first_name} ${referral.last_name}`.trim() || referral.username,
            avatar: referral.avatar_url,
            email: referral.email,
            joinedDate: referral.user_joined_date,
          }
        : null,
    }));

    // Get referral statistics
    const stats = await knex('referrals')
      .where('referrer_id', userId)
      .select('status')
      .count('* as count')
      .groupBy('status');

    const totalReferrals = await knex('referrals')
      .where('referrer_id', userId)
      .count('* as total')
      .first();

    const successfulReferrals = await knex('referrals')
      .where('referrer_id', userId)
      .where('status', 'completed')
      .count('* as count')
      .first();

    res.json({
      referrals: transformedReferrals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total),
        pages: Math.ceil(total / limit),
      },
      stats: {
        total: parseInt(totalReferrals.total),
        successful: parseInt(successfulReferrals.count),
        pending: stats.find((s) => s.status === 'pending')?.count || 0,
        expired: stats.find((s) => s.status === 'expired')?.count || 0,
        cancelled: stats.find((s) => s.status === 'cancelled')?.count || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching referrals:', error);
    res.status(500).json({ error: 'Failed to fetch referrals' });
  }
});

// Get referral statistics
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get referral statistics
    const stats = await knex('referrals')
      .where('referrer_id', userId)
      .select('status')
      .count('* as count')
      .groupBy('status');

    // Get total points earned from referrals
    const totalPoints = await knex('referrals')
      .where('referrer_id', userId)
      .where('referrer_rewarded', true)
      .sum('referrer_points as total')
      .first();

    // Get monthly referral trends
    const monthlyTrends = await knex('referrals')
      .select(
        knex.raw("DATE_TRUNC('month', referral_date) as month"),
        knex.raw('COUNT(*) as count'),
      )
      .where('referrer_id', userId)
      .where('referral_date', '>=', knex.raw("NOW() - INTERVAL '12 months'"))
      .groupBy('month')
      .orderBy('month', 'asc');

    // Get top referral sources
    const topSources = await knex('referrals')
      .select('source')
      .count('* as count')
      .where('referrer_id', userId)
      .groupBy('source')
      .orderBy('count', 'desc')
      .limit(5);

    res.json({
      totalReferrals: stats.reduce((sum, stat) => sum + parseInt(stat.count), 0),
      successfulReferrals: stats.find((s) => s.status === 'completed')?.count || 0,
      pendingReferrals: stats.find((s) => s.status === 'pending')?.count || 0,
      totalPointsEarned: parseInt(totalPoints.total) || 0,
      monthlyTrends: monthlyTrends.map((trend) => ({
        month: trend.month,
        count: parseInt(trend.count),
      })),
      topSources: topSources.map((source) => ({
        source: source.source,
        count: parseInt(source.count),
      })),
    });
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    res.status(500).json({ error: 'Failed to fetch referral statistics' });
  }
});

// Process referral (when someone signs up with referral code)
router.post('/process', async (req, res) => {
  try {
    const { referralCode, userId, email } = req.body;

    if (!referralCode || !userId) {
      return res.status(400).json({ error: 'Referral code and user ID are required' });
    }

    // Find referral record
    const referral = await knex('referrals')
      .where('referral_code', referralCode)
      .where('status', 'pending')
      .first();

    if (!referral) {
      return res.status(404).json({ error: 'Invalid or expired referral code' });
    }

    // Check if referral is expired
    if (referral.expiry_date && new Date() > new Date(referral.expiry_date)) {
      await knex('referrals').where('id', referral.id).update({ status: 'expired' });

      return res.status(400).json({ error: 'Referral code has expired' });
    }

    // Check if user is trying to refer themselves
    if (referral.referrer_id === userId) {
      return res.status(400).json({ error: 'Cannot refer yourself' });
    }

    // Update referral record
    await knex('referrals').where('id', referral.id).update({
      referred_id: userId,
      status: 'completed',
      completion_date: knex.fn.now(),
    });

    // Award points to both users
    const referrerPoints = 500; // REFERRAL_SUCCESS points
    const referredPoints = 100; // Welcome bonus

    // Award points to referrer
    await knex('credit_transactions').insert({
      user_id: referral.referrer_id,
      transaction_type: 'earned',
      activity_type: 'referral_success',
      points: referrerPoints,
      description: 'Successful referral',
      related_user_id: userId,
      source: 'system',
    });

    // Award points to referred user
    await knex('credit_transactions').insert({
      user_id: userId,
      transaction_type: 'earned',
      activity_type: 'welcome_bonus',
      points: referredPoints,
      description: 'Welcome bonus from referral',
      related_user_id: referral.referrer_id,
      source: 'system',
    });

    // Update user credits
    await knex('user_credits')
      .where('user_id', referral.referrer_id)
      .increment('total_points', referrerPoints)
      .increment('referrals_successful', 1);

    await knex('user_credits').where('user_id', userId).increment('total_points', referredPoints);

    // Update referral record with points
    await knex('referrals').where('id', referral.id).update({
      referrer_points: referrerPoints,
      referred_points: referredPoints,
      referrer_rewarded: true,
      referred_rewarded: true,
      referrer_rewarded_at: knex.fn.now(),
      referred_rewarded_at: knex.fn.now(),
    });

    // Update leaderboards
    const { updateLeaderboard } = require('./credits');
    await updateLeaderboard(referral.referrer_id);
    await updateLeaderboard(userId);

    res.json({
      message: 'Referral processed successfully',
      referrerPoints,
      referredPoints,
    });
  } catch (error) {
    console.error('Error processing referral:', error);
    res.status(500).json({ error: 'Failed to process referral' });
  }
});

// Validate referral code
router.get('/validate/:code', async (req, res) => {
  try {
    const { code } = req.params;

    const referral = await knex('referrals')
      .select('r.*', 'u.first_name', 'u.last_name', 'u.username')
      .join('users as u', 'r.referrer_id', 'u.id')
      .where('r.referral_code', code)
      .where('r.status', 'pending')
      .first();

    if (!referral) {
      return res.status(404).json({ error: 'Invalid referral code' });
    }

    // Check if referral is expired
    if (referral.expiry_date && new Date() > new Date(referral.expiry_date)) {
      return res.status(400).json({ error: 'Referral code has expired' });
    }

    res.json({
      valid: true,
      referrer: {
        name: `${referral.first_name} ${referral.last_name}`.trim() || referral.username,
      },
      campaign: referral.campaign,
      source: referral.source,
    });
  } catch (error) {
    console.error('Error validating referral code:', error);
    res.status(500).json({ error: 'Failed to validate referral code' });
  }
});

// Get referral leaderboard
router.get('/leaderboard', protect, async (req, res) => {
  try {
    const { period = 'all_time', limit = 20 } = req.query;

    let query = knex('referrals as r')
      .select(
        'r.referrer_id',
        knex.raw('COUNT(*) as total_referrals'),
        knex.raw("SUM(CASE WHEN r.status = 'completed' THEN 1 ELSE 0 END) as successful_referrals"),
        knex.raw('SUM(r.referrer_points) as total_points'),
        'u.first_name',
        'u.last_name',
        'u.username',
        'u.avatar_url',
        'u.location',
        'u.university',
      )
      .join('users as u', 'r.referrer_id', 'u.id')
      .groupBy(
        'r.referrer_id',
        'u.first_name',
        'u.last_name',
        'u.username',
        'u.avatar_url',
        'u.location',
        'u.university',
      )
      .orderBy('successful_referrals', 'desc')
      .orderBy('total_points', 'desc');

    if (period !== 'all_time') {
      const now = new Date();
      if (period === 'monthly') {
        query = query.where('r.referral_date', '>=', knex.raw("DATE_TRUNC('month', ?)", [now]));
      } else if (period === 'weekly') {
        query = query.where('r.referral_date', '>=', knex.raw("DATE_TRUNC('week', ?)", [now]));
      } else if (period === 'daily') {
        query = query.where('r.referral_date', '>=', knex.raw("DATE_TRUNC('day', ?)", [now]));
      }
    }

    const leaderboard = await query.limit(parseInt(limit));

    const transformedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      user: {
        name: `${entry.first_name} ${entry.last_name}`.trim() || entry.username,
        avatar: entry.avatar_url,
        location: entry.location,
        university: entry.university,
      },
      totalReferrals: parseInt(entry.total_referrals),
      successfulReferrals: parseInt(entry.successful_referrals),
      totalPoints: parseInt(entry.total_points) || 0,
    }));

    res.json(transformedLeaderboard);
  } catch (error) {
    console.error('Error fetching referral leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch referral leaderboard' });
  }
});

// Cancel referral
router.put('/:referralId/cancel', protect, async (req, res) => {
  try {
    const { referralId } = req.params;
    const userId = req.user.id;

    const referral = await knex('referrals')
      .where('id', referralId)
      .where('referrer_id', userId)
      .where('status', 'pending')
      .first();

    if (!referral) {
      return res.status(404).json({ error: 'Referral not found' });
    }

    await knex('referrals').where('id', referralId).update({ status: 'cancelled' });

    res.json({ message: 'Referral cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling referral:', error);
    res.status(500).json({ error: 'Failed to cancel referral' });
  }
});

// Helper function to generate referral code
function generateReferralCode(userId) {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  const userPart = userId.substring(0, 8);
  return `${userPart}${timestamp}${randomPart}`.toUpperCase();
}

module.exports = router;
