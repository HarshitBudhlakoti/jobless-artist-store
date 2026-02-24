import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiChevronLeft, FiChevronRight, FiSend, FiImage, FiType, FiMaximize, FiDollarSign, FiClipboard } from 'react-icons/fi';
import api from '../../api/axios';
import ReferenceUpload from './ReferenceUpload';
import SizeSelector from './SizeSelector';
import PriceEstimator from './PriceEstimator';

const STEPS = [
  { id: 1, label: 'Select Type', icon: FiType },
  { id: 2, label: 'Upload Reference', icon: FiImage },
  { id: 3, label: 'Specify Details', icon: FiMaximize },
  { id: 4, label: 'Price Estimate', icon: FiDollarSign },
  { id: 5, label: 'Review & Submit', icon: FiClipboard },
];

const ART_TYPES = [
  { id: 'portrait', label: 'Portrait', description: 'A detailed likeness of a person' },
  { id: 'landscape', label: 'Landscape', description: 'Natural scenery and vistas' },
  { id: 'abstract', label: 'Abstract', description: 'Non-representational shapes and colors' },
  { id: 'illustration', label: 'Illustration', description: 'Creative graphic or storybook art' },
  { id: 'pet_portrait', label: 'Pet Portrait', description: 'A beautiful portrait of your pet' },
  { id: 'caricature', label: 'Caricature', description: 'Fun, exaggerated likeness' },
];

const TYPE_LABELS = {
  portrait: 'Portrait',
  landscape: 'Landscape',
  abstract: 'Abstract',
  illustration: 'Illustration',
  pet_portrait: 'Pet Portrait',
  caricature: 'Caricature',
  other: 'Other',
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

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (direction) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  }),
};

const CustomOrderForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    orderType: '',
    description: '',
    referenceImages: [],
    size: '',
    medium: '',
    customWidth: '',
    customHeight: '',
    sizeUnit: 'inches',
    estimatedPrice: 0,
  });

  const updateForm = useCallback((updates) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!formData.orderType;
      case 2:
        return true; // Reference images are optional
      case 3:
        return !!formData.size && !!formData.medium;
      case 4:
        return formData.estimatedPrice > 0;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const goNext = () => {
    if (currentStep < 5 && canProceed()) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        orderType: formData.orderType,
        description: formData.description,
        referenceImages: formData.referenceImages,
        size: formData.size,
        customWidth: formData.customWidth,
        customHeight: formData.customHeight,
        sizeUnit: formData.sizeUnit,
        medium: formData.medium,
        estimatedPrice: formData.estimatedPrice,
      };

      await api.post('/custom-orders', payload);
      setSubmitted(true);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Success State
  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="text-center py-16 px-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
          className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{ background: 'rgba(34,197,94,0.1)' }}
        >
          <motion.div
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <FiCheck className="w-10 h-10 text-green-500" strokeWidth={3} />
          </motion.div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-3xl font-bold mb-3"
          style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C' }}
        >
          Order Submitted!
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-gray-500 max-w-md mx-auto mb-8"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Thank you for your custom art request. The artist will review your
          details and get back to you within 24-48 hours with a final quote.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setCurrentStep(1);
              setFormData({
                orderType: '',
                description: '',
                referenceImages: [],
                size: '',
                medium: '',
                customWidth: '',
                customHeight: '',
                sizeUnit: 'inches',
                estimatedPrice: 0,
              });
            }}
            className="px-6 py-3 rounded-xl border-2 border-[#2C2C2C] text-[#2C2C2C] font-semibold
              hover:bg-[#2C2C2C] hover:text-white transition-colors duration-300"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Create Another Order
          </button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-10">
        {/* Step indicators */}
        <div className="flex items-center justify-between mb-3">
          {STEPS.map((step, index) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            const Icon = step.icon;

            return (
              <div key={step.id} className="flex items-center flex-1 last:flex-initial">
                <div className="flex flex-col items-center">
                  <motion.div
                    animate={
                      isCurrent
                        ? {
                            boxShadow: [
                              '0 0 0 0 rgba(199,91,57,0.3)',
                              '0 0 0 8px rgba(199,91,57,0)',
                            ],
                          }
                        : {}
                    }
                    transition={
                      isCurrent
                        ? { duration: 1.5, repeat: Infinity, ease: 'easeOut' }
                        : {}
                    }
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                      transition-colors duration-300 ${
                        isCompleted
                          ? 'bg-[#C75B39] text-white'
                          : isCurrent
                          ? 'bg-[#C75B39] text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                  >
                    {isCompleted ? (
                      <FiCheck className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </motion.div>
                  <span
                    className={`text-xs mt-2 hidden sm:block whitespace-nowrap ${
                      isCurrent ? 'text-[#C75B39] font-semibold' : 'text-gray-400'
                    }`}
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connector line */}
                {index < STEPS.length - 1 && (
                  <div className="flex-1 h-0.5 mx-2 mt-[-1.25rem] sm:mt-0 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: '#C75B39' }}
                      initial={{ width: '0%' }}
                      animate={{
                        width: isCompleted ? '100%' : isCurrent ? '50%' : '0%',
                      }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Overall progress bar */}
        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #C75B39, #D4A857)' }}
            animate={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="relative overflow-hidden min-h-[400px]">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            {/* Step 1: Select Type */}
            {currentStep === 1 && (
              <div>
                <h2
                  className="text-2xl font-bold mb-2"
                  style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C' }}
                >
                  What type of art would you like?
                </h2>
                <p
                  className="text-gray-400 mb-8"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Choose the category that best describes your desired artwork.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ART_TYPES.map((type, i) => {
                    const isSelected = formData.orderType === type.id;
                    return (
                      <motion.button
                        key={type.id}
                        type="button"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          transition: { delay: i * 0.06 },
                        }}
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => updateForm({ orderType: type.id })}
                        className={`relative text-left rounded-2xl border-2 p-5 transition-colors duration-200 ${
                          isSelected
                            ? 'border-[#C75B39] bg-[#C75B39]/[0.04]'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#C75B39] flex items-center justify-center"
                          >
                            <FiCheck className="w-3.5 h-3.5 text-white" />
                          </motion.div>
                        )}

                        <div
                          className="w-12 h-12 rounded-xl mb-3 flex items-center justify-center"
                          style={{
                            background: isSelected
                              ? 'rgba(199,91,57,0.1)'
                              : 'rgba(44,44,44,0.04)',
                          }}
                        >
                          <span className="text-2xl">
                            {type.id === 'portrait'
                              ? '👤'
                              : type.id === 'landscape'
                              ? '🏞️'
                              : type.id === 'abstract'
                              ? '🎨'
                              : type.id === 'illustration'
                              ? '✏️'
                              : type.id === 'pet_portrait'
                              ? '🐾'
                              : '😄'}
                          </span>
                        </div>

                        <p
                          className="font-semibold text-sm mb-1"
                          style={{
                            fontFamily: "'DM Sans', sans-serif",
                            color: isSelected ? '#C75B39' : '#2C2C2C',
                          }}
                        >
                          {type.label}
                        </p>
                        <p
                          className="text-xs text-gray-400 leading-relaxed"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          {type.description}
                        </p>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Upload References */}
            {currentStep === 2 && (
              <div>
                <h2
                  className="text-2xl font-bold mb-2"
                  style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C' }}
                >
                  Upload Reference Images
                </h2>
                <p
                  className="text-gray-400 mb-8"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Share images that inspire your vision. This helps the artist
                  understand your expectations.
                </p>

                <ReferenceUpload
                  referenceImages={formData.referenceImages}
                  onChange={(images) => updateForm({ referenceImages: images })}
                />
              </div>
            )}

            {/* Step 3: Size & Medium */}
            {currentStep === 3 && (
              <div>
                <h2
                  className="text-2xl font-bold mb-2"
                  style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C' }}
                >
                  Specify Details
                </h2>
                <p
                  className="text-gray-400 mb-8"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Choose your preferred size, medium, and add any special instructions.
                </p>

                <SizeSelector
                  size={formData.size}
                  medium={formData.medium}
                  description={formData.description}
                  customWidth={formData.customWidth}
                  customHeight={formData.customHeight}
                  sizeUnit={formData.sizeUnit}
                  onChange={updateForm}
                />
              </div>
            )}

            {/* Step 4: Price Estimate */}
            {currentStep === 4 && (
              <div>
                <h2
                  className="text-2xl font-bold mb-2"
                  style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C' }}
                >
                  Price Estimate
                </h2>
                <p
                  className="text-gray-400 mb-8"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Here is an estimated price based on your selections.
                </p>

                <PriceEstimator
                  orderType={formData.orderType}
                  size={formData.size}
                  medium={formData.medium}
                  customWidth={formData.customWidth}
                  customHeight={formData.customHeight}
                  sizeUnit={formData.sizeUnit}
                  onChange={updateForm}
                />
              </div>
            )}

            {/* Step 5: Review & Submit */}
            {currentStep === 5 && (
              <div>
                <h2
                  className="text-2xl font-bold mb-2"
                  style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C' }}
                >
                  Review Your Order
                </h2>
                <p
                  className="text-gray-400 mb-8"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Please review all details before submitting your custom art request.
                </p>

                <div className="space-y-5">
                  {/* Review cards */}
                  {[
                    {
                      label: 'Art Type',
                      value: TYPE_LABELS[formData.orderType] || formData.orderType,
                      step: 1,
                    },
                    {
                      label: 'Reference Images',
                      value: formData.referenceImages.length > 0
                        ? `${formData.referenceImages.length} image${formData.referenceImages.length > 1 ? 's' : ''} uploaded`
                        : 'None uploaded',
                      step: 2,
                    },
                    {
                      label: 'Size',
                      value:
                        formData.size === 'custom' && formData.customWidth && formData.customHeight
                          ? `Custom (${formData.customWidth}" x ${formData.customHeight}")`
                          : SIZE_LABELS[formData.size] || formData.size,
                      step: 3,
                    },
                    {
                      label: 'Medium',
                      value: MEDIUM_LABELS[formData.medium] || formData.medium,
                      step: 3,
                    },
                    {
                      label: 'Description',
                      value: formData.description || 'No special instructions',
                      step: 3,
                    },
                  ].map((item, i) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        transition: { delay: i * 0.07 },
                      }}
                      className="flex items-start justify-between p-4 rounded-xl bg-white border border-gray-200"
                    >
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-xs text-gray-400 uppercase tracking-wide mb-1"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          {item.label}
                        </p>
                        <p
                          className="text-sm font-medium text-[#2C2C2C] break-words"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          {item.value}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setDirection(-1);
                          setCurrentStep(item.step);
                        }}
                        className="ml-4 text-xs text-[#C75B39] hover:underline flex-shrink-0"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        Edit
                      </button>
                    </motion.div>
                  ))}

                  {/* Reference image thumbnails in review */}
                  {formData.referenceImages.length > 0 && (
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {formData.referenceImages.map((url, i) => (
                        <img
                          key={url}
                          src={url}
                          alt={`Reference ${i + 1}`}
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0 border border-gray-200"
                        />
                      ))}
                    </div>
                  )}

                  {/* Estimated Price */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}
                    className="p-5 rounded-xl border-2 border-[#C75B39]/20"
                    style={{ background: 'rgba(199,91,57,0.03)' }}
                  >
                    <div className="flex items-center justify-between">
                      <p
                        className="text-sm font-semibold text-[#2C2C2C]"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        Estimated Price
                      </p>
                      <p
                        className="text-xl font-bold"
                        style={{ fontFamily: "'DM Sans', sans-serif", color: '#C75B39' }}
                      >
                        {new Intl.NumberFormat('en-IN', {
                          style: 'currency',
                          currency: 'INR',
                          minimumFractionDigits: 0,
                        }).format(formData.estimatedPrice)}
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="text-sm text-red-500 text-center mt-4"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
        <button
          type="button"
          onClick={goBack}
          disabled={currentStep === 1}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm
            transition-colors duration-200 ${
              currentStep === 1
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-[#2C2C2C] hover:bg-gray-100'
            }`}
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          <FiChevronLeft className="w-4 h-4" />
          Back
        </button>

        {currentStep < 5 ? (
          <button
            type="button"
            onClick={goNext}
            disabled={!canProceed()}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm
              text-white transition-all duration-200 ${
                canProceed()
                  ? 'bg-[#C75B39] hover:shadow-lg hover:shadow-[#C75B39]/20 hover:-translate-y-0.5'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Next
            <FiChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm
              text-white bg-[#C75B39] hover:shadow-lg hover:shadow-[#C75B39]/20 hover:-translate-y-0.5
              transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {submitting ? (
              <>
                <svg
                  className="animate-spin w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Submitting...
              </>
            ) : (
              <>
                Submit Order
                <FiSend className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default CustomOrderForm;
