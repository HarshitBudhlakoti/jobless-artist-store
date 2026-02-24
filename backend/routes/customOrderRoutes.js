const express = require('express');
const router = express.Router();
const {
  createCustomOrder,
  getMyCustomOrders,
  getCustomOrder,
  getAllCustomOrders,
  updateCustomOrder,
} = require('../controllers/customOrderController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Protected routes
router.post('/', auth, createCustomOrder);
router.get('/my-orders', auth, getMyCustomOrders);

// Admin routes (must be before /:id to avoid conflicts)
router.get('/admin/all', auth, adminAuth, getAllCustomOrders);
router.put('/:id', auth, adminAuth, updateCustomOrder);

// Protected route (single custom order - check ownership in controller)
router.get('/:id', auth, getCustomOrder);

module.exports = router;
