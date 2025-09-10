const express = require('express');
const knex = require('../database/connection');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Get all available badges
router.get('/', protect, async (req, res) => {
  try {
    const { category, rarity, earned_only = false } = req.query;
    const userId = req.user.id;

    let query = knex('badges as b')
      .select(
        'b.*',
        'ub.earned',
        'ub.earned_date',
        'ub.progress',
        'ub.is_public',
        'ub.show_on_profile'
      )
      .leftJoin('user_badges as ub', function() {
        this.on('b.id', '=', 'ub.badge_id')
          .andOn('ub.user_id', '=', knex.raw('?', [userId]));
      })
      .where('b.is_active', true)
      .orderBy('b.sort_order', 'asc')
      .orderBy('b.rarity', 'asc');

    if (category) {
      query = query.where('b.category', category);
    }

    if (rarity) {
      query = query.where('b.rarity', rarity);
    }

    if (earned_only) {
      query = query.where('ub.earned', true);
    }

    const badges = await query;

    const transformedBadges = badges.map(badge => ({
      id: badge.id,
      name: badge.name,
      description: badge.description,
      iconName: badge.icon_name,
      color: badge.color,
      textColor: badge.text_color,
      bgColor: badge.bg_color,
      borderColor: badge.border_color,
      requirement: badge.requirement,
      pointsRequired: badge.points_required,
      criteria: JSON.parse(badge.criteria),
      rarity: badge.rarity,
      category: badge.category,
      tags: badge.tags ? JSON.parse(badge.tags) : [],
      earned: badge.earned || false,
      earnedDate: badge.earned_date,
      progress: badge.progress || 0,
      isPublic: badge.is_public !== false,
      showOnProfile: badge.show_on_profile !== false
    }));

    res.json(transformedBadges);
  } catch (error) {
    console.error('Error fetching badges:', error);
    res.status(500).json({ error: 'Failed to fetch badges' });
  }
});

// Get user's badges
router.get('/my-badges', protect, async (req, res) => {
  try {
    const { earned_only = false, category, show_on_profile = false } = req.query;
    const userId = req.user.id;

    let query = knex('user_badges as ub')
      .select('ub.*', 'b.*')
      .join('badges as b', 'ub.badge_id', 'b.id')
      .where('ub.user_id', userId)
      .where('b.is_active', true);

    if (earned_only) {
      query = query.where('ub.earned', true);
    }

    if (category) {
      query = query.where('b.category', category);
    }

    if (show_on_profile) {
      query = query.where('ub.show_on_profile', true);
    }

    const badges = await query
      .orderBy('ub.earned_date', 'desc')
      .orderBy('ub.display_order', 'asc');

    const transformedBadges = badges.map(badge => ({
      id: badge.badge_id,
      name: badge.name,
      description: badge.description,
      iconName: badge.icon_name,
      color: badge.color,
      textColor: badge.text_color,
      bgColor: badge.bg_color,
      borderColor: badge.border_color,
      requirement: badge.requirement,
      pointsRequired: badge.points_required,
      criteria: JSON.parse(badge.criteria),
      rarity: badge.rarity,
      category: badge.category,
      tags: badge.tags ? JSON.parse(badge.tags) : [],
      earned: badge.earned,
      earnedDate: badge.earned_date,
      progress: badge.progress,
      isPublic: badge.is_public,
      showOnProfile: badge.show_on_profile,
      shared: badge.shared,
      sharedDate: badge.shared_date,
      sharedPlatforms: badge.shared_platforms ? JSON.parse(badge.shared_platforms) : []
    }));

    res.json(transformedBadges);
  } catch (error) {
    console.error('Error fetching user badges:', error);
    res.status(500).json({ error: 'Failed to fetch user badges' });
  }
});

// Get badge details
router.get('/:badgeId', protect, async (req, res) => {
  try {
    const { badgeId } = req.params;
    const userId = req.user.id;

    const badge = await knex('badges as b')
      .select(
        'b.*',
        'ub.earned',
        'ub.earned_date',
        'ub.progress',
        'ub.is_public',
        'ub.show_on_profile',
        'ub.criteria_met'
      )
      .leftJoin('user_badges as ub', function() {
        this.on('b.id', '=', 'ub.badge_id')
          .andOn('ub.user_id', '=', knex.raw('?', [userId]));
      })
      .where('b.id', badgeId)
      .where('b.is_active', true)
      .first();

    if (!badge) {
      return res.status(404).json({ error: 'Badge not found' });
    }

    // Get badge statistics
    const stats = await knex('user_badges')
      .where('badge_id', badgeId)
      .where('earned', true)
      .count('* as earned_count')
      .first();

    const totalUsers = await knex('users').count('* as total').first();

    const transformedBadge = {
      id: badge.id,
      name: badge.name,
      description: badge.description,
      iconName: badge.icon_name,
      color: badge.color,
      textColor: badge.text_color,
      bgColor: badge.bg_color,
      borderColor: badge.border_color,
      requirement: badge.requirement,
      pointsRequired: badge.points_required,
      criteria: JSON.parse(badge.criteria),
      rarity: badge.rarity,
      category: badge.category,
      tags: badge.tags ? JSON.parse(badge.tags) : [],
      earned: badge.earned || false,
      earnedDate: badge.earned_date,
      progress: badge.progress || 0,
      isPublic: badge.is_public !== false,
      showOnProfile: badge.show_on_profile !== false,
      criteriaMet: badge.criteria_met ? JSON.parse(badge.criteria_met) : null,
      stats: {
        earnedCount: parseInt(stats.earned_count),
        totalUsers: parseInt(totalUsers.total),
        rarityPercentage: Math.round((parseInt(stats.earned_count) / parseInt(totalUsers.total)) * 100)
      }
    };

    res.json(transformedBadge);
  } catch (error) {
    console.error('Error fetching badge details:', error);
    res.status(500).json({ error: 'Failed to fetch badge details' });
  }
});

// Award badge to user
router.post('/:badgeId/award', protect, async (req, res) => {
  try {
    const { badgeId } = req.params;
    const { user_id, reason } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Verify badge exists
    const badge = await knex('badges')
      .where('id', badgeId)
      .where('is_active', true)
      .first();

    if (!badge) {
      return res.status(404).json({ error: 'Badge not found' });
    }

    // Check if user already has this badge
    const existingBadge = await knex('user_badges')
      .where('user_id', user_id)
      .where('badge_id', badgeId)
      .first();

    if (existingBadge && existingBadge.earned) {
      return res.status(400).json({ error: 'User already has this badge' });
    }

    // Award the badge
    if (existingBadge) {
      await knex('user_badges')
        .where('id', existingBadge.id)
        .update({
          earned: true,
          earned_date: knex.fn.now(),
          awarded_by: req.user.id,
          award_reason: reason,
          progress: 100
        });
    } else {
      await knex('user_badges').insert({
        user_id,
        badge_id: badgeId,
        earned: true,
        earned_date: knex.fn.now(),
        awarded_by: req.user.id,
        award_reason: reason,
        progress: 100,
        is_public: true,
        show_on_profile: true
      });
    }

    // Award points for badge
    const badgePoints = 100; // BADGE_EARNED points
    await knex('credit_transactions').insert({
      user_id,
      transaction_type: 'earned',
      activity_type: 'badge_earned',
      points: badgePoints,
      description: `Earned ${badge.name} badge`,
      related_badge_id: badgeId,
      source: 'system'
    });

    // Update user credits
    await knex('user_credits')
      .where('user_id', user_id)
      .increment('total_points', badgePoints);

    // Update leaderboard
    const { updateLeaderboard } = require('./credits');
    await updateLeaderboard(user_id);

    res.json({ message: 'Badge awarded successfully' });
  } catch (error) {
    console.error('Error awarding badge:', error);
    res.status(500).json({ error: 'Failed to award badge' });
  }
});

// Update badge display settings
router.put('/:badgeId/settings', protect, async (req, res) => {
  try {
    const { badgeId } = req.params;
    const { is_public, show_on_profile, display_order } = req.body;
    const userId = req.user.id;

    const userBadge = await knex('user_badges')
      .where('user_id', userId)
      .where('badge_id', badgeId)
      .first();

    if (!userBadge) {
      return res.status(404).json({ error: 'Badge not found for user' });
    }

    await knex('user_badges')
      .where('id', userBadge.id)
      .update({
        is_public: is_public !== undefined ? is_public : userBadge.is_public,
        show_on_profile: show_on_profile !== undefined ? show_on_profile : userBadge.show_on_profile,
        display_order: display_order !== undefined ? display_order : userBadge.display_order,
        updated_at: knex.fn.now()
      });

    res.json({ message: 'Badge settings updated successfully' });
  } catch (error) {
    console.error('Error updating badge settings:', error);
    res.status(500).json({ error: 'Failed to update badge settings' });
  }
});

// Share badge
router.post('/:badgeId/share', protect, async (req, res) => {
  try {
    const { badgeId } = req.params;
    const { platforms } = req.body; // Array of platform names
    const userId = req.user.id;

    const userBadge = await knex('user_badges')
      .where('user_id', userId)
      .where('badge_id', badgeId)
      .where('earned', true)
      .first();

    if (!userBadge) {
      return res.status(404).json({ error: 'Badge not found or not earned' });
    }

    await knex('user_badges')
      .where('id', userBadge.id)
      .update({
        shared: true,
        shared_date: knex.fn.now(),
        shared_platforms: JSON.stringify(platforms || [])
      });

    // Award points for sharing
    const sharePoints = 50; // SOCIAL_SHARE points
    await knex('credit_transactions').insert({
      user_id: userId,
      transaction_type: 'earned',
      activity_type: 'social_share',
      points: sharePoints,
      description: `Shared ${userBadge.name} badge`,
      related_badge_id: badgeId,
      source: 'system'
    });

    // Update user credits
    await knex('user_credits')
      .where('user_id', userId)
      .increment('total_points', sharePoints);

    res.json({ message: 'Badge shared successfully' });
  } catch (error) {
    console.error('Error sharing badge:', error);
    res.status(500).json({ error: 'Failed to share badge' });
  }
});

// Check badge progress
router.get('/:badgeId/progress', protect, async (req, res) => {
  try {
    const { badgeId } = req.params;
    const userId = req.user.id;

    const badge = await knex('badges')
      .where('id', badgeId)
      .where('is_active', true)
      .first();

    if (!badge) {
      return res.status(404).json({ error: 'Badge not found' });
    }

    const userBadge = await knex('user_badges')
      .where('user_id', userId)
      .where('badge_id', badgeId)
      .first();

    const criteria = JSON.parse(badge.criteria);
    const progress = await calculateBadgeProgress(userId, criteria);

    res.json({
      badgeId,
      criteria,
      progress,
      earned: userBadge?.earned || false,
      earnedDate: userBadge?.earned_date
    });
  } catch (error) {
    console.error('Error checking badge progress:', error);
    res.status(500).json({ error: 'Failed to check badge progress' });
  }
});

// Helper function to calculate badge progress
async function calculateBadgeProgress(userId, criteria) {
  const progress = {};

  for (const criterion of criteria) {
    switch (criterion.type) {
      case 'project_launch':
        const projectsLaunched = await knex('projects')
          .where('created_by', userId)
          .count('* as count')
          .first();
        progress[criterion.type] = {
          current: parseInt(projectsLaunched.count),
          required: criterion.value,
          percentage: Math.min(100, (parseInt(projectsLaunched.count) / criterion.value) * 100)
        };
        break;

      case 'mentorship_sessions':
        const mentorshipSessions = await knex('mentorships')
          .where('mentor_id', userId)
          .where('status', 'active')
          .count('* as count')
          .first();
        progress[criterion.type] = {
          current: parseInt(mentorshipSessions.count),
          required: criterion.value,
          percentage: Math.min(100, (parseInt(mentorshipSessions.count) / criterion.value) * 100)
        };
        break;

      case 'opportunities_shared':
        const opportunitiesShared = await knex('opportunities')
          .where('posted_by', userId)
          .count('* as count')
          .first();
        progress[criterion.type] = {
          current: parseInt(opportunitiesShared.count),
          required: criterion.value,
          percentage: Math.min(100, (parseInt(opportunitiesShared.count) / criterion.value) * 100)
        };
        break;

      case 'social_shares':
        const socialShares = await knex('credit_transactions')
          .where('user_id', userId)
          .where('activity_type', 'social_share')
          .count('* as count')
          .first();
        progress[criterion.type] = {
          current: parseInt(socialShares.count),
          required: criterion.value,
          percentage: Math.min(100, (parseInt(socialShares.count) / criterion.value) * 100)
        };
        break;

      case 'referrals_successful':
        const referralsSuccessful = await knex('referrals')
          .where('referrer_id', userId)
          .where('status', 'completed')
          .count('* as count')
          .first();
        progress[criterion.type] = {
          current: parseInt(referralsSuccessful.count),
          required: criterion.value,
          percentage: Math.min(100, (parseInt(referralsSuccessful.count) / criterion.value) * 100)
        };
        break;

      case 'points_earned':
        const userCredits = await knex('user_credits')
          .where('user_id', userId)
          .first();
        progress[criterion.type] = {
          current: userCredits?.total_points || 0,
          required: criterion.value,
          percentage: Math.min(100, ((userCredits?.total_points || 0) / criterion.value) * 100)
        };
        break;

      default:
        progress[criterion.type] = {
          current: 0,
          required: criterion.value,
          percentage: 0
        };
    }
  }

  return progress;
}

module.exports = router;
