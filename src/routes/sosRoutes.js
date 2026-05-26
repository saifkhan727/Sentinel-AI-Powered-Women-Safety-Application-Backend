const express = require('express');
const router = express.Router();
const {
  triggerSOS,
  resolveSOS,
  getSOSHistory
} = require('../controllers/sosController');
const authMiddleware = require('../middleware/authMiddleware');

// All SOS routes are protected
router.use(authMiddleware);

// POST /api/sos/trigger → Trigger SOS
router.post('/trigger', triggerSOS);

// PUT /api/sos/:id/resolve → Resolve SOS
router.put('/:id/resolve', resolveSOS);

// GET /api/sos/history → Get SOS history
router.get('/history', getSOSHistory);

module.exports = router;