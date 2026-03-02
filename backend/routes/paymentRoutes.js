const express = require('express');
const router = express.Router();
const {
  createPaymentOrder,
  verifyPayment,
  webhookHandler,
} = require('../controllers/paymentController');
const auth = require('../middleware/auth');

// Protected routes (require login)
router.post('/create-order', auth, createPaymentOrder);
router.post('/verify', auth, verifyPayment);

// Webhook (called by Cashfree, no auth)
router.post('/webhook', webhookHandler);

module.exports = router;
