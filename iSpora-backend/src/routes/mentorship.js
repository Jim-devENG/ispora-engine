const express = require('express');
const db = require('../database/connection');
const { protect } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// @desc    Get user's mentorships
// @route   GET /api/mentorship
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const { status, type, role } = req.query;
    const userId = req.user.id;

    let query = db('mentorships as m')
      .select([
        'm.*',
        'mentor.first_name as mentor_first_name',
        'mentor.last_name as mentor_last_name',
        'mentor.avatar_url as mentor_avatar',
        'mentee.first_name as mentee_first_name',
        'mentee.last_name as mentee_last_name',
        'mentee.avatar_url as mentee_avatar',
        'p.title as project_title'
      ])
      .join('users as mentor', 'm.mentor_id', 'mentor.id')
      .join('users as mentee', 'm.mentee_id', 'mentee.id')
      .leftJoin('projects as p', 'm.project_id', 'p.id')
      .where(function() {
        this.where('m.mentor_id', userId)
          .orWhere('m.mentee_id', userId);
      });

    if (status) {
      query = query.where('m.status', status);
    }

    if (type) {
      query = query.where('m.type', type);
    }

    if (role === 'mentor') {
      query = query.where('m.mentor_id', userId);
    } else if (role === 'mentee') {
      query = query.where('m.mentee_id', userId);
    }

    const mentorships = await query.orderBy('m.created_at', 'desc');

    res.status(200).json({
      success: true,
      count: mentorships.length,
      data: mentorships
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create mentorship request
// @route   POST /api/mentorship
// @access  Private
router.post('/', protect, async (req, res, next) => {
  try {
    const { mentor_id, project_id, type, goals } = req.body;
    const mentee_id = req.user.id;

    if (mentor_id === mentee_id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot create mentorship with yourself'
      });
    }

    // Check if mentorship already exists
    const existing = await db('mentorships')
      .where({
        mentor_id,
        mentee_id,
        project_id: project_id || null
      })
      .first();

    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Mentorship already exists'
      });
    }

    const mentorshipData = {
      id: uuidv4(),
      mentor_id,
      mentee_id,
      project_id: project_id || null,
      type: type || 'project_based',
      goals,
      status: 'requested',
      created_at: new Date(),
      updated_at: new Date()
    };

    await db('mentorships').insert(mentorshipData);

    const mentorship = await db('mentorships as m')
      .select([
        'm.*',
        'mentor.first_name as mentor_first_name',
        'mentor.last_name as mentor_last_name',
        'mentor.avatar_url as mentor_avatar',
        'mentee.first_name as mentee_first_name',
        'mentee.last_name as mentee_last_name',
        'mentee.avatar_url as mentee_avatar'
      ])
      .join('users as mentor', 'm.mentor_id', 'mentor.id')
      .join('users as mentee', 'm.mentee_id', 'mentee.id')
      .where('m.id', mentorshipData.id)
      .first();

    res.status(201).json({
      success: true,
      data: mentorship
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update mentorship status
// @route   PUT /api/mentorship/:id
// @access  Private
router.put('/:id', protect, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, goals, rating, feedback } = req.body;
    const userId = req.user.id;

    const mentorship = await db('mentorships')
      .where({ id })
      .first();

    if (!mentorship) {
      return res.status(404).json({
        success: false,
        error: 'Mentorship not found'
      });
    }

    // Check if user is part of this mentorship
    if (mentorship.mentor_id !== userId && mentorship.mentee_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this mentorship'
      });
    }

    const updateData = { updated_at: new Date() };

    if (status && ['requested', 'active', 'paused', 'completed', 'cancelled'].includes(status)) {
      updateData.status = status;
    }

    if (goals) {
      updateData.goals = goals;
    }

    // Handle ratings and feedback
    if (mentorship.mentor_id === userId) {
      if (rating) updateData.rating_by_mentor = rating;
      if (feedback) updateData.feedback_by_mentor = feedback;
    } else {
      if (rating) updateData.rating_by_mentee = rating;
      if (feedback) updateData.feedback_by_mentee = feedback;
    }

    await db('mentorships')
      .where({ id })
      .update(updateData);

    const updatedMentorship = await db('mentorships as m')
      .select([
        'm.*',
        'mentor.first_name as mentor_first_name',
        'mentor.last_name as mentor_last_name',
        'mentor.avatar_url as mentor_avatar',
        'mentee.first_name as mentee_first_name',
        'mentee.last_name as mentee_last_name',
        'mentee.avatar_url as mentee_avatar'
      ])
      .join('users as mentor', 'm.mentor_id', 'mentor.id')
      .join('users as mentee', 'm.mentee_id', 'mentee.id')
      .where('m.id', id)
      .first();

    res.status(200).json({
      success: true,
      data: updatedMentorship
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
