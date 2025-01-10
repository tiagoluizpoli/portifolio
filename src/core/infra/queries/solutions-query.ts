import type { Solution } from '@/core/entities';
import { useQuery } from '@tanstack/react-query';
import { getSolutions } from '../http';

export const useSolutionsQuery = () => {
  const query = useQuery<Solution[]>({
    queryKey: ['solutions'],
    queryFn: getSolutions,
    staleTime: 1000 * 60 * 5,
  });

  return { ...query };
};
