const express = require('express');
const { getSettings, saveSettings } = require('../controllers/settingsController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', getSettings);
router.put('/', requireAuth, requireAdmin, saveSettings);

module.exports = router;
