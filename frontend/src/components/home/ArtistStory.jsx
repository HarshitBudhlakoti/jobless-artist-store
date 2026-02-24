import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FiHeart, FiSmile, FiAward } from 'react-icons/fi';

gsap.registerPlugin(ScrollTrigger);

/* ─── Brush stroke divider SVG ─── */
const BrushDivider = () => (
  <div className="flex justify-center my-16 md:my-20">
    <svg
      width="300"
      height="20"
      viewBox="0 0 300 20"
      fill="none"
      className="w-48 sm:w-64 md:w-[300px]"
    >
      <path
        d="M5 10C5 10 30 3 60 8C90 13 120 5 150 10C180 15 210 4 240 9C270 14 295 7 295 10"
        stroke="#C75B39"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.25"
      />
      <path
        d="M20 12C20 12 50 18 80 13C110 8 140 16 170 12C200 8 230 15 260 11C280 8 290 13 290 12"
        stroke="#D4A857"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.15"
      />
    </svg>
  </div>
);

/* ─── Stats data ─── */
const STATS = [
  { value: 0, suffix: '+', label: 'Paintings Created', icon: <FiHeart size={24} />, color: '#C75B39' },
  { value: 0, suffix: '+', label: 'Happy Clients', icon: <FiSmile size={24} />, color: '#D4A857' },
  { value: 0, suffix: '+', label: 'Years of Passion', icon: <FiAward size={24} />, color: '#4A6741' },
];

const ArtistStory = () => {
  const sectionRef = useRef(null);
  const imageRef = useRef(null);
  const textRef = useRef(null);
  const statsRef = useRef(null);
  const counterRefs = useRef([]);

  const setCounterRef = (el, i) => {
    counterRefs.current[i] = el;
  };

  /* ─── GSAP: parallax + counters + entrance ─── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      /* Parallax: image and text at different speeds */
      if (imageRef.current) {
        gsap.to(imageRef.current, {
          y: -60,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        });
      }

      if (textRef.current) {
        gsap.to(textRef.current, {
          y: -30,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5,
          },
        });
      }

      /* Section entrance */
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.8,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      /* Animated counters */
      counterRefs.current.forEach((el, i) => {
        if (!el) return;
        const target = STATS[i].value;

        gsap.fromTo(
          { val: 0 },
          { val: 0 },
          {
            val: target,
            duration: 2,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: statsRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
            onUpdate() {
              if (el) el.textContent = Math.round(this.targets()[0].val);
            },
          }
        );
      });

      /* Stats entrance stagger */
      const cards = statsRef.current?.querySelectorAll('.stat-card');
      if (cards?.length) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: statsRef.current,
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
    <>
      <BrushDivider />

      <section ref={sectionRef} className="py-10 md:py-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-cream">
        <div className="max-w-7xl mx-auto">
          {/* Section title */}
          <div className="flex flex-col items-center mb-14">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 font-display text-primary">
              About the Artist
            </h2>
            <div className="flex items-center gap-3">
              <span className="block w-12 h-0.5 bg-accent-gold" />
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2L12 8L18 10L12 12L10 18L8 12L2 10L8 8L10 2Z" fill="#D4A857" opacity="0.7" />
              </svg>
              <span className="block w-12 h-0.5 bg-accent-gold" />
            </div>
          </div>

          {/* Content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-20">
            {/* Left: artist photo placeholder */}
            <div ref={imageRef} className="relative">
              <div
                className="w-full aspect-[3/4] max-w-md mx-auto rounded-2xl overflow-hidden relative"
                style={{ boxShadow: '0 8px 40px rgba(44,44,44,0.12)' }}
              >
                {/* Warm gradient placeholder */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(160deg, #D4A857 0%, #C75B39 40%, #8B6914 70%, #2C2C2C 100%)',
                  }}
                />

                {/* Artistic texture overlay */}
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 40% 30%, rgba(255,255,255,0.4) 0%, transparent 40%), ' +
                      'radial-gradient(circle at 70% 70%, rgba(0,0,0,0.2) 0%, transparent 35%)',
                  }}
                />

                {/* Artist silhouette hint */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="opacity-20">
                    <circle cx="60" cy="40" r="22" stroke="white" strokeWidth="3" />
                    <path d="M20 110C20 85 38 68 60 68C82 68 100 85 100 110" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    <path d="M78 75L100 45" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                    <ellipse cx="103" cy="42" rx="5" ry="3" fill="white" opacity="0.5" transform="rotate(-55, 103, 42)" />
                  </svg>
                </div>

                {/* Label */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div
                    className="inline-block px-4 py-2 rounded-lg text-sm text-white/80 font-body"
                    style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
                  >
                    Artist at work
                  </div>
                </div>
              </div>

              {/* Decorative frame */}
              <div className="absolute -top-4 -left-4 w-full h-full rounded-2xl border-2 -z-10 hidden lg:block" style={{ borderColor: 'rgba(212,168,87,0.2)' }} />

              {/* Floating blob */}
              <motion.div
                className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full hidden lg:block"
                style={{ background: 'rgba(199,91,57,0.08)' }}
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
                transition={{ duration: 6, repeat: Infinity }}
              />
            </div>

            {/* Right: story text */}
            <div ref={textRef}>
              <h3 className="text-2xl sm:text-3xl font-bold mb-6 leading-snug font-display text-primary">
                Meet the Artist{' '}
                <span className="text-accent">Behind the Canvas</span>
              </h3>

              <div className="space-y-5">
                <p className="text-lg leading-relaxed font-body text-text-secondary">
                  What started as a quiet rebellion against the corporate world became a
                  lifelong love affair with colour, texture, and storytelling. Armed with
                  a brush and an unshakeable belief that art should be felt, not just
                  seen, the &ldquo;Jobless Artist&rdquo; was born.
                </p>

                <p className="text-lg leading-relaxed font-body text-text-secondary">
                  Every painting is a conversation -- between the artist and the canvas,
                  between the brushstroke and the viewer. From vibrant abstracts that
                  pulse with energy to tender portraits that whisper of quiet moments,
                  each piece carries a fragment of a shared human experience.
                </p>

                <p className="text-lg leading-relaxed font-body text-text-secondary">
                  The journey continues -- one brushstroke at a time, building a
                  community of collectors who have become family.
                </p>
              </div>

              {/* Signature line */}
              <div className="mt-8 flex items-center gap-4">
                <div className="w-16 h-0.5 bg-accent" />
                <span className="text-lg italic font-display text-accent">
                  Creating with love
                </span>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div ref={statsRef} className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-3xl mx-auto">
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                className="stat-card text-center p-6 sm:p-8 rounded-2xl bg-white"
                style={{ boxShadow: '0 4px 20px rgba(44,44,44,0.06)' }}
              >
                <div
                  className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
                  style={{ background: `${stat.color}12`, color: stat.color }}
                >
                  {stat.icon}
                </div>

                <div className="flex items-baseline justify-center gap-0.5 mb-2">
                  <span
                    ref={(el) => setCounterRef(el, i)}
                    className="text-3xl sm:text-4xl font-bold font-display text-primary"
                  >
                    0
                  </span>
                  <span
                    className="text-2xl sm:text-3xl font-bold font-display"
                    style={{ color: stat.color }}
                  >
                    {stat.suffix}
                  </span>
                </div>

                <p className="text-sm font-medium font-body" style={{ color: '#8A8A8A' }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default ArtistStory;
