import { motion } from 'framer-motion';

export const Loading = () => {
  return (
    <motion.div
      initial={{ rotate: 0 }}
      animate={{ rotate: 360 }}
      transition={{
        duration: Number.POSITIVE_INFINITY,
      }}
      className="flex justify-center items-center w-screen h-screen"
    >
      <div className="w-12 h-12 border-4 border-accent rounded-full border-t-transparent border-r-transparent border-b-transparent animate-spin" />
    </motion.div>
  );
};
