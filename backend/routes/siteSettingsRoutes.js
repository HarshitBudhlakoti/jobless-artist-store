const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/siteSettingsController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

router.get('/', getSettings);
router.put('/', auth, adminAuth, updateSettings);

module.exports = router;
