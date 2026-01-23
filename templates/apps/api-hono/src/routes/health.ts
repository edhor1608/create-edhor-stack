import { Hono } from 'hono';

export const healthRoutes = new Hono();

healthRoutes.get('/', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

healthRoutes.get('/ready', (c) => {
  // Add database/external service checks here
  return c.json({ ready: true });
});

healthRoutes.get('/live', (c) => {
  return c.json({ live: true });
});
