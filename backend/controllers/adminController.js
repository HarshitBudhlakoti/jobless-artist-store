const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const CustomOrder = require('../models/CustomOrder');

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Admin
const getDashboardStats = async (req, res, next) => {
  try {
    // Run all queries in parallel for performance
    const [
      totalRevenue,
      orderCount,
      userCount,
      productCount,
      recentOrders,
      monthlyRevenue,
      pendingCustomOrders,
    ] = await Promise.all([
      // Total revenue from paid orders
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),

      // Total order count
      Order.countDocuments(),

      // Total user count
      User.countDocuments(),

      // Total product count
      Product.countDocuments({ isActive: true }),

      // Recent 10 orders
      Order.find()
        .populate('user', 'name email')
        .populate('items.product', 'title price')
        .sort({ createdAt: -1 })
        .limit(10),

      // Monthly revenue for the last 12 months
      Order.aggregate([
        {
          $match: {
            paymentStatus: 'paid',
            createdAt: {
              $gte: new Date(
                new Date().setFullYear(new Date().getFullYear() - 1)
              ),
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            revenue: { $sum: '$totalAmount' },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 },
        },
      ]),

      // Pending custom orders
      CustomOrder.countDocuments({
        status: { $in: ['inquiry', 'quoted'] },
      }),
    ]);

    // Order status distribution
    const orderStatusDistribution = await Order.aggregate([
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 },
        },
      },
    ]);

    // Top selling products
    const topProducts = await Product.find({ isActive: true })
      .sort({ soldCount: -1 })
      .limit(5)
      .select('title price soldCount images');

    res.json({
      success: true,
      data: {
        totalRevenue:
          totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        orderCount,
        userCount,
        productCount,
        pendingCustomOrders,
        recentOrders,
        monthlyRevenue: monthlyRevenue.map((item) => ({
          year: item._id.year,
          month: item._id.month,
          revenue: item.revenue,
          orderCount: item.count,
        })),
        orderStatusDistribution: orderStatusDistribution.reduce(
          (acc, item) => {
            acc[item._id] = item.count;
            return acc;
          },
          {}
        ),
        topProducts,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  Admin
const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;

    const query = {};

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { email: { $regex: escaped, $options: 'i' } },
      ];
    }

    if (role) {
      query.role = role;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-resetPasswordToken -resetPasswordExpire')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      User.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: users,
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

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Admin
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Valid role is required (user or admin)',
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent self-demotion
    if (user._id.toString() === req.user._id.toString() && role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own admin role',
      });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: `User role updated to ${role}`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  updateUserRole,
};
