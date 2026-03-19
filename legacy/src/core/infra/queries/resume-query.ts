import type { Resume } from '@/core/entities';
import { useQuery } from '@tanstack/react-query';
import { getResume } from '../http';

export const useResumeQuery = () => {
  const query = useQuery<Resume>({
    queryKey: ['resume'],
    queryFn: getResume,
    staleTime: 1000 * 60 * 5,
  });

  return { ...query };
};
