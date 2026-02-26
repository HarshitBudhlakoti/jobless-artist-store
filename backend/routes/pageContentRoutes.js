const express = require('express');
const router = express.Router();
const { getSection, getAllSections, upsertSection } = require('../controllers/pageContentController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

router.get('/', getAllSections);
router.get('/:sectionKey', getSection);
router.put('/:sectionKey', auth, adminAuth, upsertSection);

module.exports = router;
