import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
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
import { type Contact, contactSchema, useContactMutation, useSolutionsQuery } from '@/core';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
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
  const { mutateAsync } = useContactMutation();
  const form = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      phoneNumber: '',
      email: '',
      solution: solutions?.[0].title ?? '',
      message: '',
    },
  });
  const { control, handleSubmit, reset } = form;

  const onSubmit = async (data: Contact) => {
    console.log(data);
    await mutateAsync(data);
    reset();
  };

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
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 p-10 bg-[#27272c] rounded-xl">
                <h3 className="text-4xl text-accent">Let's work together</h3>
                <p className="text-white/60">
                  Go ahead and send me a message, I'll get back to you as soon as possible.
                </p>
                {/* inputs */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField
                    control={control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input type="name" placeholder="Name" {...field} ref={null} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input type="phone" placeholder="Phone number" {...field} ref={null} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="email" placeholder="Email address" {...field} ref={null} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* select */}

                <FormField
                  control={control}
                  name="solution"
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={'Select a solution'} />
                          </SelectTrigger>
                        </FormControl>

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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* textarea */}
                <FormField
                  control={control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea className="h-[200px]" placeholder="leave me a message here" {...field} ref={null} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* btn */}
                <Button size={'md'} className="max-w-40" type="submit">
                  Send message
                </Button>
              </form>
            </Form>
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
