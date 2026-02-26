const delhivery = require('../utils/delhiveryService');
const Order = require('../models/Order');

const INDIA_POST_FLAT_RATE = parseInt(process.env.INDIA_POST_FLAT_RATE, 10) || 75;
const INDIA_POST_FREE_THRESHOLD = parseInt(process.env.INDIA_POST_FREE_THRESHOLD, 10) || 3000;

function calcIndiaPostCost(cartSubtotal) {
  return cartSubtotal >= INDIA_POST_FREE_THRESHOLD ? 0 : INDIA_POST_FLAT_RATE;
}

// @desc    Calculate shipping rates for both couriers
// @route   POST /api/shipping/calculate
// @access  Public
const calculateRates = async (req, res, next) => {
  try {
    const { destinationPin, cartSubtotal } = req.body;

    if (!destinationPin || !cartSubtotal) {
      return res.status(400).json({
        success: false,
        message: 'destinationPin and cartSubtotal are required',
      });
    }

    const indiaPostCost = calcIndiaPostCost(cartSubtotal);

    const rates = {
      'india-post': {
        available: true,
        cost: indiaPostCost,
        estimatedDays: '5-7 business days',
        label: 'India Post',
      },
      delhivery: {
        available: false,
        cost: null,
        estimatedDays: '2-4 business days',
        label: 'Delhivery',
        comingSoon: true,
      },
    };

    // Try Delhivery if configured
    if (delhivery.isConfigured()) {
      try {
        const chargeData = await delhivery.calculateCharges({
          destinationPin,
        });

        const totalCharge =
          chargeData?.[0]?.total_amount ?? chargeData?.total_amount ?? null;

        if (totalCharge !== null) {
          rates.delhivery = {
            available: true,
            cost: Math.ceil(totalCharge),
            estimatedDays: '2-4 business days',
            label: 'Delhivery',
            comingSoon: false,
          };
        }
      } catch {
        // Delhivery unavailable — keep comingSoon: true
      }
    }

    res.json({ success: true, data: rates });
  } catch (error) {
    next(error);
  }
};

// @desc    Create Delhivery shipment for an order (admin only)
// @route   POST /api/shipping/create-shipment
// @access  Admin
const createShipment = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'orderId is required',
      });
    }

    if (!delhivery.isConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'Delhivery integration is not configured',
      });
    }

    const order = await Order.findById(orderId)
      .populate('user', 'name email phone')
      .populate('items.product', 'title');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const addr = order.shippingAddress;
    const shipmentData = {
      name: addr.fullName || order.user?.name || '',
      add: addr.street,
      city: addr.city,
      state: addr.state,
      pin: addr.zip,
      country: addr.country || 'India',
      phone: addr.phone || order.user?.phone || '',
      order: order._id.toString(),
      payment_mode: order.paymentStatus === 'paid' ? 'Prepaid' : 'COD',
      total_amount: order.totalAmount,
      cod_amount: order.paymentStatus === 'paid' ? 0 : order.totalAmount,
      products_desc: order.items.map((i) => i.product?.title || 'Art piece').join(', '),
      quantity: order.items.reduce((sum, i) => sum + i.quantity, 0),
    };

    const result = await delhivery.createShipment(shipmentData);

    const awb =
      result?.upload_wbn ||
      result?.packages?.[0]?.waybill ||
      result?.waybill ||
      null;

    if (awb) {
      order.courierTrackingId = awb;
      order.courierDetails = result;
      order.shippingMethod = 'delhivery';
      await order.save();
    }

    res.json({ success: true, data: { awb, details: result } });
  } catch (error) {
    next(error);
  }
};

// @desc    Track a Delhivery shipment
// @route   GET /api/shipping/track/:awb
// @access  Private
const trackShipment = async (req, res, next) => {
  try {
    const { awb } = req.params;

    if (!delhivery.isConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'Delhivery tracking is not available',
      });
    }

    const trackingData = await delhivery.trackShipment(awb);
    res.json({ success: true, data: trackingData });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  calculateRates,
  createShipment,
  trackShipment,
  calcIndiaPostCost,
  INDIA_POST_FLAT_RATE,
  INDIA_POST_FREE_THRESHOLD,
};
