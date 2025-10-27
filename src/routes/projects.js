const express = require('express');
const { createProject, getProjects, getProject } = require('../controllers/projectController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Protected routes (require authentication)
router.post('/', authenticateToken, createProject);

// Public routes
router.get('/', getProjects);
router.get('/:id', getProject);

module.exports = router;
