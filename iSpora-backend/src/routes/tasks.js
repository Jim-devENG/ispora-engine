const express = require('express');
const db = require('../database/connection');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

async function ensureTable() {
  const exists = await db.schema.hasTable('tasks');
  if (!exists) {
    await db.schema.createTable('tasks', (t) => {
      t.string('id').primary();
      t.string('project_id').index();
      t.string('title').notNullable();
      t.text('description');
      t.string('status').notNullable().defaultTo('todo'); // todo, in_progress, done
      t.string('priority').notNullable().defaultTo('medium'); // low, medium, high
      t.datetime('due_at');
      t.string('assignee_id');
      t.text('tags');
      t.integer('order_index').notNullable().defaultTo(0);
      t.string('creator_id').index();
      t.timestamps(true, true);
    });
  }
}

// List tasks by project
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    await ensureTable();
    const { projectId, status } = req.query;
    let q = db('tasks').select('*').orderBy(['status', { column: 'order_index', order: 'asc' }]);
    if (projectId) q = q.where('project_id', projectId);
    if (status && status !== 'all') q = q.where('status', status);
    const rows = await q;
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
});

// Create task
router.post('/', protect, async (req, res, next) => {
  try {
    await ensureTable();
    const id = `task_${Date.now()}`;
    const now = new Date();
    const {
      projectId, title, description, status, priority, dueDate, assigneeId, tags, orderIndex
    } = req.body;

    const row = {
      id,
      project_id: projectId || null,
      title,
      description: description || null,
      status: status || 'todo',
      priority: priority || 'medium',
      due_at: dueDate ? new Date(dueDate) : null,
      assignee_id: assigneeId || null,
      tags: Array.isArray(tags) ? tags.join(',') : (tags || ''),
      order_index: Number.isInteger(orderIndex) ? orderIndex : 0,
      creator_id: req.user?.id || null,
      created_at: now,
      updated_at: now
    };
    await db('tasks').insert(row);
    res.status(201).json({ success: true, data: row });
  } catch (e) { next(e); }
});

// Update task
router.put('/:id', protect, async (req, res, next) => {
  try {
    await ensureTable();
    const { id } = req.params;
    const payload = { ...req.body, updated_at: new Date() };
    if (payload.tags && Array.isArray(payload.tags)) payload.tags = payload.tags.join(',');
    if (payload.dueDate) { payload.due_at = new Date(payload.dueDate); delete payload.dueDate; }
    await db('tasks').where({ id }).update(payload);
    const updated = await db('tasks').where({ id }).first();
    res.json({ success: true, data: updated });
  } catch (e) { next(e); }
});

// Delete task
router.delete('/:id', protect, async (req, res, next) => {
  try {
    await ensureTable();
    const { id } = req.params;
    await db('tasks').where({ id }).del();
    res.json({ success: true, data: { id } });
  } catch (e) { next(e); }
});

module.exports = router;


