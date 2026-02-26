const express = require('express');
const router = express.Router();
const {
  calculateRates,
  createShipment,
  trackShipment,
} = require('../controllers/shippingController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Public — calculate shipping rates
router.post('/calculate', calculateRates);

// Admin — create Delhivery shipment
router.post('/create-shipment', auth, adminAuth, createShipment);

// Authenticated — track shipment
router.get('/track/:awb', auth, trackShipment);

module.exports = router;
