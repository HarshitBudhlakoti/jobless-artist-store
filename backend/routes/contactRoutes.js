const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { submitContact } = require('../controllers/contactController');
const Newsletter = require('../models/Newsletter');

const contactLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });
const newsletterLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5 });

router.post('/', contactLimiter, submitContact);

// POST /contact/newsletter - Subscribe to newsletter
router.post('/newsletter', newsletterLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email format
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    const existing = await Newsletter.findOne({ email: email.toLowerCase().trim() });

    if (existing) {
      if (existing.isActive) {
        return res.status(200).json({ success: true, message: 'You are already subscribed!' });
      }
      // Reactivate
      existing.isActive = true;
      existing.subscribedAt = new Date();
      await existing.save();
      return res.status(200).json({ success: true, message: 'Welcome back! Your subscription has been reactivated.' });
    }

    // Create new subscription
    await Newsletter.create({ email: email.toLowerCase().trim() });
    return res.status(201).json({ success: true, message: 'Thank you for subscribing!' });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;
