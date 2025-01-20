'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { cloneElement } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';

export const AnimatePagePresence = () => {
  const location = useLocation();
  const element = useOutlet();

  return <AnimatePresence mode="wait">{element && cloneElement(element, { key: location.pathname })}</AnimatePresence>;
};

interface PageTransitionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  pageKey: string;
}
export const PageTransition = ({ children, pageKey }: PageTransitionProps) => {
  return (
    <motion.div
      key={pageKey}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
};
