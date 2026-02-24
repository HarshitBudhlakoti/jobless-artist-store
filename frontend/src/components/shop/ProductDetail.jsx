import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiShoppingCart, FiStar, FiChevronDown, FiMinus, FiPlus } from 'react-icons/fi';
import useCart from '../../hooks/useCart';
import { formatPrice } from '../../utils/helpers';
import ImageZoom from './ImageZoom';

/* Star rating display */
const StarRating = ({ rating = 0, size = 'sm', interactive = false, onRate }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const displayRating = interactive ? hoverRating || rating : rating;

  const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6';

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={interactive ? 'button' : undefined}
          onClick={interactive ? () => onRate?.(star) : undefined}
          onMouseEnter={interactive ? () => setHoverRating(star) : undefined}
          onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
          className={interactive ? 'cursor-pointer' : 'cursor-default'}
          disabled={!interactive}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          <FiStar
            className={`${sizeClass} transition-colors ${
              star <= displayRating
                ? 'text-[#D4A857] fill-[#D4A857]'
                : 'text-[#2C2C2C]/15'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

/* Rating distribution bars */
const RatingBars = ({ reviews = [] }) => {
  const distribution = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { star, count, percentage };
  });

  return (
    <div className="space-y-2">
      {distribution.map(({ star, count, percentage }) => (
        <div key={star} className="flex items-center gap-3">
          <span
            className="text-sm text-[#2C2C2C]/60 w-8 text-right"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {star}
          </span>
          <FiStar className="w-3.5 h-3.5 text-[#D4A857] fill-[#D4A857]" />
          <div className="flex-1 h-2 bg-[#FAF7F2] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              className="h-full bg-[#D4A857] rounded-full"
            />
          </div>
          <span
            className="text-sm text-[#2C2C2C]/40 w-8"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {count}
          </span>
        </div>
      ))}
    </div>
  );
};

/* Individual review card */
const ReviewCard = ({ review }) => {
  const {
    userName = 'Anonymous',
    rating = 5,
    comment = '',
    createdAt,
  } = review;

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <div className="py-5 border-b border-[#2C2C2C]/6 last:border-b-0">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p
            className="font-semibold text-[#2C2C2C] text-sm"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {userName}
          </p>
          {formattedDate && (
            <p
              className="text-xs text-[#2C2C2C]/40 mt-0.5"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {formattedDate}
            </p>
          )}
        </div>
        <StarRating rating={rating} size="sm" />
      </div>
      <p
        className="text-[#2C2C2C]/70 text-sm leading-relaxed"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {comment}
      </p>
    </div>
  );
};

/* Review form */
const ReviewForm = ({ onSubmit, isSubmitting }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0 || !comment.trim()) return;
    onSubmit({ rating, comment: comment.trim(), userName: name.trim() || 'Anonymous' });
    setRating(0);
    setComment('');
    setName('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h4
        className="text-base font-bold text-[#2C2C2C]"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        Write a Review
      </h4>

      <div>
        <label
          className="block text-sm text-[#2C2C2C]/70 mb-1.5"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Your Rating
        </label>
        <StarRating rating={rating} size="md" interactive onRate={setRating} />
        {rating === 0 && (
          <p
            className="text-xs text-[#C75B39] mt-1"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Please select a rating
          </p>
        )}
      </div>

      <div>
        <label
          className="block text-sm text-[#2C2C2C]/70 mb-1.5"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Your Name (optional)
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="w-full px-4 py-2.5 border border-[#2C2C2C]/10 rounded-xl text-sm bg-white focus:outline-none focus:border-[#C75B39] focus:ring-1 focus:ring-[#C75B39]/20 transition-all"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        />
      </div>

      <div>
        <label
          className="block text-sm text-[#2C2C2C]/70 mb-1.5"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Your Review
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts about this artwork..."
          rows={4}
          className="w-full px-4 py-2.5 border border-[#2C2C2C]/10 rounded-xl text-sm bg-white focus:outline-none focus:border-[#C75B39] focus:ring-1 focus:ring-[#C75B39]/20 transition-all resize-none"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        />
      </div>

      <button
        type="submit"
        disabled={rating === 0 || !comment.trim() || isSubmitting}
        className="px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: '#C75B39',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
};

/* Tab content wrapper */
const TabPanel = ({ active, children }) => (
  <AnimatePresence mode="wait">
    {active && (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

const ProductDetail = ({ product, reviews = [], onReviewSubmit, isSubmittingReview = false }) => {
  const {
    _id,
    title = 'Untitled Artwork',
    price = 0,
    discountPrice,
    description = '',
    medium = '',
    dimensions,
    isFramed = false,
    stock = 1,
    images = [],
    averageRating = 0,
    reviewCount = 0,
  } = product || {};

  // Format dimensions object into a display string
  const dimensionsText =
    dimensions && typeof dimensions === 'object'
      ? [dimensions.width, dimensions.height].filter(Boolean).join(' × ') +
        (dimensions.unit ? ` ${dimensions.unit}` : '')
      : typeof dimensions === 'string'
      ? dimensions
      : '';

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  const { addToCart, isInCart } = useCart();

  const isSoldOut = stock === 0;
  const alreadyInCart = isInCart(_id);
  const hasDiscount = discountPrice != null && discountPrice < price;
  const effectivePrice = hasDiscount ? discountPrice : price;
  const descriptionLong = description.length > 300;

  const handleAddToCart = useCallback(() => {
    if (isSoldOut || alreadyInCart) return;
    addToCart(product, quantity);
  }, [product, quantity, isSoldOut, alreadyInCart, addToCart]);

  const handleQuantityChange = useCallback(
    (delta) => {
      setQuantity((prev) => {
        const next = prev + delta;
        if (next < 1) return 1;
        if (next > stock) return stock;
        return next;
      });
    },
    [stock]
  );

  const tabs = [
    { id: 'description', label: 'Description' },
    { id: 'reviews', label: `Reviews (${reviews.length || reviewCount})` },
    { id: 'shipping', label: 'Shipping Info' },
  ];

  // Build images array for ImageZoom
  const zoomImages = images.length > 0
    ? images.map((img, idx) => ({
        url: typeof img === 'string' ? img : img?.url,
        seed: `${title}-${idx}`,
      }))
    : [
        { url: null, seed: `${title}-1` },
        { url: null, seed: `${title}-2` },
        { url: null, seed: `${title}-3` },
      ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      {/* Left: Images */}
      <div>
        <ImageZoom images={zoomImages} alt={title} />
      </div>

      {/* Right: Product info */}
      <div className="space-y-6">
        {/* Title */}
        <div>
          <h1
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2C2C2C] leading-tight mb-3"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {title}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <StarRating rating={averageRating} size="sm" />
            <span
              className="text-sm text-[#2C2C2C]/50"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {averageRating.toFixed(1)} ({reviews.length || reviewCount} review
              {(reviews.length || reviewCount) !== 1 ? 's' : ''})
            </span>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-3">
          <span
            className="text-3xl font-bold text-[#2C2C2C]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {formatPrice(effectivePrice)}
          </span>
          {hasDiscount && (
            <>
              <span
                className="text-lg text-[#2C2C2C]/35 line-through"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {formatPrice(price)}
              </span>
              <span
                className="text-sm font-medium text-[#C75B39] bg-[#C75B39]/8 px-2 py-0.5 rounded-lg"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {Math.round(((price - discountPrice) / price) * 100)}% Off
              </span>
            </>
          )}
        </div>

        {/* Product meta */}
        <div
          className="grid grid-cols-2 gap-3 py-4 border-y border-[#2C2C2C]/8"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {medium && (
            <div>
              <span className="block text-xs text-[#2C2C2C]/40 uppercase tracking-wider mb-0.5">
                Medium
              </span>
              <span className="text-sm text-[#2C2C2C] font-medium">{medium}</span>
            </div>
          )}
          {dimensionsText && (
            <div>
              <span className="block text-xs text-[#2C2C2C]/40 uppercase tracking-wider mb-0.5">
                Dimensions
              </span>
              <span className="text-sm text-[#2C2C2C] font-medium">{dimensionsText}</span>
            </div>
          )}
          <div>
            <span className="block text-xs text-[#2C2C2C]/40 uppercase tracking-wider mb-0.5">
              Framed
            </span>
            <span className="text-sm text-[#2C2C2C] font-medium">
              {isFramed ? 'Yes' : 'No'}
            </span>
          </div>
          <div>
            <span className="block text-xs text-[#2C2C2C]/40 uppercase tracking-wider mb-0.5">
              Availability
            </span>
            <span
              className={`text-sm font-medium ${
                isSoldOut ? 'text-red-500' : stock <= 3 ? 'text-[#D4A857]' : 'text-green-600'
              }`}
            >
              {isSoldOut
                ? 'Sold Out'
                : stock <= 3
                ? `Only ${stock} left`
                : 'In Stock'}
            </span>
          </div>
        </div>

        {/* Quantity + Add to Cart */}
        <div className="space-y-4">
          {/* Quantity selector */}
          {!isSoldOut && (
            <div className="flex items-center gap-4">
              <span
                className="text-sm text-[#2C2C2C]/60"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Quantity
              </span>
              <div className="flex items-center border border-[#2C2C2C]/10 rounded-xl overflow-hidden">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="w-10 h-10 flex items-center justify-center text-[#2C2C2C]/60 hover:bg-[#FAF7F2] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Decrease quantity"
                >
                  <FiMinus className="w-4 h-4" />
                </button>
                <span
                  className="w-12 h-10 flex items-center justify-center text-sm font-medium text-[#2C2C2C] border-x border-[#2C2C2C]/10"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= stock}
                  className="w-10 h-10 flex items-center justify-center text-[#2C2C2C]/60 hover:bg-[#FAF7F2] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Increase quantity"
                >
                  <FiPlus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button
              whileTap={!isSoldOut && !alreadyInCart ? { scale: 0.97 } : {}}
              onClick={handleAddToCart}
              disabled={isSoldOut || alreadyInCart}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isSoldOut
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : alreadyInCart
                  ? 'bg-green-600 text-white cursor-default'
                  : 'text-white hover:brightness-110'
              }`}
              style={{
                backgroundColor:
                  isSoldOut ? undefined : alreadyInCart ? undefined : '#C75B39',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <FiShoppingCart className="w-5 h-5" />
              {isSoldOut ? 'Sold Out' : alreadyInCart ? 'In Cart' : 'Add to Cart'}
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={`flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-sm font-semibold border-2 transition-all duration-200 ${
                isWishlisted
                  ? 'bg-[#C75B39]/5 border-[#C75B39] text-[#C75B39]'
                  : 'border-[#2C2C2C]/15 text-[#2C2C2C]/70 hover:border-[#2C2C2C]/30 hover:text-[#2C2C2C]'
              }`}
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              <FiHeart
                className="w-5 h-5"
                fill={isWishlisted ? 'currentColor' : 'none'}
              />
              {isWishlisted ? 'Wishlisted' : 'Wishlist'}
            </motion.button>
          </div>
        </div>

        {/* Collapsible description preview */}
        <div>
          <p
            className={`text-[#2C2C2C]/65 text-sm leading-relaxed ${
              !isDescExpanded && descriptionLong ? 'line-clamp-4' : ''
            }`}
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {description || 'No description available for this artwork.'}
          </p>
          {descriptionLong && (
            <button
              onClick={() => setIsDescExpanded(!isDescExpanded)}
              className="flex items-center gap-1 mt-2 text-sm text-[#C75B39] font-medium hover:text-[#b04e30] transition-colors"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {isDescExpanded ? 'Show less' : 'Read more'}
              <motion.div
                animate={{ rotate: isDescExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <FiChevronDown className="w-4 h-4" />
              </motion.div>
            </button>
          )}
        </div>

        {/* Tabs */}
        <div>
          {/* Tab headers */}
          <div className="flex border-b border-[#2C2C2C]/8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-[#C75B39]'
                    : 'text-[#2C2C2C]/50 hover:text-[#2C2C2C]/80'
                }`}
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C75B39]"
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="pt-6">
            <TabPanel active={activeTab === 'description'}>
              <div
                className="prose prose-sm max-w-none text-[#2C2C2C]/70"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                <p className="leading-relaxed">
                  {description || 'No description available for this artwork.'}
                </p>
                {medium && (
                  <div className="mt-4 p-4 bg-[#FAF7F2] rounded-xl">
                    <h5 className="font-semibold text-[#2C2C2C] text-sm mb-2">Artwork Details</h5>
                    <ul className="space-y-1.5 text-sm">
                      <li>
                        <span className="text-[#2C2C2C]/40">Medium:</span>{' '}
                        <span className="text-[#2C2C2C]">{medium}</span>
                      </li>
                      {dimensionsText && (
                        <li>
                          <span className="text-[#2C2C2C]/40">Size:</span>{' '}
                          <span className="text-[#2C2C2C]">{dimensionsText}</span>
                        </li>
                      )}
                      <li>
                        <span className="text-[#2C2C2C]/40">Framed:</span>{' '}
                        <span className="text-[#2C2C2C]">{isFramed ? 'Yes, ready to hang' : 'Unframed'}</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </TabPanel>

            <TabPanel active={activeTab === 'reviews'}>
              <div className="space-y-8">
                {/* Rating overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="text-center sm:text-left">
                    <div
                      className="text-5xl font-bold text-[#2C2C2C] mb-1"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {averageRating.toFixed(1)}
                    </div>
                    <StarRating rating={Math.round(averageRating)} size="md" />
                    <p
                      className="text-sm text-[#2C2C2C]/50 mt-1"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      Based on {reviews.length || reviewCount} review
                      {(reviews.length || reviewCount) !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <RatingBars reviews={reviews} />
                </div>

                {/* Reviews list */}
                {reviews.length > 0 ? (
                  <div>
                    {reviews.map((review, idx) => (
                      <ReviewCard key={review._id || idx} review={review} />
                    ))}
                  </div>
                ) : (
                  <p
                    className="text-center text-[#2C2C2C]/40 py-8"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    No reviews yet. Be the first to review this artwork!
                  </p>
                )}

                {/* Review form */}
                <div
                  className="p-6 bg-[#FAF7F2] rounded-2xl"
                  style={{ boxShadow: '0 1px 4px rgba(44,44,44,0.04)' }}
                >
                  <ReviewForm onSubmit={onReviewSubmit} isSubmitting={isSubmittingReview} />
                </div>
              </div>
            </TabPanel>

            <TabPanel active={activeTab === 'shipping'}>
              <div
                className="space-y-4 text-sm text-[#2C2C2C]/70"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                <div className="p-4 bg-[#FAF7F2] rounded-xl">
                  <h5 className="font-semibold text-[#2C2C2C] mb-2">Shipping Details</h5>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C75B39] mt-1.5 flex-shrink-0" />
                      <span>
                        Free shipping on orders above {formatPrice(2000)} within India.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C75B39] mt-1.5 flex-shrink-0" />
                      <span>
                        Standard delivery within 5-7 business days for domestic orders.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C75B39] mt-1.5 flex-shrink-0" />
                      <span>
                        International shipping available. Delivery in 10-15 business days.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C75B39] mt-1.5 flex-shrink-0" />
                      <span>
                        Each artwork is carefully packaged with protective materials to ensure it arrives in perfect condition.
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-[#FAF7F2] rounded-xl">
                  <h5 className="font-semibold text-[#2C2C2C] mb-2">Returns & Exchanges</h5>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4A857] mt-1.5 flex-shrink-0" />
                      <span>
                        We accept returns within 7 days of delivery for undamaged items in original packaging.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4A857] mt-1.5 flex-shrink-0" />
                      <span>
                        Custom or commissioned artworks are non-refundable.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4A857] mt-1.5 flex-shrink-0" />
                      <span>
                        Contact us at support@joblessartist.com for return requests.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </TabPanel>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
