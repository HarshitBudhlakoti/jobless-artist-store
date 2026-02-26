const SiteSettings = require('../models/SiteSettings');

// Helper: pick only allowed keys from an object
function pick(obj, keys) {
  const result = {};
  for (const key of keys) {
    if (obj[key] !== undefined) result[key] = obj[key];
  }
  return result;
}

// Allowed sub-keys per section
const ALLOWED = {
  contact: ['email', 'phone', 'address', 'workingHours'],
  socialLinks: ['instagram', 'pinterest', 'facebook', 'twitter', 'youtube'],
  footer: ['brandDescription', 'copyrightText', 'paymentMethods'],
  artistStats: ['paintingsCreated', 'happyClients', 'yearsOfPassion'],
};

// Max string length for text fields
const MAX_LEN = 2000;
function validateStrLen(obj) {
  for (const [, val] of Object.entries(obj)) {
    if (typeof val === 'string' && val.length > MAX_LEN) return false;
  }
  return true;
}

// @desc    Get site settings
// @route   GET /api/site-settings
// @access  Public
const getSettings = async (req, res, next) => {
  try {
    const settings = await SiteSettings.getSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

// @desc    Update site settings
// @route   PUT /api/site-settings
// @access  Admin
const updateSettings = async (req, res, next) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = new SiteSettings();
    }

    const { contact, socialLinks, footer, artistStats } = req.body;

    if (contact) {
      const safe = pick(contact, ALLOWED.contact);
      if (!validateStrLen(safe)) {
        return res.status(400).json({ success: false, message: 'Field value too long (max 2000 chars)' });
      }
      settings.contact = { ...settings.contact.toObject(), ...safe };
    }

    if (socialLinks) {
      const safe = pick(socialLinks, ALLOWED.socialLinks);
      // Validate URLs: must be empty or start with https://
      for (const [, url] of Object.entries(safe)) {
        if (url && typeof url === 'string' && url.trim() !== '' && !url.startsWith('https://')) {
          return res.status(400).json({ success: false, message: 'Social links must start with https://' });
        }
      }
      settings.socialLinks = { ...settings.socialLinks.toObject(), ...safe };
    }

    if (footer) {
      const safe = pick(footer, ALLOWED.footer);
      if (!validateStrLen(safe)) {
        return res.status(400).json({ success: false, message: 'Field value too long (max 2000 chars)' });
      }
      if (safe.paymentMethods) {
        if (!Array.isArray(safe.paymentMethods) || safe.paymentMethods.length > 20) {
          return res.status(400).json({ success: false, message: 'Payment methods must be an array (max 20)' });
        }
        safe.paymentMethods = safe.paymentMethods
          .filter((m) => typeof m === 'string')
          .map((m) => m.slice(0, 50));
      }
      settings.footer = { ...settings.footer.toObject(), ...safe };
    }

    if (artistStats) {
      const safe = pick(artistStats, ALLOWED.artistStats);
      for (const [key, val] of Object.entries(safe)) {
        const num = Number(val);
        if (!Number.isFinite(num) || num < 0 || num > 999999) {
          return res.status(400).json({ success: false, message: `Invalid value for ${key}` });
        }
        safe[key] = Math.round(num);
      }
      settings.artistStats = { ...settings.artistStats.toObject(), ...safe };
    }

    await settings.save();

    res.json({
      success: true,
      message: 'Site settings updated successfully',
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSettings, updateSettings };
