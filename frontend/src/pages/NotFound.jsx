import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiShoppingBag } from 'react-icons/fi';
import AnimatedPage from '../components/common/AnimatedPage';

/* ------------------------------------------------------------------ */
/*  Decorative SVG illustrations                                      */
/* ------------------------------------------------------------------ */

/* Paint splatters scattered around the page */
const PaintDrop = ({ className = '', color = '#C75B39', size = 24, delay = 0 }) => (
  <motion.div
    className={`absolute pointer-events-none ${className}`}
    initial={{ opacity: 0, scale: 0, y: -20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    <svg width={size} height={size * 1.3} viewBox="0 0 24 32" fill="none">
      <path
        d="M12 0C12 0 0 14 0 21C0 27.075 5.373 32 12 32C18.627 32 24 27.075 24 21C24 14 12 0 12 0Z"
        fill={color}
        opacity="0.15"
      />
    </svg>
  </motion.div>
);

const PaintSplash = ({ className = '', color = '#C75B39', delay = 0 }) => (
  <motion.div
    className={`absolute pointer-events-none ${className}`}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, delay, ease: 'backOut' }}
  >
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
      <circle cx="30" cy="30" r="18" fill={color} opacity="0.08" />
      <circle cx="16" cy="18" r="6" fill={color} opacity="0.06" />
      <circle cx="46" cy="22" r="4" fill={color} opacity="0.07" />
      <circle cx="42" cy="46" r="5" fill={color} opacity="0.05" />
      <circle cx="20" cy="44" r="3" fill={color} opacity="0.06" />
      <circle cx="30" cy="12" r="3" fill={color} opacity="0.04" />
    </svg>
  </motion.div>
);

/* Empty easel illustration */
const EmptyEasel = () => (
  <svg
    viewBox="0 0 200 220"
    fill="none"
    className="w-48 sm:w-56 md:w-64 h-auto"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Back legs */}
    <line x1="60" y1="70" x2="30" y2="215" stroke="#2C2C2C" strokeWidth="3" strokeLinecap="round" opacity="0.3" />
    <line x1="140" y1="70" x2="170" y2="215" stroke="#2C2C2C" strokeWidth="3" strokeLinecap="round" opacity="0.3" />

    {/* Front center leg */}
    <line x1="100" y1="110" x2="100" y2="215" stroke="#2C2C2C" strokeWidth="3" strokeLinecap="round" opacity="0.4" />

    {/* Cross bar */}
    <line x1="55" y1="160" x2="145" y2="160" stroke="#2C2C2C" strokeWidth="2.5" strokeLinecap="round" opacity="0.25" />

    {/* Canvas holder / shelf */}
    <line x1="50" y1="110" x2="150" y2="110" stroke="#2C2C2C" strokeWidth="3" strokeLinecap="round" opacity="0.5" />

    {/* Empty canvas */}
    <rect x="55" y="20" width="90" height="88" rx="2" stroke="#2C2C2C" strokeWidth="2.5" opacity="0.3" fill="none" />

    {/* Canvas inner shadow */}
    <rect x="60" y="25" width="80" height="78" rx="1" fill="#2C2C2C" opacity="0.03" />

    {/* Question mark on canvas */}
    <text
      x="100"
      y="72"
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize="32"
      fontFamily="'Playfair Display', serif"
      fontWeight="bold"
      fill="#C75B39"
      opacity="0.2"
    >
      ?
    </text>

    {/* Small paint drip from canvas edge */}
    <path
      d="M80 108C80 108 80 118 80 122C80 125 82 127 84 125C86 123 84 120 82 118"
      stroke="#C75B39"
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.25"
      fill="none"
    />

    {/* Another drip */}
    <path
      d="M120 108C120 108 120 115 120 118C120 121 118 122 117 120"
      stroke="#D4A857"
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.2"
      fill="none"
    />

    {/* Broken brush on the floor */}
    <g opacity="0.35">
      {/* Brush handle piece 1 */}
      <line x1="130" y1="200" x2="155" y2="195" stroke="#8B6914" strokeWidth="3" strokeLinecap="round" />
      {/* Brush handle piece 2 (broken off) */}
      <line x1="160" y1="198" x2="175" y2="202" stroke="#8B6914" strokeWidth="3" strokeLinecap="round" />
      {/* Gap between pieces */}
      {/* Bristle end */}
      <ellipse cx="128" cy="201" rx="5" ry="3" fill="#C75B39" opacity="0.6" />
      {/* Small paint spot near brush */}
      <circle cx="140" cy="208" r="3" fill="#C75B39" opacity="0.15" />
    </g>
  </svg>
);

/* Brush stroke decoration behind 404 text */
const BrushStrokeBehind = () => (
  <svg
    viewBox="0 0 500 120"
    fill="none"
    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-auto pointer-events-none"
  >
    <path
      d="M10 60C10 60 60 20 130 40C200 60 240 90 310 65C380 40 430 25 490 55"
      stroke="#C75B39"
      strokeWidth="40"
      strokeLinecap="round"
      opacity="0.06"
    />
    <path
      d="M30 70C30 70 90 100 170 75C250 50 290 30 370 60C420 78 470 65 480 60"
      stroke="#D4A857"
      strokeWidth="20"
      strokeLinecap="round"
      opacity="0.05"
    />
  </svg>
);

/* ================================================================== */
/*  Stagger animation variants                                        */
/* ================================================================== */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const floatVariants = {
  animate: {
    y: [0, -8, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/* ================================================================== */
/*  NOT FOUND PAGE                                                    */
/* ================================================================== */
const NotFound = () => {
  return (
    <AnimatedPage>
      <div
        className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-20"
        style={{ background: '#FAF7F2' }}
      >
        {/* ── Background gradient ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 40% 30%, rgba(199,91,57,0.05) 0%, transparent 55%), ' +
              'radial-gradient(ellipse at 60% 70%, rgba(212,168,87,0.04) 0%, transparent 50%), ' +
              'radial-gradient(ellipse at 50% 50%, rgba(199,91,57,0.02) 0%, transparent 70%)',
          }}
        />

        {/* ── Scattered paint drops ── */}
        <PaintDrop className="top-[10%] left-[8%]" delay={0.3} size={18} />
        <PaintDrop className="top-[15%] right-[12%]" color="#D4A857" delay={0.5} size={22} />
        <PaintDrop className="bottom-[20%] left-[15%]" delay={0.7} size={16} />
        <PaintDrop className="top-[35%] left-[5%]" color="#D4A857" delay={0.4} size={14} />
        <PaintDrop className="bottom-[15%] right-[10%]" delay={0.6} size={20} />
        <PaintDrop className="top-[60%] right-[5%]" color="#D4A857" delay={0.8} size={12} />

        <PaintSplash className="top-[5%] right-[25%]" delay={0.4} />
        <PaintSplash className="bottom-[10%] left-[20%]" color="#D4A857" delay={0.6} />
        <PaintSplash className="top-[40%] right-[3%]" delay={0.5} />
        <PaintSplash className="bottom-[30%] left-[5%]" color="#D4A857" delay={0.7} />

        {/* ── Main content ── */}
        <motion.div
          className="relative z-10 max-w-2xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* 404 text with brush stroke behind */}
          <motion.div variants={itemVariants} className="relative mb-6">
            <BrushStrokeBehind />
            <h1
              className="relative text-[8rem] sm:text-[10rem] md:text-[12rem] font-bold leading-none select-none"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: '#2C2C2C',
                textShadow: '4px 4px 0px rgba(199,91,57,0.1)',
              }}
            >
              4
              <span style={{ color: '#C75B39' }}>0</span>
              4
            </h1>
          </motion.div>

          {/* Floating easel illustration */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center mb-8"
          >
            <motion.div variants={floatVariants} animate="animate">
              <EmptyEasel />
            </motion.div>
          </motion.div>

          {/* Subtitle */}
          <motion.h2
            variants={itemVariants}
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4"
            style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C' }}
          >
            Oops! This Canvas is Blank
          </motion.h2>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="text-base md:text-lg mb-10 max-w-md mx-auto leading-relaxed"
            style={{ fontFamily: "'DM Sans', sans-serif", color: '#5A5A5A' }}
          >
            The page you are looking for does not exist or has been moved.
            Perhaps the artist painted over it.
          </motion.p>

          {/* Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                background: '#C75B39',
                boxShadow: '0 4px 14px rgba(199,91,57,0.3)',
              }}
            >
              <FiHome className="w-4 h-4" />
              Go Home
            </Link>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold rounded-xl border-2 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 hover:bg-[#2C2C2C] hover:text-[#FAF7F2]"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: '#2C2C2C',
                borderColor: '#2C2C2C',
              }}
            >
              <FiShoppingBag className="w-4 h-4" />
              Browse Gallery
            </Link>
          </motion.div>

          {/* Small decorative brush stroke under buttons */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center mt-12"
          >
            <svg viewBox="0 0 200 12" fill="none" className="w-32 h-auto">
              <path
                d="M4 6C4 6 30 2 60 5C90 8 130 3 160 6C175 7 196 4 196 4"
                stroke="#D4A857"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.3"
              />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </AnimatedPage>
  );
};

export default NotFound;
