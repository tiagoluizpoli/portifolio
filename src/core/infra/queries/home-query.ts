import type { Home } from '@/core/entities';
import { useQuery } from '@tanstack/react-query';
import { getHome } from '../http';

export const useHomeQuery = () => {
  const query = useQuery<Home>({
    queryKey: ['home'],
    queryFn: getHome,
    staleTime: 1000 * 60 * 5,
  });

  return { ...query };
};
