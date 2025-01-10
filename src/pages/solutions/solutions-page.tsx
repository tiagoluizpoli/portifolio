import { DynamicIcon } from '@/components';
import { useSolutionsQuery } from '@/core';
import { easeIn, motion } from 'framer-motion';

export const SolutionsPage = () => {
  const { data, isFetching, isLoading } = useSolutionsQuery();

  if (isFetching || isLoading) {
    return <div className="flex justify-center">Loading...</div>;
  }

  if (!data) {
    return <div className="flex justify-center">No Data</div>;
  }

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
          {data.map((service, index) => {
            const num = service.sort.toString().padStart(2, '0');

            return (
              <div key={index} className="flex-1 flex flex-col justify-center gap-6 group">
                {/* top */}
                <div className="w-full flex justify-between items-center">
                  <div className="text-5xl font-extrabold text-outline text-transparent group-hover:text-outline-hover transition-all duration-500">
                    {num}
                  </div>
                  <div className="w-[70px] h-[70px] rounded-full bg-white group-hover:bg-accent transition-all duration-500 flex justify-center items-center">
                    <DynamicIcon lib={service.iconLib} name={service.iconCode} className="text-primary text-3xl " />
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
