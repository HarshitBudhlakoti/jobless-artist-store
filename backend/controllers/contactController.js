const sendEmail = require('../utils/sendEmail');
const { escape } = require('html-escaper');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// @desc    Handle contact form submission
// @route   POST /api/contact
// @access  Public
const submitContact = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    if (name.length > 100 || subject.length > 200 || message.length > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Input exceeds maximum allowed length',
      });
    }

    if (message.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Message must be at least 10 characters',
      });
    }

    const recipientEmail = process.env.CONTACT_EMAIL || process.env.EMAIL_USER;

    if (!recipientEmail) {
      console.error('CONTACT_EMAIL and EMAIL_USER are not configured');
      return res.status(500).json({
        success: false,
        message: 'Contact form is not configured. Please try again later.',
      });
    }

    const html = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${escape(name)}</p>
      <p><strong>Email:</strong> ${escape(email)}</p>
      <p><strong>Subject:</strong> ${escape(subject)}</p>
      <hr/>
      <p><strong>Message:</strong></p>
      <p>${escape(message).replace(/\n/g, '<br/>')}</p>
      <hr/>
      <p style="color: #888; font-size: 12px;">Sent from the Jobless Artist contact form</p>
    `;

    await sendEmail({
      to: recipientEmail,
      subject: `Contact: ${subject} — from ${name}`,
      html,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
    });

    res.json({
      success: true,
      message: 'Your message has been sent successfully',
    });
  } catch (error) {
    console.error('Contact form error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.',
    });
  }
};

module.exports = { submitContact };
