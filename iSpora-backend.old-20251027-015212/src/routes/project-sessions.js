const express = require('express');
const db = require('../database/connection');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ==================== SESSION MANAGEMENT ====================

// @desc    Update session
// @route   PUT /api/project-sessions/:sessionId
// @access  Private
router.put('/:sessionId', protect, async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const updateData = req.body;

    // Verify user has permission to update session
    const session = await db('project_sessions as ps')
      .select(['ps.*', 'pm.role'])
      .leftJoin('project_members as pm', function () {
        this.on('ps.project_id', '=', 'pm.project_id').andOn(
          'pm.user_id',
          '=',
          db.raw('?', [req.user.id]),
        );
      })
      .where('ps.id', sessionId)
      .first();

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
      });
    }

    if (session.created_by !== req.user.id && !['admin', 'mentor'].includes(session.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to update this session',
      });
    }

    // Handle JSON fields
    if (updateData.agenda) {
      updateData.agenda = JSON.stringify(updateData.agenda);
    }
    if (updateData.recordings) {
      updateData.recordings = JSON.stringify(updateData.recordings);
    }
    if (updateData.materials) {
      updateData.materials = JSON.stringify(updateData.materials);
    }
    if (updateData.tags) {
      updateData.tags = JSON.stringify(updateData.tags);
    }

    // Handle date fields
    if (updateData.scheduled_date) {
      updateData.scheduled_date = new Date(updateData.scheduled_date);
    }

    updateData.updated_at = new Date();

    await db('project_sessions').where({ id: sessionId }).update(updateData);

    const updatedSession = await db('project_sessions').where({ id: sessionId }).first();

    res.status(200).json({
      success: true,
      message: 'Session updated successfully',
      data: updatedSession,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete session
// @route   DELETE /api/project-sessions/:sessionId
// @access  Private
router.delete('/:sessionId', protect, async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    // Verify user has permission to delete session
    const session = await db('project_sessions')
      .where({ id: sessionId, created_by: req.user.id })
      .first();

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found or insufficient permissions',
      });
    }

    await db('project_sessions').where({ id: sessionId }).del();

    res.status(200).json({
      success: true,
      message: 'Session deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Reschedule session
// @route   POST /api/project-sessions/:sessionId/reschedule
// @access  Private
router.post('/:sessionId/reschedule', protect, async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { new_date, reason } = req.body;

    if (!new_date) {
      return res.status(400).json({
        success: false,
        error: 'New date is required',
      });
    }

    // Verify user has permission to reschedule
    const session = await db('project_sessions as ps')
      .select(['ps.*', 'pm.role'])
      .leftJoin('project_members as pm', function () {
        this.on('ps.project_id', '=', 'pm.project_id').andOn(
          'pm.user_id',
          '=',
          db.raw('?', [req.user.id]),
        );
      })
      .where('ps.id', sessionId)
      .first();

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
      });
    }

    if (session.created_by !== req.user.id && !['admin', 'mentor'].includes(session.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to reschedule this session',
      });
    }

    await db('project_sessions')
      .where({ id: sessionId })
      .update({
        original_date: session.scheduled_date,
        scheduled_date: new Date(new_date),
        reschedule_reason: reason,
        status: 'rescheduled',
        updated_at: new Date(),
      });

    res.status(200).json({
      success: true,
      message: 'Session rescheduled successfully',
    });
  } catch (error) {
    next(error);
  }
});

// ==================== SESSION ATTENDEES ====================

// @desc    Get session attendees
// @route   GET /api/project-sessions/:sessionId/attendees
// @access  Private
router.get('/:sessionId/attendees', protect, async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    // Verify user has access to session
    const session = await db('project_sessions as ps')
      .select(['ps.*', 'pm.role'])
      .leftJoin('project_members as pm', function () {
        this.on('ps.project_id', '=', 'pm.project_id').andOn(
          'pm.user_id',
          '=',
          db.raw('?', [req.user.id]),
        );
      })
      .where('ps.id', sessionId)
      .first();

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
      });
    }

    const attendees = await db('session_attendees as sa')
      .select(['sa.*', 'u.first_name', 'u.last_name', 'u.avatar_url', 'u.email'])
      .join('users as u', 'sa.user_id', 'u.id')
      .where('sa.session_id', sessionId)
      .orderBy('sa.role', 'desc')
      .orderBy('u.first_name', 'asc');

    res.status(200).json({
      success: true,
      data: attendees,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Add attendee to session
// @route   POST /api/project-sessions/:sessionId/attendees
// @access  Private
router.post('/:sessionId/attendees', protect, async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { user_id, role = 'participant' } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required',
      });
    }

    // Verify user has permission to add attendees
    const session = await db('project_sessions as ps')
      .select(['ps.*', 'pm.role'])
      .leftJoin('project_members as pm', function () {
        this.on('ps.project_id', '=', 'pm.project_id').andOn(
          'pm.user_id',
          '=',
          db.raw('?', [req.user.id]),
        );
      })
      .where('ps.id', sessionId)
      .first();

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
      });
    }

    if (session.created_by !== req.user.id && !['admin', 'mentor'].includes(session.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to add attendees',
      });
    }

    // Check if user is already an attendee
    const existingAttendee = await db('session_attendees')
      .where({ session_id: sessionId, user_id })
      .first();

    if (existingAttendee) {
      return res.status(400).json({
        success: false,
        error: 'User is already an attendee',
      });
    }

    const attendee = await db('session_attendees')
      .insert({
        session_id: sessionId,
        user_id,
        role,
        invited_at: new Date(),
      })
      .returning('*');

    res.status(201).json({
      success: true,
      message: 'Attendee added successfully',
      data: attendee[0],
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update attendee response
// @route   PUT /api/project-sessions/:sessionId/attendees/:userId
// @access  Private
router.put('/:sessionId/attendees/:userId', protect, async (req, res, next) => {
  try {
    const { sessionId, userId } = req.params;
    const { response_status, notes } = req.body;

    // Verify user is the attendee or has permission
    const session = await db('project_sessions as ps')
      .select(['ps.*', 'pm.role'])
      .leftJoin('project_members as pm', function () {
        this.on('ps.project_id', '=', 'pm.project_id').andOn(
          'pm.user_id',
          '=',
          db.raw('?', [req.user.id]),
        );
      })
      .where('ps.id', sessionId)
      .first();

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
      });
    }

    // Check if user is the attendee or has admin permissions
    if (userId !== req.user.id && !['admin', 'mentor'].includes(session.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
      });
    }

    const updateData = {
      responded_at: new Date(),
      updated_at: new Date(),
    };

    if (response_status) {
      updateData.response_status = response_status;
    }

    if (notes) {
      updateData.notes = notes;
    }

    await db('session_attendees')
      .where({ session_id: sessionId, user_id: userId })
      .update(updateData);

    res.status(200).json({
      success: true,
      message: 'Attendee response updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Record session attendance
// @route   POST /api/project-sessions/:sessionId/attendance
// @access  Private
router.post('/:sessionId/attendance', protect, async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { user_id, attended, joined_at, left_at, duration_minutes, feedback, rating } = req.body;

    // Verify user has permission to record attendance
    const session = await db('project_sessions as ps')
      .select(['ps.*', 'pm.role'])
      .leftJoin('project_members as pm', function () {
        this.on('ps.project_id', '=', 'pm.project_id').andOn(
          'pm.user_id',
          '=',
          db.raw('?', [req.user.id]),
        );
      })
      .where('ps.id', sessionId)
      .first();

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
      });
    }

    if (!['admin', 'mentor'].includes(session.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to record attendance',
      });
    }

    const updateData = {
      attended: attended || false,
      updated_at: new Date(),
    };

    if (joined_at) {
      updateData.joined_at = new Date(joined_at);
    }

    if (left_at) {
      updateData.left_at = new Date(left_at);
    }

    if (duration_minutes) {
      updateData.duration_minutes = duration_minutes;
    }

    if (feedback) {
      updateData.feedback = feedback;
    }

    if (rating) {
      updateData.rating = rating;
    }

    await db('session_attendees').where({ session_id: sessionId, user_id }).update(updateData);

    res.status(200).json({
      success: true,
      message: 'Attendance recorded successfully',
    });
  } catch (error) {
    next(error);
  }
});

// ==================== SESSION RECORDINGS ====================

// @desc    Add session recording
// @route   POST /api/project-sessions/:sessionId/recordings
// @access  Private
router.post('/:sessionId/recordings', protect, async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { url, title, duration, thumbnail_url } = req.body;

    if (!url || !title) {
      return res.status(400).json({
        success: false,
        error: 'Recording URL and title are required',
      });
    }

    // Verify user has permission to add recordings
    const session = await db('project_sessions as ps')
      .select(['ps.*', 'pm.role'])
      .leftJoin('project_members as pm', function () {
        this.on('ps.project_id', '=', 'pm.project_id').andOn(
          'pm.user_id',
          '=',
          db.raw('?', [req.user.id]),
        );
      })
      .where('ps.id', sessionId)
      .first();

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
      });
    }

    if (!['admin', 'mentor'].includes(session.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to add recordings',
      });
    }

    // Get existing recordings
    const existingRecordings = session.recordings ? JSON.parse(session.recordings) : [];

    const newRecording = {
      id: Date.now().toString(),
      url,
      title,
      duration: duration || 0,
      thumbnail_url,
      added_by: req.user.id,
      added_at: new Date(),
    };

    existingRecordings.push(newRecording);

    await db('project_sessions')
      .where({ id: sessionId })
      .update({
        recordings: JSON.stringify(existingRecordings),
        updated_at: new Date(),
      });

    res.status(201).json({
      success: true,
      message: 'Recording added successfully',
      data: newRecording,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get session statistics
// @route   GET /api/project-sessions/:sessionId/stats
// @access  Private
router.get('/:sessionId/stats', protect, async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    // Verify user has access to session
    const session = await db('project_sessions as ps')
      .select(['ps.*', 'pm.role'])
      .leftJoin('project_members as pm', function () {
        this.on('ps.project_id', '=', 'pm.project_id').andOn(
          'pm.user_id',
          '=',
          db.raw('?', [req.user.id]),
        );
      })
      .where('ps.id', sessionId)
      .first();

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
      });
    }

    const [totalAttendees, attendedCount, responseStats, averageRating] = await Promise.all([
      db('session_attendees').where({ session_id: sessionId }).count('* as count').first(),
      db('session_attendees')
        .where({ session_id: sessionId, attended: true })
        .count('* as count')
        .first(),
      db('session_attendees')
        .select('response_status')
        .count('* as count')
        .where({ session_id: sessionId })
        .groupBy('response_status'),
      db('session_attendees')
        .where({ session_id: sessionId })
        .whereNotNull('rating')
        .avg('rating as avg')
        .first(),
    ]);

    const attendanceRate =
      totalAttendees.count > 0
        ? ((attendedCount.count / totalAttendees.count) * 100).toFixed(1)
        : 0;

    res.status(200).json({
      success: true,
      data: {
        total_attendees: parseInt(totalAttendees.count),
        attended_count: parseInt(attendedCount.count),
        attendance_rate: parseFloat(attendanceRate),
        response_stats: responseStats,
        average_rating: parseFloat(averageRating.avg) || 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
