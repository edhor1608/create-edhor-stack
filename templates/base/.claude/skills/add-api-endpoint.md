---
name: add-api-endpoint
description: Create a new API endpoint with Zod validation
---

# Add API Endpoint

Creates a type-safe API endpoint with Zod schema validation.

## Usage

```
/add-api-endpoint users
/add-api-endpoint "projects/[id]"
```

## Process

### 1. Define Schema

```typescript
// src/api/schemas.ts (or add to existing)
import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  createdAt: z.string().datetime(),
});

export type User = z.infer<typeof UserSchema>;

export const UsersResponseSchema = z.object({
  users: z.array(UserSchema),
  total: z.number(),
  nextCursor: z.string().nullable(),
});

export type UsersResponse = z.infer<typeof UsersResponseSchema>;
```

### 2. Create Query Options

```typescript
// src/api/queries.ts (or src/lib/queries.ts for web)
import { queryOptions } from '@tanstack/react-query';
import { fetchValidated } from './client';
import { UserSchema, UsersResponseSchema } from './schemas';

export const usersQueryOptions = (cursor?: string) =>
  queryOptions({
    queryKey: ['users', { cursor }],
    queryFn: () =>
      fetchValidated(
        `/api/users${cursor ? `?cursor=${cursor}` : ''}`,
        UsersResponseSchema
      ),
  });

export const userQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ['users', id],
    queryFn: () => fetchValidated(`/api/users/${id}`, UserSchema),
  });
```

### 3. Create Server Function (Web)

```typescript
// src/routes/api/users.ts
import { createServerFn } from '@tanstack/start';
import { z } from 'zod';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';

export const getUsers = createServerFn('GET', async () => {
  return await db.select().from(users);
});

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

export const createUser = createServerFn('POST', async (input: unknown) => {
  const data = CreateUserSchema.parse(input);
  const [user] = await db.insert(users).values(data).returning();
  return user;
});
```

### 4. Use in Component

```tsx
// Web
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersQueryOptions } from '@/lib/queries';
import { createUser } from '@/routes/api/users';

function UsersPage() {
  const { data, isLoading } = useQuery(usersQueryOptions());
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  if (isLoading) return <div>Loading...</div>;
  return <UserList users={data.users} />;
}
```

```tsx
// Mobile
import { useQuery } from '@tanstack/react-query';
import { usersQueryOptions } from '@/api/queries';

function UsersScreen() {
  const { data, isLoading } = useQuery(usersQueryOptions());

  if (isLoading) return <LoadingSpinner />;
  return <UserList users={data.users} />;
}
```

## Conventions

- Schema names end with `Schema`
- Types derived from schemas with `z.infer`
- Query options follow pattern: `[resource]QueryOptions`
- Always validate responses with `fetchValidated`
- Use cursor-based pagination for lists
- Include `total` count for paginated responses
