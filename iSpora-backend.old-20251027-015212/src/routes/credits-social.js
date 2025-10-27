const express = require('express');
const knex = require('../database/connection');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Share achievement/progress
router.post('/share', protect, async (req, res) => {
  try {
    const {
      share_type, // level_up, badge_earned, milestone_reached, etc.
      share_data, // { level, badge_name, points, etc. }
      platforms, // ['linkedin', 'twitter', 'facebook']
      custom_message,
    } = req.body;

    if (!share_type || !share_data) {
      return res.status(400).json({ error: 'Share type and data are required' });
    }

    const userId = req.user.id;

    // Generate share content based on type
    const shareContent = generateShareContent(share_type, share_data, custom_message);

    // Record the share
    await knex('credit_transactions').insert({
      user_id: userId,
      transaction_type: 'earned',
      activity_type: 'social_share',
      points: 50, // SOCIAL_SHARE points
      description: `Shared ${share_type} on social media`,
      metadata: JSON.stringify({
        share_type,
        share_data,
        platforms: platforms || [],
        share_content: shareContent,
      }),
      source: 'system',
    });

    // Update user credits
    await knex('user_credits')
      .where('user_id', userId)
      .increment('total_points', 50)
      .increment('social_shares', 1);

    // Update leaderboard
    const { updateLeaderboard } = require('./credits');
    await updateLeaderboard(userId);

    res.json({
      message: 'Share recorded successfully',
      pointsAwarded: 50,
      shareContent,
    });
  } catch (error) {
    console.error('Error recording share:', error);
    res.status(500).json({ error: 'Failed to record share' });
  }
});

// Get share analytics
router.get('/analytics', protect, async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const userId = req.user.id;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get share statistics
    const shareStats = await knex('credit_transactions')
      .where('user_id', userId)
      .where('activity_type', 'social_share')
      .where('created_at', '>=', startDate)
      .select('metadata')
      .orderBy('created_at', 'desc');

    // Process share data
    const shareData = shareStats.map((share) => {
      const metadata = JSON.parse(share.metadata);
      return {
        shareType: metadata.share_type,
        platforms: metadata.platforms || [],
        shareData: metadata.share_data,
        createdAt: share.created_at,
      };
    });

    // Get platform breakdown
    const platformStats = {};
    shareData.forEach((share) => {
      share.platforms.forEach((platform) => {
        platformStats[platform] = (platformStats[platform] || 0) + 1;
      });
    });

    // Get share type breakdown
    const shareTypeStats = {};
    shareData.forEach((share) => {
      shareTypeStats[share.shareType] = (shareTypeStats[share.shareType] || 0) + 1;
    });

    // Get daily shares for chart
    const dailyShares = await knex('credit_transactions')
      .select(knex.raw("DATE_TRUNC('day', created_at) as date"), knex.raw('COUNT(*) as count'))
      .where('user_id', userId)
      .where('activity_type', 'social_share')
      .where('created_at', '>=', startDate)
      .groupBy('date')
      .orderBy('date', 'asc');

    res.json({
      totalShares: shareData.length,
      totalPointsEarned: shareData.length * 50,
      platformStats,
      shareTypeStats,
      dailyShares: dailyShares.map((share) => ({
        date: share.date,
        count: parseInt(share.count),
      })),
      recentShares: shareData.slice(0, 10),
      period: parseInt(period),
    });
  } catch (error) {
    console.error('Error fetching share analytics:', error);
    res.status(500).json({ error: 'Failed to fetch share analytics' });
  }
});

// Get share templates
router.get('/templates', protect, async (req, res) => {
  try {
    const { share_type } = req.query;
    const userId = req.user.id;

    // Get user's current stats
    const userCredits = await knex('user_credits').where('user_id', userId).first();

    const userBadges = await knex('user_badges as ub')
      .select('ub.*', 'b.name', 'b.description', 'b.rarity')
      .join('badges as b', 'ub.badge_id', 'b.id')
      .where('ub.user_id', userId)
      .where('ub.earned', true)
      .orderBy('ub.earned_date', 'desc')
      .limit(5);

    const templates = {};

    if (!share_type || share_type === 'level_up') {
      templates.level_up = {
        title: `🎉 Just reached Level ${userCredits?.current_level || 1} on Ispora!`,
        description: `I'm building impactful projects and connecting with amazing diaspora professionals. Join me on this journey!`,
        text: `Just reached Level ${userCredits?.current_level || 1} on Ispora! 🚀 Building the future with fellow diaspora innovators.`,
        hashtags: ['BuiltOnIspora', 'DiasporaInnovation', 'LevelUp'],
      };
    }

    if (!share_type || share_type === 'badge_earned') {
      const latestBadge = userBadges[0];
      if (latestBadge) {
        templates.badge_earned = {
          title: `🏆 Earned the ${latestBadge.name} badge on Ispora!`,
          description: `${latestBadge.description}. Proud to be part of the diaspora innovation community!`,
          text: `🏆 Just earned the ${latestBadge.name} badge on Ispora! ${latestBadge.description}`,
          hashtags: ['BuiltOnIspora', 'DiasporaInnovation', 'BadgeEarned'],
        };
      }
    }

    if (!share_type || share_type === 'milestone_reached') {
      templates.milestone_reached = {
        title: `🎯 Reached a new milestone on Ispora!`,
        description: `Every step forward in our diaspora community makes a difference. Grateful for this journey!`,
        text: `🎯 Just reached a new milestone on Ispora! Building the future with fellow diaspora innovators.`,
        hashtags: ['BuiltOnIspora', 'DiasporaInnovation', 'Milestone'],
      };
    }

    if (!share_type || share_type === 'general') {
      templates.general = {
        title: `🌟 Making an impact on Ispora!`,
        description: `Join me in building the future with fellow diaspora professionals and innovators.`,
        text: `🌟 Making an impact on Ispora! Join the diaspora innovation community.`,
        hashtags: ['BuiltOnIspora', 'DiasporaInnovation', 'Community'],
      };
    }

    res.json(templates);
  } catch (error) {
    console.error('Error fetching share templates:', error);
    res.status(500).json({ error: 'Failed to fetch share templates' });
  }
});

// Export user's credit report
router.get('/export', protect, async (req, res) => {
  try {
    const { format = 'json', period = 'all_time' } = req.query;
    const userId = req.user.id;

    // Get user credits
    const userCredits = await knex('user_credits').where('user_id', userId).first();

    if (!userCredits) {
      return res.status(404).json({ error: 'User credits not found' });
    }

    // Get transactions
    let transactionQuery = knex('credit_transactions')
      .where('user_id', userId)
      .orderBy('created_at', 'desc');

    if (period !== 'all_time') {
      const startDate = new Date();
      if (period === 'monthly') {
        startDate.setMonth(startDate.getMonth() - 1);
      } else if (period === 'yearly') {
        startDate.setFullYear(startDate.getFullYear() - 1);
      }
      transactionQuery = transactionQuery.where('created_at', '>=', startDate);
    }

    const transactions = await transactionQuery;

    // Get badges
    const badges = await knex('user_badges as ub')
      .select('ub.*', 'b.name', 'b.description', 'b.rarity', 'b.category')
      .join('badges as b', 'ub.badge_id', 'b.id')
      .where('ub.user_id', userId)
      .where('ub.earned', true)
      .orderBy('ub.earned_date', 'desc');

    // Get leaderboard position
    const leaderboardPosition = await knex('leaderboard')
      .where('user_id', userId)
      .where('period', 'all_time')
      .first();

    const reportData = {
      user: {
        id: userId,
        totalPoints: userCredits.total_points,
        currentLevel: userCredits.current_level,
        levelProgress: userCredits.level_progress,
        currentStreak: userCredits.current_streak,
        longestStreak: userCredits.longest_streak,
      },
      statistics: {
        totalContributions: userCredits.total_contributions,
        projectsLaunched: userCredits.projects_launched,
        mentorshipSessions: userCredits.mentorship_sessions,
        opportunitiesShared: userCredits.opportunities_shared,
        socialShares: userCredits.social_shares,
        challengesWon: userCredits.challenges_won,
        referralsSuccessful: userCredits.referrals_successful,
      },
      leaderboard: {
        rank: leaderboardPosition?.rank || null,
        points: leaderboardPosition?.points || 0,
      },
      transactions: transactions.map(transformTransaction),
      badges: badges.map((badge) => ({
        name: badge.name,
        description: badge.description,
        rarity: badge.rarity,
        category: badge.category,
        earnedDate: badge.earned_date,
      })),
      period,
      generatedAt: new Date().toISOString(),
    };

    if (format === 'csv') {
      // Convert to CSV format
      const csv = convertToCSV(reportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="ispora-credits-report.csv"');
      res.send(csv);
    } else {
      res.json(reportData);
    }
  } catch (error) {
    console.error('Error exporting credit report:', error);
    res.status(500).json({ error: 'Failed to export credit report' });
  }
});

// Helper functions
function generateShareContent(shareType, shareData, customMessage) {
  const baseUrl = process.env.FRONTEND_URL || 'https://ispora.com';

  switch (shareType) {
    case 'level_up':
      return {
        title: `🎉 Just reached Level ${shareData.level} on Ispora!`,
        description: `I'm building impactful projects and connecting with amazing diaspora professionals. Join me on this journey!`,
        text: `Just reached Level ${shareData.level} on Ispora! 🚀 Building the future with fellow diaspora innovators.`,
        url: `${baseUrl}/profile/${shareData.userId}`,
        hashtags: ['BuiltOnIspora', 'DiasporaInnovation', 'LevelUp'],
      };

    case 'badge_earned':
      return {
        title: `🏆 Earned the ${shareData.badgeName} badge on Ispora!`,
        description: `${shareData.badgeDescription}. Proud to be part of the diaspora innovation community!`,
        text: `🏆 Just earned the ${shareData.badgeName} badge on Ispora! ${shareData.badgeDescription}`,
        url: `${baseUrl}/profile/${shareData.userId}`,
        hashtags: ['BuiltOnIspora', 'DiasporaInnovation', 'BadgeEarned'],
      };

    case 'milestone_reached':
      return {
        title: `🎯 Reached a new milestone on Ispora!`,
        description: `Every step forward in our diaspora community makes a difference. Grateful for this journey!`,
        text: `🎯 Just reached a new milestone on Ispora! Building the future with fellow diaspora innovators.`,
        url: `${baseUrl}/profile/${shareData.userId}`,
        hashtags: ['BuiltOnIspora', 'DiasporaInnovation', 'Milestone'],
      };

    default:
      return {
        title: customMessage || `🌟 Making an impact on Ispora!`,
        description: `Join me in building the future with fellow diaspora professionals and innovators.`,
        text:
          customMessage || `🌟 Making an impact on Ispora! Join the diaspora innovation community.`,
        url: `${baseUrl}/profile/${shareData.userId}`,
        hashtags: ['BuiltOnIspora', 'DiasporaInnovation', 'Community'],
      };
  }
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

function convertToCSV(data) {
  const headers = ['Date', 'Type', 'Activity', 'Points', 'Description'];

  const rows = data.transactions.map((transaction) => [
    new Date(transaction.createdAt).toLocaleDateString(),
    transaction.type,
    transaction.activityType,
    transaction.points,
    transaction.description,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
}

module.exports = router;
