import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import useCart from '../../hooks/useCart';
import { formatPrice } from '../../utils/helpers';

const CartItem = ({ item, compact = false }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const effectivePrice =
    item.discountPrice != null && item.discountPrice < item.price
      ? item.discountPrice
      : item.price || 0;
  const lineTotal = effectivePrice * (item.quantity || 1);

  const handleRemove = () => {
    if (confirmDelete) {
      removeFromCart(item._id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      updateQuantity(item._id, item.quantity - 1);
    }
  };

  const handleIncrement = () => {
    updateQuantity(item._id, item.quantity + 1);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`flex gap-4 ${compact ? 'py-3' : 'py-4'} border-b border-gray-100 last:border-b-0`}
    >
      {/* Image */}
      <Link
        to={`/product/${item._id}`}
        className={`flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 ${
          compact ? 'w-16 h-16' : 'w-20 h-20 sm:w-24 sm:h-24'
        }`}
      >
        {item.image || item.images?.[0]?.url ? (
          <img
            src={item.image || item.images[0].url}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100">
            <span className="text-2xl opacity-40">🎨</span>
          </div>
        )}
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <Link
            to={`/product/${item._id}`}
            className="block"
          >
            <h3
              className={`font-semibold text-[#2C2C2C] truncate hover:text-[#C75B39] transition-colors ${
                compact ? 'text-sm' : 'text-sm sm:text-base'
              }`}
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {item.title}
            </h3>
          </Link>
          <p
            className="text-sm text-gray-400 mt-0.5"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {formatPrice(effectivePrice)} each
          </p>
        </div>

        <div className="flex items-center justify-between mt-2">
          {/* Quantity Controls */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleDecrement}
              disabled={item.quantity <= 1}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors
                ${
                  item.quantity <= 1
                    ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                    : 'bg-gray-100 text-[#2C2C2C] hover:bg-gray-200'
                }`}
            >
              <FiMinus className="w-3 h-3" />
            </button>

            <span
              className="w-8 text-center text-sm font-semibold text-[#2C2C2C]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {item.quantity}
            </span>

            <button
              type="button"
              onClick={handleIncrement}
              className="w-7 h-7 rounded-lg bg-gray-100 text-[#2C2C2C] flex items-center justify-center
                hover:bg-gray-200 transition-colors"
            >
              <FiPlus className="w-3 h-3" />
            </button>
          </div>

          {/* Line Total */}
          <p
            className={`font-semibold ${compact ? 'text-sm' : 'text-sm sm:text-base'}`}
            style={{ fontFamily: "'DM Sans', sans-serif", color: '#2C2C2C' }}
          >
            {formatPrice(lineTotal)}
          </p>
        </div>
      </div>

      {/* Remove Button */}
      <div className="flex-shrink-0 flex items-start">
        <button
          type="button"
          onClick={handleRemove}
          className={`p-1.5 rounded-lg transition-colors duration-200 ${
            confirmDelete
              ? 'bg-red-50 text-red-500 hover:bg-red-100'
              : 'text-gray-300 hover:text-red-500 hover:bg-red-50'
          }`}
          title={confirmDelete ? 'Click again to confirm' : 'Remove item'}
        >
          <FiTrash2 className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
        </button>
      </div>
    </motion.div>
  );
};

export default CartItem;
