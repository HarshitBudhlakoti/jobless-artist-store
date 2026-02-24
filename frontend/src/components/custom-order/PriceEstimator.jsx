import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiInfo } from 'react-icons/fi';
import { formatPrice } from '../../utils/helpers';

const BASE_PRICES = {
  portrait: 3000,
  landscape: 2500,
  abstract: 2000,
  illustration: 1800,
  pet_portrait: 2800,
  caricature: 1500,
  other: 2000,
};

const SIZE_MULTIPLIERS = {
  small: 1,
  medium: 1.8,
  large: 2.8,
  custom: 2,
};

const MEDIUM_MODIFIERS = {
  oil: 1500,
  watercolor: 800,
  acrylic: 1000,
  digital: 0,
  mixed: 1200,
};

const SIZE_LABELS = {
  small: '8" x 10"',
  medium: '16" x 20"',
  large: '24" x 36"',
  custom: 'Custom',
};

const MEDIUM_LABELS = {
  oil: 'Oil Paint',
  watercolor: 'Watercolor',
  acrylic: 'Acrylic',
  digital: 'Digital',
  mixed: 'Mixed Media',
};

const TYPE_LABELS = {
  portrait: 'Portrait',
  landscape: 'Landscape',
  abstract: 'Abstract',
  illustration: 'Illustration',
  pet_portrait: 'Pet Portrait',
  caricature: 'Caricature',
  other: 'Other',
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const AnimatedCounter = ({ value, duration = 1200 }) => {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);
  const frameRef = useRef(null);

  useEffect(() => {
    const start = prevRef.current;
    const end = value;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);
      setDisplay(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        prevRef.current = end;
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [value, duration]);

  return <span>{formatPrice(display)}</span>;
};

const PriceEstimator = ({ orderType, size, medium, customWidth, customHeight, sizeUnit, onChange }) => {
  const basePrice = BASE_PRICES[orderType] || BASE_PRICES.other;

  let sizeMultiplier = SIZE_MULTIPLIERS[size] || 1;
  if (size === 'custom' && customWidth && customHeight) {
    const area =
      sizeUnit === 'cm'
        ? (customWidth * customHeight) / 6.45
        : customWidth * customHeight;
    if (area <= 80) sizeMultiplier = 1;
    else if (area <= 320) sizeMultiplier = 1.8;
    else if (area <= 864) sizeMultiplier = 2.8;
    else sizeMultiplier = 3.5;
  }

  const mediumMod = MEDIUM_MODIFIERS[medium] || 0;
  const sizeComponent = Math.round(basePrice * (sizeMultiplier - 1));
  const totalEstimate = Math.round(basePrice * sizeMultiplier + mediumMod);

  useEffect(() => {
    onChange({ estimatedPrice: totalEstimate });
  }, [totalEstimate, onChange]);

  const breakdownItems = [
    { label: 'Base Price', sublabel: TYPE_LABELS[orderType] || 'Artwork', amount: basePrice },
    { label: 'Size Modifier', sublabel: SIZE_LABELS[size] || size, amount: sizeComponent },
    { label: 'Medium', sublabel: MEDIUM_LABELS[medium] || medium, amount: mediumMod },
  ];

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Type', value: TYPE_LABELS[orderType] || orderType },
          {
            label: 'Size',
            value:
              size === 'custom' && customWidth && customHeight
                ? `${customWidth}" x ${customHeight}" ${sizeUnit === 'cm' ? '(cm)' : ''}`
                : SIZE_LABELS[size] || size,
          },
          { label: 'Medium', value: MEDIUM_LABELS[medium] || medium },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="rounded-xl border border-gray-200 bg-white p-4"
          >
            <p
              className="text-xs text-gray-400 uppercase tracking-wide mb-1"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {card.label}
            </p>
            <p
              className="text-base font-semibold text-[#2C2C2C]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {card.value || '—'}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Price Breakdown */}
      <motion.div
        custom={3}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="rounded-2xl border border-gray-200 bg-white overflow-hidden"
      >
        <div className="p-6">
          <h3
            className="text-lg font-semibold mb-5"
            style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C' }}
          >
            Price Breakdown
          </h3>

          <div className="space-y-4">
            {breakdownItems.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center justify-between"
              >
                <div>
                  <p
                    className="text-sm font-medium text-[#2C2C2C]"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {item.label}
                  </p>
                  <p
                    className="text-xs text-gray-400"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {item.sublabel}
                  </p>
                </div>
                <p
                  className="text-sm font-semibold text-[#2C2C2C]"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {item.amount > 0 ? `+ ${formatPrice(item.amount)}` : 'Included'}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="border-t border-gray-100 mt-5 pt-5">
            <div className="flex items-center justify-between">
              <p
                className="text-base font-semibold text-[#2C2C2C]"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Estimated Total
              </p>
              <p
                className="text-2xl font-bold"
                style={{ fontFamily: "'DM Sans', sans-serif", color: '#C75B39' }}
              >
                <AnimatedCounter value={totalEstimate} />
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div
          className="px-6 py-4 flex items-start gap-3"
          style={{ background: 'rgba(212,168,87,0.08)' }}
        >
          <FiInfo className="w-4 h-4 text-[#D4A857] flex-shrink-0 mt-0.5" />
          <p
            className="text-xs text-gray-500 leading-relaxed"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            This is an estimate based on your selections. The final price will be
            confirmed by the artist after reviewing your reference images and
            requirements. Complex compositions may incur additional charges.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PriceEstimator;
