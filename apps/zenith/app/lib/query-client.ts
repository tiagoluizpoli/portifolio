import { QueryClient } from '@tanstack/react-query';

/**
 * Global QueryClient instance.
 * Configured with robust defaults for the Zenith hub:
 * - 5 minute staleTime for general data.
 * - Retry logic for network resilience.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
