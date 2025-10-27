const express = require('express');
const db = require('../database/connection');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ==================== MESSAGE MANAGEMENT ====================

// @desc    Get project messages
// @route   GET /api/project-messages/:projectId
// @access  Private
router.get('/:projectId', protect, async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { page = 1, limit = 50, channel = 'general', thread_id } = req.query;
    const offset = (page - 1) * limit;

    // Verify user has access to project
    const projectAccess = await db('project_members')
      .where({ project_id: projectId, user_id: req.user.id, status: 'active' })
      .first();

    if (!projectAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this project',
      });
    }

    let query = db('project_messages as pm')
      .select(['pm.*', 'u.first_name', 'u.last_name', 'u.avatar_url', 'u.user_type'])
      .join('users as u', 'pm.user_id', 'u.id')
      .where('pm.project_id', projectId);

    if (channel) {
      query = query.where('pm.channel', channel);
    }

    if (thread_id) {
      query = query.where('pm.thread_id', thread_id);
    } else {
      query = query.whereNull('pm.thread_id'); // Only top-level messages
    }

    const messages = await query
      .orderBy('pm.created_at', 'desc')
      .limit(parseInt(limit))
      .offset(offset);

    // Parse JSON fields
    messages.forEach((message) => {
      if (message.mentions) {
        message.mentions = JSON.parse(message.mentions);
      }
      if (message.reactions) {
        message.reactions = JSON.parse(message.reactions);
      }
      if (message.read_by) {
        message.read_by = JSON.parse(message.read_by);
      }
    });

    const totalCount = await db('project_messages')
      .where({ project_id: projectId, channel })
      .count('* as count')
      .first();

    res.status(200).json({
      success: true,
      count: messages.length,
      total: parseInt(totalCount.count),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalCount.count / limit),
      },
      data: messages.reverse(), // Return in chronological order
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Send message
// @route   POST /api/project-messages/:projectId
// @access  Private
router.post('/:projectId', protect, async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const {
      content,
      type = 'text',
      channel = 'general',
      reply_to_id,
      mentions = [],
      file_url,
      file_name,
      file_type,
      file_size,
      voice_url,
      duration_seconds,
    } = req.body;

    if (!content && type === 'text') {
      return res.status(400).json({
        success: false,
        error: 'Message content is required',
      });
    }

    // Verify user has access to project
    const projectAccess = await db('project_members')
      .where({ project_id: projectId, user_id: req.user.id, status: 'active' })
      .first();

    if (!projectAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this project',
      });
    }

    // Determine thread_id if replying
    let thread_id = null;
    if (reply_to_id) {
      const parentMessage = await db('project_messages')
        .where({ id: reply_to_id, project_id: projectId })
        .first();

      if (!parentMessage) {
        return res.status(404).json({
          success: false,
          error: 'Parent message not found',
        });
      }

      thread_id = parentMessage.thread_id || parentMessage.id;
    }

    const message = await db('project_messages')
      .insert({
        project_id: projectId,
        user_id: req.user.id,
        content,
        type,
        channel,
        reply_to_id,
        thread_id,
        mentions: JSON.stringify(mentions),
        file_url,
        file_name,
        file_type,
        file_size,
        voice_url,
        duration_seconds,
        read_by: JSON.stringify({ [req.user.id]: new Date() }),
      })
      .returning('*');

    // Parse JSON fields for response
    const responseMessage = {
      ...message[0],
      mentions: JSON.parse(message[0].mentions),
      reactions: JSON.parse(message[0].reactions || '{}'),
      read_by: JSON.parse(message[0].read_by),
    };

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: responseMessage,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update message
// @route   PUT /api/project-messages/:messageId
// @access  Private
router.put('/:messageId', protect, async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Message content is required',
      });
    }

    const message = await db('project_messages')
      .where({ id: messageId, user_id: req.user.id })
      .first();

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found or insufficient permissions',
      });
    }

    await db('project_messages').where({ id: messageId }).update({
      content,
      is_edited: true,
      edited_at: new Date(),
      updated_at: new Date(),
    });

    res.status(200).json({
      success: true,
      message: 'Message updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete message
// @route   DELETE /api/project-messages/:messageId
// @access  Private
router.delete('/:messageId', protect, async (req, res, next) => {
  try {
    const { messageId } = req.params;

    const message = await db('project_messages as pm')
      .select(['pm.*', 'pm_member.role'])
      .leftJoin('project_members as pm_member', function () {
        this.on('pm.project_id', '=', 'pm_member.project_id').andOn(
          'pm_member.user_id',
          '=',
          db.raw('?', [req.user.id]),
        );
      })
      .where('pm.id', messageId)
      .first();

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found',
      });
    }

    // Check permissions (message author or admin/mentor)
    if (message.user_id !== req.user.id && !['admin', 'mentor'].includes(message.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to delete this message',
      });
    }

    await db('project_messages').where({ id: messageId }).del();

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// ==================== MESSAGE REACTIONS ====================

// @desc    Add reaction to message
// @route   POST /api/project-messages/:messageId/reactions
// @access  Private
router.post('/:messageId/reactions', protect, async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({
        success: false,
        error: 'Emoji is required',
      });
    }

    // Verify user has access to message
    const message = await db('project_messages as pm')
      .select(['pm.*', 'pm_member.role'])
      .leftJoin('project_members as pm_member', function () {
        this.on('pm.project_id', '=', 'pm_member.project_id').andOn(
          'pm_member.user_id',
          '=',
          db.raw('?', [req.user.id]),
        );
      })
      .where('pm.id', messageId)
      .first();

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found',
      });
    }

    const reactions = JSON.parse(message.reactions || '{}');

    if (!reactions[emoji]) {
      reactions[emoji] = [];
    }

    // Remove user from other emoji reactions if they exist
    Object.keys(reactions).forEach((key) => {
      reactions[key] = reactions[key].filter((userId) => userId !== req.user.id);
    });

    // Add user to this emoji reaction
    if (!reactions[emoji].includes(req.user.id)) {
      reactions[emoji].push(req.user.id);
    }

    await db('project_messages')
      .where({ id: messageId })
      .update({
        reactions: JSON.stringify(reactions),
        updated_at: new Date(),
      });

    res.status(200).json({
      success: true,
      message: 'Reaction added successfully',
      data: { emoji, reactions },
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Remove reaction from message
// @route   DELETE /api/project-messages/:messageId/reactions/:emoji
// @access  Private
router.delete('/:messageId/reactions/:emoji', protect, async (req, res, next) => {
  try {
    const { messageId, emoji } = req.params;

    const message = await db('project_messages').where({ id: messageId }).first();

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found',
      });
    }

    const reactions = JSON.parse(message.reactions || '{}');

    if (reactions[emoji]) {
      reactions[emoji] = reactions[emoji].filter((userId) => userId !== req.user.id);

      // Remove emoji if no users left
      if (reactions[emoji].length === 0) {
        delete reactions[emoji];
      }
    }

    await db('project_messages')
      .where({ id: messageId })
      .update({
        reactions: JSON.stringify(reactions),
        updated_at: new Date(),
      });

    res.status(200).json({
      success: true,
      message: 'Reaction removed successfully',
      data: { emoji, reactions },
    });
  } catch (error) {
    next(error);
  }
});

// ==================== MESSAGE THREADS ====================

// @desc    Get message thread
// @route   GET /api/project-messages/:projectId/threads/:threadId
// @access  Private
router.get('/:projectId/threads/:threadId', protect, async (req, res, next) => {
  try {
    const { projectId, threadId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Verify user has access to project
    const projectAccess = await db('project_members')
      .where({ project_id: projectId, user_id: req.user.id, status: 'active' })
      .first();

    if (!projectAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this project',
      });
    }

    const messages = await db('project_messages as pm')
      .select(['pm.*', 'u.first_name', 'u.last_name', 'u.avatar_url', 'u.user_type'])
      .join('users as u', 'pm.user_id', 'u.id')
      .where('pm.project_id', projectId)
      .where('pm.thread_id', threadId)
      .orderBy('pm.thread_position', 'asc')
      .orderBy('pm.created_at', 'asc')
      .limit(parseInt(limit))
      .offset(offset);

    // Parse JSON fields
    messages.forEach((message) => {
      if (message.mentions) {
        message.mentions = JSON.parse(message.mentions);
      }
      if (message.reactions) {
        message.reactions = JSON.parse(message.reactions);
      }
      if (message.read_by) {
        message.read_by = JSON.parse(message.read_by);
      }
    });

    const totalCount = await db('project_messages')
      .where({ project_id: projectId, thread_id: threadId })
      .count('* as count')
      .first();

    res.status(200).json({
      success: true,
      count: messages.length,
      total: parseInt(totalCount.count),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalCount.count / limit),
      },
      data: messages,
    });
  } catch (error) {
    next(error);
  }
});

// ==================== MESSAGE PINS ====================

// @desc    Pin message
// @route   POST /api/project-messages/:messageId/pin
// @access  Private
router.post('/:messageId/pin', protect, async (req, res, next) => {
  try {
    const { messageId } = req.params;

    const message = await db('project_messages as pm')
      .select(['pm.*', 'pm_member.role'])
      .leftJoin('project_members as pm_member', function () {
        this.on('pm.project_id', '=', 'pm_member.project_id').andOn(
          'pm_member.user_id',
          '=',
          db.raw('?', [req.user.id]),
        );
      })
      .where('pm.id', messageId)
      .first();

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found',
      });
    }

    // Only admin/mentor can pin messages
    if (!['admin', 'mentor'].includes(message.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to pin messages',
      });
    }

    await db('project_messages').where({ id: messageId }).update({
      is_pinned: true,
      pinned_at: new Date(),
      pinned_by: req.user.id,
      updated_at: new Date(),
    });

    res.status(200).json({
      success: true,
      message: 'Message pinned successfully',
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Unpin message
// @route   DELETE /api/project-messages/:messageId/pin
// @access  Private
router.delete('/:messageId/pin', protect, async (req, res, next) => {
  try {
    const { messageId } = req.params;

    const message = await db('project_messages as pm')
      .select(['pm.*', 'pm_member.role'])
      .leftJoin('project_members as pm_member', function () {
        this.on('pm.project_id', '=', 'pm_member.project_id').andOn(
          'pm_member.user_id',
          '=',
          db.raw('?', [req.user.id]),
        );
      })
      .where('pm.id', messageId)
      .first();

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found',
      });
    }

    // Only admin/mentor or the user who pinned can unpin
    if (!['admin', 'mentor'].includes(message.role) && message.pinned_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to unpin messages',
      });
    }

    await db('project_messages').where({ id: messageId }).update({
      is_pinned: false,
      pinned_at: null,
      pinned_by: null,
      updated_at: new Date(),
    });

    res.status(200).json({
      success: true,
      message: 'Message unpinned successfully',
    });
  } catch (error) {
    next(error);
  }
});

// ==================== MESSAGE READ STATUS ====================

// @desc    Mark message as read
// @route   POST /api/project-messages/:messageId/read
// @access  Private
router.post('/:messageId/read', protect, async (req, res, next) => {
  try {
    const { messageId } = req.params;

    const message = await db('project_messages').where({ id: messageId }).first();

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found',
      });
    }

    const readBy = JSON.parse(message.read_by || '{}');
    readBy[req.user.id] = new Date();

    await db('project_messages')
      .where({ id: messageId })
      .update({
        read_by: JSON.stringify(readBy),
        updated_at: new Date(),
      });

    res.status(200).json({
      success: true,
      message: 'Message marked as read',
    });
  } catch (error) {
    next(error);
  }
});

// ==================== MESSAGE CHANNELS ====================

// @desc    Get project channels
// @route   GET /api/project-messages/:projectId/channels
// @access  Private
router.get('/:projectId/channels', protect, async (req, res, next) => {
  try {
    const { projectId } = req.params;

    // Verify user has access to project
    const projectAccess = await db('project_members')
      .where({ project_id: projectId, user_id: req.user.id, status: 'active' })
      .first();

    if (!projectAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this project',
      });
    }

    const channels = await db('project_messages')
      .select('channel')
      .count('* as message_count')
      .max('created_at as last_message_at')
      .where('project_id', projectId)
      .groupBy('channel')
      .orderBy('last_message_at', 'desc');

    res.status(200).json({
      success: true,
      data: channels,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
