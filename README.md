# create-edhor-stack

Scaffold opinionated Bun + Turborepo monorepo projects with interactive prompts.

## Quick Start

```bash
bunx create-edhor-stack my-app
# or
npx create-edhor-stack my-app
```

## What You Get

### Base (always included)

- **Bun + Turborepo** - Fast monorepo with parallel builds
- **Biome** - Linting + formatting (replaces ESLint + Prettier)
- **Husky + lint-staged** - Pre-commit hooks
- **TypeScript** - Strict mode, path aliases
- **AI-ready** - CLAUDE.md, AGENTS.md, and Claude Code skills pre-configured

### Apps

| App | Stack |
|-----|-------|
| **Web** | TanStack Start (Vite), React 19, file-based routing, SSR |
| **Mobile** | Expo SDK 54, React Native, expo-router |
| **API** (optional) | Hono or Elysia with typed routes |

### Packages

| Package | Description |
|---------|-------------|
| **UI** | shadcn/ui + Tailwind v4, pre-configured with Button component |
| **Shared** | Common types, Zod schemas, utilities for web & mobile |
| **Auth** | Better Auth (PostgreSQL) or Convex Auth |
| **Stripe** | Payment integration with webhooks |

### Database Options

| Option | Stack |
|--------|-------|
| **PostgreSQL** | Drizzle ORM with type-safe queries |
| **Convex** | Real-time database + serverless functions |
| **None** | External API / BaaS |

### Extras

- **Testing** - Vitest + Playwright setup
- **CI** - GitHub Actions workflows
- **Deployment** - Dockerfile + fly.toml for Fly.io

## Interactive Prompts

```
┌  create-edhor-stack
│
◆  Project name
│  my-app
│
◆  Which apps do you want?
│  ◼ Web (TanStack Start)
│  ◻ Mobile (Expo + React Native)
│
◆  Database?
│  ○ None
│  ● PostgreSQL (Drizzle ORM)
│  ○ Convex
│
◆  API framework?
│  ● None (TanStack Start server functions)
│  ○ Hono
│  ○ Elysia
│
◆  Additional packages?
│  ◼ UI (shadcn/ui + Tailwind)
│  ◼ Shared (types + schemas)
│  ◻ Auth
│  ◻ Stripe
│
◆  Add testing setup? (Vitest + Playwright)
│  Yes
│
◆  Add GitHub Actions CI?
│  Yes
│
◆  Add deployment config? (Dockerfile + fly.toml)
│  Yes
│
└  Done!
```

## After Scaffolding

```bash
cd my-app
bun install
bun dev
```

This starts all apps in parallel:
- Web: http://localhost:3000
- Mobile: Expo DevTools
- API: http://localhost:4000 (if selected)

### Add UI Components

```bash
cd packages/ui
bunx shadcn add card dialog table
```

## Project Structure

```
my-app/
├── apps/
│   ├── web/          # TanStack Start app
│   ├── mobile/       # Expo app
│   └── api/          # Hono or Elysia (optional)
├── packages/
│   ├── ui/           # shadcn/ui components
│   ├── shared/       # Types, schemas, utils
│   ├── auth/         # Authentication (optional)
│   └── stripe/       # Payments (optional)
├── CLAUDE.md         # AI assistant context
├── AGENTS.md         # Multi-agent guidelines
├── turbo.json
├── biome.json
└── package.json
```

## Philosophy

See [STACK.md](./STACK.md) for opinionated best practices on:
- Framework choices and why
- Styling patterns
- State management
- Database design
- Authentication flows
- Testing strategies
- Deployment patterns

## Requirements

- [Bun](https://bun.sh) v1.0+
- Node.js 22+ (for some dependencies)

## License

MIT
