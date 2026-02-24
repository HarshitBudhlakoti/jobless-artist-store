import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiChevronRight } from 'react-icons/fi';
import { gsap } from 'gsap';
import AnimatedPage from '../components/common/AnimatedPage';
import ProductDetail from '../components/shop/ProductDetail';
import ProductCard from '../components/shop/ProductCard';
import api from '../api/axios';

/* Loading skeleton for product page */
const ProductPageSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {/* Breadcrumb skeleton */}
    <div className="flex gap-2 mb-8">
      <div className="h-4 w-12 bg-[#2C2C2C]/5 rounded animate-pulse" />
      <div className="h-4 w-4 bg-[#2C2C2C]/5 rounded animate-pulse" />
      <div className="h-4 w-16 bg-[#2C2C2C]/5 rounded animate-pulse" />
      <div className="h-4 w-4 bg-[#2C2C2C]/5 rounded animate-pulse" />
      <div className="h-4 w-32 bg-[#2C2C2C]/5 rounded animate-pulse" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      {/* Image skeleton */}
      <div>
        <div className="aspect-[4/5] rounded-2xl bg-[#2C2C2C]/5 animate-pulse" />
        <div className="flex gap-2 mt-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="w-20 h-20 rounded-xl bg-[#2C2C2C]/5 animate-pulse" />
          ))}
        </div>
      </div>

      {/* Info skeleton */}
      <div className="space-y-6">
        <div>
          <div className="h-8 w-3/4 bg-[#2C2C2C]/5 rounded animate-pulse mb-3" />
          <div className="h-4 w-36 bg-[#2C2C2C]/5 rounded animate-pulse" />
        </div>
        <div className="h-8 w-28 bg-[#2C2C2C]/5 rounded animate-pulse" />
        <div className="grid grid-cols-2 gap-3 py-4 border-y border-[#2C2C2C]/8">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="space-y-1.5">
              <div className="h-3 w-16 bg-[#2C2C2C]/5 rounded animate-pulse" />
              <div className="h-4 w-20 bg-[#2C2C2C]/5 rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <div className="h-12 w-full bg-[#2C2C2C]/5 rounded-xl animate-pulse" />
          <div className="flex gap-3">
            <div className="h-12 flex-1 bg-[#2C2C2C]/5 rounded-xl animate-pulse" />
            <div className="h-12 w-36 bg-[#2C2C2C]/5 rounded-xl animate-pulse" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-[#2C2C2C]/5 rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-[#2C2C2C]/5 rounded animate-pulse" />
          <div className="h-4 w-4/6 bg-[#2C2C2C]/5 rounded animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const productSectionRef = useRef(null);

  /* Fetch product data */
  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/products/${id}`);
        const data = res.data?.data || res.data;
        setProduct(data);

        // Extract reviews from the populated product data
        const productReviews = data?.reviews || [];
        setReviews(Array.isArray(productReviews) ? productReviews : []);

        // Fetch related products
        try {
          const categoryId = data?.category?._id || data?.category;
          if (categoryId) {
            const relatedRes = await api.get('/products', {
              params: { category: categoryId, limit: 4, exclude: id },
            });
            const relatedData = relatedRes.data?.data || relatedRes.data || [];
            setRelatedProducts(
              Array.isArray(relatedData)
                ? relatedData.filter((p) => p._id !== id).slice(0, 4)
                : []
            );
          }
        } catch {
          setRelatedProducts([]);
        }
      } catch {
        setProduct(null);
        setReviews([]);
        setRelatedProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProduct();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [id]);

  /* GSAP image reveal animation on load */
  useEffect(() => {
    if (!isLoading && productSectionRef.current) {
      const section = productSectionRef.current;
      const imageContainer = section.querySelector('[data-gsap-image]');
      const infoContainer = section.querySelector('[data-gsap-info]');

      if (imageContainer) {
        gsap.fromTo(
          imageContainer,
          { clipPath: 'inset(100% 0 0 0)', opacity: 0 },
          {
            clipPath: 'inset(0% 0 0 0)',
            opacity: 1,
            duration: 0.9,
            ease: 'power3.out',
            delay: 0.1,
          }
        );
      }

      if (infoContainer) {
        gsap.fromTo(
          infoContainer,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: 'power3.out',
            delay: 0.3,
          }
        );
      }
    }
  }, [isLoading]);

  /* Submit review */
  const handleReviewSubmit = useCallback(
    async (reviewData) => {
      setIsSubmittingReview(true);
      try {
        const res = await api.post(`/products/${id}/review`, reviewData);
        const newReview = res.data?.data || res.data;
        setReviews((prev) => [newReview, ...prev]);

        // Update product average rating
        setProduct((prev) => {
          if (!prev) return prev;
          const allReviews = [newReview, ...reviews];
          const avgRating =
            allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
          return {
            ...prev,
            averageRating: avgRating,
            reviewCount: allReviews.length,
          };
        });
      } catch {
        // If API fails, add review locally anyway for UX
        const localReview = {
          ...reviewData,
          _id: `local-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        setReviews((prev) => [localReview, ...prev]);
      } finally {
        setIsSubmittingReview(false);
      }
    },
    [id, reviews]
  );

  if (isLoading) {
    return (
      <AnimatedPage>
        <div className="min-h-screen bg-[#FAF7F2]">
          <ProductPageSkeleton />
        </div>
      </AnimatedPage>
    );
  }

  if (!product) {
    return (
      <AnimatedPage>
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#2C2C2C]/5 flex items-center justify-center">
              <svg className="w-12 h-12 text-[#2C2C2C]/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2
              className="text-2xl font-bold text-[#2C2C2C] mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Artwork Not Found
            </h2>
            <p
              className="text-[#2C2C2C]/50 mb-6"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              The artwork you are looking for does not seem to exist.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center px-6 py-3 rounded-xl text-white text-sm font-medium transition-colors hover:brightness-110"
              style={{
                backgroundColor: '#C75B39',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Browse Gallery
            </Link>
          </div>
        </div>
      </AnimatedPage>
    );
  }

  const categoryName = product.category?.name || product.category || 'Shop';

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Breadcrumb */}
          <nav
            className="flex items-center gap-1.5 text-sm mb-8 flex-wrap"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
            aria-label="Breadcrumb"
          >
            <Link
              to="/"
              className="text-[#2C2C2C]/40 hover:text-[#C75B39] transition-colors"
            >
              Home
            </Link>
            <FiChevronRight className="w-3.5 h-3.5 text-[#2C2C2C]/25" />
            <Link
              to="/shop"
              className="text-[#2C2C2C]/40 hover:text-[#C75B39] transition-colors"
            >
              Shop
            </Link>
            {categoryName && (
              <>
                <FiChevronRight className="w-3.5 h-3.5 text-[#2C2C2C]/25" />
                <Link
                  to={`/shop?category=${product.category?._id || product.category || ''}`}
                  className="text-[#2C2C2C]/40 hover:text-[#C75B39] transition-colors"
                >
                  {categoryName}
                </Link>
              </>
            )}
            <FiChevronRight className="w-3.5 h-3.5 text-[#2C2C2C]/25" />
            <span className="text-[#2C2C2C]/70 font-medium truncate max-w-[200px]">
              {product.title}
            </span>
          </nav>

          {/* Product detail section with GSAP refs */}
          <div ref={productSectionRef}>
            <div data-gsap-image className="mb-0">
              <ProductDetail
                product={product}
                reviews={reviews}
                onReviewSubmit={handleReviewSubmit}
                isSubmittingReview={isSubmittingReview}
              />
            </div>
          </div>

          {/* Related products */}
          {relatedProducts.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mt-16 sm:mt-20"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2
                    className="text-2xl sm:text-3xl font-bold text-[#2C2C2C]"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    You May Also Like
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="h-px w-6 bg-[#D4A857]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C75B39]" />
                    <div className="h-px w-6 bg-[#D4A857]" />
                  </div>
                </div>
                <Link
                  to={`/shop?category=${product.category?._id || product.category || ''}`}
                  className="text-sm text-[#C75B39] font-medium hover:text-[#b04e30] transition-colors flex items-center gap-1"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  View All
                  <FiChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relProduct) => (
                  <ProductCard key={relProduct._id} product={relProduct} />
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
};

export default ProductPage;
