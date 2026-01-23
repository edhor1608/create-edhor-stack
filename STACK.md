# STACK.md - Edhor Stack Best Practices

> This document captures the actual patterns used in Edhor production applications. It serves as context for AI assistants and developers working on projects scaffolded with create-edhor-stack.

---

## Table of Contents

1. [Core Stack](#core-stack)
2. [Environment Variables](#environment-variables)
3. [Expo Mobile Patterns](#expo-mobile-patterns)
4. [TanStack Start Web Patterns](#tanstack-start-web-patterns)
5. [Styling Patterns](#styling-patterns)
6. [Database Options](#database-options)
7. [Authentication](#authentication)
8. [Code Organization](#code-organization)
9. [UI/Accessibility Guidelines](#uiaccessibility-guidelines)

---

## Core Stack

### Always Included

| Tool | Purpose | Version |
|------|---------|---------|
| Bun | Package manager & runtime | 1.3+ |
| Turborepo | Monorepo build orchestration | 2.5+ |
| TypeScript | Type safety (strict mode) | 5.8+ |
| Biome | Linting & formatting (replaces ESLint/Prettier) | 2.3+ |
| Husky | Git hooks | 9.1+ |
| TanStack Query | Server state management | 5.x |
| t3-env | Type-safe environment variables | 0.12+ |

### Biome Configuration

```json
{
  "linter": {
    "rules": {
      "correctness": {
        "noUnusedImports": "error",
        "noUnusedVariables": "warn",
        "useHookAtTopLevel": "error"
      },
      "style": {
        "useImportType": "error"
      }
    }
  },
  "formatter": {
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "trailingCommas": "es5",
      "semicolons": "always"
    }
  }
}
```

---

## Environment Variables

Use [t3-env](https://env.t3.gg/) for type-safe environment variables with Zod validation.

### Web (TanStack Start)

```typescript
// src/lib/env.ts
import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    API_SECRET: z.string().min(32),
  },
  clientPrefix: 'VITE_',
  client: {
    VITE_APP_URL: z.string().url(),
    VITE_PUBLIC_API_URL: z.string().url(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    API_SECRET: process.env.API_SECRET,
    VITE_APP_URL: process.env.VITE_APP_URL,
    VITE_PUBLIC_API_URL: process.env.VITE_PUBLIC_API_URL,
  },
  emptyStringAsUndefined: true,
});
```

### Mobile (Expo)

```typescript
// src/lib/env.ts
import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  clientPrefix: 'EXPO_PUBLIC_',
  client: {
    EXPO_PUBLIC_API_URL: z.string().url(),
    EXPO_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  },
  runtimeEnv: {
    EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
    EXPO_PUBLIC_SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN,
  },
  emptyStringAsUndefined: true,
});
```

### Usage

```typescript
// Always import from env.ts, never use process.env directly
import { env } from '@/lib/env';

// Type-safe access with autocomplete
const apiUrl = env.EXPO_PUBLIC_API_URL;

// Server variables throw if accessed on client
const secret = env.API_SECRET; // Error on client!
```

### .env Files

```bash
# .env.local (never commit)
DATABASE_URL=postgresql://...
API_SECRET=your-secret-key

# Client variables (prefixed)
VITE_APP_URL=http://localhost:3000    # Web
EXPO_PUBLIC_API_URL=https://api.com   # Mobile
```

**Key rules:**
- Never use `process.env` directly - always use `env` object
- Server variables throw if accessed on client
- Client variables must be prefixed (`VITE_` or `EXPO_PUBLIC_`)
- All variables must be in `runtimeEnv` for bundler compatibility

---

## Expo Mobile Patterns

### State Management: Zustand with Persistence

**Multiple specialized stores, not one giant store:**

```typescript
// lib/store.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// App settings store
interface AppState {
  fontSize: 'small' | 'medium' | 'large';
  theme: 'light' | 'dark' | 'system';
  setFontSize: (size: AppState['fontSize']) => void;
  setTheme: (theme: AppState['theme']) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      fontSize: 'medium',
      theme: 'system',
      setFontSize: (fontSize) => set({ fontSize }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Search store (separate concern)
interface SearchState {
  query: string;
  recentSearches: string[];
  setQuery: (query: string) => void;
  addRecentSearch: (search: string) => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      query: '',
      recentSearches: [],
      setQuery: (query) => set({ query }),
      addRecentSearch: (search) =>
        set((state) => ({
          recentSearches: [search, ...state.recentSearches.filter((s) => s !== search)].slice(0, 10),
        })),
    }),
    {
      name: 'search-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

**Always use selectors to prevent re-renders:**

```typescript
// Good - only re-renders when fontSize changes
const fontSize = useAppStore((state) => state.fontSize);

// Bad - re-renders on ANY store change
const { fontSize } = useAppStore();
```

### API Layer: Zod Validation with fetchValidated

**Every API call validates responses with Zod:**

```typescript
// api/client.ts
import { z } from 'zod';

export async function fetchValidated<T>(
  url: string,
  schema: z.ZodType<T>,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  return schema.parse(data);
}

// api/schemas.ts
export const ArticleSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  publishedAt: z.string().datetime(),
  author: z.object({
    name: z.string(),
    avatar: z.string().url().optional(),
  }),
});

export const ArticlesResponseSchema = z.object({
  articles: z.array(ArticleSchema),
  nextCursor: z.string().nullable(),
});

export type Article = z.infer<typeof ArticleSchema>;

// api/queries.ts
import { queryOptions } from '@tanstack/react-query';

export const articlesQueryOptions = (cursor?: string) =>
  queryOptions({
    queryKey: ['articles', { cursor }],
    queryFn: () =>
      fetchValidated(
        `https://api.example.com/articles?cursor=${cursor ?? ''}`,
        ArticlesResponseSchema
      ),
  });
```

### TanStack Query: Offline-First Configuration

```typescript
// lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Keep cached data for 7 days (offline support)
      gcTime: 1000 * 60 * 60 * 24 * 7,
      // Data considered fresh for 5 minutes
      staleTime: 1000 * 60 * 5,
      // Try cache first, then network
      networkMode: 'offlineFirst',
      // Retry with exponential backoff
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
});

// Persist to AsyncStorage for true offline support
export const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'REACT_QUERY_OFFLINE_CACHE',
});
```

**App entry with persistence:**

```typescript
// app/_layout.tsx
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { queryClient, persister } from '@/lib/query-client';

export default function RootLayout() {
  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
      <Stack />
    </PersistQueryClientProvider>
  );
}
```

### Error Handling: Result Pattern

**Explicit error handling without try-catch everywhere:**

```typescript
// lib/result.ts
export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

// Usage in API calls
export async function fetchArticle(id: string): Promise<Result<Article, string>> {
  try {
    const article = await fetchValidated(`/api/articles/${id}`, ArticleSchema);
    return ok(article);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return err('Invalid response format');
    }
    return err(e instanceof Error ? e.message : 'Unknown error');
  }
}

// Usage in component
const result = await fetchArticle(id);
if (!result.ok) {
  showToast(result.error);
  return;
}
const article = result.value;
```

### Custom Hooks

```typescript
// hooks/useNetworkStatus.ts
import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    return NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });
  }, []);

  return isConnected;
}

// hooks/useDebouncedState.ts
import { useState, useEffect } from 'react';

export function useDebouncedState<T>(initialValue: T, delay: number = 300) {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return [debouncedValue, setValue, value] as const;
}
```

### Virtualized Lists: FlashList

```typescript
import { FlashList } from '@shopify/flash-list';

function ArticleList({ articles }: { articles: Article[] }) {
  return (
    <FlashList
      data={articles}
      renderItem={({ item }) => <ArticleCard article={item} />}
      estimatedItemSize={120}
      keyExtractor={(item) => item.id}
    />
  );
}
```

### Navigation: Expo Router

```typescript
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Home, Search, Settings } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

// app/article/[slug].tsx - Dynamic route
import { useLocalSearchParams } from 'expo-router';

export default function ArticleScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data: article } = useQuery(articleQueryOptions(slug));
  // ...
}
```

---

## TanStack Start Web Patterns

> **Note**: TanStack Start uses Vite 6+ as its build tool. Configuration lives in `vite.config.ts` using the `@tanstack/react-start/plugin/vite` plugin.

### Vite Configuration

```typescript
// vite.config.ts
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import tailwindcss from '@tailwindcss/vite';
import viteReact from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    tailwindcss(),
    tsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tanstackStart({
      srcDirectory: 'src',
    }),
    viteReact(),
  ],
});
```

### Router Configuration

```typescript
// src/router.tsx
import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

export function getRouter() {
  const router = createRouter({
    routeTree,
    defaultPreload: 'intent',
    scrollRestoration: true,
  });
  return router;
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
```

### Data Fetching: TanStack Query

**Query options factories for consistency:**

```typescript
// lib/queries.ts
import { queryOptions } from '@tanstack/react-query';

export const projectsQueryOptions = queryOptions({
  queryKey: ['projects'],
  queryFn: async () => {
    const response = await fetch('/api/projects');
    return response.json();
  },
  staleTime: 1000 * 60 * 5,
});

export const projectQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ['projects', id],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${id}`);
      return response.json();
    },
  });
```

**Route loaders with React Query:**

```typescript
// routes/projects.tsx
import { createFileRoute } from '@tanstack/react-router';
import { projectsQueryOptions } from '@/lib/queries';

export const Route = createFileRoute('/projects')({
  loader: ({ context }) => context.queryClient.ensureQueryData(projectsQueryOptions),
  component: ProjectsPage,
});

function ProjectsPage() {
  const { data: projects } = useSuspenseQuery(projectsQueryOptions);
  return <ProjectList projects={projects} />;
}
```

### Real-time Data: Convex

```typescript
// convex/messages.ts
import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const list = query({
  args: { channelId: v.id('channels') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('messages')
      .withIndex('by_channel', (q) => q.eq('channelId', args.channelId))
      .order('desc')
      .take(50);
  },
});

export const send = mutation({
  args: {
    channelId: v.id('channels'),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');

    return await ctx.db.insert('messages', {
      channelId: args.channelId,
      content: args.content,
      authorId: identity.subject,
      createdAt: Date.now(),
    });
  },
});
```

```typescript
// Component usage
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

function Chat({ channelId }: { channelId: Id<'channels'> }) {
  const messages = useQuery(api.messages.list, { channelId });
  const sendMessage = useMutation(api.messages.send);

  // messages automatically updates when database changes
}
```

### Tables: TanStack Table

```typescript
// components/data-table.tsx
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table';

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
}

export function DataTable<T>({ data, columns }: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: { sorting, columnFilters },
  });

  return (
    <div>
      {/* Filter input */}
      <input
        placeholder="Filter..."
        value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
        onChange={(e) => table.getColumn('name')?.setFilterValue(e.target.value)}
      />

      {/* Table */}
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} onClick={header.column.getToggleSortingHandler()}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {{ asc: ' ↑', desc: ' ↓' }[header.column.getIsSorted() as string] ?? null}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div>
        <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Previous
        </button>
        <span>
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
        <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next
        </button>
      </div>
    </div>
  );
}
```

### Server Functions

```typescript
// routes/api/projects.ts
import { createServerFn } from '@tanstack/start';
import { db } from '@/lib/db';
import { projects } from '@/lib/schema';

export const getProjects = createServerFn('GET', async () => {
  return await db.select().from(projects);
});

export const createProject = createServerFn('POST', async (data: { name: string; description?: string }) => {
  const [project] = await db.insert(projects).values(data).returning();
  return project;
});
```

---

## Styling Patterns

### Tailwind CSS v4

```css
/* app.css */
@import "tailwindcss";

@theme {
  --color-primary: oklch(0.7 0.15 200);
  --color-secondary: oklch(0.6 0.1 250);
  --font-sans: "Inter", system-ui, sans-serif;
}
```

### shadcn/ui with cn() Helper

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Icons: Lucide

```tsx
import { Search, Menu, X, ChevronRight } from 'lucide-react';

// Consistent sizing with size-* utility
<Search className="size-4" />
<Menu className="size-5" />

// React Native
import { Search, Menu } from 'lucide-react-native';
<Search color={colors.gray[500]} size={20} />
```

---

## Database Options

### Drizzle + PostgreSQL

**Schema with custom types (pgvector example):**

```typescript
// lib/schema.ts
import { pgTable, text, timestamp, uuid, customType } from 'drizzle-orm/pg-core';

// Custom pgvector type
const vector = customType<{ data: number[]; driverData: string }>({
  dataType() {
    return 'vector(1536)';
  },
  toDriver(value: number[]): string {
    return `[${value.join(',')}]`;
  },
  fromDriver(value: string): number[] {
    return JSON.parse(value.replace('[', '[').replace(']', ']'));
  },
});

export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  content: text('content').notNull(),
  embedding: vector('embedding'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

**Environment-aware client:**

```typescript
// lib/db.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export const db = drizzle(pool, { schema });
```

### Convex Schema

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    image: v.optional(v.string()),
  }).index('by_email', ['email']),

  projects: defineTable({
    name: v.string(),
    ownerId: v.id('users'),
    createdAt: v.number(),
  }).index('by_owner', ['ownerId']),

  tasks: defineTable({
    projectId: v.id('projects'),
    title: v.string(),
    completed: v.boolean(),
    order: v.number(),
  })
    .index('by_project', ['projectId'])
    .index('by_project_order', ['projectId', 'order']),
});
```

---

## Authentication

### Better Auth with Drizzle

```typescript
// lib/auth.ts
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db';

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg' }),
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
});
```

```typescript
// lib/auth-client.ts
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: process.env.VITE_APP_URL,
});

export const { useSession, signIn, signOut } = authClient;
```

### Better Auth with Convex

```typescript
// convex/auth.config.ts
import { convexAuth } from '@convex-dev/auth/server';
import Google from '@auth/core/providers/google';

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [Google],
});
```

### Protected Routes (TanStack Start)

```typescript
// routes/dashboard.tsx
import { createFileRoute, redirect } from '@tanstack/react-router';
import { auth } from '@/lib/auth';

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async ({ context }) => {
    const session = await auth.api.getSession({
      headers: context.request.headers,
    });
    if (!session) {
      throw redirect({ to: '/login' });
    }
    return { session };
  },
  component: Dashboard,
});
```

---

## Code Organization

### Monorepo Structure

```
project/
├── apps/
│   ├── web/                    # TanStack Start
│   │   ├── src/
│   │   │   ├── routes/         # File-based routing
│   │   │   ├── components/     # App components
│   │   │   └── lib/            # Utilities, queries
│   │   └── package.json
│   └── mobile/                 # Expo
│       ├── app/                # Expo Router
│       ├── src/
│       │   ├── api/            # API client, schemas
│       │   ├── components/
│       │   ├── hooks/
│       │   └── lib/            # Store, utils
│       └── package.json
├── packages/
│   ├── ui/                     # shadcn/ui components
│   └── database/               # Drizzle schema (if using)
├── convex/                     # Convex functions (if using)
├── turbo.json
├── biome.json
└── package.json
```

### Import Alias

All imports use `@/` prefix:

```typescript
import { useAppStore } from '@/lib/store';
import { ArticleCard } from '@/components/article-card';
import { fetchValidated } from '@/api/client';
```

### Section Comments

Use this format for organizing large files:

```typescript
// ============================================================================
// TYPES
// ============================================================================

interface User {
  // ...
}

// ============================================================================
// STORE
// ============================================================================

export const useUserStore = create<UserState>()(...);

// ============================================================================
// HOOKS
// ============================================================================

export function useCurrentUser() {
  // ...
}
```

---

## UI/Accessibility Guidelines

### Keyboard & Focus

- Full keyboard support per WAI-ARIA APG patterns
- Visible focus rings (`:focus-visible`)
- Focus management in modals/dialogs
- Never `outline: none` without replacement

### Touch Targets

- Minimum 44x44px on mobile
- `touch-action: manipulation` to prevent double-tap zoom
- Input font-size >= 16px to prevent iOS zoom

### Forms

- Keep submit enabled until request starts
- Show spinner with original label during loading
- Inline errors next to fields
- Focus first error on submit
- Warn on unsaved changes before navigation

### Performance

- Virtualize lists > 50 items (FlashList for RN)
- Preload above-fold images, lazy-load rest
- Profile with CPU/network throttling
- Mutations target < 500ms

### Dark Mode

```typescript
// Set color-scheme on html element
document.documentElement.style.colorScheme = theme;

// Use CSS variables for theming
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.1 0 0);
}

.dark {
  --background: oklch(0.1 0 0);
  --foreground: oklch(0.95 0 0);
}
```

---

## Quick Reference

### Commands

```bash
# Development
bun dev                    # Start all apps
bun dev --filter=web       # Start web only
bun dev --filter=mobile    # Start mobile only

# Building
bun build                  # Build all
turbo build --filter=web   # Build specific

# Code quality
bun lint                   # Lint all
bun check                  # Lint + format with auto-fix

# Database (Drizzle)
bun db:generate            # Generate migration
bun db:migrate             # Apply migrations
bun db:studio              # Open Drizzle Studio

# Convex
npx convex dev             # Start Convex dev
npx convex deploy          # Deploy to production

# Mobile
bun ios                    # Run on iOS simulator
bun android                # Run on Android emulator
eas build --platform ios   # Build for TestFlight
```

### Key Dependencies

| Category | Web | Mobile |
|----------|-----|--------|
| Framework | TanStack Start | Expo SDK 54 |
| Routing | TanStack Router | Expo Router |
| State | TanStack Query | Zustand + TanStack Query |
| Forms | Plain useState | Plain useState |
| Tables | TanStack Table | - |
| Lists | - | FlashList |
| Auth | Better Auth | Better Auth |
| Styling | Tailwind + shadcn | React Native StyleSheet |

---
