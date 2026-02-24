import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiShoppingBag } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import useCart from '../../hooks/useCart';
import { formatPrice } from '../../utils/helpers';
import CartItem from './CartItem';

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const drawerVariants = {
  hidden: { x: '100%' },
  visible: {
    x: 0,
    transition: { type: 'spring', damping: 30, stiffness: 300 },
  },
  exit: {
    x: '100%',
    transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
  },
};

const CartDrawer = ({ isOpen, onClose }) => {
  const { cartItems, cartTotal, cartCount } = useCart();

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-50
              flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <FiShoppingBag className="w-5 h-5 text-[#2C2C2C]" />
                <h2
                  className="text-lg font-bold text-[#2C2C2C]"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Your Cart
                </h2>
                {cartCount > 0 && (
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                    style={{ background: '#C75B39', fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {cartCount}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400
                  hover:text-[#2C2C2C] hover:bg-gray-100 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
                    style={{ background: 'rgba(199,91,57,0.06)' }}
                  >
                    <FiShoppingBag className="w-8 h-8 text-[#C75B39] opacity-50" />
                  </div>
                  <h3
                    className="text-lg font-semibold text-[#2C2C2C] mb-2"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Your cart is empty
                  </h3>
                  <p
                    className="text-sm text-gray-400 mb-6 max-w-[240px]"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    Discover handcrafted art pieces and add them to your cart.
                  </p>
                  <Link
                    to="/shop"
                    onClick={onClose}
                    className="inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold
                      text-white transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                    style={{
                      background: '#C75B39',
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {cartItems.map((item) => (
                    <CartItem key={item._id} item={item} compact />
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="border-t border-gray-100 px-6 py-5 space-y-4">
                {/* Total */}
                <div className="flex items-center justify-between">
                  <p
                    className="text-sm text-gray-500"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    Subtotal
                  </p>
                  <motion.p
                    key={cartTotal}
                    initial={{ scale: 1.1, color: '#C75B39' }}
                    animate={{ scale: 1, color: '#2C2C2C' }}
                    className="text-lg font-bold"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {formatPrice(cartTotal)}
                  </motion.p>
                </div>

                <p
                  className="text-xs text-gray-400"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Shipping and taxes calculated at checkout.
                </p>

                {/* Buttons */}
                <div className="flex flex-col gap-2">
                  <Link
                    to="/checkout"
                    onClick={onClose}
                    className="w-full inline-flex items-center justify-center px-5 py-3 rounded-xl
                      text-sm font-semibold text-white transition-all duration-200
                      hover:shadow-lg hover:-translate-y-0.5"
                    style={{
                      background: '#C75B39',
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    Checkout
                  </Link>
                  <Link
                    to="/cart"
                    onClick={onClose}
                    className="w-full inline-flex items-center justify-center px-5 py-3 rounded-xl
                      text-sm font-semibold border-2 border-gray-200 text-[#2C2C2C]
                      hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    View Cart
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
