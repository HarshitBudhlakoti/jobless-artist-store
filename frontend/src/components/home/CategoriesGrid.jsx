import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePageContent } from '../../hooks/useSiteContent';

gsap.registerPlugin(ScrollTrigger);

/* ─── Default category data ─── */
const DEFAULT_CATEGORIES = [
  {
    name: 'Paintings',
    slug: 'paintings',
    description: 'Original oil & acrylic works',
    gradient: 'linear-gradient(135deg, #C75B39 0%, #E8A87C 100%)',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="6" y="6" width="36" height="36" rx="4" stroke="white" strokeWidth="2.5" />
        <circle cx="18" cy="20" r="4" stroke="white" strokeWidth="2" />
        <path d="M6 32L16 24L24 30L32 20L42 28" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    name: 'Portraits',
    slug: 'portraits',
    description: 'Custom & commissioned portraits',
    gradient: 'linear-gradient(135deg, #2C2C2C 0%, #5A5A5A 100%)',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="18" r="8" stroke="white" strokeWidth="2.5" />
        <path d="M10 42C10 34 16 28 24 28C32 28 38 34 38 42" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: 'Landscapes',
    slug: 'landscapes',
    description: 'Scenic vistas and nature art',
    gradient: 'linear-gradient(135deg, #4A6741 0%, #8FBC8F 100%)',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <path d="M4 38L16 18L28 38" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 38L32 22L44 38" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="36" cy="14" r="4" stroke="white" strokeWidth="2" />
      </svg>
    ),
  },
  {
    name: 'Crafts',
    slug: 'crafts',
    description: 'Handmade artistic creations',
    gradient: 'linear-gradient(135deg, #D4A857 0%, #B8860B 100%)',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <path d="M24 6L28 18H40L30 26L34 38L24 30L14 38L18 26L8 18H20L24 6Z" stroke="white" strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    name: 'Abstract',
    slug: 'abstract',
    description: 'Bold, expressive art pieces',
    gradient: 'linear-gradient(135deg, #6B4C8A 0%, #C75B39 100%)',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="20" cy="20" r="10" stroke="white" strokeWidth="2.5" />
        <rect x="22" y="22" width="18" height="18" rx="3" stroke="white" strokeWidth="2.5" />
        <path d="M14 34L8 44" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
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

// Map slug -> icon from defaults (icons stay in code)
const ICON_MAP = {};
DEFAULT_CATEGORIES.forEach((cat) => { ICON_MAP[cat.slug] = cat.icon; });

const DEFAULT_GRID = {
  sectionTitle: 'Explore Categories',
  categories: DEFAULT_CATEGORIES.map(({ name, slug, description, gradient }) => ({ name, slug, description, gradient })),
};

const CategoriesGrid = () => {
  const { content } = usePageContent('categoriesGrid', DEFAULT_GRID);
  const sectionRef = useRef(null);

  // Merge CMS data with hardcoded icons
  const CATEGORIES = (content?.categories || DEFAULT_GRID.categories).map((cat) => ({
    ...cat,
    icon: ICON_MAP[cat.slug] || DEFAULT_CATEGORIES[0]?.icon,
    gradient: cat.gradient || 'linear-gradient(135deg, #C75B39 0%, #E8A87C 100%)',
  }));

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
          {CATEGORIES.map((cat) => (
            <motion.div key={cat.slug} variants={cardVariants}>
              <Link
                to={`/shop?category=${cat.slug}`}
                className="group block relative overflow-hidden rounded-2xl h-64 sm:h-72"
                style={{ boxShadow: '0 4px 20px rgba(44,44,44,0.08)' }}
              >
                {/* Background gradient */}
                <div
                  className="absolute inset-0 transition-transform duration-500 group-hover:scale-110"
                  style={{ background: cat.gradient }}
                />

                {/* Dark gradient overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

                {/* Decorative radial overlay */}
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.3) 0%, transparent 30%), ' +
                      'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 25%)',
                  }}
                />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
                  <div className="mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1">
                    {cat.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 font-display">
                    {cat.name}
                  </h3>
                  <p className="text-sm text-white/80 font-body opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    {cat.description}
                  </p>
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
