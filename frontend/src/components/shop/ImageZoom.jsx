import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import { placeholderGradient } from '../../utils/helpers';

const ImageZoom = ({ images = [], alt = 'Product image' }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const imageContainerRef = useRef(null);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowLeft') navigateLightbox(-1);
      if (e.key === 'ArrowRight') navigateLightbox(1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, activeIndex]);

  const handleMouseMove = useCallback((e) => {
    if (isTouchDevice) return;
    const rect = imageContainerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  }, [isTouchDevice]);

  const handleMouseEnter = useCallback(() => {
    if (!isTouchDevice) setIsZooming(true);
  }, [isTouchDevice]);

  const handleMouseLeave = useCallback(() => {
    setIsZooming(false);
  }, []);

  const handleImageClick = useCallback(() => {
    setLightboxOpen(true);
  }, []);

  const navigateLightbox = useCallback(
    (direction) => {
      setActiveIndex((prev) => {
        const next = prev + direction;
        if (next < 0) return images.length - 1;
        if (next >= images.length) return 0;
        return next;
      });
    },
    [images.length]
  );

  const placeholderImages = images.length > 0
    ? images
    : [
        { url: null, seed: `${alt}-1` },
        { url: null, seed: `${alt}-2` },
        { url: null, seed: `${alt}-3` },
      ];

  const currentImage = placeholderImages[activeIndex];

  const renderImage = (img, className = '', style = {}) => {
    if (img?.url) {
      return (
        <img
          src={img.url}
          alt={alt}
          className={className}
          style={style}
          draggable={false}
        />
      );
    }
    const seed = img?.seed || img?.url || `${alt}-${activeIndex}`;
    const gradient = placeholderGradient(seed);
    return (
      <div
        className={`bg-gradient-to-br ${gradient} ${className} flex items-center justify-center`}
        style={style}
      >
        <div className="text-center opacity-40">
          <svg className="w-16 h-16 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Artwork
          </span>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Main image container */}
      <div className="space-y-3">
        <div
          ref={imageContainerRef}
          className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden cursor-zoom-in bg-[#FAF7F2]"
          style={{ boxShadow: '0 4px 24px rgba(44,44,44,0.08)' }}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleImageClick}
        >
          {/* Base image */}
          {renderImage(currentImage, 'w-full h-full object-cover')}

          {/* Zoom lens overlay (desktop only) */}
          {isZooming && !isTouchDevice && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: currentImage?.url ? `url(${currentImage.url})` : 'none',
                backgroundSize: '250%',
                backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                backgroundRepeat: 'no-repeat',
                opacity: currentImage?.url ? 1 : 0,
              }}
            />
          )}

          {/* Zoom indicator for non-URL images on hover */}
          {isZooming && !currentImage?.url && (
            <div className="absolute inset-0 bg-black/5 pointer-events-none flex items-center justify-center">
              <div className="bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-[#2C2C2C]"
                style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Click to view full size
              </div>
            </div>
          )}
        </div>

        {/* Thumbnail strip */}
        {placeholderImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {placeholderImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden transition-all duration-200 ${
                  idx === activeIndex
                    ? 'ring-2 ring-[#C75B39] ring-offset-2 ring-offset-[#FAF7F2]'
                    : 'ring-1 ring-[#2C2C2C]/10 hover:ring-[#2C2C2C]/30'
                }`}
              >
                {renderImage(img, 'w-full h-full object-cover')}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={() => setLightboxOpen(false)}
          >
            {/* Close button */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Close lightbox"
            >
              <FiX className="w-6 h-6" />
            </button>

            {/* Navigation arrows */}
            {placeholderImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateLightbox(-1);
                  }}
                  className="absolute left-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  aria-label="Previous image"
                >
                  <FiChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateLightbox(1);
                  }}
                  className="absolute right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  aria-label="Next image"
                >
                  <FiChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Lightbox image */}
            <motion.div
              key={activeIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-[90vw] max-h-[85vh] rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {renderImage(
                placeholderImages[activeIndex],
                'max-w-[90vw] max-h-[85vh] object-contain w-auto h-auto',
                { minWidth: '300px', minHeight: '400px' }
              )}
            </motion.div>

            {/* Image counter */}
            {placeholderImages.length > 1 && (
              <div
                className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 text-white text-sm"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {activeIndex + 1} / {placeholderImages.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ImageZoom;
