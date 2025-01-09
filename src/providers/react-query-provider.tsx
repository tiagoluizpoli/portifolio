import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ProviderProps } from './types';

const queryClient = new QueryClient();

export const ReactQueryProvider = ({ children }: ProviderProps) => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
