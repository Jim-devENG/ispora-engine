/**
 * Projects Routes (Mongoose)
 * Phase 1: Projects endpoints with objectives normalization
 */

const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProject,
  getProjectUpdates
} = require('../controllers/projectsMongoose');
const { verifyToken } = require('../middleware/authMongoose');

// Protected routes (require authentication)
router.post('/', verifyToken, createProject);
router.get('/updates', verifyToken, getProjectUpdates);

// Public routes
router.get('/', getProjects);
router.get('/:id', getProject);

module.exports = router;

