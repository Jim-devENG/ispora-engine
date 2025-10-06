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
  } catch (e) {
    next(e);
  }
});

// Create session
router.post('/', protect, async (req, res, next) => {
  try {
    await ensureTable();
    const id = `sess_${Date.now()}`;
    const now = new Date();
    const {
      projectId,
      title,
      description,
      scheduledDate,
      scheduledTime,
      duration,
      type,
      location,
      isPublic,
      maxParticipants,
      tags,
      agenda,
      meetingLink,
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
      tags: Array.isArray(tags) ? tags.join(',') : tags || '',
      agenda: Array.isArray(agenda) ? agenda.join('\n') : agenda || '',
      notes: null,
      creator_id: req.user?.id || null,
      created_at: now,
      updated_at: now,
    };
    await db('sessions').insert(row);
    res.status(201).json({ success: true, data: row });
  } catch (e) {
    next(e);
  }
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
  } catch (e) {
    next(e);
  }
});

// Delete session
router.delete('/:id', protect, async (req, res, next) => {
  try {
    await ensureTable();
    const { id } = req.params;
    await db('sessions').where({ id }).del();
    res.json({ success: true, data: { id } });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
