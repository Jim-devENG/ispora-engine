const express = require('express');
const knex = require('../database/connection');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Get user's network profile
router.get('/my-profile', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await knex('users as u')
      .select(
        'u.*',
        'unp.role',
        'unp.experience_years',
        'unp.skills',
        'unp.expertise',
        'unp.interests',
        'unp.availability',
        'unp.open_to',
        'unp.achievements',
        'unp.social_links',
        'unp.response_rate',
        'unp.is_public',
        'unp.show_online_status',
        'unp.allow_connection_requests',
        'uos.is_online',
        'uos.last_seen',
        'uos.status_message'
      )
      .leftJoin('user_network_profiles as unp', 'u.id', 'unp.user_id')
      .leftJoin('user_online_status as uos', 'u.id', 'uos.user_id')
      .where('u.id', userId)
      .first();

    if (!profile) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Transform the data
    const transformedProfile = {
      id: profile.id,
      name: `${profile.first_name} ${profile.last_name}`.trim() || profile.username,
      avatar: profile.avatar_url,
      title: profile.title,
      company: profile.company,
      location: profile.location,
      university: profile.university,
      graduationYear: profile.graduation_year,
      program: profile.program,
      bio: profile.bio,
      skills: profile.skills || [],
      expertise: profile.expertise || [],
      role: profile.role,
      experience: profile.experience_years || 0,
      interests: profile.interests || [],
      socialLinks: profile.social_links,
      achievements: profile.achievements || [],
      availability: profile.availability || {},
      openTo: profile.open_to || [],
      responseRate: profile.response_rate || 0,
      isVerified: profile.is_verified,
      isOnline: profile.is_online,
      lastActive: profile.last_seen ? new Date(profile.last_seen).toISOString() : null,
      isPublic: profile.is_public,
      showOnlineStatus: profile.show_online_status,
      allowConnectionRequests: profile.allow_connection_requests,
      statusMessage: profile.status_message
    };

    res.json(transformedProfile);
  } catch (error) {
    console.error('Error fetching network profile:', error);
    res.status(500).json({ error: 'Failed to fetch network profile' });
  }
});

// Update user's network profile
router.put('/my-profile', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      role,
      experience_years,
      skills,
      expertise,
      interests,
      availability,
      open_to,
      achievements,
      social_links,
      response_rate,
      is_public,
      show_online_status,
      allow_connection_requests,
      status_message
    } = req.body;

    // Check if network profile exists
    const existingProfile = await knex('user_network_profiles')
      .where('user_id', userId)
      .first();

    const profileData = {
      user_id: userId,
      role,
      experience_years,
      skills: skills ? JSON.stringify(skills) : null,
      expertise: expertise ? JSON.stringify(expertise) : null,
      interests: interests ? JSON.stringify(interests) : null,
      availability: availability ? JSON.stringify(availability) : null,
      open_to: open_to ? JSON.stringify(open_to) : null,
      achievements: achievements ? JSON.stringify(achievements) : null,
      social_links: social_links ? JSON.stringify(social_links) : null,
      response_rate,
      is_public,
      show_online_status,
      allow_connection_requests,
      updated_at: knex.fn.now()
    };

    let networkProfile;
    if (existingProfile) {
      // Update existing profile
      [networkProfile] = await knex('user_network_profiles')
        .where('user_id', userId)
        .update(profileData)
        .returning('*');
    } else {
      // Create new profile
      [networkProfile] = await knex('user_network_profiles')
        .insert(profileData)
        .returning('*');
    }

    // Update online status if status_message is provided
    if (status_message !== undefined) {
      const existingStatus = await knex('user_online_status')
        .where('user_id', userId)
        .first();

      if (existingStatus) {
        await knex('user_online_status')
          .where('user_id', userId)
          .update({
            status_message: status_message,
            updated_at: knex.fn.now()
          });
      } else {
        await knex('user_online_status')
          .insert({
            user_id: userId,
            status_message: status_message
          });
      }
    }

    res.json(networkProfile);
  } catch (error) {
    console.error('Error updating network profile:', error);
    res.status(500).json({ error: 'Failed to update network profile' });
  }
});

// Get public network profile by user ID
router.get('/profile/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;

    const profile = await knex('users as u')
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
        'unp.role',
        'unp.experience_years',
        'unp.skills',
        'unp.expertise',
        'unp.interests',
        'unp.availability',
        'unp.open_to',
        'unp.achievements',
        'unp.social_links',
        'unp.response_rate',
        'unp.is_public',
        'unp.show_online_status',
        'unp.allow_connection_requests',
        'uos.is_online',
        'uos.last_seen',
        'uos.status_message'
      )
      .leftJoin('user_network_profiles as unp', 'u.id', 'unp.user_id')
      .leftJoin('user_online_status as uos', 'u.id', 'uos.user_id')
      .where('u.id', userId)
      .first();

    if (!profile) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!profile.is_public) {
      return res.status(403).json({ error: 'Profile is private' });
    }

    // Check connection status
    const connection = await knex('connections')
      .where(function() {
        this.where({ requester_id: req.user.id, receiver_id: userId })
          .orWhere({ requester_id: userId, receiver_id: req.user.id });
      })
      .first();

    let connectionStatus = 'none';
    if (connection) {
      if (connection.status === 'accepted') {
        connectionStatus = 'connected';
      } else if (connection.requester_id === req.user.id) {
        connectionStatus = 'pending_sent';
      } else {
        connectionStatus = 'pending_received';
      }
    }

    // Calculate mutual connections
    const mutualConnections = await knex('connections as c1')
      .join('connections as c2', function() {
        this.on('c1.receiver_id', '=', 'c2.requester_id')
          .andOn('c1.requester_id', '=', 'c2.receiver_id');
      })
      .where('c1.requester_id', req.user.id)
      .where('c1.status', 'accepted')
      .where('c2.requester_id', userId)
      .where('c2.status', 'accepted')
      .count('* as count')
      .first();

    // Track profile view
    await knex('network_analytics').insert({
      user_id: userId,
      event_type: 'profile_view',
      related_user_id: req.user.id,
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    // Transform the data
    const transformedProfile = {
      id: profile.id,
      name: `${profile.first_name} ${profile.last_name}`.trim() || profile.username,
      avatar: profile.avatar_url,
      title: profile.title,
      company: profile.company,
      location: profile.location,
      university: profile.university,
      graduationYear: profile.graduation_year,
      program: profile.program,
      bio: profile.bio,
      skills: profile.skills || [],
      expertise: profile.expertise || [],
      role: profile.role,
      experience: profile.experience_years || 0,
      connectionStatus,
      mutualConnections: parseInt(mutualConnections.count) || 0,
      responseRate: profile.response_rate || 0,
      isVerified: profile.is_verified,
      isOnline: profile.show_online_status ? profile.is_online : null,
      lastActive: profile.show_online_status && profile.last_seen ? new Date(profile.last_seen).toISOString() : null,
      interests: profile.interests || [],
      socialLinks: profile.social_links,
      achievements: profile.achievements || [],
      availability: profile.availability || {},
      openTo: profile.open_to || [],
      statusMessage: profile.show_online_status ? profile.status_message : null,
      allowConnectionRequests: profile.allow_connection_requests
    };

    res.json(transformedProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update online status
router.put('/online-status', protect, async (req, res) => {
  try {
    const { is_online, status_message } = req.body;
    const userId = req.user.id;

    const existingStatus = await knex('user_online_status')
      .where('user_id', userId)
      .first();

    const statusData = {
      user_id: userId,
      is_online: is_online !== undefined ? is_online : true,
      last_seen: knex.fn.now(),
      status_message,
      updated_at: knex.fn.now()
    };

    let onlineStatus;
    if (existingStatus) {
      [onlineStatus] = await knex('user_online_status')
        .where('user_id', userId)
        .update(statusData)
        .returning('*');
    } else {
      [onlineStatus] = await knex('user_online_status')
        .insert(statusData)
        .returning('*');
    }

    res.json(onlineStatus);
  } catch (error) {
    console.error('Error updating online status:', error);
    res.status(500).json({ error: 'Failed to update online status' });
  }
});

// Get network profile analytics
router.get('/analytics', protect, async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const userId = req.user.id;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get profile views
    const profileViews = await knex('network_analytics')
      .count('* as count')
      .where('user_id', userId)
      .where('event_type', 'profile_view')
      .where('created_at', '>=', startDate)
      .first();

    // Get connection requests received
    const connectionRequestsReceived = await knex('network_analytics')
      .count('* as count')
      .where('user_id', userId)
      .where('event_type', 'connection_request_sent')
      .where('created_at', '>=', startDate)
      .first();

    // Get connection requests sent
    const connectionRequestsSent = await knex('network_analytics')
      .count('* as count')
      .where('related_user_id', userId)
      .where('event_type', 'connection_request_sent')
      .where('created_at', '>=', startDate)
      .first();

    // Get daily profile views
    const dailyViews = await knex('network_analytics')
      .select(
        knex.raw("DATE_TRUNC('day', created_at) as date"),
        knex.raw('COUNT(*) as count')
      )
      .where('user_id', userId)
      .where('event_type', 'profile_view')
      .where('created_at', '>=', startDate)
      .groupBy('date')
      .orderBy('date', 'asc');

    // Get top viewers
    const topViewers = await knex('network_analytics')
      .select('related_user_id')
      .count('* as view_count')
      .where('user_id', userId)
      .where('event_type', 'profile_view')
      .where('created_at', '>=', startDate)
      .whereNotNull('related_user_id')
      .groupBy('related_user_id')
      .orderBy('view_count', 'desc')
      .limit(10);

    // Get viewer details
    const viewerDetails = await knex('users')
      .select('id', 'first_name', 'last_name', 'username', 'avatar_url', 'title', 'company')
      .whereIn('id', topViewers.map(v => v.related_user_id));

    const topViewersWithDetails = topViewers.map(viewer => {
      const details = viewerDetails.find(d => d.id === viewer.related_user_id);
      return {
        ...viewer,
        user: details ? {
          name: `${details.first_name} ${details.last_name}`.trim() || details.username,
          avatar: details.avatar_url,
          title: details.title,
          company: details.company
        } : null
      };
    });

    res.json({
      profileViews: parseInt(profileViews.count) || 0,
      connectionRequestsReceived: parseInt(connectionRequestsReceived.count) || 0,
      connectionRequestsSent: parseInt(connectionRequestsSent.count) || 0,
      dailyViews,
      topViewers: topViewersWithDetails,
      period: parseInt(period)
    });
  } catch (error) {
    console.error('Error fetching network analytics:', error);
    res.status(500).json({ error: 'Failed to fetch network analytics' });
  }
});

// Generate network recommendations
router.post('/generate-recommendations', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's profile
    const userProfile = await knex('users as u')
      .select('u.*', 'unp.*')
      .leftJoin('user_network_profiles as unp', 'u.id', 'unp.user_id')
      .where('u.id', userId)
      .first();

    if (!userProfile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Get user's connections
    const userConnections = await knex('connections')
      .select('requester_id', 'receiver_id')
      .where(function() {
        this.where('requester_id', userId)
          .orWhere('receiver_id', userId);
      })
      .where('status', 'accepted');

    const connectedUserIds = userConnections.map(conn => 
      conn.requester_id === userId ? conn.receiver_id : conn.requester_id
    );

    // Find potential connections based on various criteria
    const recommendations = [];

    // 1. Same university
    if (userProfile.university) {
      const universityMatches = await knex('users as u')
        .select('u.id', 'u.first_name', 'u.last_name', 'u.username', 'u.title', 'u.company', 'u.avatar_url', 'u.is_verified')
        .leftJoin('user_network_profiles as unp', 'u.id', 'unp.user_id')
        .where('u.university', userProfile.university)
        .where('u.id', '!=', userId)
        .whereNotIn('u.id', connectedUserIds)
        .where('unp.is_public', true)
        .limit(5);

      universityMatches.forEach(user => {
        recommendations.push({
          user_id: user.id,
          recommended_user_id: user.id,
          recommendation_type: 'same_university',
          score: 85,
          reasons: [`Both graduated from ${userProfile.university}`]
        });
      });
    }

    // 2. Similar skills
    if (userProfile.skills && userProfile.skills.length > 0) {
      const skillMatches = await knex('users as u')
        .select('u.id', 'u.first_name', 'u.last_name', 'u.username', 'u.title', 'u.company', 'u.avatar_url', 'u.is_verified')
        .leftJoin('user_network_profiles as unp', 'u.id', 'unp.user_id')
        .where('u.id', '!=', userId)
        .whereNotIn('u.id', connectedUserIds)
        .where('unp.is_public', true)
        .whereRaw('unp.skills ?| array[?]', [userProfile.skills])
        .limit(5);

      skillMatches.forEach(user => {
        recommendations.push({
          user_id: userId,
          recommended_user_id: user.id,
          recommendation_type: 'similar_skills',
          score: 75,
          reasons: ['Has similar skills and expertise']
        });
      });
    }

    // 3. Same location
    if (userProfile.location) {
      const locationMatches = await knex('users as u')
        .select('u.id', 'u.first_name', 'u.last_name', 'u.username', 'u.title', 'u.company', 'u.avatar_url', 'u.is_verified')
        .leftJoin('user_network_profiles as unp', 'u.id', 'unp.user_id')
        .where('u.location', 'ilike', `%${userProfile.location.split(',')[0]}%`)
        .where('u.id', '!=', userId)
        .whereNotIn('u.id', connectedUserIds)
        .where('unp.is_public', true)
        .limit(5);

      locationMatches.forEach(user => {
        recommendations.push({
          user_id: userId,
          recommended_user_id: user.id,
          recommendation_type: 'same_location',
          score: 70,
          reasons: [`Located in ${userProfile.location}`]
        });
      });
    }

    // Remove duplicates and insert recommendations
    const uniqueRecommendations = recommendations.filter((rec, index, self) => 
      index === self.findIndex(r => r.recommended_user_id === rec.recommended_user_id)
    );

    // Clear existing recommendations
    await knex('network_recommendations')
      .where('user_id', userId)
      .del();

    // Insert new recommendations
    if (uniqueRecommendations.length > 0) {
      await knex('network_recommendations')
        .insert(uniqueRecommendations.map(rec => ({
          ...rec,
          reasons: JSON.stringify(rec.reasons)
        })));
    }

    res.json({
      message: 'Recommendations generated successfully',
      count: uniqueRecommendations.length
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

// Dismiss recommendation
router.put('/dismiss-recommendation/:recommendedUserId', protect, async (req, res) => {
  try {
    const { recommendedUserId } = req.params;
    const userId = req.user.id;

    await knex('network_recommendations')
      .where('user_id', userId)
      .where('recommended_user_id', recommendedUserId)
      .update({
        is_dismissed: true,
        dismissed_at: knex.fn.now()
      });

    res.json({ message: 'Recommendation dismissed successfully' });
  } catch (error) {
    console.error('Error dismissing recommendation:', error);
    res.status(500).json({ error: 'Failed to dismiss recommendation' });
  }
});

module.exports = router;
