import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { secureHeaders } from 'hono/secure-headers';

import { healthRoutes } from './routes/health';
import { usersRoutes } from './routes/users';

// ============================================================================
// APP SETUP
// ============================================================================

const app = new Hono();

// Global middleware
app.use('*', logger());
app.use('*', secureHeaders());
app.use('*', prettyJSON());
app.use(
  '*',
  cors({
    origin: ['http://localhost:3000', 'http://localhost:8081'],
    credentials: true,
  })
);

// ============================================================================
// ROUTES
// ============================================================================

app.route('/health', healthRoutes);
app.route('/api/users', usersRoutes);

// Root route
app.get('/', (c) => {
  return c.json({
    name: '{{name}}-api',
    version: '1.0.0',
    docs: '/health',
  });
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found', path: c.req.path }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

// ============================================================================
// SERVER
// ============================================================================

const port = process.env.PORT || 4000;

console.log(`🔥 Hono server running at http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
