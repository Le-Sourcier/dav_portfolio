import { QueryClient } from '@tanstack/react-query';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          const message = error instanceof Error ? error.message : '';
          if (message.includes('401')) return false;
          return failureCount < 1;
        },
        refetchOnWindowFocus: false,
        staleTime: 2 * 60 * 1000,
      },
    },
  });
}
