import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';

const SIZE_OPTIONS = [
  { id: 'small', label: 'Small', dimensions: '8" x 10"', w: 8, h: 10 },
  { id: 'medium', label: 'Medium', dimensions: '16" x 20"', w: 16, h: 20 },
  { id: 'large', label: 'Large', dimensions: '24" x 36"', w: 24, h: 36 },
  { id: 'custom', label: 'Custom', dimensions: 'Your choice', w: 0, h: 0 },
];

const MEDIUM_OPTIONS = [
  { id: 'oil', label: 'Oil', icon: '🎨' },
  { id: 'watercolor', label: 'Watercolor', icon: '💧' },
  { id: 'acrylic', label: 'Acrylic', icon: '🖌️' },
  { id: 'digital', label: 'Digital', icon: '🖥️' },
  { id: 'mixed', label: 'Mixed Media', icon: '✨' },
];

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

const SizeSelector = ({ size, medium, description, customWidth, customHeight, sizeUnit, onChange }) => {
  const [unit, setUnit] = useState(sizeUnit || 'inches');

  const handleSizeSelect = (sizeId) => {
    const option = SIZE_OPTIONS.find((s) => s.id === sizeId);
    onChange({
      size: sizeId,
      customWidth: sizeId === 'custom' ? customWidth || '' : option.w,
      customHeight: sizeId === 'custom' ? customHeight || '' : option.h,
      sizeUnit: unit,
    });
  };

  const handleMediumSelect = (mediumId) => {
    onChange({ medium: mediumId });
  };

  const handleDescriptionChange = (e) => {
    onChange({ description: e.target.value });
  };

  const handleCustomDimension = (field, value) => {
    const numVal = value === '' ? '' : Math.max(0, Number(value));
    onChange({ [field]: numVal, sizeUnit: unit });
  };

  const handleUnitChange = (newUnit) => {
    setUnit(newUnit);
    onChange({ sizeUnit: newUnit });
  };

  const maxDim = Math.max(...SIZE_OPTIONS.filter((s) => s.id !== 'custom').map((s) => Math.max(s.w, s.h)));

  return (
    <div className="space-y-10">
      {/* Size Selection */}
      <div>
        <h3
          className="text-xl font-semibold mb-1"
          style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C' }}
        >
          Choose Size
        </h3>
        <p className="text-sm text-gray-400 mb-5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Select a preset size or enter custom dimensions.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SIZE_OPTIONS.map((option, i) => {
            const isSelected = size === option.id;
            const scaleW = option.w > 0 ? (option.w / maxDim) * 60 : 40;
            const scaleH = option.h > 0 ? (option.h / maxDim) * 60 : 40;

            return (
              <motion.button
                key={option.id}
                type="button"
                variants={cardVariants}
                initial="initial"
                animate="animate"
                custom={i}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSizeSelect(option.id)}
                className={`relative rounded-2xl border-2 p-5 text-center transition-colors duration-200
                  ${
                    isSelected
                      ? 'border-[#C75B39] bg-[#C75B39]/[0.04]'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
              >
                {/* Checkmark */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#C75B39] flex items-center justify-center"
                  >
                    <FiCheck className="w-3.5 h-3.5 text-white" />
                  </motion.div>
                )}

                {/* Size visualization */}
                <div className="flex items-center justify-center h-20 mb-3">
                  {option.id === 'custom' ? (
                    <div className="w-14 h-14 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400 text-lg">?</span>
                    </div>
                  ) : (
                    <div
                      className="border-2 rounded-sm transition-colors duration-200"
                      style={{
                        width: `${scaleW}px`,
                        height: `${scaleH}px`,
                        borderColor: isSelected ? '#C75B39' : '#d1d5db',
                        background: isSelected ? 'rgba(199,91,57,0.06)' : 'rgba(0,0,0,0.02)',
                      }}
                    />
                  )}
                </div>

                <p
                  className="font-semibold text-sm"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    color: isSelected ? '#C75B39' : '#2C2C2C',
                  }}
                >
                  {option.label}
                </p>
                <p
                  className="text-xs text-gray-400 mt-0.5"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {option.dimensions}
                </p>
              </motion.button>
            );
          })}
        </div>

        {/* Custom size inputs */}
        {size === 'custom' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-5 p-5 rounded-xl bg-gray-50 border border-gray-200"
          >
            <div className="flex items-center gap-3 mb-4">
              <span
                className="text-sm font-medium text-[#2C2C2C]"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Unit:
              </span>
              <div className="flex rounded-lg overflow-hidden border border-gray-200">
                {['inches', 'cm'].map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => handleUnitChange(u)}
                    className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                      unit === u
                        ? 'bg-[#C75B39] text-white'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label
                  className="block text-sm text-gray-500 mb-1"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Width
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 18"
                  value={customWidth}
                  onChange={(e) => handleCustomDimension('customWidth', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm
                    focus:outline-none focus:border-[#C75B39] focus:ring-1 focus:ring-[#C75B39]/30
                    transition-colors"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                />
              </div>
              <span className="text-gray-400 mt-6 text-lg font-light">&times;</span>
              <div className="flex-1">
                <label
                  className="block text-sm text-gray-500 mb-1"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Height
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 24"
                  value={customHeight}
                  onChange={(e) => handleCustomDimension('customHeight', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm
                    focus:outline-none focus:border-[#C75B39] focus:ring-1 focus:ring-[#C75B39]/30
                    transition-colors"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                />
              </div>
              <span
                className="text-sm text-gray-400 mt-6"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {unit}
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Medium Selection */}
      <div>
        <h3
          className="text-xl font-semibold mb-1"
          style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C' }}
        >
          Preferred Medium
        </h3>
        <p className="text-sm text-gray-400 mb-5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          What medium would you like the artwork created in?
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {MEDIUM_OPTIONS.map((option, i) => {
            const isSelected = medium === option.id;
            return (
              <motion.button
                key={option.id}
                type="button"
                variants={cardVariants}
                initial="initial"
                animate="animate"
                custom={i}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleMediumSelect(option.id)}
                className={`relative rounded-xl border-2 p-4 text-center transition-colors duration-200
                  ${
                    isSelected
                      ? 'border-[#C75B39] bg-[#C75B39]/[0.04]'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
              >
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#C75B39] flex items-center justify-center"
                  >
                    <FiCheck className="w-3 h-3 text-white" />
                  </motion.div>
                )}
                <span className="text-2xl block mb-1">{option.icon}</span>
                <p
                  className="text-sm font-medium"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    color: isSelected ? '#C75B39' : '#2C2C2C',
                  }}
                >
                  {option.label}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Description / Special Instructions */}
      <div>
        <h3
          className="text-xl font-semibold mb-1"
          style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C' }}
        >
          Special Instructions
        </h3>
        <p className="text-sm text-gray-400 mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Describe your vision, color preferences, mood, or any specific details.
        </p>
        <textarea
          rows={5}
          value={description}
          onChange={handleDescriptionChange}
          placeholder="e.g., I'd love a warm sunset landscape with golden tones. The scene should evoke a sense of calm and nostalgia..."
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm resize-none
            focus:outline-none focus:border-[#C75B39] focus:ring-1 focus:ring-[#C75B39]/30
            transition-colors placeholder:text-gray-300"
          style={{ fontFamily: "'DM Sans', sans-serif", color: '#2C2C2C' }}
        />
        <p
          className="text-xs text-gray-400 mt-1 text-right"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {description.length}/1000
        </p>
      </div>
    </div>
  );
};

export default SizeSelector;
