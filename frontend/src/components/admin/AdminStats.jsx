import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

function AnimatedCounter({ value, duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const target = typeof value === 'number' ? value : 0;
    if (target === 0) {
      setDisplay(0);
      return;
    }

    const startTime = performance.now();
    startRef.current = display;

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startRef.current + (target - startRef.current) * eased);
      setDisplay(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  return <>{display.toLocaleString('en-IN')}</>;
}

export default function AdminStats({ icon: Icon, label, value, change, color = 'accent', prefix = '', isCurrency = false }) {
  const isPositive = change >= 0;

  const colorMap = {
    accent: { bg: 'bg-[#C75B39]/10', iconColor: 'text-[#C75B39]' },
    gold: { bg: 'bg-[#D4A857]/10', iconColor: 'text-[#D4A857]' },
    green: { bg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    blue: { bg: 'bg-blue-50', iconColor: 'text-blue-600' },
    purple: { bg: 'bg-purple-50', iconColor: 'text-purple-600' },
  };

  const colors = colorMap[color] || colorMap.accent;

  const formattedValue = isCurrency
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-shadow duration-300"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-[#6B6B6B] mb-1 font-['DM_Sans']">{label}</p>
          <p className="text-2xl font-bold text-[#1A1A1A] font-['DM_Sans']">
            {isCurrency ? (
              formattedValue
            ) : (
              <>
                {prefix}
                <AnimatedCounter value={value} />
              </>
            )}
          </p>
        </div>
        <div className={`${colors.bg} p-3 rounded-lg`}>
          <Icon className={`w-5 h-5 ${colors.iconColor}`} />
        </div>
      </div>
      {change !== undefined && change !== null && (
        <div className="mt-3 flex items-center gap-1">
          <span
            className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
              isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
            }`}
          >
            {isPositive ? '\u2191' : '\u2193'} {Math.abs(change)}%
          </span>
          <span className="text-xs text-[#6B6B6B] font-['DM_Sans']">vs last month</span>
        </div>
      )}
    </motion.div>
  );
}
