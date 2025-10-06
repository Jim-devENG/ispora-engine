const express = require('express');
const db = require('../database/connection');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

async function ensureTable() {
  const exists = await db.schema.hasTable('deliverables');
  if (!exists) {
    await db.schema.createTable('deliverables', (t) => {
      t.string('id').primary();
      t.string('project_id').index();
      t.string('title').notNullable();
      t.text('description');
      t.string('status').notNullable().defaultTo('pending'); // pending, submitted, approved, rejected
      t.datetime('due_at');
      t.datetime('submitted_at');
      t.string('submitter_id');
      t.text('files'); // JSON string of uploaded files metadata
      t.text('tags');
      t.text('feedback');
      t.string('reviewer_id');
      t.timestamps(true, true);
    });
  }
}

router.get('/', optionalAuth, async (req, res, next) => {
  try {
    await ensureTable();
    const { projectId, status } = req.query;
    let q = db('deliverables').select('*').orderBy('due_at', 'asc');
    if (projectId) q = q.where('project_id', projectId);
    if (status && status !== 'all') q = q.where('status', status);
    const rows = await q;
    res.json({ success: true, data: rows });
  } catch (e) {
    next(e);
  }
});

router.post('/', protect, async (req, res, next) => {
  try {
    await ensureTable();
    const id = `del_${Date.now()}`;
    const now = new Date();
    const { projectId, title, description, dueAt, tags } = req.body;
    const row = {
      id,
      project_id: projectId || null,
      title,
      description: description || null,
      status: 'pending',
      due_at: dueAt ? new Date(dueAt) : null,
      submitted_at: null,
      submitter_id: null,
      files: '[]',
      tags: Array.isArray(tags) ? tags.join(',') : tags || '',
      feedback: null,
      reviewer_id: null,
      created_at: now,
      updated_at: now,
    };
    await db('deliverables').insert(row);
    res.status(201).json({ success: true, data: row });
  } catch (e) {
    next(e);
  }
});

router.put('/:id', protect, async (req, res, next) => {
  try {
    await ensureTable();
    const { id } = req.params;
    const payload = { ...req.body, updated_at: new Date() };
    if (payload.tags && Array.isArray(payload.tags)) payload.tags = payload.tags.join(',');
    if (payload.dueAt) {
      payload.due_at = new Date(payload.dueAt);
      delete payload.dueAt;
    }
    if (payload.files && typeof payload.files !== 'string')
      payload.files = JSON.stringify(payload.files);
    await db('deliverables').where({ id }).update(payload);
    const updated = await db('deliverables').where({ id }).first();
    res.json({ success: true, data: updated });
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', protect, async (req, res, next) => {
  try {
    await ensureTable();
    const { id } = req.params;
    await db('deliverables').where({ id }).del();
    res.json({ success: true, data: { id } });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
