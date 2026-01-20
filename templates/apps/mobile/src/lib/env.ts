import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  /**
   * Server-side environment variables.
   * These should only be used in API routes or server functions.
   */
  server: {
    // API_SECRET: z.string().min(32),
  },

  /**
   * Client-side environment variables (available everywhere).
   * Must be prefixed with EXPO_PUBLIC_ in .env files.
   */
  clientPrefix: 'EXPO_PUBLIC_',
  client: {
    EXPO_PUBLIC_API_URL: z.string().url().default('https://api.example.com'),
    // EXPO_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  },

  /**
   * Runtime environment - manually specify all variables.
   */
  runtimeEnv: {
    EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
    // Add all variables here
  },

  /**
   * Treat empty strings as undefined.
   */
  emptyStringAsUndefined: true,

  /**
   * Skip validation during builds if needed.
   */
  skipValidation: process.env.SKIP_ENV_VALIDATION === 'true',
});
