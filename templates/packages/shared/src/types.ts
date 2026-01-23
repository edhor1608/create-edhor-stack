import type { z } from 'zod';
import type {
  UserSchema,
  CreateUserSchema,
  UpdateUserSchema,
  PaginationSchema,
  ApiErrorSchema,
} from './schemas';

// ============================================================================
// INFERRED TYPES FROM SCHEMAS
// ============================================================================

export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;
export type ApiError = z.infer<typeof ApiErrorSchema>;

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

export type Result<T, E = ApiError> =
  | { ok: true; data: T }
  | { ok: false; error: E };

// ============================================================================
// API TYPES
// ============================================================================

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type ApiEndpoint<TInput, TOutput> = {
  method: HttpMethod;
  path: string;
  input: TInput;
  output: TOutput;
};
