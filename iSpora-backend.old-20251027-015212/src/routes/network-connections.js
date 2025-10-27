const express = require('express');
const knex = require('../database/connection');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Get user's connections
router.get('/my-connections', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, location, sort_by = 'recent' } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    let query = knex('connections as c')
      .select(
        'c.*',
        'u.id as user_id',
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
      .join('users as u', function () {
        this.on('u.id', '=', 'c.requester_id').orOn('u.id', '=', 'c.receiver_id');
      })
      .leftJoin('user_network_profiles as unp', 'u.id', 'unp.user_id')
      .leftJoin('user_online_status as uos', 'u.id', 'uos.user_id')
      .where('c.status', 'accepted')
      .where(function () {
        this.where('c.requester_id', userId).orWhere('c.receiver_id', userId);
      })
      .where('u.id', '!=', userId);

    // Apply filters
    if (search) {
      query = query.where(function () {
        this.where('u.first_name', 'ilike', `%${search}%`)
          .orWhere('u.last_name', 'ilike', `%${search}%`)
          .orWhere('u.title', 'ilike', `%${search}%`)
          .orWhere('u.company', 'ilike', `%${search}%`);
      });
    }

    if (role && role !== 'all') {
      query = query.where('unp.role', role);
    }

    if (location && location !== 'all') {
      query = query.where('u.location', 'ilike', `%${location}%`);
    }

    // Apply sorting
    if (sort_by === 'recent') {
      query = query.orderBy('c.created_at', 'desc');
    } else if (sort_by === 'name') {
      query = query.orderBy('u.first_name', 'asc');
    } else if (sort_by === 'experience') {
      query = query.orderBy('unp.experience_years', 'desc');
    }

    // Get total count
    const countQuery = query.clone().count('* as total');
    const [{ total }] = await countQuery;

    // Apply pagination
    const connections = await query.limit(limit).offset(offset);

    // Transform the data
    const transformedConnections = connections.map((conn) => ({
      id: conn.user_id,
      name: `${conn.first_name} ${conn.last_name}`.trim() || conn.username,
      avatar: conn.avatar_url,
      title: conn.title,
      company: conn.company,
      location: conn.location,
      university: conn.university,
      graduationYear: conn.graduation_year,
      program: conn.program,
      bio: conn.bio,
      skills: conn.skills || [],
      expertise: conn.expertise || [],
      role: conn.network_role,
      experience: conn.experience_years || 0,
      connectionStatus: 'connected',
      responseRate: conn.response_rate || 0,
      isVerified: conn.is_verified,
      isOnline: conn.is_online,
      lastActive: conn.last_seen ? new Date(conn.last_seen).toISOString() : null,
      interests: conn.interests || [],
      socialLinks: conn.social_links,
      achievements: conn.achievements || [],
      availability: conn.availability || {},
      openTo: conn.open_to || [],
      connectedAt: conn.created_at,
      connectionMessage: conn.message,
      connectionPurpose: conn.purpose,
    }));

    res.json({
      connections: transformedConnections,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({ error: 'Failed to fetch connections' });
  }
});

// Get connection requests (received)
router.get('/requests', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'pending' } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    let query = knex('connections as c')
      .select(
        'c.*',
        'u.id as user_id',
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
      )
      .join('users as u', 'c.requester_id', 'u.id')
      .leftJoin('user_network_profiles as unp', 'u.id', 'unp.user_id')
      .leftJoin('user_online_status as uos', 'u.id', 'uos.user_id')
      .where('c.receiver_id', userId)
      .where('c.status', status);

    // Get total count
    const countQuery = query.clone().count('* as total');
    const [{ total }] = await countQuery;

    // Apply pagination and ordering
    const requests = await query.orderBy('c.created_at', 'desc').limit(limit).offset(offset);

    // Transform the data
    const transformedRequests = requests.map((req) => ({
      id: req.id,
      from: {
        id: req.user_id,
        name: `${req.first_name} ${req.last_name}`.trim() || req.username,
        avatar: req.avatar_url,
        title: req.title,
        company: req.company,
        location: req.location,
        university: req.university,
        graduationYear: req.graduation_year,
        program: req.program,
        bio: req.bio,
        skills: req.skills || [],
        expertise: req.expertise || [],
        role: req.network_role,
        experience: req.experience_years || 0,
        responseRate: req.response_rate || 0,
        isVerified: req.is_verified,
        isOnline: req.is_online,
        lastActive: req.last_seen ? new Date(req.last_seen).toISOString() : null,
        interests: req.interests || [],
        socialLinks: req.social_links,
        achievements: req.achievements || [],
        availability: req.availability || {},
        openTo: req.open_to || [],
      },
      to: {
        id: userId,
        name: `${req.user.first_name} ${req.user.last_name}`.trim() || req.user.username,
      },
      message: req.message,
      timestamp: req.created_at,
      status: req.status,
      type: 'connection',
      purpose: req.purpose,
    }));

    res.json({
      requests: transformedRequests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching connection requests:', error);
    res.status(500).json({ error: 'Failed to fetch connection requests' });
  }
});

// Get sent connection requests
router.get('/sent-requests', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'pending' } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    let query = knex('connections as c')
      .select(
        'c.*',
        'u.id as user_id',
        'u.first_name',
        'u.last_name',
        'u.username',
        'u.title',
        'u.company',
        'u.location',
        'u.avatar_url',
        'u.is_verified',
        'unp.role as network_role',
        'unp.experience_years',
        'uos.is_online',
        'uos.last_seen',
      )
      .join('users as u', 'c.receiver_id', 'u.id')
      .leftJoin('user_network_profiles as unp', 'u.id', 'unp.user_id')
      .leftJoin('user_online_status as uos', 'u.id', 'uos.user_id')
      .where('c.requester_id', userId)
      .where('c.status', status);

    // Get total count
    const countQuery = query.clone().count('* as total');
    const [{ total }] = await countQuery;

    // Apply pagination and ordering
    const requests = await query.orderBy('c.created_at', 'desc').limit(limit).offset(offset);

    // Transform the data
    const transformedRequests = requests.map((req) => ({
      id: req.id,
      to: {
        id: req.user_id,
        name: `${req.first_name} ${req.last_name}`.trim() || req.username,
        avatar: req.avatar_url,
        title: req.title,
        company: req.company,
        location: req.location,
        role: req.network_role,
        experience: req.experience_years || 0,
        isVerified: req.is_verified,
        isOnline: req.is_online,
        lastActive: req.last_seen ? new Date(req.last_seen).toISOString() : null,
      },
      message: req.message,
      timestamp: req.created_at,
      status: req.status,
      type: 'connection',
      purpose: req.purpose,
    }));

    res.json({
      requests: transformedRequests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching sent requests:', error);
    res.status(500).json({ error: 'Failed to fetch sent requests' });
  }
});

// Send connection request
router.post('/connect', protect, async (req, res) => {
  try {
    const { userId, message, purpose } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot send connection request to yourself' });
    }

    // Check if user exists and is public
    const targetUser = await knex('users as u')
      .select('u.id', 'unp.allow_connection_requests')
      .leftJoin('user_network_profiles as unp', 'u.id', 'unp.user_id')
      .where('u.id', userId)
      .first();

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!targetUser.allow_connection_requests) {
      return res.status(403).json({ error: 'User does not accept connection requests' });
    }

    // Check if connection already exists
    const existingConnection = await knex('connections')
      .where(function () {
        this.where({ requester_id: req.user.id, receiver_id: userId }).orWhere({
          requester_id: userId,
          receiver_id: req.user.id,
        });
      })
      .first();

    if (existingConnection) {
      return res.status(400).json({ error: 'Connection already exists between these users' });
    }

    // Create connection request
    const [connection] = await knex('connections')
      .insert({
        requester_id: req.user.id,
        receiver_id: userId,
        message: message,
        purpose: purpose,
        status: 'pending',
      })
      .returning('*');

    // Track analytics
    await knex('network_analytics').insert({
      user_id: req.user.id,
      event_type: 'connection_request_sent',
      related_user_id: userId,
      metadata: JSON.stringify({ purpose, has_message: !!message }),
    });

    // Create notification for receiver
    await knex('notifications').insert({
      user_id: userId,
      title: 'New Connection Request',
      message: `${req.user.first_name} ${req.user.last_name} sent you a connection request`,
      type: 'connection',
      related_user_id: req.user.id,
      action_data: JSON.stringify({ connection_id: connection.id }),
    });

    res.status(201).json(connection);
  } catch (error) {
    console.error('Error sending connection request:', error);
    res.status(500).json({ error: 'Failed to send connection request' });
  }
});

// Accept connection request
router.put('/accept/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    // Get connection request
    const connection = await knex('connections')
      .where('id', id)
      .where('receiver_id', req.user.id)
      .where('status', 'pending')
      .first();

    if (!connection) {
      return res.status(404).json({ error: 'Connection request not found' });
    }

    // Update connection status
    const [updatedConnection] = await knex('connections')
      .where('id', id)
      .update({
        status: 'accepted',
        responded_at: knex.fn.now(),
      })
      .returning('*');

    // Track analytics
    await knex('network_analytics').insert({
      user_id: req.user.id,
      event_type: 'connection_request_accepted',
      related_user_id: connection.requester_id,
    });

    // Create notification for requester
    await knex('notifications').insert({
      user_id: connection.requester_id,
      title: 'Connection Request Accepted',
      message: `${req.user.first_name} ${req.user.last_name} accepted your connection request`,
      type: 'connection',
      related_user_id: req.user.id,
      action_data: JSON.stringify({ connection_id: connection.id }),
    });

    res.json(updatedConnection);
  } catch (error) {
    console.error('Error accepting connection request:', error);
    res.status(500).json({ error: 'Failed to accept connection request' });
  }
});

// Decline connection request
router.put('/decline/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    // Get connection request
    const connection = await knex('connections')
      .where('id', id)
      .where('receiver_id', req.user.id)
      .where('status', 'pending')
      .first();

    if (!connection) {
      return res.status(404).json({ error: 'Connection request not found' });
    }

    // Update connection status
    const [updatedConnection] = await knex('connections')
      .where('id', id)
      .update({
        status: 'declined',
        responded_at: knex.fn.now(),
      })
      .returning('*');

    // Track analytics
    await knex('network_analytics').insert({
      user_id: req.user.id,
      event_type: 'connection_request_declined',
      related_user_id: connection.requester_id,
    });

    res.json(updatedConnection);
  } catch (error) {
    console.error('Error declining connection request:', error);
    res.status(500).json({ error: 'Failed to decline connection request' });
  }
});

// Remove connection
router.delete('/remove/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the connection
    const connection = await knex('connections')
      .where(function () {
        this.where({ requester_id: req.user.id, receiver_id: userId }).orWhere({
          requester_id: userId,
          receiver_id: req.user.id,
        });
      })
      .where('status', 'accepted')
      .first();

    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    // Delete the connection
    await knex('connections').where('id', connection.id).del();

    // Track analytics
    await knex('network_analytics').insert({
      user_id: req.user.id,
      event_type: 'connection_removed',
      related_user_id: userId,
    });

    res.json({ message: 'Connection removed successfully' });
  } catch (error) {
    console.error('Error removing connection:', error);
    res.status(500).json({ error: 'Failed to remove connection' });
  }
});

// Get mutual connections
router.get('/mutual/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query;

    // Get mutual connections
    const mutualConnections = await knex('connections as c1')
      .select(
        'u.id',
        'u.first_name',
        'u.last_name',
        'u.username',
        'u.title',
        'u.company',
        'u.avatar_url',
        'u.is_verified',
        'unp.role',
        'unp.experience_years',
        'uos.is_online',
      )
      .join('connections as c2', function () {
        this.on('c1.receiver_id', '=', 'c2.requester_id').andOn(
          'c1.requester_id',
          '=',
          'c2.receiver_id',
        );
      })
      .join('users as u', function () {
        this.on('u.id', '=', 'c1.receiver_id').orOn('u.id', '=', 'c1.requester_id');
      })
      .leftJoin('user_network_profiles as unp', 'u.id', 'unp.user_id')
      .leftJoin('user_online_status as uos', 'u.id', 'uos.user_id')
      .where('c1.requester_id', req.user.id)
      .where('c1.status', 'accepted')
      .where('c2.requester_id', userId)
      .where('c2.status', 'accepted')
      .where('u.id', '!=', req.user.id)
      .where('u.id', '!=', userId)
      .limit(parseInt(limit));

    const transformedConnections = mutualConnections.map((conn) => ({
      id: conn.id,
      name: `${conn.first_name} ${conn.last_name}`.trim() || conn.username,
      avatar: conn.avatar_url,
      title: conn.title,
      company: conn.company,
      role: conn.role,
      experience: conn.experience_years || 0,
      isVerified: conn.is_verified,
      isOnline: conn.is_online,
    }));

    res.json(transformedConnections);
  } catch (error) {
    console.error('Error fetching mutual connections:', error);
    res.status(500).json({ error: 'Failed to fetch mutual connections' });
  }
});

module.exports = router;
