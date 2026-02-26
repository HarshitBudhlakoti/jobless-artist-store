import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FiArrowRight } from 'react-icons/fi';
import { usePageContent } from '../../hooks/useSiteContent';

gsap.registerPlugin(ScrollTrigger);

/* ─── Animated Easel SVG Illustration ─── */
const EaselIllustration = () => (
  <div className="relative w-full max-w-md mx-auto">
    <svg
      viewBox="0 0 400 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto"
    >
      {/* Easel legs */}
      <line x1="120" y1="200" x2="80" y2="480" stroke="#5A4A3A" strokeWidth="6" strokeLinecap="round" />
      <line x1="280" y1="200" x2="320" y2="480" stroke="#5A4A3A" strokeWidth="6" strokeLinecap="round" />
      <line x1="200" y1="280" x2="200" y2="480" stroke="#5A4A3A" strokeWidth="5" strokeLinecap="round" />

      {/* Crossbar */}
      <line x1="105" y1="350" x2="295" y2="350" stroke="#5A4A3A" strokeWidth="4" strokeLinecap="round" />

      {/* Canvas shelf */}
      <line x1="100" y1="280" x2="300" y2="280" stroke="#6B5B4A" strokeWidth="6" strokeLinecap="round" />

      {/* Canvas frame */}
      <rect x="110" y="60" width="180" height="220" rx="4" fill="#FFFFFF" stroke="#8B7355" strokeWidth="3" />

      {/* Inner canvas area */}
      <rect x="120" y="70" width="160" height="200" rx="2" fill="#FFF8F0" />

      {/* Paint appearing on canvas (SVG SMIL animation) */}
      <g>
        {/* Sky wash */}
        <rect x="120" y="70" width="160" height="80" rx="2" fill="#E8D5B7" opacity="0">
          <animate attributeName="opacity" from="0" to="0.6" dur="2s" begin="0.5s" fill="freeze" />
        </rect>

        {/* Mountains */}
        <path d="M120 150L160 100L200 140L240 90L280 130L280 170L120 170Z" fill="#8B7355" opacity="0">
          <animate attributeName="opacity" from="0" to="0.5" dur="2s" begin="1.5s" fill="freeze" />
        </path>

        {/* Sun */}
        <circle cx="250" cy="100" r="15" fill="#D4A857" opacity="0">
          <animate attributeName="opacity" from="0" to="0.7" dur="1.5s" begin="2.5s" fill="freeze" />
        </circle>

        {/* Green foreground */}
        <path d="M120 170L280 170L280 270L120 270Z" fill="#6B8E5A" opacity="0">
          <animate attributeName="opacity" from="0" to="0.4" dur="2s" begin="2s" fill="freeze" />
        </path>

        {/* Tree */}
        <g opacity="0">
          <animate attributeName="opacity" from="0" to="0.6" dur="1.5s" begin="3s" fill="freeze" />
          <line x1="170" y1="200" x2="170" y2="250" stroke="#5A4A3A" strokeWidth="4" />
          <circle cx="170" cy="195" r="18" fill="#4A6741" />
        </g>

        {/* Flowers */}
        <g opacity="0">
          <animate attributeName="opacity" from="0" to="0.8" dur="1s" begin="3.5s" fill="freeze" />
          <circle cx="220" cy="240" r="4" fill="#C75B39" />
          <circle cx="235" cy="248" r="3" fill="#D4A857" />
          <circle cx="210" cy="252" r="3.5" fill="#C75B39" />
          <circle cx="245" cy="238" r="3" fill="#E88B73" />
        </g>
      </g>

      {/* Paint palette */}
      <g>
        <ellipse cx="340" cy="320" rx="35" ry="28" fill="#8B7355" opacity="0.8" />
        <ellipse cx="340" cy="318" rx="32" ry="25" fill="#A08060" />
        <circle cx="330" cy="308" r="5" fill="#C75B39" />
        <circle cx="345" cy="310" r="4" fill="#D4A857" />
        <circle cx="355" cy="318" r="4" fill="#4A6741" />
        <circle cx="340" cy="325" r="4" fill="#2C2C2C" />
        <circle cx="325" cy="320" r="3.5" fill="#6B4C8A" />
        <ellipse cx="340" cy="335" rx="6" ry="5" fill="#FAF7F2" />
      </g>

      {/* Paint brush */}
      <g transform="rotate(-25, 360, 280)">
        <rect x="355" y="240" width="4" height="50" rx="2" fill="#D4A857" />
        <rect x="353" y="230" width="8" height="15" rx="2" fill="#8B7355" />
        <rect x="354" y="225" width="6" height="8" rx="1" fill="#C75B39" />
      </g>
    </svg>

    {/* Floating sparkle accents */}
    <motion.div
      className="absolute top-10 right-10"
      animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
      transition={{ duration: 3, repeat: Infinity }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5L8 0Z" fill="#D4A857" opacity="0.6" />
      </svg>
    </motion.div>

    <motion.div
      className="absolute bottom-20 left-5"
      animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.3, 1] }}
      transition={{ duration: 4, repeat: Infinity, delay: 1 }}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M6 0L7 5L12 6L7 7L6 12L5 7L0 6L5 5L6 0Z" fill="#C75B39" opacity="0.5" />
      </svg>
    </motion.div>
  </div>
);

/* ─── Brush-stroke background texture ─── */
const BrushTexture = () => (
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none"
    viewBox="0 0 1200 600"
    fill="none"
    preserveAspectRatio="xMidYMid slice"
  >
    <path
      d="M0 300C100 280 200 320 400 290C600 260 700 340 900 300C1100 260 1150 310 1200 300"
      stroke="#C75B39" strokeWidth="2" opacity="0.06"
    />
    <path
      d="M0 200C150 220 300 180 500 210C700 240 850 170 1000 200C1100 220 1180 190 1200 200"
      stroke="#D4A857" strokeWidth="1.5" opacity="0.05"
    />
    <path
      d="M0 400C200 380 350 420 500 390C650 360 800 430 1000 400C1100 380 1150 410 1200 400"
      stroke="#C75B39" strokeWidth="1.5" opacity="0.04"
    />
  </svg>
);

const DEFAULT_CTA = {
  heading: 'Your Vision,',
  headingAccent: 'Our Canvas',
  paragraph1: 'Every great piece of art begins with a story. Share yours with us, and we will transform it into a one-of-a-kind masterpiece that captures the emotions, memories, and moments that matter most to you.',
  paragraph2: 'From intimate portraits to sprawling landscapes, our artist works closely with you at every step -- from concept sketches to the final brushstroke.',
  features: ['Personalized Consultation', 'Progress Updates', 'Satisfaction Guaranteed'],
  ctaText: 'Start Your Commission',
};

/* ─── Main component ─── */
const CustomOrderCTA = () => {
  const { content } = usePageContent('customOrderCTA', DEFAULT_CTA);
  const sectionRef = useRef(null);
  const leftRef = useRef(null);
  const rightRef = useRef(null);

  /* GSAP: sides animate in from left / right */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const trigger = {
        trigger: sectionRef.current,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      };

      gsap.fromTo(
        leftRef.current,
        { opacity: 0, x: -80 },
        { opacity: 1, x: 0, duration: 1, ease: 'power3.out', scrollTrigger: trigger }
      );

      gsap.fromTo(
        rightRef.current,
        { opacity: 0, x: 80 },
        { opacity: 1, x: 0, duration: 1, ease: 'power3.out', scrollTrigger: { ...trigger } }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const features = content?.features || DEFAULT_CTA.features;

  return (
    <section
      ref={sectionRef}
      className="relative py-20 md:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-cream"
    >
      <BrushTexture />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: illustration */}
          <div ref={leftRef} className="order-2 lg:order-1">
            <EaselIllustration />
          </div>

          {/* Right: text */}
          <div ref={rightRef} className="order-1 lg:order-2 text-center lg:text-left">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full"
              style={{ background: 'rgba(199,91,57,0.08)' }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L10 6L15 7L11 11L12 16L8 13L4 16L5 11L1 7L6 6L8 1Z" fill="#C75B39" />
              </svg>
              <span className="text-sm font-medium font-body text-accent">
                Custom Commissions
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight font-display text-primary">
              {content?.heading || DEFAULT_CTA.heading}{' '}
              <span className="text-accent">{content?.headingAccent || DEFAULT_CTA.headingAccent}</span>
            </h2>

            <p className="text-lg mb-4 leading-relaxed font-body text-text-secondary">
              {content?.paragraph1 || DEFAULT_CTA.paragraph1}
            </p>

            <p className="text-base mb-8 leading-relaxed font-body" style={{ color: '#8A8A8A' }}>
              {content?.paragraph2 || DEFAULT_CTA.paragraph2}
            </p>

            {/* Features */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 mb-10 justify-center lg:justify-start">
              {features.map((feat) => (
                <div key={feat} className="flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="10" fill="#C75B39" opacity="0.1" />
                    <path d="M6 10L9 13L14 7" stroke="#C75B39" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-sm font-medium font-body text-primary">{feat}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <Link
              to="/custom-order"
              className="inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold text-white
                         rounded-xl bg-accent font-body transition-all duration-300
                         hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 group"
              style={{ boxShadow: '0 4px 14px rgba(199,91,57,0.3)' }}
            >
              {content?.ctaText || DEFAULT_CTA.ctaText}
              <FiArrowRight size={20} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomOrderCTA;
