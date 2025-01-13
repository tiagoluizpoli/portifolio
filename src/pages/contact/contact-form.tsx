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

import { useForm } from 'react-hook-form';

export const ContactForm = () => {
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
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 p-10 bg-[#27272c] rounded-xl">
        <h3 className="text-4xl text-accent">Let's work together</h3>
        <p className="text-white/60">Go ahead and send me a message, I'll get back to you as soon as possible.</p>
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
  );
};
