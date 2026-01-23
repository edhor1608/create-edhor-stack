import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

// ============================================================================
// SCHEMAS
// ============================================================================

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

const UpdateUserSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1).optional(),
});

const UserIdSchema = z.object({
  id: z.string().uuid(),
});

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

export const usersRoutes = new Hono();

// List users
usersRoutes.get('/', (c) => {
  return c.json({ users, total: users.length });
});

// Get user by ID
usersRoutes.get('/:id', zValidator('param', UserIdSchema), (c) => {
  const { id } = c.req.valid('param');
  const user = users.find((u) => u.id === id);

  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  return c.json(user);
});

// Create user
usersRoutes.post('/', zValidator('json', CreateUserSchema), (c) => {
  const data = c.req.valid('json');

  const newUser: User = {
    id: crypto.randomUUID(),
    ...data,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  return c.json(newUser, 201);
});

// Update user
usersRoutes.patch(
  '/:id',
  zValidator('param', UserIdSchema),
  zValidator('json', UpdateUserSchema),
  (c) => {
    const { id } = c.req.valid('param');
    const data = c.req.valid('json');

    const userIndex = users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      return c.json({ error: 'User not found' }, 404);
    }

    users[userIndex] = { ...users[userIndex], ...data };
    return c.json(users[userIndex]);
  }
);

// Delete user
usersRoutes.delete('/:id', zValidator('param', UserIdSchema), (c) => {
  const { id } = c.req.valid('param');

  const userIndex = users.findIndex((u) => u.id === id);
  if (userIndex === -1) {
    return c.json({ error: 'User not found' }, 404);
  }

  users.splice(userIndex, 1);
  return c.json({ success: true });
});
