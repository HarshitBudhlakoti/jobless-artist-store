import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheck, FiX, FiRefreshCw } from 'react-icons/fi';
import AnimatedPage from '../components/common/AnimatedPage';
import useCart from '../hooks/useCart';
import api from '../api/axios';

const PaymentVerify = () => {
  const [searchParams] = useSearchParams();
  const cfOrderId = searchParams.get('order_id');

  const { clearCart } = useCart();

  const [status, setStatus] = useState('loading'); // loading | success | pending | failed
  const [order, setOrder] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const pollingRef = useRef(null);
  const cartClearedRef = useRef(false);

  useEffect(() => {
    if (!cfOrderId) {
      setStatus('failed');
      setErrorMessage('No order ID found. Please contact support.');
      return;
    }

    let attempts = 0;
    const maxAttempts = 10;

    const verify = async () => {
      try {
        const { data } = await api.post('/payments/verify', { cfOrderId });

        if (data.data?.paymentStatus === 'pending') {
          attempts++;
          if (attempts >= maxAttempts) {
            setStatus('pending');
            clearPolling();
            return;
          }
          setStatus('loading');
          return; // keep polling
        }

        // Payment verified — data.data is the populated order
        if (data.success && data.data?._id) {
          setOrder(data.data);
          setStatus('success');
          if (!cartClearedRef.current) {
            clearCart();
            cartClearedRef.current = true;
          }
          clearPolling();
        }
      } catch (err) {
        const msg = err.data?.message || err.message || 'Verification failed';
        if (err.data?.paymentStatus === 'failed' || err.status === 400) {
          setStatus('failed');
          setErrorMessage(msg);
          clearPolling();
        } else {
          // Network error or transient failure — retry
          attempts++;
          if (attempts >= maxAttempts) {
            setStatus('failed');
            setErrorMessage(msg);
            clearPolling();
          }
        }
      }
    };

    const clearPolling = () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };

    // Initial call
    verify();
    // Poll every 3s for pending status
    pollingRef.current = setInterval(verify, 3000);

    return () => clearPolling();
  }, [cfOrderId, clearCart]);

  // Loading state
  if (status === 'loading') {
    return (
      <AnimatedPage>
        <div
          className="min-h-screen flex items-center justify-center px-4"
          style={{ background: '#FAF7F2' }}
        >
          <div className="text-center">
            <svg
              className="animate-spin w-12 h-12 mx-auto mb-6 text-[#C75B39]"
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
            <h2
              className="text-xl font-bold mb-2"
              style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C' }}
            >
              Verifying Payment
            </h2>
            <p
              className="text-sm text-gray-400"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Please wait while we confirm your payment...
            </p>
          </div>
        </div>
      </AnimatedPage>
    );
  }

  // Pending state
  if (status === 'pending') {
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
            <div
              className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{ background: 'rgba(234,179,8,0.1)' }}
            >
              <FiRefreshCw className="w-12 h-12 text-yellow-500" />
            </div>
            <h1
              className="text-3xl font-bold mb-3"
              style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C' }}
            >
              Payment Processing
            </h1>
            <p
              className="text-gray-500 mb-8"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Your payment is still being processed. This usually takes a few moments.
              You&apos;ll receive an email confirmation once it&apos;s complete.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold
                  text-white transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                style={{ background: '#C75B39', fontFamily: "'DM Sans', sans-serif" }}
              >
                <FiRefreshCw className="w-4 h-4" />
                Check Again
              </button>
              <Link
                to="/shop"
                className="inline-flex items-center px-6 py-3 rounded-xl text-sm font-semibold
                  border-2 border-gray-200 text-[#2C2C2C] hover:border-gray-300
                  hover:bg-gray-50 transition-all duration-200"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Continue Shopping
              </Link>
            </div>
          </motion.div>
        </div>
      </AnimatedPage>
    );
  }

  // Failed state
  if (status === 'failed') {
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
              transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
              className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{ background: 'rgba(239,68,68,0.1)' }}
            >
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <FiX className="w-12 h-12 text-red-500" strokeWidth={3} />
              </motion.div>
            </motion.div>
            <h1
              className="text-3xl font-bold mb-3"
              style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C' }}
            >
              Payment Failed
            </h1>
            <p
              className="text-gray-500 mb-2"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {errorMessage || 'Your payment could not be completed.'}
            </p>
            <p
              className="text-sm text-gray-400 mb-8"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              No money has been deducted. Please try again or contact support if the issue persists.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/checkout"
                className="inline-flex items-center px-6 py-3 rounded-xl text-sm font-semibold
                  text-white transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                style={{ background: '#C75B39', fontFamily: "'DM Sans', sans-serif" }}
              >
                Try Again
              </Link>
              <Link
                to="/shop"
                className="inline-flex items-center px-6 py-3 rounded-xl text-sm font-semibold
                  border-2 border-gray-200 text-[#2C2C2C] hover:border-gray-300
                  hover:bg-gray-50 transition-all duration-200"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Continue Shopping
              </Link>
            </div>
          </motion.div>
        </div>
      </AnimatedPage>
    );
  }

  // Success state
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
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
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
            style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C' }}
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
            Thank you for your purchase. Your order has been placed successfully.
          </motion.p>

          {order?.orderNumber && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="text-sm text-gray-400 mb-8"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Order Number:{' '}
              <span className="font-semibold text-[#2C2C2C]">{order.orderNumber}</span>
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            {order?._id && (
              <Link
                to={`/orders/${order._id}`}
                className="inline-flex items-center px-6 py-3 rounded-xl text-sm font-semibold
                  text-white transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                style={{ background: '#C75B39', fontFamily: "'DM Sans', sans-serif" }}
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
};

export default PaymentVerify;
