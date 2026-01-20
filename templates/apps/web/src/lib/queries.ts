import { queryOptions } from '@tanstack/react-query';

// ============================================================================
// EXAMPLE QUERY OPTIONS - Replace with your actual queries
// ============================================================================

export const exampleQueryOptions = queryOptions({
  queryKey: ['example'],
  queryFn: async () => {
    // Replace with your actual API call
    return { message: 'Hello from TanStack Query!' };
  },
  staleTime: 1000 * 60 * 5, // 5 minutes
});

/**
 * Query options factory pattern for dynamic queries
 */
export const itemQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ['items', id],
    queryFn: async () => {
      const response = await fetch(`/api/items/${id}`);
      if (!response.ok) throw new Error('Failed to fetch item');
      return response.json();
    },
  });
