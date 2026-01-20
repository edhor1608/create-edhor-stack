/**
 * Result type for explicit error handling without try-catch everywhere.
 *
 * @example
 * ```ts
 * async function fetchUser(id: string): Promise<Result<User, string>> {
 *   try {
 *     const user = await api.getUser(id);
 *     return ok(user);
 *   } catch (e) {
 *     return err(e instanceof Error ? e.message : 'Unknown error');
 *   }
 * }
 *
 * // Usage
 * const result = await fetchUser('123');
 * if (!result.ok) {
 *   showToast(result.error);
 *   return;
 * }
 * const user = result.value;
 * ```
 */
export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

/**
 * Unwrap a Result, throwing if it's an error.
 * Only use this when you're certain the result is ok.
 */
export function unwrap<T, E>(result: Result<T, E>): T {
  if (!result.ok) {
    throw result.error;
  }
  return result.value;
}

/**
 * Unwrap a Result with a default value for errors.
 */
export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
  return result.ok ? result.value : defaultValue;
}
