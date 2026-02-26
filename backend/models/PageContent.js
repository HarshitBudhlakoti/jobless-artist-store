const mongoose = require('mongoose');

const pageContentSchema = new mongoose.Schema(
  {
    sectionKey: {
      type: String,
      required: [true, 'Section key is required'],
      unique: true,
      trim: true,
      index: true,
      maxlength: [100, 'Section key cannot exceed 100 characters'],
      match: [/^[a-zA-Z0-9_-]+$/, 'Section key can only contain letters, numbers, hyphens, and underscores'],
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Content is required'],
      validate: {
        validator: function (val) {
          return JSON.stringify(val).length <= 100000; // 100KB max
        },
        message: 'Content is too large (max 100KB)',
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PageContent', pageContentSchema);
