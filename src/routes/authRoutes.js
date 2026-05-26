const express = require('express');
const router = express.Router();
const { registerUser, getMe } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/auth/register → Register or login user
router.post('/register', registerUser);

// GET /api/auth/me → Get current user (protected)
router.get('/me', authMiddleware, getMe);

module.exports = router;