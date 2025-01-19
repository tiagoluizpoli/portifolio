'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface Props {
  children: React.ReactNode;
}

export const PageTransition = ({ children }: Props) => {
  const location = useLocation();

  return (
    <AnimatePresence>
      <div key={location.pathname}>
        <motion.div
          initial={{ opacity: 1 }}
          animate={{
            opacity: 0,
            transition: { duration: 0.4, ease: 'easeInOut' },
          }}
          className="fixed top-0 w-screen h-screen pointer-events-none bg-primary0"
        />
        {children}
      </div>
    </AnimatePresence>
  );
};
