import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTestimonials } from '../../hooks/useSiteContent';

gsap.registerPlugin(ScrollTrigger);

/* ─── Star rating ─── */
const StarRating = ({ rating }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <svg key={star} width="18" height="18" viewBox="0 0 18 18" fill={star <= rating ? '#D4A857' : 'none'}>
        <path
          d="M9 1L11.2 6.4L17 7.2L12.8 11.2L13.8 17L9 14.2L4.2 17L5.2 11.2L1 7.2L6.8 6.4L9 1Z"
          stroke="#D4A857"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ))}
  </div>
);

/* ─── Decorative quote mark ─── */
const QuoteMark = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mb-4">
    <path
      d="M14 28C14 28 6 28 6 20C6 12 14 8 14 8L16 12C16 12 12 14 12 18H18V28H14ZM32 28C32 28 24 28 24 20C24 12 32 8 32 8L34 12C34 12 30 14 30 18H36V28H32Z"
      fill="#C75B39"
      opacity="0.15"
    />
  </svg>
);

/* ─── Slide animation variants ─── */
const slideVariants = {
  enter: (dir) => ({
    x: dir > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (dir) => ({
    x: dir < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ─── Main component ─── */
const Testimonials = () => {
  const { testimonials: apiTestimonials } = useTestimonials();

  // Map API data to display format
  const TESTIMONIALS = apiTestimonials.map((t) => ({
    id: t._id,
    name: t.name,
    location: t.location || '',
    quote: t.quote,
    rating: t.rating,
    initials: t.name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2),
    avatarGradient: 'linear-gradient(135deg, #C75B39, #D4A857)',
  }));

  const sectionRef = useRef(null);
  const [[current, direction], setCurrent] = useState([0, 0]);
  const timerRef = useRef(null);

  const paginate = useCallback((newDir) => {
    setCurrent(([prev]) => {
      const len = TESTIMONIALS.length || 1;
      const next =
        newDir === 1
          ? (prev + 1) % len
          : (prev - 1 + len) % len;
      return [next, newDir];
    });
  }, [TESTIMONIALS.length]);

  const goTo = useCallback((idx) => {
    setCurrent(([prev]) => [idx, idx > prev ? 1 : -1]);
  }, []);

  /* Auto-advance every 5 seconds */
  useEffect(() => {
    timerRef.current = setInterval(() => paginate(1), 5000);
    return () => clearInterval(timerRef.current);
  }, [paginate]);

  /* Reset timer on manual interaction */
  const handleManual = useCallback(
    (action) => {
      clearInterval(timerRef.current);
      action();
      timerRef.current = setInterval(() => paginate(1), 5000);
    },
    [paginate]
  );

  /* GSAP ScrollTrigger entrance */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  if (TESTIMONIALS.length === 0) return null;

  const t = TESTIMONIALS[current];

  return (
    <section ref={sectionRef} className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Section title */}
        <div className="flex flex-col items-center mb-14">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 font-display text-primary">
            What Our Collectors Say
          </h2>
          <div className="flex items-center gap-3">
            <span className="block w-12 h-0.5 bg-accent-gold" />
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L12 8L18 10L12 12L10 18L8 12L2 10L8 8L10 2Z" fill="#D4A857" opacity="0.7" />
            </svg>
            <span className="block w-12 h-0.5 bg-accent-gold" />
          </div>
        </div>

        {/* Card area */}
        <div className="relative min-h-[320px] sm:min-h-[280px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={t.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full"
            >
              <div
                className="rounded-2xl p-8 sm:p-10 text-center relative overflow-hidden bg-cream"
                style={{ boxShadow: '0 4px 24px rgba(44,44,44,0.06)' }}
              >
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-1/2 translate-x-1/2 bg-accent opacity-5" />
                <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full translate-y-1/2 -translate-x-1/2 bg-accent-gold opacity-5" />

                <div className="flex justify-center">
                  <QuoteMark />
                </div>

                <div className="flex justify-center mb-5">
                  <StarRating rating={t.rating} />
                </div>

                <p className="text-lg sm:text-xl leading-relaxed mb-8 max-w-2xl mx-auto font-body" style={{ color: '#3A3A3A' }}>
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Customer info */}
                <div className="flex items-center justify-center gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 font-body"
                    style={{ background: t.avatarGradient }}
                  >
                    {t.initials}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-base font-body text-primary">{t.name}</p>
                    <p className="text-sm font-body" style={{ color: '#8A8A8A' }}>{t.location}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Prev / next arrows */}
          <button
            onClick={() => handleManual(() => paginate(-1))}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 sm:-translate-x-6 z-10
                       w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center
                       bg-white border border-gray-200 text-primary
                       transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95"
            aria-label="Previous testimonial"
          >
            <FiChevronLeft size={20} />
          </button>
          <button
            onClick={() => handleManual(() => paginate(1))}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 sm:translate-x-6 z-10
                       w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center
                       bg-white border border-gray-200 text-primary
                       transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95"
            aria-label="Next testimonial"
          >
            <FiChevronRight size={20} />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2.5 mt-8">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => handleManual(() => goTo(i))}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === current ? 28 : 10,
                height: 10,
                background: i === current ? '#C75B39' : '#DDD',
              }}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
