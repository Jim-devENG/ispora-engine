/**
 * Comment Controller
 * Phase 3: Comment management endpoints
 */

const commentService = require('../services/commentService');
const logger = require('../utils/logger');

/**
 * POST /api/v1/comments
 * Create a comment
 */
const createComment = async (req, res) => {
  try {
    const { parentType, parentId, content } = req.body;
    const authorId = req.user._id;

    // Validate required fields
    if (!parentType || !parentId || !content) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        code: 'INVALID_PAYLOAD',
        message: 'Parent type, parent ID, and content are required.'
      });
    }

    // Validate parentType enum
    if (!['project', 'update', 'post', 'task'].includes(parentType)) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        code: 'INVALID_PARENT_TYPE',
        message: 'Invalid parent type. Must be one of: project, update, post, task.'
      });
    }

    const comment = await commentService.createComment(parentType, parentId, authorId.toString(), content);
    res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      data: comment
    });
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('Not found')) {
      return res.status(404).json({
        success: false,
        error: 'Parent not found',
        code: 'NOT_FOUND',
        message: error.message || 'The parent resource could not be found.'
      });
    }
    if (error.message.includes('Not authorized')) {
      return res.status(403).json({
        success: false,
        error: 'Permission denied',
        code: 'FORBIDDEN',
        message: error.message || 'You are not authorized to comment on this resource.'
      });
    }
    logger.error({ error: error.message, userId: req.user._id, body: req.body }, 'Failed to create comment');
    res.status(500).json({
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR',
      message: 'Failed to create comment.'
    });
  }
};

/**
 * GET /api/v1/comments?parentType=&parentId=&page=&limit=
 * List comments for a parent
 */
const listComments = async (req, res) => {
  try {
    const { parentType, parentId } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    if (!parentType || !parentId) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        code: 'INVALID_QUERY',
        message: 'Parent type and parent ID are required.'
      });
    }

    const result = await commentService.listComments(parentType, parentId, { page, limit });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    logger.error({ error: error.message, query: req.query }, 'Failed to list comments');
    res.status(500).json({
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR',
      message: 'Failed to retrieve comments.'
    });
  }
};

/**
 * PATCH /api/v1/comments/:id
 * Soft delete or edit a comment (author or admin only)
 */
const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const isAdmin = req.user.roles?.includes('admin') || req.user.userType === 'admin';
    const { content, deleted } = req.body;

    // If content is provided, update the comment
    if (content !== undefined) {
      const Comment = require('../models/Comment');
      const comment = await Comment.findById(id);

      if (!comment) {
        return res.status(404).json({
          success: false,
          error: 'Comment not found',
          code: 'NOT_FOUND',
          message: 'The comment could not be found.'
        });
      }

      // Check authorization
      if (comment.author.toString() !== userId.toString() && !isAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Permission denied',
          code: 'FORBIDDEN',
          message: 'You are not authorized to edit this comment.'
        });
      }

      comment.content = content;
      comment.updatedAt = new Date();
      await comment.save();

      await comment.populate('author', 'name email firstName lastName username avatar');

      return res.status(200).json({
        success: true,
        message: 'Comment updated successfully',
        data: comment.toJSON()
      });
    }

    // If deleted is provided, soft delete
    if (deleted !== undefined) {
      const result = await commentService.softDeleteComment(id, userId.toString(), isAdmin);
      return res.status(200).json({
        success: true,
        message: 'Comment deleted successfully',
        data: result
      });
    }

    return res.status(400).json({
      success: false,
      error: 'Validation error',
      code: 'INVALID_PAYLOAD',
      message: 'Either content or deleted must be provided.'
    });
  } catch (error) {
    if (error.message === 'Comment not found') {
      return res.status(404).json({
        success: false,
        error: 'Comment not found',
        code: 'NOT_FOUND',
        message: 'The comment could not be found.'
      });
    }
    if (error.message.includes('Not authorized')) {
      return res.status(403).json({
        success: false,
        error: 'Permission denied',
        code: 'FORBIDDEN',
        message: error.message || 'You are not authorized to perform this action.'
      });
    }
    logger.error({ error: error.message, commentId: req.params.id, userId: req.user._id }, 'Failed to update comment');
    res.status(500).json({
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR',
      message: 'Failed to update comment.'
    });
  }
};

module.exports = {
  createComment,
  listComments,
  updateComment
};

