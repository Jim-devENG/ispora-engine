const express = require('express');
const db = require('../database/connection');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

async function ensureTables() {
  const contentExists = await db.schema.hasTable('learning_content');
  if (!contentExists) {
    await db.schema.createTable('learning_content', (t) => {
      t.string('id').primary();
      t.string('project_id').index();
      t.string('title').notNullable();
      t.text('description');
      t.string('type').notNullable().defaultTo('link'); // link, file, note, video
      t.string('url');
      t.text('tags');
      t.string('uploader_id');
      t.timestamps(true, true);
    });
  }

  const recExists = await db.schema.hasTable('learning_recordings');
  if (!recExists) {
    await db.schema.createTable('learning_recordings', (t) => {
      t.string('id').primary();
      t.string('project_id').index();
      t.string('title').notNullable();
      t.integer('duration');
      t.string('url');
      t.text('transcript');
      t.string('uploader_id');
      t.timestamps(true, true);
    });
  }
}

router.get('/content', optionalAuth, async (req, res, next) => {
  try {
    await ensureTables();
    const { projectId } = req.query;
    let q = db('learning_content').select('*').orderBy('created_at', 'desc');
    if (projectId) q = q.where('project_id', projectId);
    const rows = await q;
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
});

router.post('/content', protect, async (req, res, next) => {
  try {
    await ensureTables();
    const id = `lc_${Date.now()}`;
    const now = new Date();
    const { projectId, title, description, type, url, tags } = req.body;
    const row = {
      id,
      project_id: projectId || null,
      title,
      description: description || null,
      type: type || 'link',
      url: url || null,
      tags: Array.isArray(tags) ? tags.join(',') : (tags || ''),
      uploader_id: req.user?.id || null,
      created_at: now,
      updated_at: now
    };
    await db('learning_content').insert(row);
    res.status(201).json({ success: true, data: row });
  } catch (e) { next(e); }
});

router.get('/recordings', optionalAuth, async (req, res, next) => {
  try {
    await ensureTables();
    const { projectId } = req.query;
    let q = db('learning_recordings').select('*').orderBy('created_at', 'desc');
    if (projectId) q = q.where('project_id', projectId);
    const rows = await q;
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
});

router.post('/recordings', protect, async (req, res, next) => {
  try {
    await ensureTables();
    const id = `lr_${Date.now()}`;
    const now = new Date();
    const { projectId, title, duration, url, transcript } = req.body;
    const row = {
      id,
      project_id: projectId || null,
      title,
      duration: duration || null,
      url: url || null,
      transcript: transcript || null,
      uploader_id: req.user?.id || null,
      created_at: now,
      updated_at: now
    };
    await db('learning_recordings').insert(row);
    res.status(201).json({ success: true, data: row });
  } catch (e) { next(e); }
});

module.exports = router;


