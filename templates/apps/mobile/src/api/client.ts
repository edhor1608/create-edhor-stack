import type { z } from 'zod';

import { env } from '@/lib/env';

/**
 * Fetch with Zod validation - validates API responses at runtime.
 *
 * @example
 * ```ts
 * const user = await fetchValidated('/users/123', UserSchema);
 * // user is typed as User and validated at runtime
 * ```
 */
export async function fetchValidated<T>(
  path: string,
  schema: z.ZodType<T>,
  options?: RequestInit
): Promise<T> {
  const url = path.startsWith('http') ? path : `${env.EXPO_PUBLIC_API_URL}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  return schema.parse(data);
}

/**
 * POST with Zod validation
 */
export async function postValidated<T>(
  path: string,
  body: unknown,
  schema: z.ZodType<T>,
  options?: RequestInit
): Promise<T> {
  return fetchValidated(path, schema, {
    ...options,
    method: 'POST',
    body: JSON.stringify(body),
  });
}
