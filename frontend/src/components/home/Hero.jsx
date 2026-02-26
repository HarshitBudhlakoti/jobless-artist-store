import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePageContent } from '../../hooks/useSiteContent';

gsap.registerPlugin(ScrollTrigger);

/* ─── Decorative brush-stroke SVG paths ─── */

const BrushStroke1 = () => (
  <svg
    viewBox="0 0 400 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-[300px] md:w-[400px] h-auto"
  >
    <path
      d="M10 60C10 60 50 20 100 35C150 50 170 90 220 70C270 50 300 15 350 40C400 65 390 100 390 100"
      stroke="var(--color-accent, #C75B39)"
      strokeWidth="6"
      strokeLinecap="round"
      opacity="0.25"
      fill="none"
    />
  </svg>
);

const BrushStroke2 = () => (
  <svg
    viewBox="0 0 300 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-[200px] md:w-[300px] h-auto"
  >
    <path
      d="M5 40C5 40 40 10 80 30C120 50 140 70 190 50C240 30 260 10 295 35"
      stroke="var(--color-accent-gold, #D4A857)"
      strokeWidth="5"
      strokeLinecap="round"
      opacity="0.2"
      fill="none"
    />
  </svg>
);

const BrushStroke3 = () => (
  <svg
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-[150px] md:w-[200px] h-auto"
  >
    <circle cx="100" cy="100" r="80" stroke="#C75B39" strokeWidth="3" opacity="0.12" fill="none" />
    <circle cx="100" cy="100" r="50" stroke="#D4A857" strokeWidth="2" opacity="0.10" fill="none" />
  </svg>
);

const DEFAULT_HERO = {
  heading: 'Art That Speaks Your Story',
  subtitle: 'Handcrafted paintings and bespoke art pieces that transform your emotions into timeless visual stories.',
  ctaButtons: [
    { label: 'Shop Gallery', link: '/shop' },
    { label: 'Order Custom Art', link: '/custom-order' },
  ],
};

const Hero = () => {
  const { content } = usePageContent('hero', DEFAULT_HERO);
  const HEADING_TEXT = content?.heading || DEFAULT_HERO.heading;
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const bgRef = useRef(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);

  /* ─── GSAP: character-stagger heading + subtitle + CTA + parallax ─── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      /* Parallax background on scroll */
      if (bgRef.current) {
        gsap.to(bgRef.current, {
          y: 150,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }

      /* Character stagger animation on the heading */
      const chars = headingRef.current?.querySelectorAll('.hero-char');
      if (chars && chars.length > 0) {
        gsap.fromTo(
          chars,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.03,
            ease: 'power3.out',
            delay: 0.3,
          }
        );
      }

      /* Subtitle fade-in after heading completes */
      if (subtitleRef.current) {
        gsap.fromTo(
          subtitleRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            delay: 0.3 + HEADING_TEXT.length * 0.03 + 0.2,
          }
        );
      }

      /* CTA buttons fade-in */
      if (ctaRef.current) {
        gsap.fromTo(
          ctaRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            delay: 0.3 + HEADING_TEXT.length * 0.03 + 0.6,
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  /* ─── Framer Motion variants for floating brush strokes ─── */
  const floating = (duration, rotate) => ({
    animate: {
      y: [0, -15, 0],
      rotate: [-rotate, rotate, -rotate],
      transition: { duration, repeat: Infinity, ease: 'easeInOut' },
    },
  });

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-cream"
    >
      {/* Parallax background layer */}
      <div
        ref={bgRef}
        className="absolute inset-0 -top-20"
        style={{
          background:
            'radial-gradient(ellipse at 30% 20%, rgba(199,91,57,0.08) 0%, transparent 60%), ' +
            'radial-gradient(ellipse at 70% 80%, rgba(212,168,87,0.06) 0%, transparent 50%), ' +
            'linear-gradient(180deg, #FAF7F2 0%, #F5EDE3 100%)',
        }}
      />

      {/* Floating decorative brush strokes */}
      <motion.div
        className="absolute top-10 left-4 md:top-16 md:left-16 pointer-events-none"
        variants={floating(6, 3)}
        animate="animate"
      >
        <BrushStroke1 />
      </motion.div>

      <motion.div
        className="absolute bottom-20 right-4 md:bottom-24 md:right-20 pointer-events-none"
        variants={floating(8, 5)}
        animate="animate"
      >
        <BrushStroke2 />
      </motion.div>

      <motion.div
        className="absolute top-1/3 right-8 md:right-32 pointer-events-none opacity-60"
        variants={floating(10, 2)}
        animate="animate"
      >
        <BrushStroke3 />
      </motion.div>

      {/* Tiny paint splatter accents */}
      <div className="absolute top-20 right-1/4 w-3 h-3 rounded-full bg-accent opacity-20" />
      <div className="absolute bottom-32 left-1/3 w-2 h-2 rounded-full bg-accent-gold opacity-15" />
      <div className="absolute top-1/2 left-20 w-4 h-4 rounded-full bg-accent opacity-10" />

      {/* ─── Main content ─── */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 md:py-0">
        {/* Heading — each character wrapped for GSAP stagger */}
        <h1
          ref={headingRef}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 font-display text-primary"
        >
          {HEADING_TEXT.split('').map((char, i) => (
            <span key={i} className="hero-char inline-block" style={{ opacity: 0 }}>
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </h1>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="text-lg sm:text-xl md:text-2xl max-w-2xl mx-auto mb-10 leading-relaxed font-body text-text-secondary"
          style={{ opacity: 0 }}
        >
          {content?.subtitle || DEFAULT_HERO.subtitle}
        </p>

        {/* CTA buttons */}
        <div
          ref={ctaRef}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          style={{ opacity: 0 }}
        >
          {(content?.ctaButtons || DEFAULT_HERO.ctaButtons).map((btn, idx) => (
            <Link
              key={idx}
              to={btn.link}
              className={
                idx === 0
                  ? 'inline-flex items-center px-8 py-4 text-lg font-semibold text-white rounded-xl font-body bg-accent transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'
                  : `inline-flex items-center px-8 py-4 text-lg font-semibold rounded-xl border-2 border-primary font-body transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 ${hoveredBtn === idx ? 'bg-primary text-cream' : 'bg-transparent text-primary'}`
              }
              style={idx === 0 ? { boxShadow: '0 4px 14px rgba(199,91,57,0.3)' } : undefined}
              onMouseEnter={idx > 0 ? () => setHoveredBtn(idx) : undefined}
              onMouseLeave={idx > 0 ? () => setHoveredBtn(null) : undefined}
            >
              {btn.label}
            </Link>
          ))}
        </div>

      </div>

      {/* Scroll indicator — positioned relative to the section */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#2C2C2C"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-40"
        >
          <path d="M7 10l5 5 5-5" />
        </svg>
      </motion.div>
    </section>
  );
};

export default Hero;
