import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePageContent } from '../../hooks/useSiteContent';
import api from '../../api/axios';

gsap.registerPlugin(ScrollTrigger);

const GRADIENT_FALLBACKS = [
  'linear-gradient(135deg, #C75B39 0%, #E8A87C 100%)',
  'linear-gradient(135deg, #2C2C2C 0%, #5A5A5A 100%)',
  'linear-gradient(135deg, #4A6741 0%, #8FBC8F 100%)',
  'linear-gradient(135deg, #D4A857 0%, #B8860B 100%)',
  'linear-gradient(135deg, #6B4C8A 0%, #C75B39 100%)',
];

/* ─── Framer Motion stagger variants ─── */
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const DEFAULT_GRID = { sectionTitle: 'Explore Categories' };

const CategoriesGrid = () => {
  const { content } = usePageContent('categoriesGrid', DEFAULT_GRID);
  const sectionRef = useRef(null);
  const [categories, setCategories] = useState([]);

  // Fetch real categories from API
  useEffect(() => {
    api.get('/categories')
      .then((res) => {
        const data = res.data?.data || res.data || [];
        setCategories(Array.isArray(data) ? data.filter((c) => c.isActive !== false) : []);
      })
      .catch(() => setCategories([]));
  }, []);

  /* GSAP: section title animation */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const title = sectionRef.current?.querySelector('.cat-title');
      if (title) {
        gsap.fromTo(
          title,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <div className="cat-title flex flex-col items-center mb-14">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 font-display text-primary">
            {content?.sectionTitle || DEFAULT_GRID.sectionTitle}
          </h2>
          <div className="flex items-center gap-3">
            <span className="block w-12 h-0.5 bg-accent" />
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="3" fill="#C75B39" opacity="0.6" />
            </svg>
            <span className="block w-12 h-0.5 bg-accent" />
          </div>
        </div>

        {/* Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {categories.map((cat, idx) => (
            <motion.div key={cat._id || cat.slug} variants={cardVariants}>
              <Link
                to={`/shop?category=${cat._id || cat.slug}`}
                className="group block relative overflow-hidden rounded-2xl h-64 sm:h-72"
                style={{ boxShadow: '0 4px 20px rgba(44,44,44,0.08)' }}
              >
                {/* Background: image or gradient fallback */}
                {cat.image?.url ? (
                  <img
                    src={cat.image.url}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div
                    className="absolute inset-0 transition-transform duration-500 group-hover:scale-110"
                    style={{ background: GRADIENT_FALLBACKS[idx % GRADIENT_FALLBACKS.length] }}
                  />
                )}

                {/* Dark gradient overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-end justify-end p-6 text-left z-10">
                  <h3 className="text-xl font-bold text-white mb-1 font-display w-full">
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p className="text-sm text-white/80 font-body w-full">
                      {cat.description}
                    </p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CategoriesGrid;
