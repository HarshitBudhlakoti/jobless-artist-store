const { validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const {
  calcIndiaPostCost,
  INDIA_POST_FLAT_RATE,
  INDIA_POST_FREE_THRESHOLD,
} = require('./shippingController');

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { items, shippingAddress, notes, paymentId, shippingMethod, shippingCost } = req.body;

    // Validate and calculate total from actual product prices (atomic stock check)
    let productSubtotal = 0;
    const orderItems = [];
    const stockUpdates = []; // Track updates for rollback on failure

    for (const item of items) {
      // Atomically decrement stock — only succeeds if enough stock exists
      const product = await Product.findOneAndUpdate(
        { _id: item.product, isActive: true, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity, soldCount: item.quantity } },
        { new: true }
      );

      if (!product) {
        // Rollback any stock decrements already made
        for (const update of stockUpdates) {
          await Product.findByIdAndUpdate(update.product, {
            $inc: { stock: update.quantity, soldCount: -update.quantity },
          });
        }

        // Check why it failed
        const check = await Product.findById(item.product);
        if (!check) {
          return res.status(404).json({ success: false, message: 'Product not found' });
        }
        if (!check.isActive) {
          return res.status(400).json({ success: false, message: `${check.title} is not available` });
        }
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${check.title}. Available: ${check.stock}`,
        });
      }

      stockUpdates.push({ product: product._id, quantity: item.quantity });

      const itemPrice = product.discountPrice || product.price;
      productSubtotal += itemPrice * item.quantity;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: itemPrice,
      });
    }

    // Server-side shipping cost verification
    const method = shippingMethod || 'india-post';
    let verifiedShippingCost = 0;

    if (method === 'india-post') {
      verifiedShippingCost = calcIndiaPostCost(productSubtotal);
    } else if (method === 'delhivery') {
      // Server-side Delhivery cost verification
      const delhivery = require('../utils/delhiveryService');
      if (delhivery.isConfigured() && shippingAddress?.zip) {
        try {
          const chargeData = await delhivery.calculateCharges({ destinationPin: shippingAddress.zip });
          const serverCost = chargeData?.[0]?.total_amount ?? chargeData?.total_amount ?? null;
          if (serverCost !== null) {
            verifiedShippingCost = Math.ceil(serverCost);
          } else {
            verifiedShippingCost = Math.min(Math.max(parseFloat(shippingCost) || 0, 0), 2000);
          }
        } catch {
          verifiedShippingCost = Math.min(Math.max(parseFloat(shippingCost) || 0, 0), 2000);
        }
      } else {
        const cost = parseFloat(shippingCost) || 0;
        if (cost < 0 || cost > 2000) {
          return res.status(400).json({ success: false, message: 'Invalid shipping cost' });
        }
        verifiedShippingCost = cost;
      }
    }

    const totalAmount = productSubtotal + verifiedShippingCost;

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      shippingMethod: method,
      shippingCost: verifiedShippingCost,
      shippingAddress,
      notes,
      paymentId,
      paymentStatus: paymentId ? 'paid' : 'pending',
    });

    // Stock already decremented atomically above

    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('items.product', 'title images price');

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: populatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit, 10) || 10), 50);
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find({ user: req.user._id })
        .populate('items.product', 'title images price')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Order.countDocuments({ user: req.user._id }),
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'title images price');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check ownership or admin access
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order',
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders/admin/all
// @access  Admin
const getAllOrders = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      orderStatus,
      paymentStatus,
    } = req.query;

    const query = {};

    if (orderStatus) {
      query.orderStatus = orderStatus;
    }
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email')
        .populate('items.product', 'title images price')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Order.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
// @access  Admin
const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus, paymentStatus, trackingNumber } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
    }
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('items.product', 'title images price');

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
};
