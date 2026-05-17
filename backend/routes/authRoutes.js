const express = require('express');
const router = express.Router();
const passport = require('passport');
const {
  register,
  login,
  googleAuthCallback,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  changePassword,
  toggleWishlist,
  getWishlist,
} = require('../controllers/authController');
const auth = require('../middleware/auth');
const { registerValidator, loginValidator } = require('../utils/validators');

// Public routes
router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);

// Google OAuth
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/api/auth/google/failure',
    session: false,
  }),
  googleAuthCallback
);

router.get('/google/failure', (req, res) => {
  const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0].trim();
  res.redirect(`${clientUrl}/auth/google/callback?error=auth_failed`);
});

// Protected routes
router.get('/me', auth, getMe);
router.put('/profile', auth, updateProfile);

// Email verification
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', auth, resendVerification);

// Password reset
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Change password
router.put('/change-password', auth, changePassword);

// Wishlist
router.post('/wishlist/toggle', auth, toggleWishlist);
router.get('/wishlist', auth, getWishlist);

module.exports = router;
