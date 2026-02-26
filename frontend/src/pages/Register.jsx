import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import useAuth from '../hooks/useAuth';
import RegisterForm from '../components/auth/RegisterForm';

/* ---- Decorative SVG overlays for the artistic left panel ---- */
const BrushOverlay = () => (
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none"
    viewBox="0 0 600 900"
    preserveAspectRatio="xMidYMid slice"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Flowing brush strokes */}
    <path
      d="M620 150C520 170 440 100 360 130C280 160 240 240 160 210C80 180 20 260 -40 240"
      stroke="rgba(255,255,255,0.07)"
      strokeWidth="70"
      strokeLinecap="round"
    />
    <path
      d="M640 450C540 420 460 500 380 470C300 440 260 380 180 410C100 440 40 520 -40 500"
      stroke="rgba(212,168,87,0.1)"
      strokeWidth="55"
      strokeLinecap="round"
    />
    <path
      d="M620 700C520 680 440 750 360 720C280 690 240 630 160 660C80 690 20 770 -40 750"
      stroke="rgba(255,255,255,0.05)"
      strokeWidth="65"
      strokeLinecap="round"
    />
    {/* Decorative elements */}
    <circle cx="480" cy="180" r="70" stroke="rgba(212,168,87,0.08)" strokeWidth="2" />
    <circle cx="100" cy="650" r="50" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
    {/* Paint splatter dots */}
    <circle cx="350" cy="250" r="4" fill="rgba(255,255,255,0.12)" />
    <circle cx="150" cy="400" r="3" fill="rgba(212,168,87,0.18)" />
    <circle cx="450" cy="550" r="5" fill="rgba(255,255,255,0.1)" />
    <circle cx="250" cy="800" r="3" fill="rgba(212,168,87,0.15)" />
    <circle cx="500" cy="350" r="4" fill="rgba(255,255,255,0.08)" />
  </svg>
);

const Register = () => {
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
          background: 'linear-gradient(135deg, #2C2C2C 20%, #3d3232 50%, #C75B39 100%)',
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
            Join Our Creative Community
          </h2>

          <p
            className="text-white/70 text-lg leading-relaxed mb-10"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Start your art collection today. Commission custom pieces,
            explore handcrafted originals, and connect with the artist behind
            every brushstroke.
          </p>

          {/* Feature highlights */}
          <div className="text-left space-y-4 border-t border-white/10 pt-8">
            {[
              'Access exclusive original artworks',
              'Commission personalized paintings',
              'Track your orders and custom pieces',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(212,168,87,0.3)' }}
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="rgba(212,168,87,1)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 6l3 3 5-5" />
                  </svg>
                </div>
                <span
                  className="text-white/70 text-sm"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {feature}
                </span>
              </div>
            ))}
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
              'radial-gradient(ellipse at 80% 10%, rgba(199,91,57,0.06) 0%, transparent 50%), ' +
              'radial-gradient(ellipse at 20% 90%, rgba(212,168,87,0.04) 0%, transparent 40%)',
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

          <RegisterForm />
        </div>
      </div>
    </div>
  );
};

export default Register;
