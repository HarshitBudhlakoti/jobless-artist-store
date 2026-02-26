import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiLock, FiArrowLeft, FiCreditCard, FiShield, FiTruck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AnimatedPage from '../components/common/AnimatedPage';
import useCart from '../hooks/useCart';
import useAuth from '../hooks/useAuth';
import api from '../api/axios';
import { formatPrice } from '../utils/helpers';
import { getEstimatedShipping, INDIA_POST_FREE_THRESHOLD } from '../utils/shippingConfig';

const inputClasses =
  'w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-[#2C2C2C] ' +
  'focus:outline-none focus:border-[#C75B39] focus:ring-1 focus:ring-[#C75B39]/30 ' +
  'transition-colors placeholder:text-gray-300';

const labelClasses = 'block text-sm font-medium text-[#2C2C2C] mb-1.5';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, cartCount, clearCart } = useCart();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'India',
  });

  const [errors, setErrors] = useState({});
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [orderId, setOrderId] = useState('');
  const [submitError, setSubmitError] = useState('');

  // Shipping state
  const [shippingMethod, setShippingMethod] = useState('india-post');
  const [shippingRates, setShippingRates] = useState(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const debounceRef = useRef(null);

  // Pre-fill form from user data
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        fullName: user.name || prev.fullName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login?redirect=/checkout');
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Redirect if cart is empty and not in success state
  useEffect(() => {
    if (!success && cartItems.length === 0 && !authLoading) {
      navigate('/cart');
    }
  }, [cartItems, success, authLoading, navigate]);

  // Fetch shipping rates when pincode changes
  const fetchShippingRates = useCallback(
    async (pin) => {
      if (!/^\d{6}$/.test(pin)) {
        setShippingRates(null);
        return;
      }
      setShippingLoading(true);
      try {
        const { data } = await api.post('/shipping/calculate', {
          destinationPin: pin,
          cartSubtotal: cartTotal,
        });
        setShippingRates(data.data);
      } catch {
        setShippingRates(null);
      } finally {
        setShippingLoading(false);
      }
    },
    [cartTotal]
  );

  // Debounced pincode watcher
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (/^\d{6}$/.test(form.zip)) {
        fetchShippingRates(form.zip);
      }
    }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [form.zip, fetchShippingRates]);

  // Compute shipping cost from selected method
  const selectedRate = shippingRates?.[shippingMethod];
  const shipping =
    selectedRate?.available && selectedRate?.cost != null
      ? selectedRate.cost
      : getEstimatedShipping(cartTotal);
  const total = cartTotal + shipping;

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!form.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!form.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[+]?[\d\s-]{8,15}$/.test(form.phone.trim())) {
      newErrors.phone = 'Enter a valid phone number';
    }
    if (!form.street.trim()) newErrors.street = 'Street address is required';
    if (!form.city.trim()) newErrors.city = 'City is required';
    if (!form.state.trim()) newErrors.state = 'State is required';
    if (!form.zip.trim()) {
      newErrors.zip = 'ZIP/Postal code is required';
    } else if (!/^[\d]{4,10}$/.test(form.zip.trim())) {
      newErrors.zip = 'Enter a valid ZIP code';
    }
    if (!form.country.trim()) newErrors.country = 'Country is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validate()) return;

    setPaying(true);
    setSubmitError('');

    try {
      // Simulate payment processing (2 second delay)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create order
      const orderPayload = {
        items: cartItems.map((item) => ({
          product: item._id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.image || item.images?.[0]?.url,
        })),
        shippingAddress: {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          street: form.street,
          city: form.city,
          state: form.state,
          zip: form.zip,
          country: form.country,
        },
        shippingMethod,
        shippingCost: shipping,
        subtotal: cartTotal,
        shipping,
        total,
        paymentMethod: 'online',
        paymentStatus: 'paid',
      };

      const { data } = await api.post('/orders', orderPayload);

      const newOrderId = data.order?._id || data._id || data.orderId || '';
      const newOrderNumber =
        data.order?.orderNumber || data.orderNumber || `ORD-${Date.now()}`;

      setOrderId(newOrderId);
      setOrderNumber(newOrderNumber);
      setSuccess(true);
      clearCart();
      toast.success('Order placed successfully!');
    } catch (err) {
      setSubmitError(
        err.response?.data?.message || err.message || 'Payment failed. Please try again.'
      );
      toast.error('Payment failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  // Auth loading state
  if (authLoading) {
    return (
      <AnimatedPage>
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: '#FAF7F2' }}
        >
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-200" />
            <div className="w-40 h-4 rounded-lg bg-gray-200" />
          </div>
        </div>
      </AnimatedPage>
    );
  }

  // Success state
  if (success) {
    return (
      <AnimatedPage>
        <div
          className="min-h-screen flex items-center justify-center px-4"
          style={{ background: '#FAF7F2' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-md w-full"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.2,
                type: 'spring',
                stiffness: 200,
                damping: 15,
              }}
              className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{ background: 'rgba(34,197,94,0.1)' }}
            >
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <FiCheck className="w-12 h-12 text-green-500" strokeWidth={3} />
              </motion.div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-bold mb-3"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: '#2C2C2C',
              }}
            >
              Order Confirmed!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-gray-500 mb-2"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Thank you for your purchase. Your order has been placed
              successfully.
            </motion.p>

            {orderNumber && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="text-sm text-gray-400 mb-8"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Order Number:{' '}
                <span className="font-semibold text-[#2C2C2C]">
                  {orderNumber}
                </span>
              </motion.p>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              {orderId && (
                <Link
                  to={`/orders/${orderId}`}
                  className="inline-flex items-center px-6 py-3 rounded-xl text-sm font-semibold
                    text-white transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                  style={{
                    background: '#C75B39',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  View Order
                </Link>
              )}
              <Link
                to="/shop"
                className="inline-flex items-center px-6 py-3 rounded-xl text-sm font-semibold
                  border-2 border-gray-200 text-[#2C2C2C] hover:border-gray-300
                  hover:bg-gray-50 transition-all duration-200"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Continue Shopping
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <div className="min-h-screen" style={{ background: '#FAF7F2' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <Link
              to="/cart"
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#C75B39]
                transition-colors mb-4"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              <FiArrowLeft className="w-4 h-4" />
              Back to Cart
            </Link>
            <h1
              className="text-3xl sm:text-4xl font-bold"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: '#2C2C2C',
              }}
            >
              Checkout
            </h1>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Shipping Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-3"
            >
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
                <h2
                  className="text-xl font-bold mb-6"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: '#2C2C2C',
                  }}
                >
                  Shipping Information
                </h2>

                <div className="space-y-5">
                  {/* Full Name */}
                  <div>
                    <label
                      className={labelClasses}
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={handleChange('fullName')}
                      placeholder="John Doe"
                      className={`${inputClasses} ${
                        errors.fullName ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : ''
                      }`}
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    />
                    {errors.fullName && (
                      <p className="text-xs text-red-500 mt-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        className={labelClasses}
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={handleChange('email')}
                        placeholder="you@example.com"
                        className={`${inputClasses} ${
                          errors.email ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : ''
                        }`}
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      />
                      {errors.email && (
                        <p className="text-xs text-red-500 mt-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                          {errors.email}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        className={labelClasses}
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={handleChange('phone')}
                        placeholder="+91 98765 43210"
                        className={`${inputClasses} ${
                          errors.phone ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : ''
                        }`}
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      />
                      {errors.phone && (
                        <p className="text-xs text-red-500 mt-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-100 pt-2" />

                  {/* Street */}
                  <div>
                    <label
                      className={labelClasses}
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={form.street}
                      onChange={handleChange('street')}
                      placeholder="123 Main Street, Apt 4B"
                      className={`${inputClasses} ${
                        errors.street ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : ''
                      }`}
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    />
                    {errors.street && (
                      <p className="text-xs text-red-500 mt-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        {errors.street}
                      </p>
                    )}
                  </div>

                  {/* City & State */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        className={labelClasses}
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        City
                      </label>
                      <input
                        type="text"
                        value={form.city}
                        onChange={handleChange('city')}
                        placeholder="Mumbai"
                        className={`${inputClasses} ${
                          errors.city ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : ''
                        }`}
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      />
                      {errors.city && (
                        <p className="text-xs text-red-500 mt-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                          {errors.city}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        className={labelClasses}
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        State
                      </label>
                      <input
                        type="text"
                        value={form.state}
                        onChange={handleChange('state')}
                        placeholder="Maharashtra"
                        className={`${inputClasses} ${
                          errors.state ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : ''
                        }`}
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      />
                      {errors.state && (
                        <p className="text-xs text-red-500 mt-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                          {errors.state}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* ZIP & Country */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        className={labelClasses}
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        ZIP / Postal Code
                      </label>
                      <input
                        type="text"
                        value={form.zip}
                        onChange={handleChange('zip')}
                        placeholder="400001"
                        className={`${inputClasses} ${
                          errors.zip ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : ''
                        }`}
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      />
                      {errors.zip && (
                        <p className="text-xs text-red-500 mt-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                          {errors.zip}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        className={labelClasses}
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        Country
                      </label>
                      <input
                        type="text"
                        value={form.country}
                        onChange={handleChange('country')}
                        placeholder="India"
                        className={`${inputClasses} ${
                          errors.country ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : ''
                        }`}
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      />
                      {errors.country && (
                        <p className="text-xs text-red-500 mt-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                          {errors.country}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Shipping Method Selector */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h2
                    className="text-xl font-bold mb-4"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      color: '#2C2C2C',
                    }}
                  >
                    <FiTruck className="inline-block w-5 h-5 mr-2 -mt-0.5" style={{ color: '#C75B39' }} />
                    Shipping Method
                  </h2>

                  {shippingLoading ? (
                    <div className="flex items-center gap-2 py-4">
                      <svg className="animate-spin w-4 h-4 text-[#C75B39]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span className="text-sm text-gray-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        Fetching shipping rates...
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* India Post */}
                      <label
                        className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                          shippingMethod === 'india-post'
                            ? 'border-[#C75B39] bg-[#C75B39]/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="shippingMethod"
                          value="india-post"
                          checked={shippingMethod === 'india-post'}
                          onChange={() => setShippingMethod('india-post')}
                          className="accent-[#C75B39]"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-[#2C2C2C]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                            India Post
                          </p>
                          <p className="text-xs text-gray-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                            {shippingRates?.['india-post']?.estimatedDays || '5-7 business days'}
                          </p>
                        </div>
                        <p className="text-sm font-semibold" style={{ fontFamily: "'DM Sans', sans-serif", color: (shippingRates?.['india-post']?.cost ?? getEstimatedShipping(cartTotal)) === 0 ? '#16a34a' : '#2C2C2C' }}>
                          {(shippingRates?.['india-post']?.cost ?? getEstimatedShipping(cartTotal)) === 0
                            ? 'Free'
                            : formatPrice(shippingRates?.['india-post']?.cost ?? getEstimatedShipping(cartTotal))}
                        </p>
                      </label>

                      {/* Delhivery */}
                      {(() => {
                        const delhiveryRate = shippingRates?.delhivery;
                        const isAvailable = delhiveryRate?.available && !delhiveryRate?.comingSoon;
                        return (
                          <label
                            className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                              !isAvailable
                                ? 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                                : shippingMethod === 'delhivery'
                                ? 'border-[#C75B39] bg-[#C75B39]/5 cursor-pointer'
                                : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                            }`}
                          >
                            <input
                              type="radio"
                              name="shippingMethod"
                              value="delhivery"
                              checked={shippingMethod === 'delhivery'}
                              onChange={() => isAvailable && setShippingMethod('delhivery')}
                              disabled={!isAvailable}
                              className="accent-[#C75B39]"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-[#2C2C2C]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                                Delhivery
                              </p>
                              <p className="text-xs text-gray-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                                {isAvailable
                                  ? delhiveryRate.estimatedDays || '2-4 business days'
                                  : '2-4 business days'}
                              </p>
                            </div>
                            <p className="text-sm font-semibold" style={{ fontFamily: "'DM Sans', sans-serif", color: isAvailable ? '#2C2C2C' : '#9CA3AF' }}>
                              {isAvailable
                                ? delhiveryRate.cost === 0
                                  ? 'Free'
                                  : formatPrice(delhiveryRate.cost)
                                : 'Coming Soon'}
                            </p>
                          </label>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Payment Section */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h2
                    className="text-xl font-bold mb-4"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      color: '#2C2C2C',
                    }}
                  >
                    Payment
                  </h2>

                  <div className="rounded-xl border border-gray-200 p-5 mb-5">
                    <div className="flex items-center gap-3 mb-3">
                      <FiCreditCard className="w-5 h-5 text-[#C75B39]" />
                      <p
                        className="font-semibold text-sm text-[#2C2C2C]"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        Secure Payment Gateway
                      </p>
                    </div>
                    <p
                      className="text-xs text-gray-400 leading-relaxed"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      You will be securely redirected to our payment partner to
                      complete the transaction. We accept all major credit/debit
                      cards, UPI, and net banking.
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      {['Visa', 'MC', 'UPI', 'Net Banking'].map((method) => (
                        <span
                          key={method}
                          className="text-[10px] px-2 py-1 rounded-md bg-gray-100 text-gray-500 font-medium"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          {method}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Error */}
                  <AnimatePresence>
                    {submitError && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100"
                      >
                        <p
                          className="text-sm text-red-600"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          {submitError}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Pay Button */}
                  <button
                    type="button"
                    onClick={handlePayment}
                    disabled={paying}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl
                      text-base font-semibold text-white transition-all duration-200
                      hover:shadow-lg hover:shadow-[#C75B39]/20 hover:-translate-y-0.5
                      disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0
                      disabled:hover:shadow-none"
                    style={{
                      background: '#C75B39',
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {paying ? (
                      <>
                        <svg
                          className="animate-spin w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <FiLock className="w-4 h-4" />
                        Pay Now - {formatPrice(total)}
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 mt-3">
                    <FiShield className="w-3.5 h-3.5 text-gray-400" />
                    <p
                      className="text-xs text-gray-400"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      Your payment information is encrypted and secure.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Order Summary Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:sticky lg:top-24">
                <h2
                  className="text-xl font-bold mb-5"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: '#2C2C2C',
                  }}
                >
                  Order Summary
                </h2>

                {/* Items list */}
                <div className="space-y-4 mb-5 max-h-72 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item._id} className="flex gap-3">
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {item.image || item.images?.[0]?.url ? (
                          <img
                            src={item.image || item.images[0].url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100">
                            <span className="text-lg opacity-40">🎨</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium text-[#2C2C2C] truncate"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          {item.title}
                        </p>
                        <p
                          className="text-xs text-gray-400"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p
                        className="text-sm font-semibold text-[#2C2C2C] flex-shrink-0"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p
                      className="text-sm text-gray-500"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      Subtotal ({cartCount} item{cartCount !== 1 ? 's' : ''})
                    </p>
                    <p
                      className="text-sm font-semibold text-[#2C2C2C]"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {formatPrice(cartTotal)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <p
                      className="text-sm text-gray-500"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      Shipping
                    </p>
                    <p
                      className="text-sm font-semibold"
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        color: shipping === 0 ? '#16a34a' : '#2C2C2C',
                      }}
                    >
                      {shipping === 0 ? 'Free' : formatPrice(shipping)}
                    </p>
                  </div>

                  <div className="border-t border-gray-100 pt-3">
                    <div className="flex items-center justify-between">
                      <p
                        className="font-semibold text-[#2C2C2C]"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        Total
                      </p>
                      <p
                        className="text-xl font-bold"
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          color: '#C75B39',
                        }}
                      >
                        {formatPrice(total)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Free shipping nudge */}
                {shipping > 0 && (
                  <div
                    className="mt-4 p-3 rounded-xl"
                    style={{ background: 'rgba(212,168,87,0.08)' }}
                  >
                    <p
                      className="text-xs text-gray-500"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      Add {formatPrice(INDIA_POST_FREE_THRESHOLD - cartTotal)} more for free shipping (India Post)!
                    </p>
                    <div className="mt-2 w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: '#D4A857' }}
                        initial={{ width: '0%' }}
                        animate={{
                          width: `${Math.min((cartTotal / INDIA_POST_FREE_THRESHOLD) * 100, 100)}%`,
                        }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                  </div>
                )}

                {/* Secure checkout badge */}
                <div className="mt-5 pt-4 border-t border-gray-100">
                  <p
                    className="text-center text-xs text-gray-400"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    Secure checkout powered by Razorpay
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default Checkout;
