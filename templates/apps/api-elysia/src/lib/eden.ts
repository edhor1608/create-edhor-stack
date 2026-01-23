/**
 * Eden Client Setup
 *
 * Elysia provides end-to-end type safety via Eden Treaty.
 * This file shows how to create a typed client for your API.
 *
 * Install in your web/mobile app:
 *   bun add @elysiajs/eden
 *
 * Usage:
 *   import { treaty } from '@elysiajs/eden';
 *   import type { App } from '@{{name}}/api';
 *
 *   const api = treaty<App>('http://localhost:4000');
 *
 *   // Fully typed API calls
 *   const { data, error } = await api.api.users.get();
 *   const { data: user } = await api.api.users({ id: 'uuid' }).get();
 *   const { data: newUser } = await api.api.users.post({
 *     email: 'test@example.com',
 *     name: 'Test User',
 *   });
 */

export {};
