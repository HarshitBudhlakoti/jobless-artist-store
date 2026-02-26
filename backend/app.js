const dotenv = require('dotenv');
// Load env vars before other imports that depend on them
dotenv.config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const passport = require('./config/passport');
const errorHandler = require('./middleware/errorHandler');

// Connect to database
connectDB();

const app = express();

// Security middleware
app.use(helmet());

// Logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parser
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Sanitize MongoDB queries (prevent NoSQL injection)
app.use(mongoSanitize());

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', apiLimiter);

// Stricter rate limit for auth endpoints (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts, please try again later.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

// Initialize passport
app.use(passport.initialize());

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Jobless Artist API is running',
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/custom-orders', require('./routes/customOrderRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/shipping', require('./routes/shippingRoutes'));
app.use('/api/site-settings', require('./routes/siteSettingsRoutes'));
app.use('/api/page-content', require('./routes/pageContentRoutes'));
app.use('/api/testimonials', require('./routes/testimonialRoutes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
