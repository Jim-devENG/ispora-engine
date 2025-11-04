/**
 * Comment Service
 * Phase 3: Comment management service
 */

const Comment = require('../models/Comment');
const Project = require('../models/Project');
const ProjectUpdate = require('../models/ProjectUpdate');
const Task = require('../models/Task');
const logger = require('../utils/logger');

/**
 * Create a comment
 */
const createComment = async (parentType, parentId, authorId, content) => {
  try {
    // Verify parent exists and user has access
    await verifyParentAccess(parentType, parentId, authorId);

    const comment = await Comment.create({
      author: authorId,
      parentType,
      parentId,
      content
    });

    await comment.populate('author', 'name email firstName lastName username avatar');

    // Update comment count on parent (async, don't wait)
    updateCommentCount(parentType, parentId).catch(err => {
      logger.error({ error: err.message }, 'Failed to update comment count');
    });

    logger.info({ commentId: comment._id.toString(), parentType, parentId }, 'Comment created');

    return comment.toJSON();
  } catch (error) {
    logger.error({ error: error.message, parentType, parentId, authorId }, 'Failed to create comment');
    throw error;
  }
};

/**
 * List comments for a parent
 */
const listComments = async (parentType, parentId, options = {}) => {
  try {
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 20;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({
      parentType,
      parentId,
      deleted: false
    })
      .populate('author', 'name email firstName lastName username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Comment.countDocuments({
      parentType,
      parentId,
      deleted: false
    });

    return {
      comments: comments.map(c => ({
        id: c._id.toString(),
        author: c.author,
        content: c.content,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error({ error: error.message, parentType, parentId, options }, 'Failed to list comments');
    throw error;
  }
};

/**
 * Soft delete a comment (author or admin only)
 */
const softDeleteComment = async (commentId, userId, isAdmin = false) => {
  try {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw new Error('Comment not found');
    }

    // Check if user is author or admin
    if (comment.author.toString() !== userId.toString() && !isAdmin) {
      throw new Error('Not authorized to delete this comment');
    }

    comment.deleted = true;
    comment.updatedAt = new Date();
    await comment.save();

    // Update comment count on parent (async)
    updateCommentCount(comment.parentType, comment.parentId).catch(err => {
      logger.error({ error: err.message }, 'Failed to update comment count');
    });

    logger.info({ commentId, userId }, 'Comment soft deleted');

    return { success: true, message: 'Comment deleted successfully' };
  } catch (error) {
    logger.error({ error: error.message, commentId, userId }, 'Failed to delete comment');
    throw error;
  }
};

/**
 * Verify user has access to comment on parent
 */
const verifyParentAccess = async (parentType, parentId, userId) => {
  switch (parentType) {
    case 'project':
      const project = await Project.findById(parentId);
      if (!project) {
        throw new Error('Project not found');
      }
      // If private, check if user is owner or team member
      if (project.visibility === 'private') {
        if (project.owner.toString() !== userId.toString()) {
          // Check if user is in teamMembers (simple check for now)
          const isTeamMember = project.teamMembers?.some(
            member => member.email && member.email.toLowerCase() === userId.toString()
          );
          if (!isTeamMember) {
            throw new Error('Not authorized to comment on this project');
          }
        }
      }
      break;

    case 'update':
      const update = await ProjectUpdate.findById(parentId).populate('projectId');
      if (!update) {
        throw new Error('Project update not found');
      }
      // Similar access check via project
      if (update.projectId && update.projectId.visibility === 'private') {
        if (update.projectId.owner.toString() !== userId.toString()) {
          throw new Error('Not authorized to comment on this update');
        }
      }
      break;

    case 'task':
      const task = await Task.findById(parentId).populate('projectId');
      if (!task) {
        throw new Error('Task not found');
      }
      // Similar access check via project
      if (task.projectId && task.projectId.visibility === 'private') {
        if (task.projectId.owner.toString() !== userId.toString()) {
          throw new Error('Not authorized to comment on this task');
        }
      }
      break;

    default:
      // For 'post' or other types, assume public for now
      break;
  }
};

/**
 * Update comment count on parent (async, fire and forget)
 */
const updateCommentCount = async (parentType, parentId) => {
  try {
    const count = await Comment.countDocuments({
      parentType,
      parentId,
      deleted: false
    });

    // Update parent document if it has a commentCount field
    // This is a simple implementation - could be optimized with aggregation
    switch (parentType) {
      case 'project':
        await Project.findByIdAndUpdate(parentId, { $set: { commentCount: count } }, { upsert: false });
        break;
      case 'update':
        await ProjectUpdate.findByIdAndUpdate(parentId, { $set: { commentCount: count } }, { upsert: false });
        break;
      case 'task':
        await Task.findByIdAndUpdate(parentId, { $set: { commentCount: count } }, { upsert: false });
        break;
    }
  } catch (error) {
    logger.warn({ error: error.message, parentType, parentId }, 'Failed to update comment count');
  }
};

module.exports = {
  createComment,
  listComments,
  softDeleteComment
};

