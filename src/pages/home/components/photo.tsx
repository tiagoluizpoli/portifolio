import { motion } from 'framer-motion';
import { useState } from 'react';

interface Props {
  picture: string;
}

export const Photo = ({ picture }: Props) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="w-full h-full relative flex justify-center items-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          transition: {
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
              delay: 0.4,
              duration: 0.4,
              ease: 'easeIn',
            },
          }}
        >
          <img src={picture} alt="" className="hidden" onLoad={() => setIsLoaded(true)} />
          <motion.div
            className="border-accent rounded-full "
            initial={{ opacity: 0, border: 'none' }}
            animate={
              isLoaded && {
                opacity: 1,
                border: '6px solid var(--color-accent)',
              }
            }
            transition={{
              opacity: { delay: 0.4, duration: 0.4, ease: 'easeIn' },
              border: { delay: 0.5, duration: 0.4, ease: 'easeIn' },
            }}
          >
            <motion.img src={picture} className="object-contain rounded-full w-full h-full" />
          </motion.div>
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
            style={{
              transformOrigin: '50% 50%',
            }}
            stroke={'var(--color-accent)'}
            strokeWidth={'4'}
            strokeLinecap={'round'}
            strokeLinejoin={'round'}
            initial={{
              strokeDasharray: '24 10 0 0',
            }}
            animate={{
              strokeDasharray: ['15 128 25 25', '16 25 92 72', '4 250 22 22'],
              rotate: [120, 360],
            }}
            transition={{
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: 'reverse',
            }}
          />
        </motion.svg>
      </motion.div>
    </div>
  );
};
