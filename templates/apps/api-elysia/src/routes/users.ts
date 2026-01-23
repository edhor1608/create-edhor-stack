import { Elysia, t } from 'elysia';

// ============================================================================
// MOCK DATA (replace with database)
// ============================================================================

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

const users: User[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'john@example.com',
    name: 'John Doe',
    createdAt: new Date().toISOString(),
  },
];

// ============================================================================
// ROUTES
// ============================================================================

export const usersRoutes = new Elysia({ prefix: '/api/users' })
  // List users
  .get('/', () => ({ users, total: users.length }))

  // Get user by ID
  .get(
    '/:id',
    ({ params: { id }, set }) => {
      const user = users.find((u) => u.id === id);

      if (!user) {
        set.status = 404;
        return { error: 'User not found' };
      }

      return user;
    },
    {
      params: t.Object({
        id: t.String({ format: 'uuid' }),
      }),
    }
  )

  // Create user
  .post(
    '/',
    ({ body, set }) => {
      const newUser: User = {
        id: crypto.randomUUID(),
        ...body,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      set.status = 201;
      return newUser;
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
        name: t.String({ minLength: 1 }),
      }),
    }
  )

  // Update user
  .patch(
    '/:id',
    ({ params: { id }, body, set }) => {
      const userIndex = users.findIndex((u) => u.id === id);

      if (userIndex === -1) {
        set.status = 404;
        return { error: 'User not found' };
      }

      users[userIndex] = { ...users[userIndex], ...body };
      return users[userIndex];
    },
    {
      params: t.Object({
        id: t.String({ format: 'uuid' }),
      }),
      body: t.Object({
        email: t.Optional(t.String({ format: 'email' })),
        name: t.Optional(t.String({ minLength: 1 })),
      }),
    }
  )

  // Delete user
  .delete(
    '/:id',
    ({ params: { id }, set }) => {
      const userIndex = users.findIndex((u) => u.id === id);

      if (userIndex === -1) {
        set.status = 404;
        return { error: 'User not found' };
      }

      users.splice(userIndex, 1);
      return { success: true };
    },
    {
      params: t.Object({
        id: t.String({ format: 'uuid' }),
      }),
    }
  );
