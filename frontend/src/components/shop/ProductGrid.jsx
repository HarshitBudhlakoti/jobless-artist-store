import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ProductCard, { ProductCardSkeleton } from './ProductCard';
import { getPaginationRange } from '../../utils/helpers';

const ProductGrid = ({
  products = [],
  isLoading = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onQuickView,
}) => {
  /* Loading skeleton */
  if (isLoading) {
    return (
      <div className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  /* Empty state */
  if (!products || products.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 px-4">
        <div className="w-32 h-32 mb-6 rounded-full bg-[#FAF7F2] flex items-center justify-center">
          <svg className="w-16 h-16 text-[#2C2C2C]/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3
          className="text-xl font-bold text-[#2C2C2C] mb-2"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          No artworks found
        </h3>
        <p
          className="text-[#2C2C2C]/50 text-center max-w-md"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          We couldn't find any artwork matching your filters. Try adjusting your search or clearing some filters to discover more pieces.
        </p>
      </div>
    );
  }

  const pageRange = getPaginationRange(currentPage, totalPages);

  return (
    <div className="w-full">
      <LayoutGroup>
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onQuickView={onQuickView}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-12">
          {/* Prev button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className={`flex items-center justify-center w-10 h-10 rounded-xl text-sm transition-all duration-200 ${
              currentPage <= 1
                ? 'text-[#2C2C2C]/20 cursor-not-allowed'
                : 'text-[#2C2C2C]/60 hover:bg-[#FAF7F2] hover:text-[#2C2C2C]'
            }`}
            aria-label="Previous page"
          >
            <FiChevronLeft className="w-5 h-5" />
          </button>

          {/* Page numbers */}
          {pageRange.map((page, idx) =>
            page === '...' ? (
              <span
                key={`ellipsis-${idx}`}
                className="w-10 h-10 flex items-center justify-center text-[#2C2C2C]/30 text-sm"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`w-10 h-10 rounded-xl text-sm font-medium transition-all duration-200 ${
                  page === currentPage
                    ? 'bg-[#C75B39] text-white'
                    : 'text-[#2C2C2C]/60 hover:bg-[#FAF7F2] hover:text-[#2C2C2C]'
                }`}
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {page}
              </button>
            )
          )}

          {/* Next button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className={`flex items-center justify-center w-10 h-10 rounded-xl text-sm transition-all duration-200 ${
              currentPage >= totalPages
                ? 'text-[#2C2C2C]/20 cursor-not-allowed'
                : 'text-[#2C2C2C]/60 hover:bg-[#FAF7F2] hover:text-[#2C2C2C]'
            }`}
            aria-label="Next page"
          >
            <FiChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
