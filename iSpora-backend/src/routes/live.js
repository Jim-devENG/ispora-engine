const express = require('express');
const db = require('../database/connection');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

async function ensureTables() {
  const eventsExists = await db.schema.hasTable('live_events');
  if (!eventsExists) {
    await db.schema.createTable('live_events', (t) => {
      t.string('id').primary();
      t.string('project_id').index();
      t.string('title').notNullable();
      t.text('description');
      t.datetime('start_at');
      t.datetime('end_at');
      t.string('status').notNullable().defaultTo('scheduled'); // scheduled, live, ended
      t.string('meeting_link');
      t.timestamps(true, true);
    });
  }

  const chatExists = await db.schema.hasTable('live_chat_messages');
  if (!chatExists) {
    await db.schema.createTable('live_chat_messages', (t) => {
      t.string('id').primary();
      t.string('event_id').index();
      t.string('sender_id');
      t.string('sender_name');
      t.text('content');
      t.string('type').notNullable().defaultTo('text'); // text, voice, file
      t.string('file_url');
      t.integer('duration');
      t.timestamps(true, true);
    });
  }
}

router.get('/events', optionalAuth, async (req, res, next) => {
  try {
    await ensureTables();
    const { projectId, status } = req.query;
    let q = db('live_events').select('*').orderBy('start_at', 'desc');
    if (projectId) q = q.where('project_id', projectId);
    if (status && status !== 'all') q = q.where('status', status);
    res.json({ success: true, data: await q });
  } catch (e) { next(e); }
});

router.post('/events', protect, async (req, res, next) => {
  try {
    await ensureTables();
    const id = `live_${Date.now()}`;
    const now = new Date();
    const { projectId, title, description, startAt, endAt, meetingLink } = req.body;
    const row = {
      id,
      project_id: projectId || null,
      title,
      description: description || null,
      start_at: startAt ? new Date(startAt) : null,
      end_at: endAt ? new Date(endAt) : null,
      status: 'scheduled',
      meeting_link: meetingLink || null,
      created_at: now,
      updated_at: now
    };
    await db('live_events').insert(row);
    res.status(201).json({ success: true, data: row });
  } catch (e) { next(e); }
});

router.get('/events/:id/chat', optionalAuth, async (req, res, next) => {
  try {
    await ensureTables();
    const { id } = req.params;
    const rows = await db('live_chat_messages').where('event_id', id).orderBy('created_at', 'asc');
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
});

router.post('/events/:id/chat', protect, async (req, res, next) => {
  try {
    await ensureTables();
    const { id } = req.params;
    const msg = {
      id: `msg_${Date.now()}`,
      event_id: id,
      sender_id: req.user?.id || null,
      sender_name: `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim() || req.user?.username || 'User',
      content: req.body.content || null,
      type: req.body.type || 'text',
      file_url: req.body.fileUrl || null,
      duration: req.body.duration || null,
      created_at: new Date(),
      updated_at: new Date()
    };
    await db('live_chat_messages').insert(msg);
    res.status(201).json({ success: true, data: msg });
  } catch (e) { next(e); }
});

module.exports = router;


