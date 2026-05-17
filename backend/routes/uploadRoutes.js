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

// Authenticated users can upload (needed for custom order reference images)
router.post('/image', auth, uploadSingle, uploadImage);
router.post('/images', auth, uploadArray, uploadImages);

// Only admins can delete images
router.delete('/image/:public_id', auth, adminAuth, deleteImage);

module.exports = router;
