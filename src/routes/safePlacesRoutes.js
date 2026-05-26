const express = require('express');
const router = express.Router();
const { getSafePlaces } = require('../controllers/safePlacesController');

// Public route — no auth needed
router.get('/', getSafePlaces);

module.exports = router;