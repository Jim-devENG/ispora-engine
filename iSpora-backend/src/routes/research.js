const express = require('express');
const router = express.Router();

// In-memory store fallback (replace with DB integration if available)
const state = {
  sources: [],
  notes: [],
  datasets: [],
};

// Helpers
const ok = (res, data) => res.json({ success: true, data });
const created = (res, data) => res.status(201).json({ success: true, data });

// Sources
router.get('/sources', (req, res) => ok(res, state.sources));
router.post('/sources', (req, res) => {
  const { title, authors, year, type, url, abstract, keywords, notes } = req.body || {};
  const item = {
    id: `${Date.now()}`,
    title: String(title || ''),
    authors: String(authors || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean),
    year: Number(year) || new Date().getFullYear(),
    type: String(type || 'journal'),
    url: url || undefined,
    abstract: abstract || undefined,
    keywords: String(keywords || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean),
    relevance: 0,
    notes: notes || undefined,
    addedBy: 'You',
    addedDate: new Date().toISOString().split('T')[0],
    favorite: false,
  };
  state.sources.unshift(item);
  created(res, item);
});

// Notes
router.get('/notes', (req, res) => ok(res, state.notes));
router.post('/notes', (req, res) => {
  const { title, content, tags, category } = req.body || {};
  const item = {
    id: `${Date.now()}`,
    title: String(title || ''),
    content: String(content || ''),
    tags: String(tags || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean),
    author: 'You',
    createdDate: new Date().toISOString().split('T')[0],
    lastModified: new Date().toISOString().split('T')[0],
    shared: false,
    category: category || 'observation',
  };
  state.notes.unshift(item);
  created(res, item);
});

// Datasets
router.get('/datasets', (req, res) => ok(res, state.datasets));
router.post('/datasets', (req, res) => {
  const { name, description, type, size, format, tags, url, isPublic } = req.body || {};
  const item = {
    id: `${Date.now()}`,
    name: String(name || ''),
    description: String(description || ''),
    type: String(type || 'survey'),
    size: Number(size) || 0,
    format: String(format || 'CSV'),
    uploadedBy: 'You',
    uploadedDate: new Date().toISOString().split('T')[0],
    tags: String(tags || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean),
    public: Boolean(isPublic) || false,
    url: url || undefined,
  };
  state.datasets.unshift(item);
  created(res, item);
});

module.exports = router;


