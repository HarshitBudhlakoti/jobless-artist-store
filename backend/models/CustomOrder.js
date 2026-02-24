const mongoose = require('mongoose');

const customOrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    orderType: {
      type: String,
      enum: {
        values: ['portrait', 'landscape', 'abstract', 'craft', 'other'],
        message: '{VALUE} is not a valid order type',
      },
      required: [true, 'Order type is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    referenceImages: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],
    size: {
      width: { type: Number },
      height: { type: Number },
      unit: { type: String, enum: ['in', 'cm', 'ft'], default: 'in' },
    },
    medium: {
      type: String,
      trim: true,
    },
    estimatedPrice: {
      type: Number,
      min: [0, 'Estimated price cannot be negative'],
    },
    finalPrice: {
      type: Number,
      min: [0, 'Final price cannot be negative'],
    },
    status: {
      type: String,
      enum: [
        'inquiry',
        'quoted',
        'accepted',
        'in-progress',
        'review',
        'revision',
        'completed',
        'delivered',
        'cancelled',
      ],
      default: 'inquiry',
    },
    adminNotes: {
      type: String,
      maxlength: [2000, 'Admin notes cannot exceed 2000 characters'],
    },
    progressImages: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    deadline: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

customOrderSchema.index({ user: 1, createdAt: -1 });
customOrderSchema.index({ status: 1 });

module.exports = mongoose.model('CustomOrder', customOrderSchema);
