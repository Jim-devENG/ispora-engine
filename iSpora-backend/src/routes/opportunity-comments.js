const express = require('express');
const knex = require('../database/connection');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Get comments for an opportunity
router.get('/opportunity/:opportunityId', async (req, res) => {
  try {
    const { opportunityId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const query = knex('opportunity_comments')
      .select(
        'opportunity_comments.*',
        'users.first_name',
        'users.last_name',
        'users.username',
        'users.avatar_url',
        'users.is_verified as user_verified'
      )
      .leftJoin('users', 'opportunity_comments.user_id', 'users.id')
      .where('opportunity_comments.opportunity_id', opportunityId)
      .where('opportunity_comments.is_deleted', false)
      .whereNull('opportunity_comments.parent_comment_id'); // Only top-level comments

    // Get total count
    const countQuery = query.clone().count('* as total');
    const [{ total }] = await countQuery;

    // Apply pagination and ordering
    const comments = await query
      .orderBy('opportunity_comments.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    // Get replies for each comment
    const commentIds = comments.map(c => c.id);
    const replies = commentIds.length > 0 ? await knex('opportunity_comments')
      .select(
        'opportunity_comments.*',
        'users.first_name',
        'users.last_name',
        'users.username',
        'users.avatar_url',
        'users.is_verified as user_verified'
      )
      .leftJoin('users', 'opportunity_comments.user_id', 'users.id')
      .whereIn('opportunity_comments.parent_comment_id', commentIds)
      .where('opportunity_comments.is_deleted', false)
      .orderBy('opportunity_comments.created_at', 'asc') : [];

    // Transform the data
    const transformedComments = comments.map(comment => {
      const commentReplies = replies.filter(reply => reply.parent_comment_id === comment.id);
      
      return {
        id: comment.id,
        opportunityId: comment.opportunity_id,
        userId: comment.user_id,
        parentCommentId: comment.parent_comment_id,
        content: comment.content,
        isEdited: comment.is_edited,
        editedAt: comment.edited_at,
        likes: comment.likes,
        replies: commentReplies.map(reply => ({
          id: reply.id,
          opportunityId: reply.opportunity_id,
          userId: reply.user_id,
          parentCommentId: reply.parent_comment_id,
          content: reply.content,
          isEdited: reply.is_edited,
          editedAt: reply.edited_at,
          likes: reply.likes,
          createdAt: reply.created_at,
          user: {
            name: `${reply.first_name || ''} ${reply.last_name || ''}`.trim() || reply.username,
            avatar: reply.avatar_url,
            isVerified: reply.user_verified
          }
        })),
        createdAt: comment.created_at,
        user: {
          name: `${comment.first_name || ''} ${comment.last_name || ''}`.trim() || comment.username,
          avatar: comment.avatar_url,
          isVerified: comment.user_verified
        }
      };
    });

    res.json({
      comments: transformedComments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Create a comment
router.post('/comment', protect, async (req, res) => {
  try {
    const { opportunityId, content, parentCommentId } = req.body;

    if (!opportunityId || !content) {
      return res.status(400).json({ error: 'Opportunity ID and content are required' });
    }

    // Check if opportunity exists and is active
    const opportunity = await knex('opportunities')
      .where('id', opportunityId)
      .where('is_active', true)
      .first();

    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found or inactive' });
    }

    // If it's a reply, check if parent comment exists
    if (parentCommentId) {
      const parentComment = await knex('opportunity_comments')
        .where('id', parentCommentId)
        .where('opportunity_id', opportunityId)
        .where('is_deleted', false)
        .first();

      if (!parentComment) {
        return res.status(404).json({ error: 'Parent comment not found' });
      }
    }

    // Create comment
    const [comment] = await knex('opportunity_comments')
      .insert({
        opportunity_id: opportunityId,
        user_id: req.user.id,
        parent_comment_id: parentCommentId || null,
        content: content.trim()
      })
      .returning('*');

    // Update opportunity comments count
    await knex('opportunities')
      .where('id', opportunityId)
      .increment('comments', 1);

    // If it's a reply, update parent comment replies count
    if (parentCommentId) {
      await knex('opportunity_comments')
        .where('id', parentCommentId)
        .increment('replies', 1);
    }

    // Get user info for response
    const user = await knex('users')
      .select('first_name', 'last_name', 'username', 'avatar_url', 'is_verified')
      .where('id', req.user.id)
      .first();

    const transformedComment = {
      id: comment.id,
      opportunityId: comment.opportunity_id,
      userId: comment.user_id,
      parentCommentId: comment.parent_comment_id,
      content: comment.content,
      isEdited: comment.is_edited,
      editedAt: comment.edited_at,
      likes: comment.likes,
      replies: [],
      createdAt: comment.created_at,
      user: {
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
        avatar: user.avatar_url,
        isVerified: user.is_verified
      }
    };

    res.status(201).json(transformedComment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// Update a comment
router.put('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Get comment
    const comment = await knex('opportunity_comments')
      .where('id', id)
      .where('is_deleted', false)
      .first();

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user owns the comment
    if (comment.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to edit this comment' });
    }

    // Update comment
    const [updatedComment] = await knex('opportunity_comments')
      .where('id', id)
      .update({
        content: content.trim(),
        is_edited: true,
        edited_at: knex.fn.now(),
        updated_at: knex.fn.now()
      })
      .returning('*');

    res.json(updatedComment);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
});

// Delete a comment
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    // Get comment
    const comment = await knex('opportunity_comments')
      .where('id', id)
      .where('is_deleted', false)
      .first();

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user owns the comment
    if (comment.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    // Soft delete comment
    await knex('opportunity_comments')
      .where('id', id)
      .update({
        is_deleted: true,
        deleted_at: knex.fn.now(),
        content: '[This comment has been deleted]'
      });

    // Update opportunity comments count
    await knex('opportunities')
      .where('id', comment.opportunity_id)
      .decrement('comments', 1);

    // If it's a reply, update parent comment replies count
    if (comment.parent_comment_id) {
      await knex('opportunity_comments')
        .where('id', comment.parent_comment_id)
        .decrement('replies', 1);
    }

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// Get user's comments
router.get('/my-comments', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const query = knex('opportunity_comments')
      .select(
        'opportunity_comments.*',
        'opportunities.title as opportunity_title',
        'opportunities.company as opportunity_company',
        'opportunities.type as opportunity_type'
      )
      .leftJoin('opportunities', 'opportunity_comments.opportunity_id', 'opportunities.id')
      .where('opportunity_comments.user_id', req.user.id)
      .where('opportunity_comments.is_deleted', false)
      .where('opportunities.is_active', true);

    // Get total count
    const countQuery = query.clone().count('* as total');
    const [{ total }] = await countQuery;

    // Apply pagination and ordering
    const comments = await query
      .orderBy('opportunity_comments.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    // Transform the data
    const transformedComments = comments.map(comment => ({
      id: comment.id,
      opportunityId: comment.opportunity_id,
      parentCommentId: comment.parent_comment_id,
      content: comment.content,
      isEdited: comment.is_edited,
      editedAt: comment.edited_at,
      likes: comment.likes,
      replies: comment.replies,
      createdAt: comment.created_at,
      opportunity: {
        title: comment.opportunity_title,
        company: comment.opportunity_company,
        type: comment.opportunity_type
      }
    }));

    res.json({
      comments: transformedComments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching user comments:', error);
    res.status(500).json({ error: 'Failed to fetch user comments' });
  }
});

// Get comment statistics
router.get('/stats', protect, async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Total comments
    const totalComments = await knex('opportunity_comments')
      .count('* as total')
      .where('user_id', req.user.id)
      .where('is_deleted', false)
      .first();

    // Recent comments
    const recentComments = await knex('opportunity_comments')
      .count('* as total')
      .where('user_id', req.user.id)
      .where('is_deleted', false)
      .where('created_at', '>=', startDate)
      .first();

    // Comments by type
    const commentsByType = await knex('opportunity_comments')
      .select('opportunities.type')
      .count('* as count')
      .leftJoin('opportunities', 'opportunity_comments.opportunity_id', 'opportunities.id')
      .where('opportunity_comments.user_id', req.user.id)
      .where('opportunity_comments.is_deleted', false)
      .where('opportunities.is_active', true)
      .groupBy('opportunities.type');

    res.json({
      totalComments: parseInt(totalComments.total) || 0,
      recentComments: parseInt(recentComments.total) || 0,
      commentsByType
    });
  } catch (error) {
    console.error('Error fetching comment statistics:', error);
    res.status(500).json({ error: 'Failed to fetch comment statistics' });
  }
});

module.exports = router;
