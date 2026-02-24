import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import { FiArrowRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import api from '../../api/axios';
import { formatPrice } from '../../utils/helpers';

import 'swiper/css';
import 'swiper/css/navigation';

gsap.registerPlugin(ScrollTrigger);


/* ─── Tilt Card ─── */
const TiltCard = ({ item }) => {
  const cardRef = useRef(null);
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const rotateX = useTransform(y, [0, 1], [8, -8]);
  const rotateY = useTransform(x, [0, 1], [-8, 8]);

  const handleMouseMove = (e) => {
    const rect = cardRef.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width);
    y.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    x.set(0.5);
    y.set(0.5);
  };

  /* Determine image source: real URL or gradient placeholder */
  const hasImage = item.images?.length > 0;

  return (
    <motion.div
      ref={cardRef}
      className="group cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 800 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div
        className="bg-white rounded-2xl overflow-hidden transition-shadow duration-300"
        style={{ boxShadow: '0 4px 20px rgba(44,44,44,0.08)' }}
      >
        {/* Image / gradient placeholder */}
        <div className="w-full h-64 sm:h-72 relative overflow-hidden">
          {hasImage ? (
            <img
              src={item.images[0]}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{ background: item.gradient || 'linear-gradient(135deg, #C75B39, #D4A857)' }}
            />
          )}

          {/* Paint texture overlay */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.4) 0%, transparent 50%), ' +
                'radial-gradient(circle at 70% 60%, rgba(0,0,0,0.1) 0%, transparent 40%)',
            }}
          />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
            <span
              className="font-body text-white font-medium px-4 py-2 rounded-lg opacity-0
                         group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: 'rgba(44,44,44,0.7)', backdropFilter: 'blur(4px)' }}
            >
              View Details
            </span>
          </div>
        </div>

        {/* Card info */}
        <div className="p-5">
          <h3 className="text-lg font-semibold mb-1 truncate font-display text-primary">
            {item.title}
          </h3>
          <p className="text-sm mb-3 font-body text-text-secondary">
            {item.medium}
          </p>
          <p className="text-lg font-bold font-body text-accent">
            {formatPrice(item.price)}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

/* ─── Section title with decorative line ─── */
const SectionTitle = ({ children }) => (
  <div className="flex flex-col items-center mb-12">
    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 font-display text-primary">
      {children}
    </h2>
    <div className="flex items-center gap-3">
      <span className="block w-12 h-0.5 bg-accent-gold" />
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M10 2L12 8L18 10L12 12L10 18L8 12L2 10L8 8L10 2Z"
          fill="#D4A857"
          opacity="0.7"
        />
      </svg>
      <span className="block w-12 h-0.5 bg-accent-gold" />
    </div>
  </div>
);

/* ─── Main component ─── */
const FeaturedWorks = () => {
  const sectionRef = useRef(null);
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const [works, setWorks] = useState([]);

  /* Fetch from API with mock fallback */
  useEffect(() => {
    let cancelled = false;
    const fetchFeatured = async () => {
      try {
        const { data } = await api.get('/products/featured');
        if (!cancelled && data?.length > 0) {
          setWorks(data);
        }
      } catch {
        /* No data available */
      }
    };
    fetchFeatured();
    return () => { cancelled = true; };
  }, []);

  /* GSAP ScrollTrigger: fade in from bottom */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
            end: 'top 50%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  if (works.length === 0) return null;

  return (
    <section ref={sectionRef} className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-cream">
      <div className="max-w-7xl mx-auto">
        <SectionTitle>Featured Works</SectionTitle>

        {/* Swiper carousel */}
        <div className="relative">
          <Swiper
            modules={[Autoplay, Navigation]}
            spaceBetween={24}
            slidesPerView={1}
            loop={works.length > 3}
            autoplay={{ delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }}
            navigation={{
              prevEl: prevRef.current,
              nextEl: nextRef.current,
            }}
            onBeforeInit={(swiper) => {
              if (swiper.params.navigation && typeof swiper.params.navigation !== 'boolean') {
                swiper.params.navigation.prevEl = prevRef.current;
                swiper.params.navigation.nextEl = nextRef.current;
              }
            }}
            onInit={(swiper) => {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
              swiper.navigation.init();
              swiper.navigation.update();
            }}
            breakpoints={{
              480: { slidesPerView: 1.5 },
              640: { slidesPerView: 2 },
              900: { slidesPerView: 3 },
              1200: { slidesPerView: 4 },
            }}
            className="!pb-4"
          >
            {works.map((item) => (
              <SwiperSlide key={item._id}>
                <Link to={`/product/${item._id}`}>
                  <TiltCard item={item} />
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom navigation arrows */}
          <button
            ref={prevRef}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10
                       w-11 h-11 rounded-full items-center justify-center
                       bg-white border border-gray-200 text-primary
                       transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95
                       hidden md:flex"
            aria-label="Previous slide"
          >
            <FiChevronLeft size={20} />
          </button>
          <button
            ref={nextRef}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10
                       w-11 h-11 rounded-full items-center justify-center
                       bg-white border border-gray-200 text-primary
                       transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95
                       hidden md:flex"
            aria-label="Next slide"
          >
            <FiChevronRight size={20} />
          </button>
        </div>

        {/* View All link */}
        <div className="mt-12 text-center">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-lg font-semibold font-body text-accent
                       transition-all duration-300 hover:gap-4 group"
          >
            View All Works
            <FiArrowRight
              size={20}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedWorks;
