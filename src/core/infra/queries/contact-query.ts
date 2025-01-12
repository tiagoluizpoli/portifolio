import type { Contact } from '@/core/entities';
import { useMutation } from '@tanstack/react-query';
import { insertContact } from '../http/contact';

export const useContactMutation = () => {
  const mutation = useMutation({
    mutationFn: async (payload: Contact) => insertContact(payload),
  });

  return { ...mutation };
};
