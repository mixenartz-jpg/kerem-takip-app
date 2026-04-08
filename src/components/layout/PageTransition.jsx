import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const variants = {
  initial: { opacity: 0, y: 12, scale: 0.99 },
  enter:   { opacity: 1, y: 0,  scale: 1,    transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] } },
  exit:    { opacity: 0, y: -8, scale: 0.99, transition: { duration: 0.15, ease: 'easeIn' } },
};

export default function PageTransition({ children }) {
  const { pathname } = useLocation();
  return (
    <motion.div
      key={pathname}
      variants={variants}
      initial="initial"
      animate="enter"
      exit="exit"
      className="h-full"
    >
      {children}
    </motion.div>
  );
}
