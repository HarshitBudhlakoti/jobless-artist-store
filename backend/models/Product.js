const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    discountPrice: {
      type: Number,
      min: [0, 'Discount price cannot be negative'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],
    medium: {
      type: String,
      trim: true,
      enum: {
        values: [
          'oil',
          'watercolor',
          'acrylic',
          'digital',
          'charcoal',
          'pastel',
          'ink',
          'mixed-media',
          'pencil',
          'other',
        ],
        message: '{VALUE} is not a supported medium',
      },
    },
    dimensions: {
      width: { type: Number },
      height: { type: Number },
      unit: { type: String, enum: ['in', 'cm', 'ft'], default: 'in' },
    },
    isFramed: {
      type: Boolean,
      default: false,
    },
    stock: {
      type: Number,
      default: 1,
      min: [0, 'Stock cannot be negative'],
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    soldCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.virtual('averageRating').get(function () {
  if (!this.reviews || this.reviews.length === 0) {
    return 0;
  }

  if (this.reviews.length > 0 && typeof this.reviews[0] === 'object' && this.reviews[0].rating !== undefined) {
    const total = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((total / this.reviews.length) * 10) / 10;
  }

  return 0;
});

productSchema.index({ title: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isActive: 1 });

module.exports = mongoose.model('Product', productSchema);
