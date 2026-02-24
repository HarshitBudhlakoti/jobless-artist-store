import { motion } from 'framer-motion';
import { pageTransition } from '../../utils/animations';

export default function AnimatedPage({ children, className = '' }) {
  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
}
