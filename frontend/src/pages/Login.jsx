import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import useAuth from '../hooks/useAuth';
import LoginForm from '../components/auth/LoginForm';

/* ---- Decorative SVG overlays for the artistic left panel ---- */
const BrushOverlay = () => (
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none"
    viewBox="0 0 600 900"
    preserveAspectRatio="xMidYMid slice"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Flowing brush stroke 1 */}
    <path
      d="M-20 200C80 180 160 280 240 250C320 220 360 140 440 170C520 200 560 300 620 280"
      stroke="rgba(255,255,255,0.08)"
      strokeWidth="80"
      strokeLinecap="round"
    />
    {/* Flowing brush stroke 2 */}
    <path
      d="M-40 500C60 470 140 560 220 530C300 500 340 420 420 460C500 500 540 580 640 560"
      stroke="rgba(255,255,255,0.06)"
      strokeWidth="60"
      strokeLinecap="round"
    />
    {/* Flowing brush stroke 3 */}
    <path
      d="M-10 750C90 720 170 800 250 770C330 740 370 680 450 710C530 740 570 820 650 800"
      stroke="rgba(212,168,87,0.12)"
      strokeWidth="50"
      strokeLinecap="round"
    />
    {/* Decorative circles */}
    <circle cx="120" cy="120" r="60" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
    <circle cx="480" cy="700" r="80" stroke="rgba(212,168,87,0.08)" strokeWidth="2" />
    {/* Paint splatter dots */}
    <circle cx="200" cy="350" r="4" fill="rgba(255,255,255,0.15)" />
    <circle cx="400" cy="150" r="3" fill="rgba(212,168,87,0.2)" />
    <circle cx="100" cy="600" r="5" fill="rgba(255,255,255,0.1)" />
    <circle cx="500" cy="450" r="3" fill="rgba(212,168,87,0.15)" />
    <circle cx="350" cy="800" r="4" fill="rgba(255,255,255,0.12)" />
  </svg>
);

const Login = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const pageRef = useRef(null);
  const leftPanelRef = useRef(null);
  const rightPanelRef = useRef(null);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // GSAP entrance animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (leftPanelRef.current) {
        gsap.fromTo(
          leftPanelRef.current,
          { opacity: 0, x: -40 },
          { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out' }
        );
      }
      if (rightPanelRef.current) {
        gsap.fromTo(
          rightPanelRef.current,
          { opacity: 0, x: 60 },
          { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out', delay: 0.15 }
        );
      }
    }, pageRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={pageRef} className="min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-5rem)] flex" style={{ background: '#FAF7F2' }}>
      {/* ---- Left artistic panel (hidden on mobile) ---- */}
      <div
        ref={leftPanelRef}
        className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #2C2C2C 0%, #C75B39 100%)',
        }}
      >
        <BrushOverlay />

        {/* Content overlay */}
        <div className="relative z-10 max-w-md px-12 text-center">
          {/* Brand mark */}
          <div
            className="inline-block mb-8 px-5 py-2 rounded-full border border-white/20"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            <span className="text-white/80 text-sm tracking-widest uppercase">
              Jobless Artist
            </span>
          </div>

          <h2
            className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Where Every Stroke Tells a Story
          </h2>

          <p
            className="text-white/70 text-lg leading-relaxed mb-10"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Discover handcrafted paintings that capture the essence of human
            emotion. Your walls deserve art that speaks.
          </p>

          {/* Decorative quote */}
          <div className="border-t border-white/10 pt-8">
            <blockquote
              className="text-white/60 italic text-base leading-relaxed"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              &ldquo;Art is not what you see, but what you make others see.&rdquo;
            </blockquote>
            <cite
              className="block mt-3 text-white/40 text-sm not-italic"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              &mdash; Edgar Degas
            </cite>
          </div>
        </div>
      </div>

      {/* ---- Right form panel ---- */}
      <div
        ref={rightPanelRef}
        className="w-full lg:w-1/2 flex items-center justify-center py-12 px-4 sm:px-8 relative"
      >
        {/* Subtle background for mobile */}
        <div
          className="absolute inset-0 lg:hidden"
          style={{
            background:
              'radial-gradient(ellipse at 20% 10%, rgba(199,91,57,0.06) 0%, transparent 50%), ' +
              'radial-gradient(ellipse at 80% 90%, rgba(212,168,87,0.04) 0%, transparent 40%)',
          }}
        />

        <div className="relative z-10 w-full max-w-md">
          {/* Mobile brand text */}
          <div className="lg:hidden text-center mb-8">
            <span
              className="text-sm tracking-widest uppercase"
              style={{ fontFamily: "'DM Sans', sans-serif", color: '#C75B39' }}
            >
              Jobless Artist
            </span>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Login;
