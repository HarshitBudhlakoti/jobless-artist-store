const express = require('express');
const router = express.Router();
const {
  uploadImage,
  uploadImages,
  deleteImage,
} = require('../controllers/uploadController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const { uploadSingle, uploadArray } = require('../middleware/upload');

// Admin-only routes
router.post('/image', auth, adminAuth, uploadSingle, uploadImage);
router.post('/images', auth, adminAuth, uploadArray, uploadImages);
router.delete('/image/:public_id', auth, adminAuth, deleteImage);

module.exports = router;
