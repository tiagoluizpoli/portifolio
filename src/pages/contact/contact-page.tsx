import { motion } from 'framer-motion';
import { FaEnvelope, FaMapMarkerAlt, FaWhatsapp } from 'react-icons/fa';
import { ContactForm } from './contact-form';

const info = [
  {
    icon: <FaWhatsapp />,
    title: 'Whatsapp',
    description: '+55 (11) 95206-6489',
  },
  {
    icon: <FaEnvelope />,
    title: 'Email',
    description: 'tiago.seuaciuc@gmail.com',
  },
  {
    icon: <FaMapMarkerAlt />,
    title: 'Address',
    description: 'Cotia - SP',
  },
];

export const ContactPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        transition: {
          delay: 2.4,
          duration: 0.4,
          ease: 'easeIn',
        },
      }}
      className="py-6"
    >
      <div className="container mx-auto">
        <div className="flex flex-col xl:flex-row gap-[30px]">
          <div className="xl:w-[54%] order-2 xl:order-none">
            {/* form */}
            <ContactForm />
          </div>

          {/* info */}
          <div className="flex items-center flex-1 order-1 mb-8 xl:justify-start xl:order-none xl:mb-0">
            <ul className="flex flex-col gap-10">
              {info.map((item, index) => {
                return (
                  <li key={index} className="flex items-center gap-6">
                    <div className="w-[52px] h-[52px] xl:w-[72px] xl:h-[72px] bg-[#27272c] text-accent rounded-md flex items-center justify-center">
                      <div className="text-[28px]">{item.icon}</div>
                    </div>
                    <div className="flex-1">
                      <p className="text-white/60">{item.title}</p>
                      <h3 className="text-xl">{item.description}</h3>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
