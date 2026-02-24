import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiChevronDown } from 'react-icons/fi';
import api from '../../api/axios';
import { debounce } from '../../utils/helpers';

const MEDIUM_OPTIONS = [
  { label: 'Oil', value: 'Oil' },
  { label: 'Watercolor', value: 'Watercolor' },
  { label: 'Acrylic', value: 'Acrylic' },
  { label: 'Digital', value: 'Digital' },
  { label: 'Mixed Media', value: 'Mixed Media' },
];

const SIZE_OPTIONS = [
  { label: 'Small', value: 'Small' },
  { label: 'Medium', value: 'Medium' },
  { label: 'Large', value: 'Large' },
];


/* Collapsible filter section */
const FilterSection = ({ title, defaultOpen = true, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-[#2C2C2C]/8 pb-5 mb-5 last:border-b-0 last:pb-0 last:mb-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left mb-3 group"
      >
        <h4
          className="text-sm font-semibold text-[#2C2C2C] uppercase tracking-wider"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {title}
        </h4>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="text-[#2C2C2C]/50 group-hover:text-[#2C2C2C] transition-colors"
        >
          <FiChevronDown className="w-4 h-4" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FilterSidebar = ({ filters, onFilterChange, isOpen, onClose }) => {
  const [categories, setCategories] = useState([]);
  const [localMinPrice, setLocalMinPrice] = useState(filters.minPrice || '');
  const [localMaxPrice, setLocalMaxPrice] = useState(filters.maxPrice || '');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data?.data && res.data.data.length > 0) {
          setCategories(res.data.data);
        }
      } catch {
        // Keep fallback categories
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    setLocalMinPrice(filters.minPrice || '');
    setLocalMaxPrice(filters.maxPrice || '');
  }, [filters.minPrice, filters.maxPrice]);

  const debouncedPriceChange = useCallback(
    debounce((min, max) => {
      onFilterChange({ minPrice: min, maxPrice: max });
    }, 500),
    [onFilterChange]
  );

  const handleMinPriceChange = (value) => {
    setLocalMinPrice(value);
    debouncedPriceChange(value, localMaxPrice);
  };

  const handleMaxPriceChange = (value) => {
    setLocalMaxPrice(value);
    debouncedPriceChange(localMinPrice, value);
  };

  const handleCategoryChange = (categoryId) => {
    onFilterChange({
      category: filters.category === categoryId ? '' : categoryId,
    });
  };

  const handleMediumChange = (mediumValue) => {
    const currentMediums = filters.medium ? filters.medium.split(',') : [];
    const updated = currentMediums.includes(mediumValue)
      ? currentMediums.filter((m) => m !== mediumValue)
      : [...currentMediums, mediumValue];
    onFilterChange({ medium: updated.join(',') });
  };

  const handleSizeChange = (sizeValue) => {
    onFilterChange({
      size: filters.size === sizeValue ? '' : sizeValue,
    });
  };

  const handleClearAll = () => {
    setLocalMinPrice('');
    setLocalMaxPrice('');
    onFilterChange({
      category: '',
      medium: '',
      minPrice: '',
      maxPrice: '',
      size: '',
    });
  };

  const hasActiveFilters =
    filters.category || filters.medium || filters.minPrice || filters.maxPrice || filters.size;

  const selectedMediums = filters.medium ? filters.medium.split(',') : [];

  const sidebarContent = (
    <div className="space-y-0">
      {/* Header with clear button */}
      <div className="flex items-center justify-between mb-6">
        <h3
          className="text-lg font-bold text-[#2C2C2C]"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={handleClearAll}
            className="text-xs font-medium text-[#C75B39] hover:text-[#b04e30] underline underline-offset-2 transition-colors"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Clear All
          </button>
        )}
      </div>

      {/* Categories */}
      <FilterSection title="Categories" defaultOpen={true}>
        <div className="space-y-1">
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => handleCategoryChange(cat._id || cat.name)}
              className={`block w-full text-left px-3 py-2 rounded-xl text-sm transition-all duration-200 ${
                filters.category === (cat._id || cat.name)
                  ? 'bg-[#C75B39]/10 text-[#C75B39] font-medium'
                  : 'text-[#2C2C2C]/70 hover:bg-[#FAF7F2] hover:text-[#2C2C2C]'
              }`}
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range" defaultOpen={true}>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2C2C2C]/40 text-xs">
              ₹
            </span>
            <input
              type="number"
              placeholder="Min"
              value={localMinPrice}
              onChange={(e) => handleMinPriceChange(e.target.value)}
              className="w-full pl-7 pr-2 py-2.5 text-sm border border-[#2C2C2C]/10 rounded-xl bg-white focus:outline-none focus:border-[#C75B39] focus:ring-1 focus:ring-[#C75B39]/20 transition-all"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
              min="0"
            />
          </div>
          <span className="text-[#2C2C2C]/30 text-sm">—</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2C2C2C]/40 text-xs">
              ₹
            </span>
            <input
              type="number"
              placeholder="Max"
              value={localMaxPrice}
              onChange={(e) => handleMaxPriceChange(e.target.value)}
              className="w-full pl-7 pr-2 py-2.5 text-sm border border-[#2C2C2C]/10 rounded-xl bg-white focus:outline-none focus:border-[#C75B39] focus:ring-1 focus:ring-[#C75B39]/20 transition-all"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
              min="0"
            />
          </div>
        </div>
      </FilterSection>

      {/* Medium */}
      <FilterSection title="Medium" defaultOpen={true}>
        <div className="space-y-2">
          {MEDIUM_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                  selectedMediums.includes(opt.value)
                    ? 'bg-[#C75B39] border-[#C75B39]'
                    : 'border-[#2C2C2C]/20 group-hover:border-[#2C2C2C]/40'
                }`}
              >
                {selectedMediums.includes(opt.value) && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span
                className={`text-sm transition-colors ${
                  selectedMediums.includes(opt.value)
                    ? 'text-[#2C2C2C] font-medium'
                    : 'text-[#2C2C2C]/70 group-hover:text-[#2C2C2C]'
                }`}
                style={{ fontFamily: "'DM Sans', sans-serif" }}
                onClick={() => handleMediumChange(opt.value)}
              >
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Size */}
      <FilterSection title="Size" defaultOpen={false}>
        <div className="flex flex-wrap gap-2">
          {SIZE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSizeChange(opt.value)}
              className={`px-4 py-2 rounded-xl text-sm transition-all duration-200 border ${
                filters.size === opt.value
                  ? 'bg-[#C75B39] text-white border-[#C75B39]'
                  : 'bg-white text-[#2C2C2C]/70 border-[#2C2C2C]/10 hover:border-[#2C2C2C]/30'
              }`}
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </FilterSection>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:block w-[280px] flex-shrink-0">
        <div
          className="sticky top-28 bg-white rounded-2xl p-6"
          style={{ boxShadow: '0 2px 16px rgba(44,44,44,0.06)' }}
        >
          {sidebarContent}
        </div>
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
              onClick={onClose}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 w-[320px] max-w-[85vw] bg-white z-50 lg:hidden overflow-y-auto"
              style={{ boxShadow: '4px 0 24px rgba(0,0,0,0.1)' }}
            >
              {/* Mobile header */}
              <div className="flex items-center justify-between p-4 border-b border-[#2C2C2C]/8">
                <h3
                  className="text-lg font-bold text-[#2C2C2C]"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Filters
                </h3>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-[#FAF7F2] text-[#2C2C2C]/60 transition-colors"
                  aria-label="Close filters"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-5">{sidebarContent}</div>

              {/* Apply button (mobile) */}
              <div className="sticky bottom-0 p-4 bg-white border-t border-[#2C2C2C]/8">
                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-xl text-white font-medium text-sm transition-colors"
                  style={{
                    backgroundColor: '#C75B39',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default FilterSidebar;
