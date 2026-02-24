import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiShoppingCart, FiEye } from 'react-icons/fi';
import useCart from '../../hooks/useCart';
import { formatPrice, placeholderGradient, truncateText } from '../../utils/helpers';

const ProductCard = ({ product, onQuickView }) => {
  const {
    _id,
    title = 'Untitled Artwork',
    price = 0,
    discountPrice,
    images = [],
    medium = '',
    stock = 1,
    isFeatured = false,
  } = product || {};

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart, isInCart } = useCart();
  const navigate = useNavigate();

  const gradient = placeholderGradient(title + _id);
  const isSoldOut = stock === 0;
  const alreadyInCart = isInCart(_id);
  const hasDiscount = discountPrice != null && discountPrice < price;

  const handleAddToCart = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (isSoldOut || alreadyInCart) return;
      addToCart(product, 1);
    },
    [product, isSoldOut, alreadyInCart, addToCart]
  );

  const handleWishlistToggle = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsWishlisted((prev) => !prev);
    },
    []
  );

  const handleQuickView = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (onQuickView) {
        onQuickView(product);
      } else {
        navigate(`/product/${_id}`);
      }
    },
    [onQuickView, product, _id, navigate]
  );

  const renderImage = () => {
    if (images.length > 0 && images[0]?.url) {
      return (
        <img
          src={images[0].url}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 ease-out"
          style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
          loading="lazy"
        />
      );
    }
    return (
      <div
        className="w-full h-full flex items-center justify-center transition-transform duration-500 ease-out"
        style={{ background: gradient, transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
      >
        <div className="text-center opacity-30">
          <svg className="w-12 h-12 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {truncateText(title, 20)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
    >
      <Link
        to={`/product/${_id}`}
        className="block group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className="bg-white rounded-2xl overflow-hidden transition-shadow duration-300"
          style={{
            boxShadow: isHovered
              ? '0 12px 40px rgba(44,44,44,0.12)'
              : '0 2px 12px rgba(44,44,44,0.06)',
          }}
        >
          {/* Image container */}
          <div className="relative aspect-[3/4] overflow-hidden bg-[#FAF7F2]">
            {renderImage()}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
              {isFeatured && (
                <span
                  className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium text-white"
                  style={{
                    backgroundColor: '#D4A857',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Featured
                </span>
              )}
              {isSoldOut && (
                <span
                  className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium text-white bg-[#2C2C2C]/80"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Sold Out
                </span>
              )}
              {hasDiscount && !isSoldOut && (
                <span
                  className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium text-white"
                  style={{
                    backgroundColor: '#C75B39',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {Math.round(((price - discountPrice) / price) * 100)}% Off
                </span>
              )}
            </div>

            {/* Wishlist button */}
            <button
              onClick={handleWishlistToggle}
              className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-all duration-200 ${
                isWishlisted
                  ? 'bg-[#C75B39] text-white'
                  : 'bg-white/80 backdrop-blur-sm text-[#2C2C2C] hover:bg-white'
              }`}
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <FiHeart
                className="w-4 h-4"
                fill={isWishlisted ? 'currentColor' : 'none'}
              />
            </button>

            {/* Hover overlay with actions */}
            <div
              className={`absolute inset-0 bg-[#2C2C2C]/30 flex items-center justify-center gap-3 transition-opacity duration-300 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <motion.button
                initial={false}
                animate={isHovered ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2, delay: 0.05 }}
                onClick={handleQuickView}
                className="p-3 rounded-full bg-white text-[#2C2C2C] hover:bg-[#FAF7F2] transition-colors"
                style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                aria-label="Quick view"
              >
                <FiEye className="w-5 h-5" />
              </motion.button>
              <motion.button
                initial={false}
                animate={isHovered ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                onClick={handleAddToCart}
                disabled={isSoldOut}
                className={`p-3 rounded-full text-white transition-colors ${
                  isSoldOut
                    ? 'bg-gray-400 cursor-not-allowed'
                    : alreadyInCart
                    ? 'bg-green-600'
                    : 'bg-[#C75B39] hover:bg-[#b04e30]'
                }`}
                style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                aria-label={alreadyInCart ? 'In cart' : 'Add to cart'}
              >
                <FiShoppingCart className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Card body */}
          <div className="p-4">
            {/* Medium tag */}
            {medium && (
              <span
                className="inline-block text-xs text-[#C75B39] font-medium mb-1.5 tracking-wide uppercase"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {medium}
              </span>
            )}

            {/* Title */}
            <h3
              className="text-[#2C2C2C] font-semibold text-base mb-2 line-clamp-2 leading-snug"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {title}
            </h3>

            {/* Price */}
            <div className="flex items-center gap-2">
              <span
                className="text-[#2C2C2C] font-bold text-lg"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {formatPrice(hasDiscount ? discountPrice : price)}
              </span>
              {hasDiscount && (
                <span
                  className="text-[#2C2C2C]/40 text-sm line-through"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {formatPrice(price)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

/* Skeleton loader for ProductCard */
export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(44,44,44,0.06)' }}>
    <div className="aspect-[3/4] bg-[#FAF7F2] animate-pulse" />
    <div className="p-4 space-y-3">
      <div className="h-3 w-16 bg-[#FAF7F2] rounded animate-pulse" />
      <div className="h-5 w-3/4 bg-[#FAF7F2] rounded animate-pulse" />
      <div className="h-5 w-24 bg-[#FAF7F2] rounded animate-pulse" />
    </div>
  </div>
);

export default ProductCard;
