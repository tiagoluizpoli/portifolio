import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

export const StairTransition = () => {
  const location = useLocation();

  return (
    <AnimatePresence>
      <div key={location.pathname}>
        {/* <div className="fixed top-0 left-0 right-0 z-40 flex w-screen h-screen pointer-events-none">
          <Stairs />
        </div> */}
        <motion.div
          className="fixed top-0 w-screen h-screen pointer-events-none bg-primary"
          initial={{ opacity: 1 }}
          animate={{
            opacity: 0,
            transition: {
              delay: 0,
              duration: 0.4,
              ease: 'easeInOut',
            },
          }}
        />
      </div>
    </AnimatePresence>
  );
};
