const CustomOrder = require('../models/CustomOrder');
const sendEmail = require('../utils/sendEmail');
const emailTemplates = require('../utils/emailTemplates');
const SiteSettings = require('../models/SiteSettings');

// @desc    Create a custom order request
// @route   POST /api/custom-orders
// @access  Private
const createCustomOrder = async (req, res, next) => {
  try {
    const {
      orderType,
      description,
      referenceImages,
      size,
      medium,
    } = req.body;

    if (!orderType) {
      return res.status(400).json({
        success: false,
        message: 'Order type is required',
      });
    }

    if (!description) {
      return res.status(400).json({
        success: false,
        message: 'Description is required',
      });
    }

    const customOrder = await CustomOrder.create({
      user: req.user._id,
      orderType,
      description,
      referenceImages: referenceImages || [],
      size,
      medium,
    });

    const populated = await CustomOrder.findById(customOrder._id).populate(
      'user',
      'name email'
    );

    // Notify admin of new custom order (fire-and-forget)
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    try {
      const settings = await SiteSettings.getSettings();
      const adminEmail = settings?.contact?.email;
      if (adminEmail) {
        const emailData = emailTemplates.adminNewCustomOrder({
          orderId: customOrder._id.toString(),
          userName: populated.user?.name || 'Customer',
          userEmail: populated.user?.email || 'N/A',
          orderType: orderType,
          clientUrl,
        });
        sendEmail({ to: adminEmail, ...emailData }).catch(() => {});
      }
    } catch {
      // Non-blocking
    }

    res.status(201).json({
      success: true,
      message: 'Custom order request submitted successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's custom orders
// @route   GET /api/custom-orders/my-orders
// @access  Private
const getMyCustomOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit, 10) || 10), 50);
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      CustomOrder.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      CustomOrder.countDocuments({ user: req.user._id }),
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

// @desc    Get single custom order by ID
// @route   GET /api/custom-orders/:id
// @access  Private
const getCustomOrder = async (req, res, next) => {
  try {
    const order = await CustomOrder.findById(req.params.id).populate(
      'user',
      'name email phone'
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Custom order not found',
      });
    }

    // Check ownership or admin access
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this custom order',
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

// @desc    Get all custom orders (admin)
// @route   GET /api/custom-orders/admin/all
// @access  Admin
const getAllCustomOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      CustomOrder.find(query)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      CustomOrder.countDocuments(query),
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

// @desc    Update a custom order (admin)
// @route   PUT /api/custom-orders/:id
// @access  Admin
const updateCustomOrder = async (req, res, next) => {
  try {
    const order = await CustomOrder.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Custom order not found',
      });
    }

    const allowedFields = [
      'estimatedPrice',
      'finalPrice',
      'status',
      'adminNotes',
      'progressImages',
      'deadline',
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === 'progressImages' && Array.isArray(req.body[field])) {
          // Append new progress images rather than replacing
          order.progressImages.push(
            ...req.body[field].map((img) => ({
              url: img.url,
              public_id: img.public_id,
              uploadedAt: new Date(),
            }))
          );
        } else {
          order[field] = req.body[field];
        }
      }
    }

    // Auto-push negotiation entry when admin quotes a price
    if (req.body.status === 'quoted' && req.body.estimatedPrice) {
      order.negotiationHistory.push({
        price: Number(req.body.estimatedPrice),
        message: req.body.adminNotes || 'Price quoted',
        by: 'admin',
        action: 'quote',
      });
    }

    await order.save();

    const updatedOrder = await CustomOrder.findById(order._id).populate(
      'user',
      'name email'
    );

    // Send quote email to user when status changes to quoted
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    if (req.body.status === 'quoted' && req.body.estimatedPrice && updatedOrder.user?.email) {
      try {
        const emailData = emailTemplates.customOrderQuote({
          userName: updatedOrder.user.name || 'Customer',
          orderId: order._id.toString(),
          price: Number(req.body.estimatedPrice),
          message: req.body.adminNotes || '',
          clientUrl,
        });
        sendEmail({ to: updatedOrder.user.email, ...emailData }).catch(() => {});
      } catch {
        // Non-blocking
      }
    }

    res.json({
      success: true,
      message: 'Custom order updated successfully',
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    User accepts the quoted price
// @route   POST /api/custom-orders/:id/accept
// @access  Private
const acceptQuote = async (req, res, next) => {
  try {
    const order = await CustomOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Custom order not found' });
    }

    // Check ownership
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (!['quoted'].includes(order.status) && !(order.status === 'inquiry' && req.user.role === 'admin')) {
      // Admin can accept a user's counter (status remains quoted during back-and-forth)
      const lastEntry = order.negotiationHistory[order.negotiationHistory.length - 1];
      const isAdminAcceptingCounter = req.user.role === 'admin' && lastEntry?.by === 'user' && lastEntry?.action === 'counter';
      if (!isAdminAcceptingCounter) {
        return res.status(400).json({ success: false, message: 'Order cannot be accepted in current state' });
      }
    }

    const lastNegotiation = order.negotiationHistory[order.negotiationHistory.length - 1];
    const acceptedPrice = lastNegotiation?.price || order.estimatedPrice || order.finalPrice;

    order.negotiationHistory.push({
      price: acceptedPrice,
      message: req.body.message || 'Accepted',
      by: req.user.role === 'admin' ? 'admin' : 'user',
      action: 'accept',
    });

    order.status = 'accepted';
    order.finalPrice = acceptedPrice;
    await order.save();

    const updated = await CustomOrder.findById(order._id).populate('user', 'name email');

    // Notify the other party
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    try {
      if (req.user.role === 'admin' && updated.user?.email) {
        // Notify user that admin accepted
        const emailData = emailTemplates.customOrderNegotiationUpdate({
          userName: updated.user.name || 'Customer',
          orderId: order._id.toString(),
          action: 'accept',
          price: acceptedPrice,
          clientUrl,
        });
        sendEmail({ to: updated.user.email, ...emailData }).catch(() => {});
      } else {
        // Notify admin that user accepted
        const settings = await SiteSettings.getSettings();
        const adminEmail = settings?.contact?.email;
        if (adminEmail) {
          const emailData = emailTemplates.customOrderNegotiationUpdate({
            userName: 'Admin',
            orderId: order._id.toString(),
            action: 'accept',
            price: acceptedPrice,
            message: `${updated.user?.name || 'Customer'} accepted the quote`,
            clientUrl,
          });
          sendEmail({ to: adminEmail, ...emailData }).catch(() => {});
        }
      }
    } catch { /* Non-blocking */ }

    res.json({ success: true, message: 'Quote accepted', data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    User or Admin sends a counter-offer
// @route   POST /api/custom-orders/:id/counter
// @access  Private
const counterOffer = async (req, res, next) => {
  try {
    const { price, message } = req.body;

    if (!price || price <= 0) {
      return res.status(400).json({ success: false, message: 'A valid price is required' });
    }

    const order = await CustomOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Custom order not found' });
    }

    // Check ownership or admin
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const by = req.user.role === 'admin' ? 'admin' : 'user';

    order.negotiationHistory.push({
      price: Number(price),
      message: message || '',
      by,
      action: 'counter',
    });

    // Keep status as 'quoted' during negotiation
    if (order.status === 'inquiry') {
      order.status = 'quoted';
    }
    order.estimatedPrice = Number(price);
    await order.save();

    const updated = await CustomOrder.findById(order._id).populate('user', 'name email');

    // Notify the other party about counter-offer
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    try {
      if (by === 'admin' && updated.user?.email) {
        const emailData = emailTemplates.customOrderNegotiationUpdate({
          userName: updated.user.name || 'Customer',
          orderId: order._id.toString(),
          action: 'counter',
          price: Number(price),
          message,
          clientUrl,
        });
        sendEmail({ to: updated.user.email, ...emailData }).catch(() => {});
      } else if (by === 'user') {
        const settings = await SiteSettings.getSettings();
        const adminEmail = settings?.contact?.email;
        if (adminEmail) {
          const emailData = emailTemplates.customOrderNegotiationUpdate({
            userName: 'Admin',
            orderId: order._id.toString(),
            action: 'counter',
            price: Number(price),
            message: `${updated.user?.name || 'Customer'} countered: ${message || ''}`,
            clientUrl,
          });
          sendEmail({ to: adminEmail, ...emailData }).catch(() => {});
        }
      }
    } catch { /* Non-blocking */ }

    res.json({ success: true, message: 'Counter-offer sent', data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    User rejects and cancels the order
// @route   POST /api/custom-orders/:id/reject
// @access  Private
const rejectQuote = async (req, res, next) => {
  try {
    const order = await CustomOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Custom order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const lastNegotiation = order.negotiationHistory[order.negotiationHistory.length - 1];

    order.negotiationHistory.push({
      price: lastNegotiation?.price || order.estimatedPrice || 0,
      message: req.body.message || 'Rejected',
      by: 'user',
      action: 'reject',
    });

    order.status = 'cancelled';
    await order.save();

    const updated = await CustomOrder.findById(order._id).populate('user', 'name email');

    // Notify admin about rejection
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    try {
      const settings = await SiteSettings.getSettings();
      const adminEmail = settings?.contact?.email;
      if (adminEmail) {
        const emailData = emailTemplates.customOrderNegotiationUpdate({
          userName: 'Admin',
          orderId: order._id.toString(),
          action: 'reject',
          price: lastNegotiation?.price || 0,
          message: `${updated.user?.name || 'Customer'} rejected the quote`,
          clientUrl,
        });
        sendEmail({ to: adminEmail, ...emailData }).catch(() => {});
      }
    } catch { /* Non-blocking */ }

    res.json({ success: true, message: 'Order rejected', data: updated });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCustomOrder,
  getMyCustomOrders,
  getCustomOrder,
  getAllCustomOrders,
  updateCustomOrder,
  acceptQuote,
  counterOffer,
  rejectQuote,
};
