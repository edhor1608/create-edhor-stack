# create-edhor-stack

Scaffold opinionated Bun + Turborepo projects with interactive prompts.

## Usage

```bash
bunx create-edhor-stack my-app
# or
npx create-edhor-stack my-app
# or
bun create edhor-stack my-app
```

## What's Included

**Base (always):**
- Bun + Turborepo monorepo
- Biome (linting + formatting)
- Husky + lint-staged (pre-commit hooks)
- TypeScript strict mode

**Apps:**
- Web app (TanStack Start) - File-based routing, React 19, SSR
- Mobile app (Expo SDK 54) - React Native with expo-router

**Packages:**
- UI (shadcn/ui + Tailwind) - Initialized with your choice of style and base color

## Interactive Prompts

The CLI guides you through setup:

1. **Project name** - Your project's name (lowercase, hyphens allowed)
2. **Apps** - Select web, mobile, or both
3. **Backend** - None, Convex (real-time), or Drizzle (traditional)
4. **Packages** - UI components with shadcn/ui
5. **Testing** - Vitest + Playwright (coming soon)
6. **CI** - GitHub Actions (coming soon)

If you select the UI package, you'll also choose:
- **Style** - New York or Default
- **Base color** - Zinc, Slate, Stone, Neutral, or Gray

## Philosophy

See [STACK.md](./STACK.md) for our opinionated best practices covering:
- Framework choices
- Styling patterns
- State management
- Database options
- Authentication
- Testing strategies
- Deployment patterns
- Accessibility guidelines

## Requirements

- [Bun](https://bun.sh) v1.0 or later
- Node.js 22+ (for some dependencies)

## After Scaffolding

```bash
cd my-app
bun install
git init && git add -A && git commit -m "Initial commit"
bun dev
```

## License

MIT
