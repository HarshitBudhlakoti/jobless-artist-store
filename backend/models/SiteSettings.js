const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema(
  {
    contact: {
      email: { type: String, default: 'joblessartist99@gmail.com', maxlength: 255 },
      phone: { type: String, default: '+91 82185 85651', maxlength: 50 },
      address: {
        type: String,
        default:
          'Issainagar Phase 2, Jaipur Padli, Lamachaur, Haldwani, Nainital 263139',
        maxlength: 500,
      },
      workingHours: { type: String, default: 'Mon - Sat: 10:00 AM - 7:00 PM', maxlength: 200 },
    },
    socialLinks: {
      instagram: { type: String, default: '', maxlength: 500 },
      pinterest: { type: String, default: '', maxlength: 500 },
      facebook: { type: String, default: '', maxlength: 500 },
      twitter: { type: String, default: '', maxlength: 500 },
      youtube: { type: String, default: '', maxlength: 500 },
    },
    footer: {
      brandDescription: {
        type: String,
        default:
          'Handcrafted art that tells a story. Each piece is created with passion, precision, and a deep love for artistic expression. Bringing unique, soulful art into your world.',
        maxlength: 2000,
      },
      copyrightText: {
        type: String,
        default: 'Jobless Artist. All rights reserved.',
        maxlength: 200,
      },
      paymentMethods: {
        type: [String],
        default: ['Visa', 'Mastercard', 'UPI', 'Cashfree'],
        validate: [
          (arr) => arr.length <= 20,
          'Cannot have more than 20 payment methods',
        ],
      },
    },
    artistStats: {
      paintingsCreated: { type: Number, default: 0, min: 0, max: 999999 },
      happyClients: { type: Number, default: 0, min: 0, max: 999999 },
      yearsOfPassion: { type: Number, default: 0, min: 0, max: 999999 },
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one document exists (singleton)
siteSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
