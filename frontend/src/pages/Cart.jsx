import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingBag, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import AnimatedPage from '../components/common/AnimatedPage';
import CartItem from '../components/cart/CartItem';
import useCart from '../hooks/useCart';
import { formatPrice } from '../utils/helpers';
import { getEstimatedShipping, INDIA_POST_FREE_THRESHOLD } from '../utils/shippingConfig';

const Cart = () => {
  const { cartItems, cartTotal, cartCount, clearCart } = useCart();

  const shipping = getEstimatedShipping(cartTotal);
  const total = cartTotal + shipping;

  return (
    <AnimatedPage>
      <div className="min-h-screen" style={{ background: '#FAF7F2' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#C75B39]
                transition-colors mb-4"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              <FiArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
            <h1
              className="text-3xl sm:text-4xl font-bold"
              style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C' }}
            >
              Shopping Cart
            </h1>
            {cartCount > 0 && (
              <p
                className="text-gray-400 mt-1"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {cartCount} item{cartCount !== 1 ? 's' : ''} in your cart
              </p>
            )}
          </motion.div>

          {cartItems.length === 0 ? (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center py-20"
            >
              <div
                className="w-28 h-28 rounded-full mx-auto mb-6 flex items-center justify-center"
                style={{ background: 'rgba(199,91,57,0.06)' }}
              >
                <FiShoppingBag className="w-12 h-12 text-[#C75B39] opacity-40" />
              </div>

              {/* Decorative illustration */}
              <svg
                width="200"
                height="60"
                viewBox="0 0 200 60"
                fill="none"
                className="mx-auto mb-6 opacity-20"
              >
                <path
                  d="M10 30C10 30 40 5 70 25C100 45 120 10 150 30C180 50 190 20 190 20"
                  stroke="#C75B39"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>

              <h2
                className="text-2xl font-bold mb-3"
                style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C' }}
              >
                Your cart is empty
              </h2>
              <p
                className="text-gray-400 mb-8 max-w-md mx-auto"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                It looks like you have not added any art pieces yet. Explore our
                gallery and find something that speaks to you.
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold
                  text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                style={{
                  background: '#C75B39',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Start Shopping
                <FiArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ) : (
            /* Cart Content */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Items Column */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="lg:col-span-2"
              >
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
                  {/* Items header */}
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-2">
                    <p
                      className="text-sm font-semibold text-gray-400 uppercase tracking-wide"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      Items
                    </p>
                    <button
                      type="button"
                      onClick={clearCart}
                      className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      Clear all
                    </button>
                  </div>

                  <AnimatePresence mode="popLayout">
                    {cartItems.map((item) => (
                      <CartItem key={item._id} item={item} />
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Summary Column */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 lg:sticky lg:top-24">
                  <h3
                    className="text-lg font-bold mb-5"
                    style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C' }}
                  >
                    Order Summary
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p
                        className="text-sm text-gray-500"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        Subtotal
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
                        Estimated Shipping
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

                    {shipping === 0 && (
                      <p
                        className="text-xs text-green-600"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        Free shipping on orders above {formatPrice(INDIA_POST_FREE_THRESHOLD)}
                      </p>
                    )}
                    <p
                      className="text-xs text-gray-400 mt-1"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      Final shipping based on courier choice at checkout
                    </p>
                  </div>

                  <div className="border-t border-gray-100 mt-4 pt-4">
                    <div className="flex items-center justify-between">
                      <p
                        className="font-semibold text-[#2C2C2C]"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        Total
                      </p>
                      <motion.p
                        key={total}
                        initial={{ scale: 1.05 }}
                        animate={{ scale: 1 }}
                        className="text-xl font-bold"
                        style={{ fontFamily: "'DM Sans', sans-serif", color: '#C75B39' }}
                      >
                        {formatPrice(total)}
                      </motion.p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <Link
                      to="/checkout"
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl
                        text-sm font-semibold text-white transition-all duration-200
                        hover:shadow-lg hover:shadow-[#C75B39]/20 hover:-translate-y-0.5"
                      style={{
                        background: '#C75B39',
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      Proceed to Checkout
                      <FiArrowRight className="w-4 h-4" />
                    </Link>

                    <Link
                      to="/shop"
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl
                        text-sm font-medium text-gray-500 hover:text-[#2C2C2C] hover:bg-gray-50
                        transition-colors duration-200"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      <FiArrowLeft className="w-4 h-4" />
                      Continue Shopping
                    </Link>
                  </div>

                  {/* Trust badges */}
                  <div className="mt-6 pt-5 border-t border-gray-100">
                    <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0110 0v4" />
                        </svg>
                        <span style={{ fontFamily: "'DM Sans', sans-serif" }}>Secure</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        <span style={{ fontFamily: "'DM Sans', sans-serif" }}>Protected</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                        </svg>
                        <span style={{ fontFamily: "'DM Sans', sans-serif" }}>Handcrafted</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
};

export default Cart;
