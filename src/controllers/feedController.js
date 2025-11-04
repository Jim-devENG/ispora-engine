/**
 * Feed Controller
 * Phase 3: Personalized feed endpoints
 */

const feedPersonalizationService = require('../services/feedPersonalizationService');
const ProjectUpdate = require('../models/ProjectUpdate');
const Project = require('../models/Project');
const Comment = require('../models/Comment');
const Reaction = require('../models/Reaction');
const logger = require('../utils/logger');

/**
 * GET /api/v1/feed?page=&limit=&type=all|personalized|following
 * Get feed items
 */
const getFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const type = req.query.type || 'all';

    // If personalized and user is authenticated, use personalization service
    if (type === 'personalized' && req.user) {
      const result = await feedPersonalizationService.getFeedForUser(req.user._id.toString(), {
        page,
        limit
      });
      return res.status(200).json({ success: true, data: result });
    }

    // Otherwise, return recent items (all or following)
    let query = {};
    let populateFields = ['author', 'name email firstName lastName username avatar'];

    if (type === 'following' && req.user) {
      // Get users the current user follows
      const Follow = require('../models/Follow');
      const following = await Follow.find({ follower: req.user._id })
        .select('followee')
        .lean();
      const followeeIds = following.map(f => f.followee);

      // Get projects owned by followed users
      const followedProjects = await Project.find({ owner: { $in: followeeIds } })
        .select('_id')
        .lean();
      const projectIds = followedProjects.map(p => p._id);

      query.projectId = { $in: projectIds };
    }

    const updates = await ProjectUpdate.find(query)
      .populate('author', 'name email firstName lastName username avatar')
      .populate('projectId', 'title owner')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await ProjectUpdate.countDocuments(query);

    const items = updates.map(update => ({
      type: 'update',
      id: update._id.toString(),
      author: update.author,
      project: update.projectId,
      content: update.content,
      title: update.title,
      createdAt: update.createdAt
    }));

    res.status(200).json({
      success: true,
      data: {
        items,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error({ error: error.message, query: req.query, userId: req.user?._id }, 'Failed to get feed');
    res.status(500).json({
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR',
      message: 'Failed to retrieve feed.'
    });
  }
};

/**
 * GET /api/v1/feed/:id
 * Get single feed entry detail with comments and reactions summary
 */
const getFeedEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const viewerId = req.user ? req.user._id.toString() : null;

    // Try to find as ProjectUpdate first
    let feedItem = await ProjectUpdate.findById(id)
      .populate('author', 'name email firstName lastName username avatar')
      .populate('projectId', 'title owner description visibility')
      .lean();

    if (feedItem) {
      // Get comments count
      const commentCount = await Comment.countDocuments({
        parentType: 'update',
        parentId: id,
        deleted: false
      });

      // Get reactions
      const reactionService = require('../services/reactionService');
      const reactions = await reactionService.getReactions('update', id, viewerId);

      return res.status(200).json({
        success: true,
        data: {
          type: 'update',
          id: feedItem._id.toString(),
          author: feedItem.author,
          project: feedItem.projectId,
          content: feedItem.content,
          title: feedItem.title,
          createdAt: feedItem.createdAt,
          commentCount,
          reactions: reactions.counts,
          totalReactions: reactions.total,
          viewerReaction: reactions.viewerReaction
        }
      });
    }

    // Try to find as Project
    const project = await Project.findById(id)
      .populate('owner', 'name email firstName lastName username avatar')
      .lean();

    if (project) {
      const commentCount = await Comment.countDocuments({
        parentType: 'project',
        parentId: id,
        deleted: false
      });

      const reactionService = require('../services/reactionService');
      const reactions = await reactionService.getReactions('project', id, viewerId);

      return res.status(200).json({
        success: true,
        data: {
          type: 'project',
          id: project._id.toString(),
          author: project.owner,
          title: project.title,
          description: project.description,
          createdAt: project.createdAt,
          commentCount,
          reactions: reactions.counts,
          totalReactions: reactions.total,
          viewerReaction: reactions.viewerReaction
        }
      });
    }

    return res.status(404).json({
      success: false,
      error: 'Feed entry not found',
      code: 'NOT_FOUND',
      message: 'The requested feed entry could not be found.'
    });
  } catch (error) {
    logger.error({ error: error.message, feedId: req.params.id }, 'Failed to get feed entry');
    res.status(500).json({
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR',
      message: 'Failed to retrieve feed entry.'
    });
  }
};

module.exports = {
  getFeed,
  getFeedEntry
};
