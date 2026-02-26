import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiSearch, FiX } from 'react-icons/fi';
import AnimatedPage from '../components/common/AnimatedPage';
import SEO from '../components/common/SEO';
import FilterSidebar from '../components/shop/FilterSidebar';
import ProductGrid from '../components/shop/ProductGrid';
import api from '../api/axios';
import { debounce, buildQueryString } from '../utils/helpers';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
];

const PRODUCTS_PER_PAGE = 12;

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  /* Parse current filters from URL */
  const filters = useMemo(
    () => ({
      category: searchParams.get('category') || '',
      medium: searchParams.get('medium') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      sort: searchParams.get('sort') || 'newest',
      page: parseInt(searchParams.get('page') || '1', 10),
      search: searchParams.get('search') || '',
      size: searchParams.get('size') || '',
    }),
    [searchParams]
  );

  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search);

  /* Fetch products */
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const queryParams = {
        page: filters.page,
        limit: PRODUCTS_PER_PAGE,
      };
      if (filters.category) queryParams.category = filters.category;
      if (filters.medium) queryParams.medium = filters.medium;
      if (filters.minPrice) queryParams.minPrice = filters.minPrice;
      if (filters.maxPrice) queryParams.maxPrice = filters.maxPrice;
      if (filters.size) queryParams.size = filters.size;
      if (filters.search) queryParams.search = filters.search;

      // Map sort values to API params
      if (filters.sort === 'price_asc') {
        queryParams.sort = 'price';
      } else if (filters.sort === 'price_desc') {
        queryParams.sort = '-price';
      } else if (filters.sort === 'popular') {
        queryParams.sort = '-averageRating';
      } else {
        queryParams.sort = '-createdAt';
      }

      const res = await api.get('/products', { params: queryParams });
      const data = res.data;

      if (data?.data) {
        setProducts(data.data);
        setTotalPages(data.totalPages || Math.ceil((data.total || data.data.length) / PRODUCTS_PER_PAGE));
        setTotalCount(data.total || data.data.length);
      } else if (Array.isArray(data)) {
        setProducts(data);
        setTotalPages(1);
        setTotalCount(data.length);
      } else {
        setProducts([]);
        setTotalPages(1);
        setTotalCount([].length);
      }
    } catch {
      // Use fallback data
      setProducts([]);
      setTotalPages(1);
      setTotalCount([].length);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /* Update URL params when filters change */
  const updateFilters = useCallback(
    (updates) => {
      const newParams = { ...filters, ...updates };
      // Reset to page 1 when changing filters (not pagination)
      if (!('page' in updates)) {
        newParams.page = 1;
      }
      const queryString = buildQueryString({
        category: newParams.category,
        medium: newParams.medium,
        minPrice: newParams.minPrice,
        maxPrice: newParams.maxPrice,
        sort: newParams.sort !== 'newest' ? newParams.sort : '',
        page: newParams.page > 1 ? newParams.page : '',
        search: newParams.search,
        size: newParams.size,
      });
      setSearchParams(queryString ? `?${queryString}` : '', { replace: true });
    },
    [filters, setSearchParams]
  );

  /* Debounced search */
  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        updateFilters({ search: value });
      }, 400),
    [updateFilters]
  );

  const handleSearchChange = useCallback(
    (e) => {
      const value = e.target.value;
      setSearchInput(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  const handleClearSearch = useCallback(() => {
    setSearchInput('');
    updateFilters({ search: '' });
  }, [updateFilters]);

  const handlePageChange = useCallback(
    (page) => {
      updateFilters({ page });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [updateFilters]
  );

  const handleSortChange = useCallback(
    (e) => {
      updateFilters({ sort: e.target.value });
    },
    [updateFilters]
  );

  return (
    <AnimatedPage>
      <SEO title="Shop" description="Browse our collection of unique handcrafted paintings, wall art, and custom art pieces. Find the perfect artwork for your space." path="/shop" />
      <div className="min-h-screen bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Page header */}
          <div className="text-center mb-10">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2C2C2C] mb-3"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Gallery & Shop
            </motion.h1>

            {/* Decorative underline */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto mb-4"
              style={{ originX: 0.5 }}
            >
              <div className="flex items-center justify-center gap-2">
                <div className="h-px w-8 bg-[#D4A857]" />
                <div className="w-2 h-2 rounded-full bg-[#C75B39]" />
                <div className="h-px w-8 bg-[#D4A857]" />
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="text-[#2C2C2C]/50 max-w-lg mx-auto"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Discover unique handcrafted artworks, each created with passion and care by independent artists.
            </motion.p>
          </div>

          {/* Search & sort bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8"
          >
            {/* Mobile filter toggle */}
            <button
              onClick={() => setFilterDrawerOpen(true)}
              className="lg:hidden flex items-center justify-center gap-2 px-4 py-2.5 border border-[#2C2C2C]/10 rounded-xl text-sm text-[#2C2C2C]/70 hover:bg-white hover:border-[#2C2C2C]/20 transition-all"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              <FiFilter className="w-4 h-4" />
              Filters
            </button>

            {/* Search bar */}
            <div className="relative flex-1">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2C2C2C]/30" />
              <input
                type="text"
                placeholder="Search artworks..."
                value={searchInput}
                onChange={handleSearchChange}
                className="w-full pl-11 pr-10 py-2.5 border border-[#2C2C2C]/10 rounded-xl text-sm bg-white focus:outline-none focus:border-[#C75B39] focus:ring-1 focus:ring-[#C75B39]/20 transition-all"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              />
              {searchInput && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[#FAF7F2] text-[#2C2C2C]/30 hover:text-[#2C2C2C]/60 transition-colors"
                  aria-label="Clear search"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort dropdown */}
            <div className="flex items-center gap-2">
              <span
                className="hidden sm:inline text-sm text-[#2C2C2C]/50 whitespace-nowrap"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Sort by
              </span>
              <select
                value={filters.sort}
                onChange={handleSortChange}
                className="px-4 py-2.5 border border-[#2C2C2C]/10 rounded-xl text-sm bg-white text-[#2C2C2C] focus:outline-none focus:border-[#C75B39] focus:ring-1 focus:ring-[#C75B39]/20 transition-all cursor-pointer appearance-none"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%232C2C2C' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  paddingRight: '36px',
                }}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>

          {/* Results count */}
          {!isLoading && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-[#2C2C2C]/40 mb-4"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {totalCount} artwork{totalCount !== 1 ? 's' : ''} found
              {filters.search && (
                <span>
                  {' '}
                  for "<span className="text-[#C75B39]">{filters.search}</span>"
                </span>
              )}
            </motion.p>
          )}

          {/* Main content area */}
          <div className="flex gap-8">
            {/* Sidebar */}
            <FilterSidebar
              filters={filters}
              onFilterChange={updateFilters}
              isOpen={filterDrawerOpen}
              onClose={() => setFilterDrawerOpen(false)}
            />

            {/* Product grid */}
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${filters.category}-${filters.medium}-${filters.sort}-${filters.page}-${filters.search}-${filters.minPrice}-${filters.maxPrice}-${filters.size}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductGrid
                    products={products}
                    isLoading={isLoading}
                    currentPage={filters.page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default Shop;
