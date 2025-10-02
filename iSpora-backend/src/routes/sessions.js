const express = require('express');
const db = require('../database/connection');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

async function ensureTable() {
  const exists = await db.schema.hasTable('sessions');
  if (!exists) {
    await db.schema.createTable('sessions', (t) => {
      t.string('id').primary();
      t.string('project_id').index();
      t.string('title').notNullable();
      t.text('description');
      t.datetime('scheduled_at').notNullable();
      t.integer('duration').notNullable().defaultTo(60);
      t.string('status').notNullable().defaultTo('upcoming');
      t.string('type').notNullable().defaultTo('video');
      t.string('meeting_link');
      t.string('location');
      t.boolean('is_public').notNullable().defaultTo(false);
      t.integer('max_participants');
      t.text('tags'); // comma-separated
      t.text('agenda'); // newline-separated
      t.text('notes');
      t.string('creator_id').index();
      t.timestamps(true, true);
    });
  }
}

// List sessions by project
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    await ensureTable();
    const { projectId, status } = req.query;
    let q = db('sessions').select('*').orderBy('scheduled_at', 'desc');
    if (projectId) q = q.where('project_id', projectId);
    if (status && status !== 'all') q = q.where('status', status);
    const rows = await q;
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
});

// Create session
router.post('/', protect, async (req, res, next) => {
  try {
    await ensureTable();
    const id = `sess_${Date.now()}`;
    const now = new Date();
    const {
      projectId, title, description, scheduledDate, scheduledTime, duration,
      type, location, isPublic, maxParticipants, tags, agenda, meetingLink
    } = req.body;

    const scheduled_at = new Date(`${scheduledDate}T${scheduledTime || '00:00'}`);
    const row = {
      id,
      project_id: projectId || null,
      title,
      description: description || null,
      scheduled_at,
      duration: duration || 60,
      status: 'upcoming',
      type: type || 'video',
      meeting_link: meetingLink || null,
      location: location || null,
      is_public: !!isPublic,
      max_participants: maxParticipants || null,
      tags: Array.isArray(tags) ? tags.join(',') : (tags || ''),
      agenda: Array.isArray(agenda) ? agenda.join('\n') : (agenda || ''),
      notes: null,
      creator_id: req.user?.id || null,
      created_at: now,
      updated_at: now
    };
    await db('sessions').insert(row);
    res.status(201).json({ success: true, data: row });
  } catch (e) { next(e); }
});

// Update session
router.put('/:id', protect, async (req, res, next) => {
  try {
    await ensureTable();
    const { id } = req.params;
    const payload = { ...req.body, updated_at: new Date() };
    if (payload.tags && Array.isArray(payload.tags)) payload.tags = payload.tags.join(',');
    if (payload.agenda && Array.isArray(payload.agenda)) payload.agenda = payload.agenda.join('\n');
    if (payload.scheduledDate) {
      const time = payload.scheduledTime || '00:00';
      payload.scheduled_at = new Date(`${payload.scheduledDate}T${time}`);
      delete payload.scheduledDate;
      delete payload.scheduledTime;
    }
    await db('sessions').where({ id }).update(payload);
    const updated = await db('sessions').where({ id }).first();
    res.json({ success: true, data: updated });
  } catch (e) { next(e); }
});

// Delete session
router.delete('/:id', protect, async (req, res, next) => {
  try {
    await ensureTable();
    const { id } = req.params;
    await db('sessions').where({ id }).del();
    res.json({ success: true, data: { id } });
  } catch (e) { next(e); }
});

module.exports = router;

const express = require('express');
const { protect } = require('../middleware/auth');
const db = require('../database/connection');
const { v4: uuidv4 } = require('uuid');
const { createNotification } = require('./notifications');
const socketService = require('../services/socketService');

const router = express.Router();

// @desc    Get user sessions
// @route   GET /api/sessions
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const { 
      status,
      type,
      upcoming = false,
      page = 1, 
      limit = 20 
    } = req.query;
    
    const offset = (page - 1) * limit;

    let query = db('sessions as s')
      .select([
        's.*',
        'host.first_name as host_first_name',
        'host.last_name as host_last_name',
        'host.avatar_url as host_avatar',
        'mentorship.mentor_id',
        'mentorship.mentee_id',
        'project.title as project_title'
      ])
      .join('users as host', 's.host_id', 'host.id')
      .leftJoin('mentorships as mentorship', 's.mentorship_id', 'mentorship.id')
      .leftJoin('projects as project', 's.project_id', 'project.id')
      .where(function() {
        this.where('s.host_id', req.user.id)
          .orWhere('s.attendees', 'like', `%${req.user.id}%`);
      });

    if (status) {
      query = query.where('s.status', status);
    }

    if (type) {
      query = query.where('s.type', type);
    }

    if (upcoming === 'true') {
      query = query.where('s.scheduled_start', '>', new Date())
        .where('s.status', 'scheduled');
    }

    const sessions = await query
      .orderBy('s.scheduled_start', 'desc')
      .limit(parseInt(limit))
      .offset(offset);

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single session
// @route   GET /api/sessions/:id
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const session = await db('sessions as s')
      .select([
        's.*',
        'host.first_name as host_first_name',
        'host.last_name as host_last_name',
        'host.avatar_url as host_avatar',
        'host.title as host_title',
        'mentorship.mentor_id',
        'mentorship.mentee_id',
        'project.title as project_title'
      ])
      .join('users as host', 's.host_id', 'host.id')
      .leftJoin('mentorships as mentorship', 's.mentorship_id', 'mentorship.id')
      .leftJoin('projects as project', 's.project_id', 'project.id')
      .where('s.id', req.params.id)
      .first();

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    // Check if user has access to this session
    const hasAccess = session.host_id === req.user.id || 
      (session.attendees && session.attendees.includes(req.user.id));

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this session'
      });
    }

    // Get attendee details
    if (session.attendees) {
      const attendeeIds = JSON.parse(session.attendees);
      const attendeeDetails = await db('users')
        .select(['id', 'first_name', 'last_name', 'avatar_url', 'title'])
        .whereIn('id', attendeeIds);
      
      session.attendee_details = attendeeDetails;
    }

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create session
// @route   POST /api/sessions
// @access  Private
router.post('/', protect, async (req, res, next) => {
  try {
    const {
      title,
      description,
      type = 'mentorship',
      scheduledStart,
      scheduledEnd,
      mentorshipId,
      projectId,
      attendees = [],
      agenda,
      maxParticipants = 10,
      recordingEnabled = false,
      waitingRoomEnabled = true
    } = req.body;

    const sessionData = {
      id: uuidv4(),
      title,
      description,
      host_id: req.user.id,
      mentorship_id: mentorshipId || null,
      project_id: projectId || null,
      type,
      scheduled_start: new Date(scheduledStart),
      scheduled_end: new Date(scheduledEnd),
      status: 'scheduled',
      attendees: JSON.stringify(attendees),
      agenda: agenda ? JSON.stringify(agenda) : null,
      max_participants: maxParticipants,
      recording_enabled: recordingEnabled,
      waiting_room_enabled: waitingRoomEnabled,
      meeting_id: `session-${Date.now()}`,
      created_at: new Date(),
      updated_at: new Date()
    };

    await db('sessions').insert(sessionData);

    // Send notifications to attendees
    for (let attendeeId of attendees) {
      await createNotification({
        user_id: attendeeId,
        title: 'New Session Scheduled',
        message: `${req.user.first_name} ${req.user.last_name} scheduled a session: ${title}`,
        type: 'session',
        related_user_id: req.user.id,
        action_data: JSON.stringify({ session_id: sessionData.id })
      });
    }

    const session = await db('sessions as s')
      .select([
        's.*',
        'host.first_name as host_first_name',
        'host.last_name as host_last_name',
        'host.avatar_url as host_avatar'
      ])
      .join('users as host', 's.host_id', 'host.id')
      .where('s.id', sessionData.id)
      .first();

    res.status(201).json({
      success: true,
      data: session
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update session
// @route   PUT /api/sessions/:id
// @access  Private
router.put('/:id', protect, async (req, res, next) => {
  try {
    const { id } = req.params;

    const session = await db('sessions')
      .where({ id })
      .first();

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    // Only host can update session
    if (session.host_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this session'
      });
    }

    const updateData = {
      ...req.body,
      updated_at: new Date()
    };

    // Convert arrays to JSON strings
    if (updateData.attendees) {
      updateData.attendees = JSON.stringify(updateData.attendees);
    }
    if (updateData.agenda) {
      updateData.agenda = JSON.stringify(updateData.agenda);
    }

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.host_id;
    delete updateData.created_at;

    await db('sessions')
      .where({ id })
      .update(updateData);

    const updatedSession = await db('sessions as s')
      .select([
        's.*',
        'host.first_name as host_first_name',
        'host.last_name as host_last_name',
        'host.avatar_url as host_avatar'
      ])
      .join('users as host', 's.host_id', 'host.id')
      .where('s.id', id)
      .first();

    res.status(200).json({
      success: true,
      data: updatedSession
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Start session
// @route   POST /api/sessions/:id/start
// @access  Private
router.post('/:id/start', protect, async (req, res, next) => {
  try {
    const { id } = req.params;

    const session = await db('sessions')
      .where({ id })
      .first();

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    // Only host can start session
    if (session.host_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to start this session'
      });
    }

    if (session.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        error: 'Session cannot be started in current status'
      });
    }

    // Generate meeting URL (in real app, this would integrate with Zoom/Teams/etc)
    const meetingUrl = `${process.env.FRONTEND_URL}/session/${id}/room`;

    await db('sessions')
      .where({ id })
      .update({
        status: 'live',
        actual_start: new Date(),
        meeting_url: meetingUrl,
        updated_at: new Date()
      });

    // Notify attendees that session has started
    if (session.attendees) {
      const attendeeIds = JSON.parse(session.attendees);
      for (let attendeeId of attendeeIds) {
        await createNotification({
          user_id: attendeeId,
          title: 'Session Started',
          message: `${session.title} has started`,
          type: 'session',
          related_user_id: req.user.id,
          action_url: meetingUrl
        });

        // Send real-time notification
        socketService.sendNotificationToUser(attendeeId, {
          type: 'session_started',
          data: { sessionId: id, meetingUrl }
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Session started successfully',
      data: { meetingUrl }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    End session
// @route   POST /api/sessions/:id/end
// @access  Private
router.post('/:id/end', protect, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes, sharedResources } = req.body;

    const session = await db('sessions')
      .where({ id })
      .first();

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    // Only host can end session
    if (session.host_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to end this session'
      });
    }

    if (session.status !== 'live') {
      return res.status(400).json({
        success: false,
        error: 'Session is not currently live'
      });
    }

    await db('sessions')
      .where({ id })
      .update({
        status: 'completed',
        actual_end: new Date(),
        notes,
        shared_resources: sharedResources ? JSON.stringify(sharedResources) : null,
        updated_at: new Date()
      });

    res.status(200).json({
      success: true,
      message: 'Session ended successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Join session
// @route   POST /api/sessions/:id/join
// @access  Private
router.post('/:id/join', protect, async (req, res, next) => {
  try {
    const { id } = req.params;

    const session = await db('sessions')
      .where({ id })
      .first();

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    // Check if user is authorized to join
    const isHost = session.host_id === req.user.id;
    const attendees = session.attendees ? JSON.parse(session.attendees) : [];
    const isAttendee = attendees.includes(req.user.id);

    if (!isHost && !isAttendee) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to join this session'
      });
    }

    if (session.status !== 'live') {
      return res.status(400).json({
        success: false,
        error: 'Session is not currently live'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        sessionId: id,
        meetingUrl: session.meeting_url,
        meetingId: session.meeting_id,
        meetingPassword: session.meeting_password
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Cancel session
// @route   DELETE /api/sessions/:id
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const { id } = req.params;

    const session = await db('sessions')
      .where({ id })
      .first();

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    // Only host can cancel session
    if (session.host_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to cancel this session'
      });
    }

    await db('sessions')
      .where({ id })
      .update({
        status: 'cancelled',
        updated_at: new Date()
      });

    // Notify attendees of cancellation
    if (session.attendees) {
      const attendeeIds = JSON.parse(session.attendees);
      for (let attendeeId of attendeeIds) {
        await createNotification({
          user_id: attendeeId,
          title: 'Session Cancelled',
          message: `${session.title} has been cancelled`,
          type: 'session',
          related_user_id: req.user.id
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Session cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
