const Testimonial = require('../models/Testimonial');

// @desc    Get all active testimonials
// @route   GET /api/testimonials
// @access  Public
const getTestimonials = async (req, res, next) => {
  try {
    // Only admins can see inactive testimonials
    const isAdmin = req.user?.role === 'admin';
    const filter = (req.query.all === 'true' && isAdmin) ? {} : { isActive: true };
    const testimonials = await Testimonial.find(filter)
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(100);
    res.json({ success: true, data: testimonials });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a testimonial
// @route   POST /api/testimonials
// @access  Admin
const createTestimonial = async (req, res, next) => {
  try {
    const { name, location, quote, rating, isActive, displayOrder } = req.body;

    if (!name || !quote) {
      return res.status(400).json({
        success: false,
        message: 'Name and quote are required',
      });
    }

    const testimonial = await Testimonial.create({
      name,
      location,
      quote,
      rating: rating || 5,
      isActive: isActive !== undefined ? isActive : true,
      displayOrder: displayOrder || 0,
    });

    res.status(201).json({
      success: true,
      message: 'Testimonial created successfully',
      data: testimonial,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a testimonial
// @route   PUT /api/testimonials/:id
// @access  Admin
const updateTestimonial = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found',
      });
    }

    const allowedFields = ['name', 'location', 'quote', 'rating', 'isActive', 'displayOrder'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const updated = await Testimonial.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Testimonial updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a testimonial
// @route   DELETE /api/testimonials/:id
// @access  Admin
const deleteTestimonial = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found',
      });
    }

    await Testimonial.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Testimonial deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
};
