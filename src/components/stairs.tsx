import { motion } from 'framer-motion';

const stairAnimation = {
  initial: {
    top: '0%',
  },
  animate: {
    top: '100%',
  },
  exit: {
    top: ['100%', '0%'],
  },
};

// calculate the reverse index for staggered delay

const reverseIndex = (index: number) => {
  const totalSteps = 6; // total of steps
  return totalSteps - index - 1;
};

// render 6 motion divs, each representing a step of the stairs
// Ech div will have the same animation defined by the stairsAnimation object
// The delay for each div is calculated dynamically based on it's reversed index
// creating a staggered effect with decresasing elay for each subsequent step.

export const Stairs = () => {
  return (
    <>
      {[...Array(6)].map((_, index) => {
        return (
          <motion.div
            key={index}
            variants={stairAnimation}
            initial="initial"
            animate="animate"
            exit={'exit'}
            transition={{
              duration: 0.4,
              ease: 'easeInOut',
              delay: reverseIndex(index) * 0.1,
            }}
            className="relative w-full h-full bg-white"
          />
        );
      })}
    </>
  );
};
