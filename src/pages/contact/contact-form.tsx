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
import { type Contact, type SolutionsTranslation, contactSchema, useContactMutation, useSolutionsQuery } from '@/core';
import { useLangContext } from '@/providers/lang';
import { zodResolver } from '@hookform/resolvers/zod';

import { useForm } from 'react-hook-form';

const enFormContent = {
  title: `Let's work together`,
  description: `Go ahead and send me a message, I'll get back to you as soon as possible.`,
  inputs: {
    name: {
      label: 'Name',
      placeholder: 'Name',
    },
    phoneNumber: {
      label: 'Phone number',
      placeholder: 'Phone number',
    },
    email: {
      label: 'Email address',
      placeholder: 'Email address',
    },
  },

  select: {
    label: 'Select an option below',
    placeholder: 'Select a solution',
    options: {
      other: 'Other...',
    },
  },

  textarea: {
    label: 'Leave me a message here',
    placeholder: 'leave me a message here',
  },

  submit: 'Send message',
};

const ptFormContent = {
  title: 'Vamos trabalhar juntos',
  description: 'Envie-me uma mensagem e responderei o mais breve possível.',
  inputs: {
    name: {
      label: 'Nome',
      placeholder: 'Nome',
    },
    phoneNumber: {
      label: 'Número de telefone',
      placeholder: 'Número de telefone',
    },
    email: {
      label: 'Endereço de email',
      placeholder: 'Endereço de email',
    },
  },

  select: {
    label: 'Selecione uma opção abaixo',
    placeholder: 'Selecione uma solução',
    options: {
      other: 'Outro...',
    },
  },

  textarea: {
    label: 'Deixe-me uma mensagem aqui',
    placeholder: 'Deixe-me uma mensagem aqui',
  },

  submit: 'Enviar mensagem',
};

export const ContactForm = () => {
  const { data: solutions } = useSolutionsQuery();

  const { lang, getTranslation } = useLangContext();

  const { mutateAsync } = useContactMutation();

  const form = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      phoneNumber: '',
      email: '',
      solution: '',
      message: '',
    },
  });
  const { control, handleSubmit, reset } = form;

  const onSubmit = async (data: Contact) => {
    await mutateAsync(data);
    reset();
  };

  if (!solutions) {
    return null;
  }

  const content = lang === 'en-US' ? enFormContent : ptFormContent;

  const { name, email, phoneNumber } = content.inputs;
  const { label: selectLabel, placeholder: selectPlaceholder, options: selectOptions } = content.select;

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 p-10 bg-[#27272c] rounded-xl">
        <h3 className="text-4xl text-accent">{content.title}</h3>
        <p className="text-white/60">{content.description}</p>
        {/* inputs */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type="name" placeholder={name.placeholder} {...field} ref={null} />
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
                  <Input type="phone" placeholder={phoneNumber.placeholder} {...field} ref={null} />
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
                <Input type="email" placeholder={email.placeholder} {...field} ref={null} />
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
                    <SelectValue placeholder={selectPlaceholder} />
                  </SelectTrigger>
                </FormControl>

                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>{selectLabel}</SelectLabel>
                    {solutions.map((item) => {
                      const translated = getTranslation<SolutionsTranslation>(item.translations);
                      return (
                        <SelectItem key={item.id} value={translated.title}>
                          {translated.title}
                        </SelectItem>
                      );
                    })}
                    <SelectItem value="other">{selectOptions.other}</SelectItem>
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
                <Textarea className="h-[200px]" placeholder={content.textarea.placeholder} {...field} ref={null} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* btn */}
        <Button size={'md'} className="w-fit max-w-48" type="submit">
          {content.submit}
        </Button>
      </form>
    </Form>
  );
};
