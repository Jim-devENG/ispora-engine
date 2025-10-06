const express = require('express');
const { protect } = require('../middleware/auth');
const db = require('../database/connection');
const { v4: uuidv4 } = require('uuid');
const { createNotification } = require('./notifications');

const router = express.Router();

// @desc    Get user connections
// @route   GET /api/connections
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const { status = 'accepted', page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = db('connections as c')
      .select([
        'c.*',
        'requester.id as requester_id',
        'requester.first_name as requester_first_name',
        'requester.last_name as requester_last_name',
        'requester.avatar_url as requester_avatar',
        'requester.title as requester_title',
        'requester.company as requester_company',
        'receiver.id as receiver_id',
        'receiver.first_name as receiver_first_name',
        'receiver.last_name as receiver_last_name',
        'receiver.avatar_url as receiver_avatar',
        'receiver.title as receiver_title',
        'receiver.company as receiver_company',
      ])
      .join('users as requester', 'c.requester_id', 'requester.id')
      .join('users as receiver', 'c.receiver_id', 'receiver.id')
      .where(function () {
        this.where('c.requester_id', req.user.id).orWhere('c.receiver_id', req.user.id);
      });

    if (status) {
      query = query.where('c.status', status);
    }

    const connections = await query
      .orderBy('c.created_at', 'desc')
      .limit(parseInt(limit))
      .offset(offset);

    // Format the response to show the other person
    const formattedConnections = connections.map((connection) => {
      const isRequester = connection.requester_id === req.user.id;
      const otherPerson = isRequester
        ? {
            id: connection.receiver_id,
            name: `${connection.receiver_first_name} ${connection.receiver_last_name}`,
            avatar: connection.receiver_avatar,
            title: connection.receiver_title,
            company: connection.receiver_company,
          }
        : {
            id: connection.requester_id,
            name: `${connection.requester_first_name} ${connection.requester_last_name}`,
            avatar: connection.requester_avatar,
            title: connection.requester_title,
            company: connection.requester_company,
          };

      return {
        id: connection.id,
        status: connection.status,
        message: connection.message,
        purpose: connection.purpose,
        created_at: connection.created_at,
        responded_at: connection.responded_at,
        is_requester: isRequester,
        user: otherPerson,
      };
    });

    res.status(200).json({
      success: true,
      count: formattedConnections.length,
      data: formattedConnections,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Send connection request
// @route   POST /api/connections
// @access  Private
router.post('/', protect, async (req, res, next) => {
  try {
    const { receiverId, message, purpose } = req.body;

    if (receiverId === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot send connection request to yourself',
      });
    }

    // Check if connection already exists
    const existingConnection = await db('connections')
      .where(function () {
        this.where({ requester_id: req.user.id, receiver_id: receiverId }).orWhere({
          requester_id: receiverId,
          receiver_id: req.user.id,
        });
      })
      .first();

    if (existingConnection) {
      return res.status(400).json({
        success: false,
        error: 'Connection already exists between these users',
      });
    }

    const connectionData = {
      id: uuidv4(),
      requester_id: req.user.id,
      receiver_id: receiverId,
      message,
      purpose,
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date(),
    };

    await db('connections').insert(connectionData);

    // Create notification for receiver
    await createNotification({
      user_id: receiverId,
      title: 'New Connection Request',
      message: `${req.user.first_name} ${req.user.last_name} sent you a connection request`,
      type: 'connection',
      related_user_id: req.user.id,
      action_data: JSON.stringify({ connection_id: connectionData.id }),
    });

    res.status(201).json({
      success: true,
      data: connectionData,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Respond to connection request
// @route   PUT /api/connections/:id
// @access  Private
router.put('/:id', protect, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'accepted', 'declined'

    const connection = await db('connections').where({ id }).first();

    if (!connection) {
      return res.status(404).json({
        success: false,
        error: 'Connection request not found',
      });
    }

    // Only receiver can respond to connection request
    if (connection.receiver_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to respond to this connection request',
      });
    }

    if (connection.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Connection request has already been responded to',
      });
    }

    await db('connections').where({ id }).update({
      status,
      responded_at: new Date(),
      updated_at: new Date(),
    });

    // Create notification for requester
    const notificationMessage =
      status === 'accepted'
        ? `${req.user.first_name} ${req.user.last_name} accepted your connection request`
        : `${req.user.first_name} ${req.user.last_name} declined your connection request`;

    await createNotification({
      user_id: connection.requester_id,
      title: `Connection Request ${status === 'accepted' ? 'Accepted' : 'Declined'}`,
      message: notificationMessage,
      type: 'connection',
      related_user_id: req.user.id,
    });

    const updatedConnection = await db('connections').where({ id }).first();

    res.status(200).json({
      success: true,
      data: updatedConnection,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get connection status with another user
// @route   GET /api/connections/status/:userId
// @access  Private
router.get('/status/:userId', protect, async (req, res, next) => {
  try {
    const { userId } = req.params;

    const connection = await db('connections')
      .where(function () {
        this.where({ requester_id: req.user.id, receiver_id: userId }).orWhere({
          requester_id: userId,
          receiver_id: req.user.id,
        });
      })
      .first();

    let status = 'none';
    if (connection) {
      if (connection.status === 'accepted') {
        status = 'connected';
      } else if (connection.status === 'pending') {
        status = connection.requester_id === req.user.id ? 'pending_sent' : 'pending_received';
      } else if (connection.status === 'declined') {
        status = 'declined';
      }
    }

    res.status(200).json({
      success: true,
      data: { status, connectionId: connection?.id },
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Remove connection
// @route   DELETE /api/connections/:id
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const { id } = req.params;

    const connection = await db('connections').where({ id }).first();

    if (!connection) {
      return res.status(404).json({
        success: false,
        error: 'Connection not found',
      });
    }

    // Only participants can remove connection
    if (connection.requester_id !== req.user.id && connection.receiver_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to remove this connection',
      });
    }

    await db('connections').where({ id }).del();

    res.status(200).json({
      success: true,
      message: 'Connection removed successfully',
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get mutual connections with user
// @route   GET /api/connections/mutual/:userId
// @access  Private
router.get('/mutual/:userId', protect, async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Get user's connections
    const userConnections = await db('connections')
      .select('requester_id', 'receiver_id')
      .where('status', 'accepted')
      .where(function () {
        this.where('requester_id', req.user.id).orWhere('receiver_id', req.user.id);
      });

    // Get other user's connections
    const otherUserConnections = await db('connections')
      .select('requester_id', 'receiver_id')
      .where('status', 'accepted')
      .where(function () {
        this.where('requester_id', userId).orWhere('receiver_id', userId);
      });

    // Extract user IDs from connections
    const userConnectionIds = new Set();
    userConnections.forEach((conn) => {
      const otherId = conn.requester_id === req.user.id ? conn.receiver_id : conn.requester_id;
      userConnectionIds.add(otherId);
    });

    const otherUserConnectionIds = new Set();
    otherUserConnections.forEach((conn) => {
      const otherId = conn.requester_id === userId ? conn.receiver_id : conn.requester_id;
      otherUserConnectionIds.add(otherId);
    });

    // Find mutual connections
    const mutualIds = [...userConnectionIds].filter((id) => otherUserConnectionIds.has(id));

    // Get user details for mutual connections
    const mutualConnections = await db('users')
      .select(['id', 'first_name', 'last_name', 'avatar_url', 'title', 'company'])
      .whereIn('id', mutualIds);

    res.status(200).json({
      success: true,
      count: mutualConnections.length,
      data: mutualConnections,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
