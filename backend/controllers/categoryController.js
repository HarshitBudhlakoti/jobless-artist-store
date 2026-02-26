const Category = require('../models/Category');
const cloudinary = require('../config/cloudinary');

// @desc    Get all active categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({
      displayOrder: 1,
      name: 1,
    });

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Admin
const createCategory = async (req, res, next) => {
  try {
    const { name, description, image, type, isActive, displayOrder } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
      });
    }

    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${escapedName}$`, 'i') },
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists',
      });
    }

    const category = await Category.create({
      name,
      description,
      image,
      type,
      isActive: isActive !== undefined ? isActive : true,
      displayOrder: displayOrder || 0,
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Admin
const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    const allowedFields = [
      'name',
      'description',
      'image',
      'type',
      'isActive',
      'displayOrder',
    ];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // If name is being changed, regenerate slug
    if (updates.name) {
      updates.slug = updates.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Admin
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Delete category image from Cloudinary if it exists
    if (category.image && category.image.public_id) {
      await cloudinary.uploader.destroy(category.image.public_id);
    }

    await Category.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
