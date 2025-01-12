'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useSolutionsQuery } from '@/core';
import { motion } from 'framer-motion';
import { FaEnvelope, FaMapMarkerAlt, FaWhatsapp } from 'react-icons/fa';

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
  const { data: solutions, isLoading, isFetching } = useSolutionsQuery();

  if (isFetching || isLoading) {
    return <div>Loading...</div>;
  }

  if (!solutions) {
    return <div>No data</div>;
  }

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
            <form className="flex flex-col gap-6 p-10 bg-[#27272c] rounded-xl">
              <h3 className="text-4xl text-accent">Let's work together</h3>
              <p className="text-white/60">Go ahead and send me a message, I'll get back to you as soon as possible.</p>
              {/* inputs */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Input type="name" placeholder="Name" />
                <Input type="phone" placeholder="Phone number" />
              </div>
              <Input type="email" placeholder="Email address" />

              {/* select */}
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={'Select a solution you need me for'} />
                </SelectTrigger>

                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Select an option below</SelectLabel>
                    {solutions.map((item) => {
                      return (
                        <SelectItem key={item.id} value={item.title}>
                          {item.title}
                        </SelectItem>
                      );
                    })}
                    <SelectItem value="other">Other...</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              {/* textarea */}
              <Textarea className="h-[200px]" placeholder="leave me a message here" />

              {/* btn */}
              <Button size={'md'} className="max-w-40">
                Send message
              </Button>
            </form>
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
