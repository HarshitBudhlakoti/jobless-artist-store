const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const { orderValidator } = require('../utils/validators');

// Protected routes
router.post('/', auth, orderValidator, createOrder);
router.get('/my-orders', auth, getMyOrders);

// Admin routes (must be before /:id to avoid conflicts)
router.get('/admin/all', auth, adminAuth, getAllOrders);
router.put('/:id/status', auth, adminAuth, updateOrderStatus);

// Protected route (single order - check ownership in controller)
router.get('/:id', auth, getOrder);

module.exports = router;
