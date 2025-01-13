import type { Contact } from '@/core/entities';
import { getContactInfo, insertContact } from '@/core/infra/http';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useContactInfoQuery = () => {
  const query = useQuery({
    queryKey: ['contactInfo'],
    queryFn: getContactInfo,
    staleTime: 1000 * 60 * 60 * 1,
  });

  return { ...query };
};

export const useContactMutation = () => {
  const mutation = useMutation({
    mutationFn: async (payload: Contact) => insertContact(payload),
  });

  return { ...mutation };
};
