const express = require('express');
const knex = require('../database/connection');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Point values configuration
const POINT_VALUES = {
  PROJECT_LAUNCH: 500,
  PROJECT_MILESTONE: 150,
  MENTORSHIP_DELIVER: 200,
  OPPORTUNITY_SHARE: 75,
  DISCUSSION_JOIN: 25,
  IDEA_POST: 100,
  PLATFORM_INVITE: 300,
  SOCIAL_SHARE: 50,
  COMMUNITY_UPVOTE: 10,
  WORKSHOP_COMPLETE: 250,
  CHALLENGE_WIN: 1000,
  REFERRAL_SUCCESS: 500,
  BADGE_EARNED: 100,
  LEVEL_UP_BONUS: 200,
};

// Level configuration
const LEVEL_CONFIG = {
  1: { points_required: 0, bonus_points: 0 },
  2: { points_required: 100, bonus_points: 50 },
  3: { points_required: 250, bonus_points: 75 },
  4: { points_required: 500, bonus_points: 100 },
  5: { points_required: 750, bonus_points: 125 },
  6: { points_required: 1000, bonus_points: 150 },
  7: { points_required: 1500, bonus_points: 200 },
  8: { points_required: 2000, bonus_points: 250 },
  9: { points_required: 3000, bonus_points: 300 },
  10: { points_required: 4000, bonus_points: 400 },
  11: { points_required: 5500, bonus_points: 500 },
  12: { points_required: 7000, bonus_points: 600 },
  13: { points_required: 9000, bonus_points: 700 },
  14: { points_required: 12000, bonus_points: 800 },
  15: { points_required: 15000, bonus_points: 1000 },
};

// Get user's credit dashboard
router.get('/dashboard', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user credits
    const userCredits = await knex('user_credits').where('user_id', userId).first();

    if (!userCredits) {
      // Initialize credits for new user
      await initializeUserCredits(userId);
      const newCredits = await knex('user_credits').where('user_id', userId).first();
      return res.json(transformCreditsData(newCredits));
    }

    // Get recent transactions
    const recentTransactions = await knex('credit_transactions')
      .where('user_id', userId)
      .orderBy('created_at', 'desc')
      .limit(10);

    // Get earned badges
    const earnedBadges = await knex('user_badges as ub')
      .select('ub.*', 'b.*')
      .join('badges as b', 'ub.badge_id', 'b.id')
      .where('ub.user_id', userId)
      .where('ub.earned', true)
      .orderBy('ub.earned_date', 'desc')
      .limit(5);

    // Get current level info
    const currentLevel = userCredits.current_level;
    const nextLevel = currentLevel + 1;
    const levelConfig = LEVEL_CONFIG[nextLevel] || { points_required: 0, bonus_points: 0 };
    const pointsToNextLevel = levelConfig.points_required - userCredits.total_points;

    const dashboardData = {
      ...transformCreditsData(userCredits),
      nextLevelPoints: Math.max(0, pointsToNextLevel),
      recentTransactions: recentTransactions.map(transformTransaction),
      recentBadges: earnedBadges.map(transformBadge),
      levelConfig: LEVEL_CONFIG,
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Error fetching credit dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch credit dashboard' });
  }
});

// Get user's credit statistics
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '30' } = req.query; // days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get user credits
    const userCredits = await knex('user_credits').where('user_id', userId).first();

    if (!userCredits) {
      return res.status(404).json({ error: 'User credits not found' });
    }

    // Get period statistics
    const periodStats = await knex('credit_transactions')
      .select('activity_type')
      .sum('points as total_points')
      .count('* as count')
      .where('user_id', userId)
      .where('created_at', '>=', startDate)
      .where('points', '>', 0)
      .groupBy('activity_type');

    // Get daily points for chart
    const dailyPoints = await knex('credit_transactions')
      .select(knex.raw("DATE_TRUNC('day', created_at) as date"), knex.raw('SUM(points) as points'))
      .where('user_id', userId)
      .where('created_at', '>=', startDate)
      .where('points', '>', 0)
      .groupBy('date')
      .orderBy('date', 'asc');

    // Get leaderboard position
    const leaderboardPosition = await knex('leaderboard')
      .where('user_id', userId)
      .where('period', 'all_time')
      .first();

    res.json({
      totalPoints: userCredits.total_points,
      currentLevel: userCredits.current_level,
      levelProgress: userCredits.level_progress,
      currentStreak: userCredits.current_streak,
      longestStreak: userCredits.longest_streak,
      monthlyPoints: userCredits.monthly_points,
      weeklyPoints: userCredits.weekly_points,
      periodStats: periodStats.map((stat) => ({
        activityType: stat.activity_type,
        totalPoints: parseInt(stat.total_points),
        count: parseInt(stat.count),
      })),
      dailyPoints,
      leaderboardRank: leaderboardPosition?.rank || null,
      period: parseInt(period),
    });
  } catch (error) {
    console.error('Error fetching credit stats:', error);
    res.status(500).json({ error: 'Failed to fetch credit statistics' });
  }
});

// Get credit transactions
router.get('/transactions', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, activity_type } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    let query = knex('credit_transactions').where('user_id', userId).orderBy('created_at', 'desc');

    if (type) {
      query = query.where('transaction_type', type);
    }

    if (activity_type) {
      query = query.where('activity_type', activity_type);
    }

    // Get total count
    const countQuery = query.clone().count('* as total');
    const [{ total }] = await countQuery;

    // Apply pagination
    const transactions = await query.limit(limit).offset(offset);

    res.json({
      transactions: transactions.map(transformTransaction),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Award points to user
router.post('/award', protect, async (req, res) => {
  try {
    const {
      user_id,
      activity_type,
      points,
      description,
      related_project_id,
      related_user_id,
      related_opportunity_id,
      metadata,
    } = req.body;

    if (!user_id || !activity_type || !points || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify user exists
    const user = await knex('users').where('id', user_id).first();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get or create user credits
    let userCredits = await knex('user_credits').where('user_id', user_id).first();

    if (!userCredits) {
      await initializeUserCredits(user_id);
      userCredits = await knex('user_credits').where('user_id', user_id).first();
    }

    // Create transaction
    const transaction = await knex('credit_transactions')
      .insert({
        user_id,
        transaction_type: 'earned',
        activity_type,
        points,
        description,
        related_project_id,
        related_user_id,
        related_opportunity_id,
        metadata: JSON.stringify(metadata),
        source: 'system',
        level_before: userCredits.current_level,
      })
      .returning('*');

    // Update user credits
    const newTotalPoints = userCredits.total_points + points;
    const levelInfo = calculateLevel(newTotalPoints);

    const updatedCredits = await knex('user_credits')
      .where('user_id', user_id)
      .update({
        total_points: newTotalPoints,
        current_level: levelInfo.level,
        level_progress: levelInfo.progress,
        points_to_next_level: levelInfo.pointsToNext,
        monthly_points: userCredits.monthly_points + points,
        weekly_points: userCredits.weekly_points + points,
        total_contributions: userCredits.total_contributions + 1,
        updated_at: knex.fn.now(),
      })
      .returning('*');

    // Check for level up
    if (levelInfo.level > userCredits.current_level) {
      // Award level up bonus
      const bonusPoints = LEVEL_CONFIG[levelInfo.level]?.bonus_points || 0;
      if (bonusPoints > 0) {
        await knex('credit_transactions').insert({
          user_id,
          transaction_type: 'bonus',
          activity_type: 'level_up',
          points: bonusPoints,
          description: `Level ${levelInfo.level} bonus`,
          source: 'system',
          is_bonus: true,
          level_up: true,
        });

        // Update credits with bonus
        await knex('user_credits')
          .where('user_id', user_id)
          .update({
            total_points: newTotalPoints + bonusPoints,
            last_level_up: knex.fn.now(),
          });
      }
    }

    // Update leaderboard
    await updateLeaderboard(user_id);

    res.json({
      transaction: transformTransaction(transaction[0]),
      credits: transformCreditsData(updatedCredits[0]),
      levelUp: levelInfo.level > userCredits.current_level,
    });
  } catch (error) {
    console.error('Error awarding points:', error);
    res.status(500).json({ error: 'Failed to award points' });
  }
});

// Get leaderboard
router.get('/leaderboard', protect, async (req, res) => {
  try {
    const { period = 'all_time', limit = 50 } = req.query;
    const userId = req.user.id;

    let query = knex('leaderboard as l')
      .select(
        'l.*',
        'u.first_name',
        'u.last_name',
        'u.username',
        'u.avatar_url',
        'u.location',
        'u.university',
      )
      .join('users as u', 'l.user_id', 'u.id')
      .where('l.period', period)
      .orderBy('l.rank', 'asc');

    if (period !== 'all_time') {
      const now = new Date();
      if (period === 'monthly') {
        query = query.where('l.period_date', knex.raw("DATE_TRUNC('month', ?)", [now]));
      } else if (period === 'weekly') {
        query = query.where('l.period_date', knex.raw("DATE_TRUNC('week', ?)", [now]));
      } else if (period === 'daily') {
        query = query.where('l.period_date', knex.raw("DATE_TRUNC('day', ?)", [now]));
      }
    }

    const leaderboard = await query.limit(parseInt(limit));

    // Add current user indicator
    const transformedLeaderboard = leaderboard.map((entry) => ({
      rank: entry.rank,
      user: {
        name: `${entry.first_name} ${entry.last_name}`.trim() || entry.username,
        avatar: entry.avatar_url,
        location: entry.location,
        university: entry.university,
      },
      points: entry.points,
      level: entry.level,
      badges: entry.badges_count,
      change: entry.change_direction,
      changeValue: entry.change_value,
      isCurrentUser: entry.user_id === userId,
    }));

    res.json(transformedLeaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Helper functions
async function initializeUserCredits(userId) {
  await knex('user_credits').insert({
    user_id: userId,
    total_points: 0,
    current_level: 1,
    level_progress: 0,
    points_to_next_level: 100,
    current_streak: 0,
    longest_streak: 0,
    monthly_points: 0,
    weekly_points: 0,
    total_contributions: 0,
    projects_launched: 0,
    mentorship_sessions: 0,
    opportunities_shared: 0,
    social_shares: 0,
    challenges_won: 0,
    referrals_successful: 0,
    level_config: JSON.stringify(LEVEL_CONFIG),
  });
}

function calculateLevel(totalPoints) {
  let level = 1;
  let pointsToNext = 100;

  for (const [levelNum, config] of Object.entries(LEVEL_CONFIG)) {
    if (totalPoints >= config.points_required) {
      level = parseInt(levelNum);
      const nextLevel = level + 1;
      const nextConfig = LEVEL_CONFIG[nextLevel];
      if (nextConfig) {
        pointsToNext = nextConfig.points_required - totalPoints;
      } else {
        pointsToNext = 0;
      }
    } else {
      break;
    }
  }

  const progress =
    pointsToNext > 0
      ? Math.round(
          ((LEVEL_CONFIG[level + 1]?.points_required - totalPoints) /
            (LEVEL_CONFIG[level + 1]?.points_required - LEVEL_CONFIG[level]?.points_required)) *
            100,
        )
      : 100;

  return { level, progress, pointsToNext };
}

async function updateLeaderboard(userId) {
  // Update all-time leaderboard
  const userCredits = await knex('user_credits').where('user_id', userId).first();
  if (!userCredits) return;

  const badgesCount = await knex('user_badges')
    .where('user_id', userId)
    .where('earned', true)
    .count('* as count')
    .first();

  // Get current rank
  const higherRankedUsers = await knex('user_credits')
    .where('total_points', '>', userCredits.total_points)
    .count('* as count')
    .first();

  const rank = parseInt(higherRankedUsers.count) + 1;

  // Update or insert leaderboard entry
  await knex('leaderboard').where('user_id', userId).where('period', 'all_time').del();

  await knex('leaderboard').insert({
    user_id: userId,
    rank,
    points: userCredits.total_points,
    level: userCredits.current_level,
    badges_count: parseInt(badgesCount.count),
    period: 'all_time',
    monthly_points: userCredits.monthly_points,
    weekly_points: userCredits.weekly_points,
    daily_points: 0, // This would be calculated separately
  });
}

function transformCreditsData(credits) {
  return {
    totalPoints: credits.total_points,
    currentLevel: credits.current_level,
    levelProgress: credits.level_progress,
    pointsToNextLevel: credits.points_to_next_level,
    currentStreak: credits.current_streak,
    longestStreak: credits.longest_streak,
    monthlyPoints: credits.monthly_points,
    weeklyPoints: credits.weekly_points,
    totalContributions: credits.total_contributions,
    projectsLaunched: credits.projects_launched,
    mentorshipSessions: credits.mentorship_sessions,
    opportunitiesShared: credits.opportunities_shared,
    socialShares: credits.social_shares,
    challengesWon: credits.challenges_won,
    referralsSuccessful: credits.referrals_successful,
  };
}

function transformTransaction(transaction) {
  return {
    id: transaction.id,
    type: transaction.transaction_type,
    activityType: transaction.activity_type,
    points: transaction.points,
    description: transaction.description,
    isBonus: transaction.is_bonus,
    isPenalty: transaction.is_penalty,
    levelUp: transaction.level_up,
    createdAt: transaction.created_at,
    metadata: transaction.metadata ? JSON.parse(transaction.metadata) : null,
  };
}

function transformBadge(badge) {
  return {
    id: badge.badge_id,
    name: badge.name,
    description: badge.description,
    iconName: badge.icon_name,
    color: badge.color,
    textColor: badge.text_color,
    bgColor: badge.bg_color,
    borderColor: badge.border_color,
    rarity: badge.rarity,
    earned: badge.earned,
    earnedDate: badge.earned_date,
    progress: badge.progress,
  };
}

module.exports = router;
