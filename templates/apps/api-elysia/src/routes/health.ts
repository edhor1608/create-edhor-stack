import { Elysia } from 'elysia';

export const healthRoutes = new Elysia({ prefix: '/health' })
  .get('/', () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }))
  .get('/ready', () => {
    // Add database/external service checks here
    return { ready: true };
  })
  .get('/live', () => ({ live: true }));
