const express = require('express');
const router = express.Router();
const {
  uploadImage,
  uploadImages,
  deleteImage,
} = require('../controllers/uploadController');
const auth = require('../middleware/auth');
const { uploadSingle, uploadArray } = require('../middleware/upload');

// Protected routes
router.post('/image', auth, uploadSingle, uploadImage);
router.post('/images', auth, uploadArray, uploadImages);
router.delete('/image/:public_id', auth, deleteImage);

module.exports = router;
