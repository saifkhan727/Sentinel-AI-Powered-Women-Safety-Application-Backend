const express = require('express');
const router = express.Router();
const {
  startSession,
  updateLocation,
  stopSession,
  getActiveSession,
  trackLocation
} = require('../controllers/locationController');
const authMiddleware = require('../middleware/authMiddleware');

// Protected routes
router.post('/start', authMiddleware, startSession);
router.put('/update', authMiddleware, updateLocation);
router.post('/stop', authMiddleware, stopSession);
router.get('/active', authMiddleware, getActiveSession);

// Public route — guardians track without app
router.get('/track/:token', trackLocation);

module.exports = router;