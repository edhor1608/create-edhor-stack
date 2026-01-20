import { queryOptions } from '@tanstack/react-query';

import { fetchValidated } from './client';
import { ItemSchema, PaginatedResponseSchema, UserSchema } from './schemas';

// ============================================================================
// QUERY OPTIONS - Replace with your actual queries
// ============================================================================

export const userQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ['user', userId],
    queryFn: () => fetchValidated(`/users/${userId}`, UserSchema),
  });

export const itemsQueryOptions = (cursor?: string) =>
  queryOptions({
    queryKey: ['items', { cursor }],
    queryFn: () =>
      fetchValidated(
        `/items${cursor ? `?cursor=${cursor}` : ''}`,
        PaginatedResponseSchema(ItemSchema)
      ),
  });
