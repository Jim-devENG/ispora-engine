const express = require('express');
const knex = require('../database/connection');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Get network discovery users (people to follow)
router.get('/discovery', protect, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      role,
      location,
      availability,
      experience_min,
      experience_max,
      skills,
      interests,
      university,
      sort_by = 'recommended',
      sort_order = 'desc',
    } = req.query;

    const offset = (page - 1) * limit;
    const userId = req.user.id;

    // Build base query for users not connected to current user
    let query = knex('users as u')
      .select(
        'u.id',
        'u.first_name',
        'u.last_name',
        'u.username',
        'u.title',
        'u.company',
        'u.location',
        'u.university',
        'u.graduation_year',
        'u.program',
        'u.bio',
        'u.avatar_url',
        'u.is_verified',
        'unp.role as network_role',
        'unp.experience_years',
        'unp.skills',
        'unp.expertise',
        'unp.interests',
        'unp.availability',
        'unp.open_to',
        'unp.achievements',
        'unp.social_links',
        'unp.response_rate',
        'uos.is_online',
        'uos.last_seen',
        'uos.status_message',
      )
      .leftJoin('user_network_profiles as unp', 'u.id', 'unp.user_id')
      .leftJoin('user_online_status as uos', 'u.id', 'uos.user_id')
      .where('u.id', '!=', userId)
      .where('unp.is_public', true)
      .where('unp.allow_connection_requests', true);

    // Exclude users already connected or with pending requests
    query = query.whereNotExists(function () {
      this.select('*')
        .from('connections as c')
        .whereRaw(
          '(c.requester_id = ? AND c.receiver_id = u.id) OR (c.requester_id = u.id AND c.receiver_id = ?)',
          [userId, userId],
        );
    });

    // Apply filters
    if (search) {
      query = query.where(function () {
        this.where('u.first_name', 'ilike', `%${search}%`)
          .orWhere('u.last_name', 'ilike', `%${search}%`)
          .orWhere('u.title', 'ilike', `%${search}%`)
          .orWhere('u.company', 'ilike', `%${search}%`)
          .orWhere('u.bio', 'ilike', `%${search}%`)
          .orWhereRaw('unp.skills::text ilike ?', [`%${search}%`])
          .orWhereRaw('unp.expertise::text ilike ?', [`%${search}%`]);
      });
    }

    if (role && role !== 'all') {
      query = query.where('unp.role', role);
    }

    if (location && location !== 'all') {
      query = query.where('u.location', 'ilike', `%${location}%`);
    }

    if (availability && availability !== 'all') {
      query = query.whereRaw(`unp.availability->>'${availability}' = 'true'`);
    }

    if (experience_min) {
      query = query.where('unp.experience_years', '>=', experience_min);
    }

    if (experience_max) {
      query = query.where('unp.experience_years', '<=', experience_max);
    }

    if (skills) {
      const skillArray = skills.split(',');
      query = query.whereRaw('unp.skills ?| array[?]', [skillArray]);
    }

    if (interests) {
      const interestArray = interests.split(',');
      query = query.whereRaw('unp.interests ?| array[?]', [interestArray]);
    }

    if (university) {
      query = query.where('u.university', 'ilike', `%${university}%`);
    }

    // Get total count
    const countQuery = query.clone().count('* as total');
    const [{ total }] = await countQuery;

    // Apply sorting
    if (sort_by === 'recommended') {
      // Add recommendation score calculation
      query = query
        .orderBy('unp.response_rate', 'desc')
        .orderBy('u.is_verified', 'desc')
        .orderBy('unp.experience_years', 'desc');
    } else if (sort_by === 'recent') {
      query = query.orderBy('u.created_at', sort_order);
    } else if (sort_by === 'experience') {
      query = query.orderBy('unp.experience_years', sort_order);
    } else if (sort_by === 'name') {
      query = query.orderBy('u.first_name', sort_order);
    }

    // Apply pagination
    const users = await query.limit(limit).offset(offset);

    // Calculate mutual connections for each user
    const usersWithMutualConnections = await Promise.all(
      users.map(async (user) => {
        const mutualConnections = await knex('connections as c1')
          .join('connections as c2', function () {
            this.on('c1.receiver_id', '=', 'c2.requester_id').andOn(
              'c1.requester_id',
              '=',
              'c2.receiver_id',
            );
          })
          .where('c1.requester_id', userId)
          .where('c1.status', 'accepted')
          .where('c2.requester_id', user.id)
          .where('c2.status', 'accepted')
          .count('* as count')
          .first();

        return {
          id: user.id,
          name: `${user.first_name} ${user.last_name}`.trim() || user.username,
          avatar: user.avatar_url,
          title: user.title,
          company: user.company,
          location: user.location,
          university: user.university,
          graduationYear: user.graduation_year,
          program: user.program,
          bio: user.bio,
          skills: user.skills || [],
          expertise: user.expertise || [],
          role: user.network_role,
          experience: user.experience_years || 0,
          connectionStatus: 'none',
          mutualConnections: parseInt(mutualConnections.count) || 0,
          responseRate: user.response_rate || 0,
          isVerified: user.is_verified,
          isOnline: user.is_online,
          lastActive: user.last_seen ? new Date(user.last_seen).toISOString() : null,
          interests: user.interests || [],
          socialLinks: user.social_links,
          achievements: user.achievements || [],
          availability: user.availability || {},
          openTo: user.open_to || [],
        };
      }),
    );

    res.json({
      users: usersWithMutualConnections,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching discovery users:', error);
    res.status(500).json({ error: 'Failed to fetch discovery users' });
  }
});

// Get network recommendations
router.get('/recommendations', protect, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const userId = req.user.id;

    // Get personalized recommendations
    const recommendations = await knex('network_recommendations as nr')
      .select(
        'nr.*',
        'u.first_name',
        'u.last_name',
        'u.username',
        'u.title',
        'u.company',
        'u.location',
        'u.avatar_url',
        'u.is_verified',
        'unp.role',
        'unp.experience_years',
        'unp.skills',
        'unp.expertise',
        'unp.interests',
        'unp.availability',
        'unp.open_to',
        'uos.is_online',
        'uos.last_seen',
      )
      .leftJoin('users as u', 'nr.recommended_user_id', 'u.id')
      .leftJoin('user_network_profiles as unp', 'u.id', 'unp.user_id')
      .leftJoin('user_online_status as uos', 'u.id', 'uos.user_id')
      .where('nr.user_id', userId)
      .where('nr.is_dismissed', false)
      .where('unp.is_public', true)
      .orderBy('nr.score', 'desc')
      .limit(parseInt(limit));

    const transformedRecommendations = recommendations.map((rec) => ({
      id: rec.recommended_user_id,
      name: `${rec.first_name} ${rec.last_name}`.trim() || rec.username,
      avatar: rec.avatar_url,
      title: rec.title,
      company: rec.company,
      location: rec.location,
      role: rec.role,
      experience: rec.experience_years || 0,
      skills: rec.skills || [],
      expertise: rec.expertise || [],
      interests: rec.interests || [],
      availability: rec.availability || {},
      openTo: rec.open_to || [],
      isVerified: rec.is_verified,
      isOnline: rec.is_online,
      lastActive: rec.last_seen ? new Date(rec.last_seen).toISOString() : null,
      recommendationType: rec.recommendation_type,
      score: parseFloat(rec.score),
      reasons: rec.reasons || [],
    }));

    res.json(transformedRecommendations);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

// Get network statistics
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get connection statistics
    const connectionStats = await knex('connections')
      .select('status')
      .count('* as count')
      .where(function () {
        this.where('requester_id', userId).orWhere('receiver_id', userId);
      })
      .groupBy('status');

    // Get pending requests (received)
    const pendingRequests = await knex('connections')
      .count('* as count')
      .where('receiver_id', userId)
      .where('status', 'pending')
      .first();

    // Get sent requests
    const sentRequests = await knex('connections')
      .count('* as count')
      .where('requester_id', userId)
      .where('status', 'pending')
      .first();

    // Get profile views (last 30 days)
    const profileViews = await knex('network_analytics')
      .count('* as count')
      .where('user_id', userId)
      .where('event_type', 'profile_view')
      .where('created_at', '>=', knex.raw("NOW() - INTERVAL '30 days'"))
      .first();

    // Get monthly growth (connections this month vs last month)
    const currentMonthConnections = await knex('connections')
      .count('* as count')
      .where(function () {
        this.where('requester_id', userId).orWhere('receiver_id', userId);
      })
      .where('status', 'accepted')
      .where('created_at', '>=', knex.raw("DATE_TRUNC('month', CURRENT_DATE)"))
      .first();

    const lastMonthConnections = await knex('connections')
      .count('* as count')
      .where(function () {
        this.where('requester_id', userId).orWhere('receiver_id', userId);
      })
      .where('status', 'accepted')
      .where('created_at', '>=', knex.raw("DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')"))
      .where('created_at', '<', knex.raw("DATE_TRUNC('month', CURRENT_DATE)"))
      .first();

    const currentCount = parseInt(currentMonthConnections.count) || 0;
    const lastCount = parseInt(lastMonthConnections.count) || 0;
    const monthlyGrowth =
      lastCount > 0 ? Math.round(((currentCount - lastCount) / lastCount) * 100) : 0;

    // Get total connections
    const totalConnections = await knex('connections')
      .count('* as count')
      .where(function () {
        this.where('requester_id', userId).orWhere('receiver_id', userId);
      })
      .where('status', 'accepted')
      .first();

    res.json({
      totalConnections: parseInt(totalConnections.count) || 0,
      pendingRequests: parseInt(pendingRequests.count) || 0,
      sentRequests: parseInt(sentRequests.count) || 0,
      profileViews: parseInt(profileViews.count) || 0,
      monthlyGrowth: monthlyGrowth,
      connectionStats: connectionStats.reduce((acc, stat) => {
        acc[stat.status] = parseInt(stat.count);
        return acc;
      }, {}),
    });
  } catch (error) {
    console.error('Error fetching network stats:', error);
    res.status(500).json({ error: 'Failed to fetch network statistics' });
  }
});

// Get filter options for discovery
router.get('/filter-options', protect, async (req, res) => {
  try {
    // Get unique roles
    const roles = await knex('user_network_profiles')
      .select('role')
      .count('* as count')
      .where('is_public', true)
      .groupBy('role')
      .orderBy('count', 'desc');

    // Get unique locations
    const locations = await knex('users')
      .select('location')
      .count('* as count')
      .whereNotNull('location')
      .where('location', '!=', '')
      .groupBy('location')
      .orderBy('count', 'desc')
      .limit(50);

    // Get unique universities
    const universities = await knex('users')
      .select('university')
      .count('* as count')
      .whereNotNull('university')
      .where('university', '!=', '')
      .groupBy('university')
      .orderBy('count', 'desc')
      .limit(50);

    // Get popular skills
    const skills = await knex('user_network_profiles')
      .select('skills')
      .where('is_public', true)
      .whereNotNull('skills');

    // Flatten and count skills
    const skillCounts = {};
    skills.forEach((profile) => {
      if (profile.skills && Array.isArray(profile.skills)) {
        profile.skills.forEach((skill) => {
          skillCounts[skill] = (skillCounts[skill] || 0) + 1;
        });
      }
    });

    const popularSkills = Object.entries(skillCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 50)
      .map(([skill, count]) => ({ skill, count }));

    // Get popular interests
    const interests = await knex('user_network_profiles')
      .select('interests')
      .where('is_public', true)
      .whereNotNull('interests');

    const interestCounts = {};
    interests.forEach((profile) => {
      if (profile.interests && Array.isArray(profile.interests)) {
        profile.interests.forEach((interest) => {
          interestCounts[interest] = (interestCounts[interest] || 0) + 1;
        });
      }
    });

    const popularInterests = Object.entries(interestCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 50)
      .map(([interest, count]) => ({ interest, count }));

    res.json({
      roles,
      locations,
      universities,
      skills: popularSkills,
      interests: popularInterests,
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({ error: 'Failed to fetch filter options' });
  }
});

module.exports = router;
