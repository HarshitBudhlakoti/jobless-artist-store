const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} = require('../controllers/testimonialController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Optional auth: sets req.user if valid token present, but doesn't reject
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.startsWith('Bearer')
      ? req.headers.authorization.split(' ')[1]
      : null;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    }
  } catch {
    // Silently continue without user
  }
  next();
};

router.get('/', optionalAuth, getTestimonials);
router.post('/', auth, adminAuth, createTestimonial);
router.put('/:id', auth, adminAuth, updateTestimonial);
router.delete('/:id', auth, adminAuth, deleteTestimonial);

module.exports = router;
