const express = require('express');
const { protect } = require('../middleware/auth');
const db = require('../database/connection');
const { v4: uuidv4 } = require('uuid');
const socketService = require('../services/socketService');

const router = express.Router();

// @desc    Get user conversations
// @route   GET /api/communication/conversations
// @access  Private
router.get('/conversations', protect, async (req, res, next) => {
  try {
    const conversations = await db('conversations as c')
      .select([
        'c.*',
        'creator.first_name as creator_first_name',
        'creator.last_name as creator_last_name',
        'creator.avatar_url as creator_avatar'
      ])
      .join('users as creator', 'c.created_by', 'creator.id')
      .join('conversation_participants as cp', 'c.id', 'cp.conversation_id')
      .where('cp.user_id', req.user.id)
      .orderBy('c.last_message_at', 'desc');

    // Get participant info for each conversation
    for (let conversation of conversations) {
      const participants = await db('conversation_participants as cp')
        .select([
          'u.id', 'u.first_name', 'u.last_name', 'u.avatar_url', 'u.is_online',
          'cp.role', 'cp.last_read_at'
        ])
        .join('users as u', 'cp.user_id', 'u.id')
        .where('cp.conversation_id', conversation.id);

      conversation.participants = participants;

      // Get unread count for current user
      const participant = participants.find(p => p.id === req.user.id);
      const lastReadAt = participant?.last_read_at || new Date(0);
      
      const unreadCount = await db('messages')
        .where('conversation_id', conversation.id)
        .where('created_at', '>', lastReadAt)
        .where('sender_id', '!=', req.user.id)
        .count('* as count')
        .first();

      conversation.unread_count = unreadCount.count;
    }

    res.status(200).json({
      success: true,
      data: conversations
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create conversation
// @route   POST /api/communication/conversations
// @access  Private
router.post('/conversations', protect, async (req, res, next) => {
  try {
    const { participants, title, type = 'direct', projectId } = req.body;

    const conversationId = uuidv4();
    const conversationData = {
      id: conversationId,
      type,
      title,
      created_by: req.user.id,
      project_id: projectId || null,
      created_at: new Date(),
      updated_at: new Date()
    };

    await db('conversations').insert(conversationData);

    // Add participants
    const participantData = participants.map(participantId => ({
      id: uuidv4(),
      conversation_id: conversationId,
      user_id: participantId,
      role: participantId === req.user.id ? 'admin' : 'member',
      created_at: new Date(),
      updated_at: new Date()
    }));

    // Add creator if not in participants
    if (!participants.includes(req.user.id)) {
      participantData.push({
        id: uuidv4(),
        conversation_id: conversationId,
        user_id: req.user.id,
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    await db('conversation_participants').insert(participantData);

    const conversation = await db('conversations')
      .where({ id: conversationId })
      .first();

    res.status(201).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get messages for a conversation
// @route   GET /api/communication/messages/:conversationId
// @access  Private
router.get('/messages/:conversationId', protect, async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    // Check if user is participant
    const participant = await db('conversation_participants')
      .where({ conversation_id: conversationId, user_id: req.user.id })
      .first();

    if (!participant) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this conversation'
      });
    }

    const messages = await db('messages as m')
      .select([
        'm.*',
        'sender.first_name as sender_first_name',
        'sender.last_name as sender_last_name',
        'sender.avatar_url as sender_avatar',
        'reply_to_msg.content as reply_to_content',
        'reply_to_sender.first_name as reply_to_sender_name'
      ])
      .join('users as sender', 'm.sender_id', 'sender.id')
      .leftJoin('messages as reply_to_msg', 'm.reply_to_id', 'reply_to_msg.id')
      .leftJoin('users as reply_to_sender', 'reply_to_msg.sender_id', 'reply_to_sender.id')
      .where('m.conversation_id', conversationId)
      .orderBy('m.created_at', 'desc')
      .limit(parseInt(limit))
      .offset(offset);

    // Update last read timestamp
    await db('conversation_participants')
      .where({ conversation_id: conversationId, user_id: req.user.id })
      .update({ last_read_at: new Date() });

    res.status(200).json({
      success: true,
      data: messages.reverse() // Return in chronological order
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Send a message
// @route   POST /api/communication/messages
// @access  Private
router.post('/messages', protect, async (req, res, next) => {
  try {
    const { conversationId, content, type = 'text', attachments, replyToId } = req.body;

    // Check if user is participant
    const participant = await db('conversation_participants')
      .where({ conversation_id: conversationId, user_id: req.user.id })
      .first();

    if (!participant) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to send messages to this conversation'
      });
    }

    const messageId = uuidv4();
    const messageData = {
      id: messageId,
      conversation_id: conversationId,
      sender_id: req.user.id,
      content,
      type,
      attachments: attachments ? JSON.stringify(attachments) : null,
      reply_to_id: replyToId || null,
      created_at: new Date(),
      updated_at: new Date()
    };

    await db('messages').insert(messageData);

    // Update conversation last message timestamp
    await db('conversations')
      .where({ id: conversationId })
      .update({ last_message_at: new Date() });

    // Get full message with sender info
    const message = await db('messages as m')
      .select([
        'm.*',
        'sender.first_name as sender_first_name',
        'sender.last_name as sender_last_name',
        'sender.avatar_url as sender_avatar'
      ])
      .join('users as sender', 'm.sender_id', 'sender.id')
      .where('m.id', messageId)
      .first();

    // Send real-time notification to other participants
    const otherParticipants = await db('conversation_participants')
      .where({ conversation_id: conversationId })
      .whereNot({ user_id: req.user.id });

    for (let participant of otherParticipants) {
      socketService.sendNotificationToUser(participant.user_id, {
        type: 'new_message',
        data: message
      });
    }

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get direct conversation with user
// @route   GET /api/communication/direct/:userId
// @access  Private
router.get('/direct/:userId', protect, async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Find existing direct conversation
    let conversation = await db('conversations as c')
      .join('conversation_participants as cp1', 'c.id', 'cp1.conversation_id')
      .join('conversation_participants as cp2', 'c.id', 'cp2.conversation_id')
      .where('c.type', 'direct')
      .where('cp1.user_id', req.user.id)
      .where('cp2.user_id', userId)
      .select('c.*')
      .first();

    if (!conversation) {
      // Create new direct conversation
      const conversationId = uuidv4();
      const conversationData = {
        id: conversationId,
        type: 'direct',
        created_by: req.user.id,
        created_at: new Date(),
        updated_at: new Date()
      };

      await db('conversations').insert(conversationData);

      // Add participants
      await db('conversation_participants').insert([
        {
          id: uuidv4(),
          conversation_id: conversationId,
          user_id: req.user.id,
          role: 'member',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          conversation_id: conversationId,
          user_id: userId,
          role: 'member',
          created_at: new Date(),
          updated_at: new Date()
        }
      ]);

      conversation = await db('conversations')
        .where({ id: conversationId })
        .first();
    }

    res.status(200).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update message (edit)
// @route   PUT /api/communication/messages/:id
// @access  Private
router.put('/messages/:id', protect, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const message = await db('messages')
      .where({ id, sender_id: req.user.id })
      .first();

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found or not authorized'
      });
    }

    await db('messages')
      .where({ id })
      .update({
        content,
        edited: true,
        edited_at: new Date(),
        updated_at: new Date()
      });

    const updatedMessage = await db('messages as m')
      .select([
        'm.*',
        'sender.first_name as sender_first_name',
        'sender.last_name as sender_last_name',
        'sender.avatar_url as sender_avatar'
      ])
      .join('users as sender', 'm.sender_id', 'sender.id')
      .where('m.id', id)
      .first();

    res.status(200).json({
      success: true,
      data: updatedMessage
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
