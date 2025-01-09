import { easeIn, motion } from 'framer-motion';
import { FaCode } from 'react-icons/fa';
import { GrServices } from 'react-icons/gr';
import { GrConnect } from 'react-icons/gr';
import { MdOutlineCloud } from 'react-icons/md';

const solutions = [
  {
    num: '01',
    title: 'Frontend Development',
    description: 'Stunning and responsive interfaces.',
    icon: FaCode,
  },
  {
    num: '02',
    title: 'Backend Development',
    description: 'Scalable and reliable backend solutions for your projects.',
    icon: GrServices,
  },
  {
    num: '03',
    title: 'Integrations',
    description: 'Seamless and effective integrations with other tools and platforms for smooth workflows.',
    //Connect your projects with top tools and platforms through seamless integrations, optimizing efficiency and ensuring smooth workflows.
    icon: GrConnect,
  },
  {
    num: '04',
    title: 'Cloud Based Solutions',
    description:
      'Power your projects with cloud-based solutions, enabling scalability, reliability, and cost-effectiveness.',
    icon: MdOutlineCloud,
  },
];

export const SolutionsPage = () => {
  return (
    <section className="min-h-[80vh] flex flex-col justify-center py-12 xl:py-0">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            transition: {
              delay: 2.4,
              duration: 0.4,
              ease: easeIn,
            },
          }}
          className="grid grid-cols-1 md:grid-cols-2 gap-[60px]"
        >
          {solutions.map((service, index) => {
            const Icon = service.icon;

            return (
              <div key={index} className="flex-1 flex flex-col justify-center gap-6 group">
                {/* top */}
                <div className="w-full flex justify-between items-center">
                  <div className="text-5xl font-extrabold text-outline text-transparent group-hover:text-outline-hover transition-all duration-500">
                    {service.num}
                  </div>
                  <div className="w-[70px] h-[70px] rounded-full bg-white group-hover:bg-accent transition-all duration-500 flex justify-center items-center">
                    <Icon className="text-primary text-3xl " />
                  </div>
                </div>

                {/* heading */}
                <h2 className="text-[42px] font-bold leading-none text-white group-hover:text-accent transition-all duration-500">
                  {service.title}
                </h2>

                {/* description */}
                <p className="text-white/60">{service.description}</p>

                {/* border */}
                <div className="border-b border-white/20 w-full" />
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
