# STACK.md - Edhor Stack Best Practices

> This document serves as context for AI assistants and developers working on projects scaffolded with create-edhor-stack. It captures patterns derived from production applications.

---

## Table of Contents

1. [Core Stack](#core-stack)
2. [Framework Choices](#framework-choices)
3. [Styling Patterns](#styling-patterns)
4. [State Management](#state-management)
5. [Database Options](#database-options)
6. [Authentication](#authentication)
7. [Testing Strategies](#testing-strategies)
8. [Deployment Patterns](#deployment-patterns)
9. [Code Organization](#code-organization)
10. [UI/Accessibility Guidelines](#uiaccessibility-guidelines)

---

## Core Stack

### Always Included

| Tool | Purpose | Version |
|------|---------|---------|
| Bun | Package manager & runtime | 1.3+ |
| Turborepo | Monorepo build orchestration | 2.5+ |
| TypeScript | Type safety | 5.8+ |
| Biome | Linting & formatting (replaces ESLint/Prettier) | 2.3+ |
| Husky | Git hooks | 9.1+ |

### Why Bun?

- Faster package installation than npm/pnpm
- Native TypeScript execution (no build step for dev)
- Built-in test runner compatible with Vitest API
- Workspace support for monorepos

### Why Turborepo?

- Intelligent caching reduces CI time by 70-90%
- Parallel task execution
- Remote caching for team workflows
- Simple configuration

---

## Framework Choices

### Web: TanStack Start

**Use for:** All web applications requiring SSR, file-based routing, or SEO.

```typescript
// app.config.ts
import { defineConfig } from "@tanstack/start/config";
import viteTsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  vite: {
    plugins: [viteTsConfigPaths()],
  },
});
```

**Key patterns:**

- File-based routing in `src/routes/`
- `__root.tsx` for layout and providers
- Route loaders for data fetching
- Server functions for API-like operations

**When NOT to use:**

- Static sites (use Astro)
- Simple SPAs without SSR needs (use Vite + React Router)

### Mobile: Expo + React Native

**Use for:** iOS and Android applications with shared React Native codebase.

```typescript
// App entry with Expo Router
import { Stack } from "expo-router";

export default function Layout() {
  return <Stack />;
}
```

**Key patterns:**

- Expo Router for file-based navigation
- Expo modules over bare React Native packages
- EAS Build for CI/CD
- `expo-dev-client` for custom native modules

**When NOT to use:**

- Heavy native customization (consider bare React Native)
- Web-only applications

---

## Styling Patterns

### Tailwind CSS v4

**Configuration (v4 style):**

```css
/* styles.css */
@import "tailwindcss";

@theme {
  --color-primary: oklch(0.7 0.15 200);
  --color-secondary: oklch(0.6 0.1 250);
  --font-sans: "Inter", system-ui, sans-serif;
}
```

**Best practices:**

1. Use CSS variables for theming via `@theme`
2. Prefer `oklch()` for perceptually uniform colors
3. Keep utility classes; extract components for repeated patterns
4. Use `cn()` helper for conditional classes

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### shadcn/ui

**Installation pattern:**

```bash
bunx shadcn@latest init
bunx shadcn@latest add button card dialog
```

**Usage guidelines:**

1. Components live in `packages/ui/src/components/`
2. Copy-paste model allows full customization
3. Always use the `cn()` utility for class merging
4. Prefer composition over configuration

```tsx
// Composable pattern
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

### Icons: Lucide React

```tsx
import { Search, Menu, X } from "lucide-react";

// Consistent sizing
<Search className="size-4" />
<Menu className="size-5" />
```

**Guidelines:**

- Use `size-*` for width and height together
- Prefer stroke icons for UI, filled for emphasis
- Import individual icons, not the entire package

---

## State Management

### Decision Matrix

| Scenario | Solution |
|----------|----------|
| Server state (REST/GraphQL) | TanStack React Query |
| Real-time data | Convex `useQuery` |
| Global UI state | Zustand |
| Form state | React Hook Form + Zod |
| URL state | TanStack Router search params |
| Local component state | `useState` / `useReducer` |

### TanStack React Query

**For traditional REST/GraphQL APIs:**

```typescript
// queries/users.ts
import { queryOptions } from "@tanstack/react-query";

export const usersQueryOptions = queryOptions({
  queryKey: ["users"],
  queryFn: () => fetch("/api/users").then((r) => r.json()),
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// Usage in component
const { data, isLoading } = useQuery(usersQueryOptions);
```

**Best practices:**

1. Define query options in separate files
2. Use `queryKey` factories for consistency
3. Set appropriate `staleTime` (default is 0)
4. Use `useMutation` for write operations with `onSuccess` invalidation

### Convex Real-time

**For real-time features:**

```typescript
// convex/messages.ts
import { query } from "./_generated/server";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("messages").order("desc").take(50);
  },
});

// Component
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function Messages() {
  const messages = useQuery(api.messages.list);
  // Automatically re-renders on database changes
}
```

### Zustand (Global UI State)

```typescript
// stores/ui.ts
import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
```

**Use Zustand for:**

- Modal/dialog open states
- Sidebar visibility
- Theme preferences
- Any UI state shared across components

**Do NOT use for:**

- Server data (use React Query/Convex)
- Form data (use React Hook Form)

---

## Database Options

### Convex (Serverless Real-time)

**Best for:**

- Real-time collaborative features
- Rapid prototyping
- Projects without existing database
- Applications needing subscriptions

**Schema definition:**

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  posts: defineTable({
    authorId: v.id("users"),
    title: v.string(),
    content: v.string(),
    published: v.boolean(),
  }).index("by_author", ["authorId"]),
});
```

**Key patterns:**

1. Use `v.id("table")` for foreign keys
2. Define indexes for query patterns
3. Use `ctx.db.query().withIndex()` for efficient queries
4. Mutations are automatically transactional

### Drizzle + PostgreSQL (Traditional)

**Best for:**

- Complex SQL queries
- Existing PostgreSQL database
- Need for raw SQL escape hatch
- Strict relational data modeling

**Schema definition:**

```typescript
// packages/database/src/schema.ts
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  authorId: uuid("author_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  published: boolean("published").default(false).notNull(),
});
```

**Query patterns:**

```typescript
// Simple select
const allUsers = await db.select().from(users);

// With relations
const usersWithPosts = await db.query.users.findMany({
  with: { posts: true },
});

// Complex query
const result = await db
  .select()
  .from(posts)
  .where(and(eq(posts.published, true), gt(posts.createdAt, lastWeek)));
```

### Migration Strategy

```bash
# Drizzle migrations
bun drizzle-kit generate  # Generate migration
bun drizzle-kit migrate   # Apply migration
bun drizzle-kit studio    # Visual database browser
```

---

## Authentication

### Better Auth

**Why Better Auth:**

- Framework-agnostic
- Works with Convex and Drizzle
- Social providers out of the box
- Type-safe API

**Server setup (with Drizzle):**

```typescript
// lib/auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/packages/database";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
});
```

**Client setup:**

```typescript
// lib/auth-client.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
});

export const { useSession, signIn, signOut } = authClient;
```

**Protected routes (TanStack Start):**

```typescript
// routes/dashboard.tsx
import { createFileRoute, redirect } from "@tanstack/react-router";
import { auth } from "@/lib/auth";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async ({ context }) => {
    const session = await auth.api.getSession({
      headers: context.request.headers,
    });
    if (!session) throw redirect({ to: "/login" });
  },
  component: Dashboard,
});
```

**With Convex:**

```typescript
// convex/auth.config.ts
import { convexAuth } from "@convex-dev/auth/server";
import Google from "@auth/core/providers/google";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [Google],
});
```

---

## Testing Strategies

### Test Pyramid

```
        /\
       /  \     E2E (Playwright) - Critical user flows
      /----\
     /      \   Integration - API routes, database
    /--------\
   /          \ Unit (Vitest) - Utils, hooks, components
  --------------
```

### Vitest (Unit & Integration)

**Configuration:**

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
```

**Testing patterns:**

```typescript
// Component test
import { render, screen } from "@testing-library/react";
import { Button } from "./button";

test("renders button with text", () => {
  render(<Button>Click me</Button>);
  expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
});

// Hook test
import { renderHook, act } from "@testing-library/react";
import { useCounter } from "./use-counter";

test("increments counter", () => {
  const { result } = renderHook(() => useCounter());
  act(() => result.current.increment());
  expect(result.current.count).toBe(1);
});

// API test
import { describe, it, expect, vi } from "vitest";

describe("userService", () => {
  it("fetches users", async () => {
    const users = await userService.getAll();
    expect(users).toHaveLength(3);
  });
});
```

### Playwright (E2E)

**Configuration:**

```typescript
// playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "bun run dev",
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

**Test patterns:**

```typescript
// e2e/auth.spec.ts
import { test, expect } from "@playwright/test";

test("user can sign in", async ({ page }) => {
  await page.goto("/login");
  await page.fill('[name="email"]', "test@example.com");
  await page.fill('[name="password"]', "password123");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL("/dashboard");
});
```

**Testing guidelines:**

1. Test user flows, not implementation
2. Use data-testid for stable selectors
3. Run E2E in CI, not on every commit
4. Keep E2E tests focused (< 20 per project)

---

## Deployment Patterns

### Web: Netlify (Recommended)

**netlify.toml:**

```toml
[build]
  command = "turbo build --filter=@project/web"
  publish = "apps/web/.output/public"

[build.environment]
  NODE_VERSION = "22"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Environment variables:**

- Set in Netlify dashboard under Site Settings > Environment Variables
- Use `VITE_` prefix for client-accessible variables
- Never commit `.env` files

### Web: Vercel (Alternative)

**vercel.json:**

```json
{
  "buildCommand": "turbo build --filter=@project/web",
  "outputDirectory": "apps/web/.output",
  "installCommand": "bun install"
}
```

### Mobile: EAS (Expo Application Services)

**eas.json:**

```json
{
  "cli": { "version": ">= 5.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

**Commands:**

```bash
eas build --platform ios --profile preview   # TestFlight
eas build --platform android --profile preview  # Internal
eas submit --platform ios  # App Store
```

### Convex Deployment

```bash
npx convex deploy  # Production deployment
npx convex dev     # Local development with sync
```

---

## Code Organization

### Monorepo Structure

```
project/
├── apps/
│   ├── web/              # TanStack Start application
│   │   ├── src/
│   │   │   ├── routes/   # File-based routes
│   │   │   ├── components/  # App-specific components
│   │   │   ├── hooks/    # App-specific hooks
│   │   │   └── lib/      # App utilities
│   │   └── package.json
│   └── mobile/           # Expo application
│       ├── app/          # Expo Router routes
│       ├── components/
│       └── package.json
├── packages/
│   ├── ui/               # Shared shadcn/ui components
│   │   ├── src/
│   │   │   ├── components/
│   │   │   └── lib/
│   │   └── package.json
│   ├── database/         # Drizzle schema & client
│   │   ├── src/
│   │   │   ├── schema.ts
│   │   │   ├── client.ts
│   │   │   └── migrations/
│   │   └── package.json
│   └── auth/             # Better Auth configuration
├── convex/               # Convex functions (if using)
│   ├── schema.ts
│   ├── _generated/
│   └── *.ts
├── turbo.json
├── biome.json
└── package.json
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files (components) | kebab-case | `user-profile.tsx` |
| Files (utilities) | kebab-case | `format-date.ts` |
| React components | PascalCase | `UserProfile` |
| Functions | camelCase | `formatDate` |
| Constants | SCREAMING_SNAKE | `MAX_RETRIES` |
| Types/Interfaces | PascalCase | `UserProfile` |
| CSS classes | kebab-case | `user-profile-header` |

### Import Organization

```typescript
// 1. External packages
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

// 2. Internal packages (monorepo)
import { Button } from "@project/ui";
import { db } from "@project/database";

// 3. Relative imports (current package)
import { formatDate } from "@/lib/utils";
import { UserCard } from "@/components/user-card";

// 4. Types (always last)
import type { User } from "@/types";
```

### File Colocation

Keep related files together:

```
components/
  user-profile/
    index.tsx           # Main component
    user-profile.test.tsx  # Tests
    use-user-data.ts    # Related hook
```

---

## UI/Accessibility Guidelines

### Accessibility Checklist

- [ ] All interactive elements are keyboard accessible
- [ ] Focus states are visible
- [ ] Color contrast meets WCAG 2.1 AA (4.5:1 for text)
- [ ] Images have alt text
- [ ] Form inputs have labels
- [ ] Error messages are announced to screen readers
- [ ] Page has proper heading hierarchy (h1 > h2 > h3)

### Semantic HTML

```tsx
// Good
<button onClick={handleClick}>Submit</button>
<a href="/about">About</a>

// Bad
<div onClick={handleClick}>Submit</div>
<span onClick={() => navigate("/about")}>About</span>
```

### Focus Management

```tsx
// Dialog focus trap (shadcn/ui handles this)
<Dialog>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    {/* Focus is trapped here */}
  </DialogContent>
</Dialog>
```

### Aria Labels

```tsx
// Icon-only buttons need labels
<Button variant="ghost" size="icon" aria-label="Close menu">
  <X className="size-4" />
</Button>

// Loading states
<Button disabled aria-busy={isLoading}>
  {isLoading ? <Spinner /> : "Submit"}
</Button>
```

### Responsive Design

```tsx
// Mobile-first approach
<div className="flex flex-col md:flex-row gap-4">
  <aside className="w-full md:w-64">Sidebar</aside>
  <main className="flex-1">Content</main>
</div>

// Touch targets (min 44x44px)
<Button className="min-h-11 min-w-11">Tap me</Button>
```

### Dark Mode

```typescript
// Theme toggle with system preference
const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

useEffect(() => {
  const root = document.documentElement;
  if (theme === "system") {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    root.classList.toggle("dark", systemTheme === "dark");
  } else {
    root.classList.toggle("dark", theme === "dark");
  }
}, [theme]);
```

---

## Quick Reference

### Common Commands

```bash
# Development
bun dev                    # Start all apps
bun dev --filter=web       # Start web only

# Building
bun build                  # Build all
turbo build --filter=web   # Build specific

# Testing
bun test                   # Run tests
bun test:e2e               # Run E2E

# Code quality
bun lint                   # Lint all
bun format                 # Format all
bun check                  # Lint + format

# Database (Drizzle)
bun db:generate            # Generate migration
bun db:migrate             # Apply migrations
bun db:studio              # Open Drizzle Studio

# Convex
npx convex dev             # Start Convex dev
npx convex deploy          # Deploy to production
```

### Environment Variables

```bash
# .env.local (never commit)
DATABASE_URL=postgresql://...
CONVEX_DEPLOYMENT=...

# Client-accessible (prefix with VITE_)
VITE_APP_URL=http://localhost:3000
```

### Recommended VS Code Extensions

- Biome (biomejs.biome)
- Tailwind CSS IntelliSense
- Pretty TypeScript Errors
- Error Lens
- GitLens

---

## Changelog

- **v0.1.0** - Initial documentation based on patterns from meinungsmache-app, picalyze, qwer-digest, unicasto
