import { motion } from 'framer-motion';

interface Props {
  picture: string;
}

export const Photo = ({ picture }: Props) => {
  return (
    <div className="w-full h-full relative flex justify-center items-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          transition: {
            delay: 2,
            duration: 0.4,
            ease: 'easeIn',
          },
        }}
      >
        {/* image */}
        <motion.div
          className="w-[300px] h-[300px] xl:w-[506px] xl:h-[506px] mix-blend-difference absolute p-3"
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            transition: {
              delay: 2.4,
              duration: 0.4,
              ease: 'easeInOut',
            },
          }}
        >
          <div className="border-[6px] border-accent rounded-full">
            <img src={picture} alt="" className="object-contain rounded-full" />
          </div>
        </motion.div>

        {/* circle */}

        <motion.svg
          className="w-[300px] xl:w-[506px] h-[300px] xl:h-[506px]"
          fill="transparent"
          viewBox="0 0 506 506"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>turning circle</title>
          <motion.circle
            cx="253"
            cy="253"
            r="250"
            stroke="var(--color-accent)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transformOrigin: '50% 50%',
            }}
            initial={{
              strokeDasharray: '15 128 25 25',
              strokeDashoffset: 0,
            }}
            animate={{
              strokeDashoffset: [0, -1000], // Adjust the value to control the rotation speed
            }}
            transition={{
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'linear',
            }}
          />
        </motion.svg>
      </motion.div>
    </div>
  );
};
