const express = require('express');
const { register, login, getMe, logout, refreshToken } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', authenticateToken, getMe);
router.post('/logout', authenticateToken, logout);
router.post('/refresh', authenticateToken, refreshToken); // Token refresh endpoint

module.exports = router;
