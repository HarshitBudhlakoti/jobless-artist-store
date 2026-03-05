const Order = require('../models/Order');
const Product = require('../models/Product');
const cashfree = require('../utils/cashfreeService');
const sendEmail = require('../utils/sendEmail');
const emailTemplates = require('../utils/emailTemplates');
const SiteSettings = require('../models/SiteSettings');
const {
  calcIndiaPostCost,
} = require('./shippingController');

// @desc    Create a Cashfree payment order
// @route   POST /api/payments/create-order
// @access  Private
const createPaymentOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, shippingMethod, shippingCost, notes } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'No items provided' });
    }
    if (!shippingAddress) {
      return res.status(400).json({ success: false, message: 'Shipping address is required' });
    }

    // Atomic stock decrement (same pattern as orderController)
    let productSubtotal = 0;
    const orderItems = [];
    const stockUpdates = [];

    for (const item of items) {
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
          // Rollback stock
          for (const update of stockUpdates) {
            await Product.findByIdAndUpdate(update.product, {
              $inc: { stock: update.quantity, soldCount: -update.quantity },
            });
          }
          return res.status(400).json({ success: false, message: 'Invalid shipping cost' });
        }
        verifiedShippingCost = cost;
      }
    }

    const totalAmount = productSubtotal + verifiedShippingCost;

    // Create order in DB with pending payment
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      shippingMethod: method,
      shippingCost: verifiedShippingCost,
      shippingAddress,
      notes,
      paymentStatus: 'pending',
    });

    // Create Cashfree order
    const cfOrderId = `order_${order._id}`;
    const cfOrder = await cashfree.createOrder({
      orderId: cfOrderId,
      orderAmount: totalAmount,
      customerDetails: {
        customerId: req.user._id.toString(),
        customerName: shippingAddress.fullName || req.user.name,
        customerEmail: shippingAddress.email || req.user.email,
        customerPhone: shippingAddress.phone || req.user.phone || '9999999999',
        returnUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/checkout/verify?order_id=${cfOrderId}`,
      },
    });

    // Save Cashfree order ID to our order
    order.cfOrderId = cfOrderId;
    await order.save();

    res.status(201).json({
      success: true,
      data: {
        payment_session_id: cfOrder.payment_session_id,
        cfOrderId,
        orderId: order._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify payment after Cashfree checkout
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = async (req, res, next) => {
  try {
    const { cfOrderId } = req.body;

    if (!cfOrderId) {
      return res.status(400).json({ success: false, message: 'cfOrderId is required' });
    }

    const order = await Order.findOne({ cfOrderId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify ownership
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Already processed
    if (order.paymentStatus === 'paid') {
      const populatedOrder = await Order.findById(order._id)
        .populate('user', 'name email')
        .populate('items.product', 'title images price');
      return res.json({ success: true, data: populatedOrder });
    }

    // Verify with Cashfree
    const cfStatus = await cashfree.getOrderStatus(cfOrderId);

    if (cfStatus.order_status === 'PAID') {
      order.paymentStatus = 'paid';
      order.paymentId = cfStatus.cf_order_id?.toString() || cfOrderId;
      await order.save();

      const populatedOrder = await Order.findById(order._id)
        .populate('user', 'name email')
        .populate('items.product', 'title images price');

      // Fire-and-forget email notifications
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      try {
        const userName = populatedOrder.user?.name || 'Customer';
        const userEmail = populatedOrder.user?.email;

        // Payment confirmation to user
        if (userEmail) {
          const emailData = emailTemplates.paymentConfirmed({
            userName,
            orderId: order._id.toString(),
            totalAmount: order.totalAmount,
            clientUrl,
          });
          sendEmail({ to: userEmail, ...emailData }).catch(() => {});
        }

        // Admin notification
        const settings = await SiteSettings.getSettings();
        const adminEmail = settings?.contact?.email;
        if (adminEmail) {
          const adminData = emailTemplates.adminNewOrder({
            orderId: order._id.toString(),
            userName,
            userEmail: userEmail || 'N/A',
            totalAmount: order.totalAmount,
            itemCount: order.items?.length || 0,
            clientUrl,
          });
          sendEmail({ to: adminEmail, ...adminData }).catch(() => {});
        }
      } catch {
        // Non-blocking
      }

      return res.json({ success: true, data: populatedOrder });
    }

    // Payment not successful — rollback stock
    if (['EXPIRED', 'TERMINATED', 'CANCELLED'].includes(cfStatus.order_status)) {
      order.paymentStatus = 'failed';
      await order.save();

      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity, soldCount: -item.quantity },
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Payment failed or was cancelled',
        paymentStatus: 'failed',
      });
    }

    // Still pending/active
    return res.json({
      success: true,
      data: { paymentStatus: 'pending', orderStatus: cfStatus.order_status },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cashfree webhook handler
// @route   POST /api/payments/webhook
// @access  Public (called by Cashfree)
const webhookHandler = async (req, res, next) => {
  try {
    const timestamp = req.headers['x-webhook-timestamp'];
    const signature = req.headers['x-webhook-signature'];

    if (!timestamp || !signature) {
      return res.status(400).json({ success: false, message: 'Missing webhook headers' });
    }

    const isValid = cashfree.verifyWebhookSignature(req.rawBody || '', timestamp, signature);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid webhook signature' });
    }

    const event = req.body;
    const eventType = event.type;
    const orderData = event.data?.order;
    const cfOrderId = orderData?.order_id;

    if (!cfOrderId) {
      return res.status(200).json({ success: true, message: 'No order ID in webhook' });
    }

    const order = await Order.findOne({ cfOrderId });
    if (!order) {
      return res.status(200).json({ success: true, message: 'Order not found' });
    }

    if (eventType === 'PAYMENT_SUCCESS_WEBHOOK') {
      if (order.paymentStatus !== 'paid') {
        order.paymentStatus = 'paid';
        order.paymentId = event.data?.payment?.cf_payment_id?.toString() || cfOrderId;
        await order.save();
      }
    } else if (
      eventType === 'PAYMENT_FAILED_WEBHOOK' ||
      eventType === 'PAYMENT_EXPIRED_WEBHOOK'
    ) {
      if (order.paymentStatus !== 'paid' && order.paymentStatus !== 'failed') {
        order.paymentStatus = 'failed';
        await order.save();

        // Rollback stock
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity, soldCount: -item.quantity },
          });
        }
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  webhookHandler,
};
