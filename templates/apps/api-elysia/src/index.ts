import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';

import { healthRoutes } from './routes/health';
import { usersRoutes } from './routes/users';

// ============================================================================
// APP SETUP
// ============================================================================

const app = new Elysia()
  .use(
    cors({
      origin: ['http://localhost:3000', 'http://localhost:8081'],
      credentials: true,
    })
  )
  .use(
    swagger({
      documentation: {
        info: {
          title: '{{name}} API',
          version: '1.0.0',
        },
      },
    })
  )
  // ============================================================================
  // ROUTES
  // ============================================================================
  .get('/', () => ({
    name: '{{name}}-api',
    version: '1.0.0',
    docs: '/swagger',
  }))
  .use(healthRoutes)
  .use(usersRoutes)
  // ============================================================================
  // ERROR HANDLING
  // ============================================================================
  .onError(({ code, error, set }) => {
    if (code === 'NOT_FOUND') {
      set.status = 404;
      return { error: 'Not Found' };
    }

    console.error('Error:', error);
    set.status = 500;
    return { error: 'Internal Server Error' };
  })
  .listen(process.env.PORT || 4000);

console.log(
  `🦊 Elysia server running at http://${app.server?.hostname}:${app.server?.port}`
);

// Export type for Eden client (end-to-end type safety)
export type App = typeof app;
