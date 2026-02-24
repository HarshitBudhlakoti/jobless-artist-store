const CustomOrder = require('../models/CustomOrder');

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

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
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

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
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

    await order.save();

    const updatedOrder = await CustomOrder.findById(order._id).populate(
      'user',
      'name email'
    );

    res.json({
      success: true,
      message: 'Custom order updated successfully',
      data: updatedOrder,
    });
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
};
