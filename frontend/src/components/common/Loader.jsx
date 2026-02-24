import { motion } from 'framer-motion';

export default function Loader() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-cream">
      {/* Animated paint brush SVG */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <svg
          width="80"
          height="80"
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Brush handle */}
          <motion.rect
            x="36"
            y="30"
            width="8"
            height="40"
            rx="2"
            fill="#2C2C2C"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ originY: 1 }}
          />
          {/* Brush ferrule */}
          <motion.rect
            x="34"
            y="26"
            width="12"
            height="6"
            rx="1"
            fill="#D4A857"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          />
          {/* Brush bristles */}
          <motion.path
            d="M34 26 C34 16, 40 10, 40 10 C40 10, 46 16, 46 26Z"
            fill="#C75B39"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          />
          {/* Paint drip */}
          <motion.circle
            cx="40"
            cy="10"
            r="3"
            fill="#C75B39"
            initial={{ opacity: 0, y: -5 }}
            animate={{
              opacity: [0, 1, 1, 0],
              y: [-5, 0, 0, 5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 0.5,
            }}
          />
        </svg>
      </motion.div>

      {/* Loading text */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="font-display text-lg font-medium text-text-primary"
      >
        Loading
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          ...
        </motion.span>
      </motion.p>

      {/* Animated underline */}
      <motion.div
        className="mt-4 h-0.5 rounded-full bg-accent"
        initial={{ width: 0 }}
        animate={{ width: 120 }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}
