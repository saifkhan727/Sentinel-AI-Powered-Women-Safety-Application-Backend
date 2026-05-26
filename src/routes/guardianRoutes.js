const express = require('express');
const router = express.Router();
const {
  getGuardians,
  addGuardian,
  updateGuardian,
  deleteGuardian
} = require('../controllers/guardianController');
const authMiddleware = require('../middleware/authMiddleware');

// All guardian routes are protected
router.use(authMiddleware);

// GET /api/guardians → Get all guardians
router.get('/', getGuardians);

// POST /api/guardians → Add new guardian
router.post('/', addGuardian);

// PUT /api/guardians/:id → Update guardian
router.put('/:id', updateGuardian);

// DELETE /api/guardians/:id → Delete guardian
router.delete('/:id', deleteGuardian);

module.exports = router;