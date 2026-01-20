import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  /**
   * Server-side environment variables (not available on client).
   * Will throw if accessed on the client.
   */
  server: {
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    // DATABASE_URL: z.string().url(),
    // API_SECRET: z.string().min(32),
  },

  /**
   * Client-side environment variables (available everywhere).
   * Must be prefixed with VITE_ in .env files.
   */
  clientPrefix: 'VITE_',
  client: {
    VITE_APP_URL: z.string().url().default('http://localhost:3000'),
    // VITE_PUBLIC_API_URL: z.string().url(),
  },

  /**
   * Shared variables (available on both client and server).
   */
  shared: {
    // NODE_ENV is commonly shared
  },

  /**
   * Runtime environment - manually specify all variables.
   * Required for bundlers that don't automatically inline process.env.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    VITE_APP_URL: process.env.VITE_APP_URL,
    // Add all variables here
  },

  /**
   * Treat empty strings as undefined.
   * Useful for optional variables.
   */
  emptyStringAsUndefined: true,

  /**
   * Skip validation in certain environments.
   */
  skipValidation: process.env.SKIP_ENV_VALIDATION === 'true',
});
