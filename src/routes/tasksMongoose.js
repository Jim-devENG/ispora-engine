/**
 * Tasks Routes (Mongoose)
 * Phase 1: Tasks endpoints integrated with MongoDB
 */

const express = require('express');
const router = express.Router();
const {
  createTask,
  getProjectTasks,
  updateTaskStatus
} = require('../controllers/tasksMongoose');
const { verifyToken } = require('../middleware/authMongoose');

// Protected routes (require authentication)
router.post('/', verifyToken, createTask);
router.patch('/:id/status', verifyToken, updateTaskStatus);

// Get tasks for a project (public/protected based on project visibility)
router.get('/project/:projectId', getProjectTasks);

module.exports = router;

