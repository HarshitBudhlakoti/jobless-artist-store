import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  FiHeart,
  FiStar,
  FiFeather,
  FiMessageCircle,
  FiEdit3,
  FiLayers,
  FiTruck,
  FiArrowRight,
} from 'react-icons/fi';
import AnimatedPage from '../components/common/AnimatedPage';
import SEO from '../components/common/SEO';
import { usePageContent, useSiteSettings } from '../hooks/useSiteContent';

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------------------------------------------ */
/*  Decorative SVG elements                                           */
/* ------------------------------------------------------------------ */
const BrushStrokeUnderline = () => (
  <svg viewBox="0 0 320 18" fill="none" className="w-48 md:w-72 h-auto mx-auto mt-2">
    <path
      d="M4 12C4 12 50 4 100 8C150 12 200 4 260 9C290 11 316 7 316 7"
      stroke="#C75B39"
      strokeWidth="4"
      strokeLinecap="round"
      opacity="0.5"
    />
  </svg>
);

const DecorativeCorner = ({ className = '' }) => (
  <svg viewBox="0 0 80 80" fill="none" className={`w-16 h-16 ${className}`}>
    <path d="M0 0L0 80" stroke="#D4A857" strokeWidth="2" opacity="0.35" />
    <path d="M0 0L80 0" stroke="#D4A857" strokeWidth="2" opacity="0.35" />
    <path d="M0 12L12 0" stroke="#D4A857" strokeWidth="1.5" opacity="0.2" />
  </svg>
);

const PaintSplatter = ({ className = '', color = '#C75B39', opacity = 0.12 }) => (
  <svg viewBox="0 0 60 60" fill="none" className={`absolute pointer-events-none ${className}`}>
    <circle cx="30" cy="30" r="20" fill={color} opacity={opacity} />
    <circle cx="18" cy="14" r="6" fill={color} opacity={opacity * 0.8} />
    <circle cx="46" cy="20" r="4" fill={color} opacity={opacity * 0.7} />
    <circle cx="40" cy="48" r="5" fill={color} opacity={opacity * 0.6} />
    <circle cx="12" cy="42" r="3" fill={color} opacity={opacity * 0.5} />
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Story section data                                                */
/* ------------------------------------------------------------------ */
const storySections = [
  {
    id: 'beginning',
    title: 'The Beginning',
    text: `It all started in a small, sunlit room with a single canvas and a handful of worn brushes. As a child, colors were my language — I would spend hours mixing shades, fascinated by how raw pigment could capture the fleeting warmth of a sunset or the quiet melancholy of a rainy afternoon. Art was never a career choice; it was an instinct, a calling that refused to be silenced. The "Jobless Artist" name began as a playful joke among friends, but it became a badge of honor — a declaration that passion outweighs convention.`,
    gradient: 'from-amber-200 via-orange-200 to-rose-200',
  },
  {
    id: 'journey',
    title: 'The Journey',
    text: `Over the years, the craft evolved. I experimented with acrylics, oils, watercolors, and mixed media, searching for the voice that felt most authentic. Every exhibition, every late night in the studio, every painting that ended up in someone's home taught me something new. I learned that art isn't just about technique — it's about connection. Each commission brought me closer to understanding what people truly want: not just a painting, but a mirror reflecting their memories, dreams, and emotions. The journey has been unpredictable, challenging, and utterly beautiful.`,
    gradient: 'from-violet-200 via-purple-200 to-indigo-200',
  },
  {
    id: 'vision',
    title: 'The Vision',
    text: `Today, Jobless Artist stands for something larger than one person's work. It's a philosophy: that handcrafted art should be accessible, personal, and meaningful. Every piece I create is a conversation between the artist and the one who will live with it. My vision is to build a community where art isn't locked behind gallery walls, but lives and breathes in your home, your office, your everyday spaces. I believe every wall tells a story — and I want to help you tell yours.`,
    gradient: 'from-emerald-200 via-teal-200 to-cyan-200',
  },
];

/* ------------------------------------------------------------------ */
/*  Values data                                                       */
/* ------------------------------------------------------------------ */
const values = [
  {
    icon: FiHeart,
    title: 'Handcrafted with Love',
    desc: 'Every brushstroke is intentional, every detail is cared for. No mass production — just pure, heartfelt artistry poured into every piece.',
  },
  {
    icon: FiStar,
    title: 'Every Piece is Unique',
    desc: 'Like fingerprints, no two paintings are identical. Each artwork carries its own personality, energy, and story that resonates uniquely with its owner.',
  },
  {
    icon: FiFeather,
    title: 'Your Story, Our Art',
    desc: 'We believe art should reflect you. Through custom commissions and thoughtful curation, we translate your vision into a masterpiece you will cherish forever.',
  },
];

/* ------------------------------------------------------------------ */
/*  Process steps                                                     */
/* ------------------------------------------------------------------ */
const processSteps = [
  {
    icon: FiMessageCircle,
    title: 'Consultation',
    desc: 'We discuss your vision, preferences, color palette, and the space where the art will live.',
  },
  {
    icon: FiEdit3,
    title: 'Sketching',
    desc: 'Initial concept sketches are created and shared for your feedback and approval before painting begins.',
  },
  {
    icon: FiLayers,
    title: 'Creating',
    desc: 'The painting comes to life layer by layer with premium materials, meticulous attention, and creative passion.',
  },
  {
    icon: FiTruck,
    title: 'Delivery',
    desc: 'Your finished artwork is carefully packaged, insured, and delivered safely to your doorstep anywhere in India.',
  },
];

/* ------------------------------------------------------------------ */
/*  Stats data                                                        */
/* ------------------------------------------------------------------ */
const stats = [
  { value: 0, suffix: '+', label: 'Paintings Completed' },
  { value: 0, suffix: '+', label: 'Happy Customers' },
  { value: 0, suffix: '+', label: 'Years of Experience' },
];

/* ================================================================== */
/*  ABOUT PAGE                                                        */
/* ================================================================== */
const DEFAULT_ABOUT = {
  heroTitle: 'The Story Behind Jobless Artist',
  storySections: storySections.map(({ title, text }) => ({ title, text })),
  values: values.map(({ title, desc }) => ({ title, desc })),
  processSteps: processSteps.map(({ title, desc }) => ({ title, desc })),
};

const VALUE_ICONS = [FiHeart, FiStar, FiFeather];
const PROCESS_ICONS = [FiMessageCircle, FiEdit3, FiLayers, FiTruck];

const About = () => {
  const { content } = usePageContent('aboutPage', DEFAULT_ABOUT);
  const { data: settings } = useSiteSettings();
  const artistStats = settings?.artistStats;

  const cmsStorySections = (content?.storySections || DEFAULT_ABOUT.storySections).map((s, i) => ({
    ...storySections[i],
    ...s,
    id: storySections[i]?.id || `section-${i}`,
    gradient: storySections[i]?.gradient || 'from-amber-200 via-orange-200 to-rose-200',
  }));

  const cmsValues = (content?.values || DEFAULT_ABOUT.values).map((v, i) => ({
    ...v,
    icon: VALUE_ICONS[i] || FiHeart,
  }));

  const cmsProcessSteps = (content?.processSteps || DEFAULT_ABOUT.processSteps).map((s, i) => ({
    ...s,
    icon: PROCESS_ICONS[i] || FiMessageCircle,
  }));

  const cmsStats = [
    { value: artistStats?.paintingsCreated ?? 0, suffix: '+', label: 'Paintings Completed' },
    { value: artistStats?.happyClients ?? 0, suffix: '+', label: 'Happy Customers' },
    { value: artistStats?.yearsOfPassion ?? 0, suffix: '+', label: 'Years of Experience' },
  ];

  const heroRef = useRef(null);
  const headingRef = useRef(null);
  const artistPhotoRef = useRef(null);
  const storySectionsRef = useRef([]);
  const valuesRef = useRef(null);
  const statsRef = useRef(null);
  const statsNumberRefs = useRef([]);
  const processRef = useRef(null);
  const ctaRef = useRef(null);

  /* ── GSAP animations with proper cleanup ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      /* --- Hero heading character reveal --- */
      const chars = headingRef.current?.querySelectorAll('.about-char');
      if (chars && chars.length > 0) {
        gsap.fromTo(
          chars,
          { opacity: 0, y: 50, rotateX: -40 },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.7,
            stagger: 0.025,
            ease: 'power3.out',
            delay: 0.2,
          }
        );
      }

      /* --- Artist photo parallax --- */
      if (artistPhotoRef.current) {
        gsap.fromTo(
          artistPhotoRef.current,
          { y: 60, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: artistPhotoRef.current,
              start: 'top 85%',
              end: 'top 40%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      /* --- Story sections alternating fade-in with parallax --- */
      storySectionsRef.current.forEach((section, index) => {
        if (!section) return;
        const image = section.querySelector('.story-image');
        const text = section.querySelector('.story-text');

        gsap.fromTo(
          image,
          { x: index % 2 === 0 ? -80 : 80, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 80%',
              end: 'top 30%',
              toggleActions: 'play none none reverse',
            },
          }
        );

        gsap.fromTo(
          text,
          { x: index % 2 === 0 ? 80 : -80, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 75%',
              end: 'top 25%',
              toggleActions: 'play none none reverse',
            },
          }
        );

        /* Parallax on the image */
        gsap.to(image, {
          y: -40,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        });
      });

      /* --- Values cards stagger --- */
      if (valuesRef.current) {
        const cards = valuesRef.current.querySelectorAll('.value-card');
        gsap.fromTo(
          cards,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.15,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: valuesRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      /* --- Stats counter animation --- */
      if (statsRef.current) {
        statsNumberRefs.current.forEach((el, i) => {
          if (!el) return;
          const target = cmsStats[i]?.value ?? 0;
          const obj = { val: 0 };
          gsap.to(obj, {
            val: target,
            duration: 2,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: statsRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
            onUpdate: () => {
              el.textContent = Math.round(obj.val);
            },
          });
        });
      }

      /* --- Process steps stagger --- */
      if (processRef.current) {
        const steps = processRef.current.querySelectorAll('.process-step');
        gsap.fromTo(
          steps,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.12,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: processRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      /* --- CTA section --- */
      if (ctaRef.current) {
        gsap.fromTo(
          ctaRef.current,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: ctaRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const headingText = content?.heroTitle || DEFAULT_ABOUT.heroTitle;

  return (
    <AnimatedPage>
      <SEO title="About" description="Learn the story behind Jobless Artist — handcrafted art created with passion, precision, and a deep love for artistic expression from Haldwani, India." path="/about" />
      <div ref={heroRef} style={{ background: '#FAF7F2' }}>
        {/* ============================================================ */}
        {/*  HERO SECTION                                                */}
        {/* ============================================================ */}
        <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden px-4 py-20 md:py-28">
          {/* Background decoration */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at 25% 30%, rgba(199,91,57,0.06) 0%, transparent 60%), ' +
                'radial-gradient(ellipse at 75% 70%, rgba(212,168,87,0.05) 0%, transparent 50%)',
            }}
          />
          <PaintSplatter className="w-20 h-20 top-16 left-8 md:left-24" />
          <PaintSplatter className="w-16 h-16 top-32 right-12 md:right-32" color="#D4A857" opacity={0.1} />
          <PaintSplatter className="w-12 h-12 bottom-20 left-1/4" opacity={0.08} />

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="text-sm md:text-base tracking-[0.25em] uppercase mb-6"
              style={{ fontFamily: "'DM Sans', sans-serif", color: '#C75B39' }}
            >
              About the Artist
            </motion.p>

            <h1
              ref={headingRef}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
              style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C', perspective: '600px' }}
            >
              {headingText.split('').map((char, i) => (
                <span
                  key={i}
                  className="about-char inline-block"
                  style={{ opacity: 0 }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </h1>

            <BrushStrokeUnderline />

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="text-base md:text-lg max-w-2xl mx-auto mt-8 leading-relaxed"
              style={{ fontFamily: "'DM Sans', sans-serif", color: '#5A5A5A' }}
            >
              A passion project turned into a purpose. Discover the heart, hands,
              and soul behind every painting that leaves our studio.
            </motion.p>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  ARTIST PHOTO SECTION                                        */}
        {/* ============================================================ */}
        <section className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div ref={artistPhotoRef} className="relative mx-auto max-w-xl">
            {/* Decorative frame */}
            <DecorativeCorner className="absolute -top-4 -left-4 z-10" />
            <DecorativeCorner className="absolute -top-4 -right-4 z-10 rotate-90" />
            <DecorativeCorner className="absolute -bottom-4 -left-4 z-10 -rotate-90" />
            <DecorativeCorner className="absolute -bottom-4 -right-4 z-10 rotate-180" />

            {/* Warm gradient placeholder for artist photo */}
            <div
              className="relative aspect-[4/5] rounded-2xl overflow-hidden"
              style={{
                boxShadow: '0 20px 60px rgba(44,44,44,0.12)',
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(135deg, #F5E6D3 0%, #E8C9A9 25%, #D4A87A 50%, #C4916A 75%, #B87A5E 100%)',
                }}
              />
              {/* Artist silhouette placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center opacity-30">
                  <svg className="w-24 h-24 mx-auto mb-3" viewBox="0 0 100 100" fill="none">
                    <circle cx="50" cy="35" r="18" stroke="#2C2C2C" strokeWidth="2" />
                    <path
                      d="M20 90C20 65 35 55 50 55C65 55 80 65 80 90"
                      stroke="#2C2C2C"
                      strokeWidth="2"
                      fill="none"
                    />
                    {/* Paint brush in hand */}
                    <line x1="65" y1="60" x2="85" y2="35" stroke="#C75B39" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="87" cy="33" r="3" fill="#C75B39" opacity="0.6" />
                  </svg>
                  <p
                    className="text-sm"
                    style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C' }}
                  >
                    The Artist at Work
                  </p>
                </div>
              </div>

              {/* Overlay gradient at bottom */}
              <div
                className="absolute bottom-0 left-0 right-0 h-1/3"
                style={{
                  background: 'linear-gradient(to top, rgba(44,44,44,0.4) 0%, transparent 100%)',
                }}
              />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <p
                  className="text-xl md:text-2xl font-bold"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  The Jobless Artist
                </p>
                <p
                  className="text-sm opacity-80 mt-1"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Painter &middot; Storyteller &middot; Dreamer
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  STORY SECTIONS (alternating layout with parallax)           */}
        {/* ============================================================ */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-24 md:space-y-32">
          {cmsStorySections.map((section, index) => (
            <div
              key={section.id}
              ref={(el) => (storySectionsRef.current[index] = el)}
              className={`flex flex-col gap-8 md:gap-12 items-center ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
            >
              {/* Image placeholder */}
              <div className="story-image w-full md:w-1/2 flex-shrink-0">
                <div
                  className={`relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br ${section.gradient}`}
                  style={{ boxShadow: '0 12px 40px rgba(44,44,44,0.08)' }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center opacity-25">
                      <svg className="w-16 h-16 mx-auto mb-2" viewBox="0 0 64 64" fill="none">
                        <rect x="8" y="12" width="48" height="40" rx="2" stroke="#2C2C2C" strokeWidth="2" />
                        <path d="M8 40L24 28L36 38L48 26L56 34" stroke="#2C2C2C" strokeWidth="2" fill="none" />
                        <circle cx="22" cy="24" r="4" stroke="#2C2C2C" strokeWidth="2" />
                      </svg>
                      <p className="text-xs" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        {section.title}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text content */}
              <div className="story-text w-full md:w-1/2">
                <span
                  className="inline-block text-xs tracking-[0.2em] uppercase mb-3"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: '#C75B39' }}
                >
                  Chapter {index + 1}
                </span>
                <h2
                  className="text-2xl sm:text-3xl md:text-4xl font-bold mb-5"
                  style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C' }}
                >
                  {section.title}
                </h2>
                <p
                  className="text-base md:text-lg leading-relaxed"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: '#5A5A5A' }}
                >
                  {section.text}
                </p>
              </div>
            </div>
          ))}
        </section>

        {/* ============================================================ */}
        {/*  VALUES / PHILOSOPHY SECTION                                 */}
        {/* ============================================================ */}
        <section className="relative py-20 md:py-28 overflow-hidden" style={{ background: '#2C2C2C' }}>
          <PaintSplatter className="w-24 h-24 -top-6 right-12" color="#D4A857" opacity={0.06} />
          <PaintSplatter className="w-16 h-16 bottom-10 left-16" color="#C75B39" opacity={0.05} />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span
                className="inline-block text-xs tracking-[0.25em] uppercase mb-3"
                style={{ fontFamily: "'DM Sans', sans-serif", color: '#D4A857' }}
              >
                Our Philosophy
              </span>
              <h2
                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
                style={{ fontFamily: "'Playfair Display', serif", color: '#FAF7F2' }}
              >
                What We Believe In
              </h2>
              <p
                className="max-w-xl mx-auto text-base"
                style={{ fontFamily: "'DM Sans', sans-serif", color: 'rgba(250,247,242,0.6)' }}
              >
                Every painting carries a set of values that guide our hands and hearts.
              </p>
            </div>

            <div ref={valuesRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {cmsValues.map((val, i) => {
                const Icon = val.icon;
                return (
                  <div
                    key={i}
                    className="value-card group p-8 rounded-2xl transition-all duration-300 hover:-translate-y-1"
                    style={{
                      background: 'rgba(250,247,242,0.05)',
                      border: '1px solid rgba(250,247,242,0.08)',
                    }}
                  >
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-colors duration-300"
                      style={{ background: 'rgba(199,91,57,0.15)' }}
                    >
                      <Icon className="w-6 h-6" style={{ color: '#C75B39' }} />
                    </div>
                    <h3
                      className="text-xl font-bold mb-3"
                      style={{ fontFamily: "'Playfair Display', serif", color: '#FAF7F2' }}
                    >
                      {val.title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ fontFamily: "'DM Sans', sans-serif", color: 'rgba(250,247,242,0.6)' }}
                    >
                      {val.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  STATS ROW (animated counters)                               */}
        {/* ============================================================ */}
        <section
          ref={statsRef}
          className="py-16 md:py-20"
          style={{
            background:
              'linear-gradient(180deg, #2C2C2C 0%, #3A3A3A 100%)',
          }}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 text-center">
              {cmsStats.map((stat, i) => (
                <div key={i}>
                  <div className="flex items-baseline justify-center gap-1">
                    <span
                      ref={(el) => (statsNumberRefs.current[i] = el)}
                      className="text-4xl md:text-5xl font-bold"
                      style={{ fontFamily: "'Playfair Display', serif", color: '#D4A857' }}
                    >
                      0
                    </span>
                    <span
                      className="text-2xl md:text-3xl font-bold"
                      style={{ fontFamily: "'Playfair Display', serif", color: '#D4A857' }}
                    >
                      {stat.suffix}
                    </span>
                  </div>
                  <p
                    className="mt-2 text-sm tracking-wide"
                    style={{ fontFamily: "'DM Sans', sans-serif", color: 'rgba(250,247,242,0.6)' }}
                  >
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  PROCESS SECTION - "How I Work"                              */}
        {/* ============================================================ */}
        <section className="py-20 md:py-28" style={{ background: '#FAF7F2' }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span
                className="inline-block text-xs tracking-[0.25em] uppercase mb-3"
                style={{ fontFamily: "'DM Sans', sans-serif", color: '#C75B39' }}
              >
                The Process
              </span>
              <h2
                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
                style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C' }}
              >
                How I Work
              </h2>
              <p
                className="max-w-xl mx-auto text-base"
                style={{ fontFamily: "'DM Sans', sans-serif", color: '#5A5A5A' }}
              >
                From the first conversation to the final delivery, every step is handled with care and transparency.
              </p>
            </div>

            <div ref={processRef} className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Connecting line (visible on lg+) */}
              <div
                className="hidden lg:block absolute top-[3.5rem] left-[12%] right-[12%] h-0.5"
                style={{ background: 'linear-gradient(90deg, transparent, #D4A857, #C75B39, transparent)' }}
              />

              {cmsProcessSteps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={i} className="process-step relative text-center">
                    {/* Step number circle */}
                    <div className="relative z-10 mx-auto mb-5">
                      <div
                        className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
                        style={{
                          background: '#FFFFFF',
                          boxShadow: '0 4px 20px rgba(44,44,44,0.08)',
                          border: '2px solid #D4A857',
                        }}
                      >
                        <Icon className="w-7 h-7" style={{ color: '#C75B39' }} />
                      </div>
                      <span
                        className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: '#C75B39', fontFamily: "'DM Sans', sans-serif" }}
                      >
                        {i + 1}
                      </span>
                    </div>
                    <h3
                      className="text-lg font-bold mb-2"
                      style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C' }}
                    >
                      {step.title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed max-w-[220px] mx-auto"
                      style={{ fontFamily: "'DM Sans', sans-serif", color: '#5A5A5A' }}
                    >
                      {step.desc}
                    </p>

                    {/* Arrow between steps (lg only) */}
                    {i < cmsProcessSteps.length - 1 && (
                      <FiArrowRight
                        className="hidden lg:block absolute top-[2.3rem] -right-4 w-5 h-5"
                        style={{ color: '#D4A857' }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  CTA SECTION                                                 */}
        {/* ============================================================ */}
        <section
          ref={ctaRef}
          className="relative py-20 md:py-28 overflow-hidden"
          style={{
            background:
              'linear-gradient(135deg, rgba(199,91,57,0.08) 0%, rgba(212,168,87,0.06) 50%, rgba(250,247,242,1) 100%)',
          }}
        >
          <PaintSplatter className="w-32 h-32 -top-10 -left-10" opacity={0.06} />
          <PaintSplatter className="w-24 h-24 bottom-0 right-8" color="#D4A857" opacity={0.05} />

          <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5"
              style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C' }}
            >
              Ready to Own a Piece?
            </h2>
            <p
              className="text-base md:text-lg mb-10 max-w-xl mx-auto leading-relaxed"
              style={{ fontFamily: "'DM Sans', sans-serif", color: '#5A5A5A' }}
            >
              Browse our collection of original artworks or commission a custom piece
              that tells your unique story.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  background: '#C75B39',
                  boxShadow: '0 4px 14px rgba(199,91,57,0.3)',
                }}
              >
                Shop Gallery
                <FiArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/custom-order"
                className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold rounded-xl border-2 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 hover:bg-[#2C2C2C] hover:text-[#FAF7F2]"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  color: '#2C2C2C',
                  borderColor: '#2C2C2C',
                }}
              >
                Order Custom Art
                <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </AnimatedPage>
  );
};

export default About;
