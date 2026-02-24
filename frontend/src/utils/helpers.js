/**
 * Format a number as a currency string (INR by default).
 * @param {number} amount
 * @param {string} currency
 * @returns {string}
 */
export const formatPrice = (amount, currency = 'INR') => {
  if (amount == null || isNaN(amount)) return '';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Truncate text to a given length with ellipsis.
 */
export const truncateText = (text, maxLength = 120) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '...';
};

/**
 * Build a Cloudinary transform URL with specified dimensions.
 * Falls back to the original URL if it's not a Cloudinary URL.
 * @param {string} url - original image URL
 * @param {number} width
 * @param {number} height
 * @returns {string}
 */
export const getImageUrl = (url, width, height) => {
  if (!url) return '/placeholder-art.jpg';
  if (!url.includes('cloudinary.com')) return url;

  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;

  const transforms = [];
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  transforms.push('c_fill', 'q_auto', 'f_auto');

  return `${parts[0]}/upload/${transforms.join(',')}/${parts[1]}`;
};

/**
 * Generate a deterministic gradient placeholder based on a seed string.
 * Returns a CSS linear-gradient string for use in inline styles.
 */
export const placeholderGradient = (seed = '') => {
  const palettes = [
    'linear-gradient(135deg, #fde68a, #fb923c)',
    'linear-gradient(135deg, #fecdd3, #f472b6)',
    'linear-gradient(135deg, #bae6fd, #818cf8)',
    'linear-gradient(135deg, #a7f3d0, #5eead4)',
    'linear-gradient(135deg, #ddd6fe, #a855f7)',
    'linear-gradient(135deg, #fef08a, #fbbf24)',
    'linear-gradient(135deg, #d9f99d, #86efac)',
    'linear-gradient(135deg, #f5d0fe, #f472b6)',
  ];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palettes[Math.abs(hash) % palettes.length];
};

/**
 * Build a query string from an object, omitting null/undefined/empty values.
 */
export const buildQueryString = (params) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value != null && value !== '' && value !== undefined) {
      if (Array.isArray(value) && value.length > 0) {
        searchParams.set(key, value.join(','));
      } else if (!Array.isArray(value)) {
        searchParams.set(key, String(value));
      }
    }
  });
  return searchParams.toString();
};

/**
 * Debounce a function.
 */
export const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Return Tailwind color classes for an order status badge.
 * @param {string} status
 * @returns {{ bg: string, text: string }}
 */
export const getStatusColor = (status) => {
  const map = {
    placed: { bg: 'bg-gray-100', text: 'text-gray-700' },
    confirmed: { bg: 'bg-blue-100', text: 'text-blue-700' },
    'in-progress': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    shipped: { bg: 'bg-purple-100', text: 'text-purple-700' },
    delivered: { bg: 'bg-green-100', text: 'text-green-700' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-700' },
    pending: { bg: 'bg-orange-100', text: 'text-orange-700' },
    paid: { bg: 'bg-green-100', text: 'text-green-700' },
    failed: { bg: 'bg-red-100', text: 'text-red-700' },
    refunded: { bg: 'bg-orange-100', text: 'text-orange-700' },
    inquiry: { bg: 'bg-gray-100', text: 'text-gray-700' },
    quoted: { bg: 'bg-blue-100', text: 'text-blue-700' },
    accepted: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
    review: { bg: 'bg-amber-100', text: 'text-amber-700' },
    revision: { bg: 'bg-orange-100', text: 'text-orange-700' },
    completed: { bg: 'bg-green-100', text: 'text-green-700' },
    active: { bg: 'bg-green-100', text: 'text-green-700' },
    inactive: { bg: 'bg-gray-100', text: 'text-gray-500' },
  };
  const key = (status || '').toLowerCase().replace(/\s+/g, '-');
  return map[key] || { bg: 'bg-gray-100', text: 'text-gray-600' };
};

/**
 * Generate an array of page numbers for pagination display.
 */
export const getPaginationRange = (currentPage, totalPages, delta = 2) => {
  const range = [];
  const left = Math.max(2, currentPage - delta);
  const right = Math.min(totalPages - 1, currentPage + delta);

  range.push(1);
  if (left > 2) range.push('...');
  for (let i = left; i <= right; i++) {
    range.push(i);
  }
  if (right < totalPages - 1) range.push('...');
  if (totalPages > 1) range.push(totalPages);

  return range;
};

/**
 * Calculate an estimated price for custom art orders.
 * @param {string} size - e.g. 'small', 'medium', 'large', 'extra-large'
 * @param {string} medium - e.g. 'pencil', 'charcoal', 'watercolor', 'acrylic', 'oil'
 * @param {string} type - e.g. 'portrait', 'landscape', 'abstract', 'pet-portrait'
 * @returns {number} estimated price in INR
 */
export const calculateEstimate = (size, medium, type) => {
  const sizeMultiplier = {
    small: 1,
    medium: 1.8,
    large: 2.8,
    'extra-large': 4,
  };

  const mediumBase = {
    pencil: 2000,
    charcoal: 2500,
    watercolor: 3500,
    acrylic: 4500,
    oil: 6000,
    digital: 3000,
    mixed: 5000,
  };

  const typeMultiplier = {
    portrait: 1.2,
    landscape: 1,
    abstract: 1.1,
    'pet-portrait': 1.3,
    caricature: 0.9,
    illustration: 1.15,
    'family-portrait': 1.5,
  };

  const base = mediumBase[medium] || 3000;
  const sizeMul = sizeMultiplier[size] || 1;
  const typeMul = typeMultiplier[type] || 1;

  return Math.round(base * sizeMul * typeMul);
};

/**
 * Slugify a string for URLs.
 */
export const slugify = (text) => {
  return (text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Get initials from a name.
 */
export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
