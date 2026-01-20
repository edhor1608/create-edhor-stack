# create-edhor-stack CLI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a CLI scaffolding tool that creates opinionated Bun + Turborepo projects with interactive prompts for optional features.

**Architecture:** TypeScript CLI using @clack/prompts for interactive UI. Templates stored as files that get copied/transformed based on user selections. Published to npm for `bunx create-edhor-stack` usage.

**Tech Stack:** Bun, TypeScript, @clack/prompts, picocolors, fs-extra

---

## Project Structure (Target)

```
create-edhor-stack/
├── src/
│   ├── index.ts              # CLI entry point
│   ├── prompts.ts            # Interactive prompts
│   ├── scaffold.ts           # File copying/transformation
│   └── utils.ts              # Helpers (colors, paths, etc.)
├── templates/
│   ├── base/                 # Always included (turbo, biome, husky)
│   │   ├── package.json.hbs
│   │   ├── turbo.json
│   │   ├── biome.json
│   │   ├── tsconfig.json
│   │   ├── .gitignore
│   │   ├── .husky/
│   │   │   └── pre-commit
│   │   └── .lintstagedrc
│   ├── apps/
│   │   ├── web/              # TanStack Start app template
│   │   └── mobile/           # Expo app template
│   ├── packages/
│   │   ├── ui/               # shadcn/ui components
│   │   ├── database/         # Drizzle setup
│   │   └── auth/             # Better Auth setup
│   └── extras/
│       ├── convex/           # Convex backend
│       ├── testing/          # Vitest + Playwright
│       └── ci/               # GitHub Actions workflows
├── STACK.md                  # Best practices documentation
├── package.json
├── tsconfig.json
└── README.md
```

---

## Task 1: Project Foundation

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `src/index.ts`

**Step 1: Create package.json**

```json
{
  "name": "create-edhor-stack",
  "version": "0.1.0",
  "description": "Scaffold opinionated Bun + Turborepo projects",
  "type": "module",
  "bin": {
    "create-edhor-stack": "./dist/index.js"
  },
  "files": [
    "dist",
    "templates",
    "STACK.md"
  ],
  "scripts": {
    "dev": "bun run src/index.ts",
    "build": "bun build src/index.ts --outdir dist --target node",
    "prepublishOnly": "bun run build"
  },
  "keywords": [
    "cli",
    "scaffold",
    "turborepo",
    "bun",
    "tanstack",
    "template"
  ],
  "author": "Jonas Rohde",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/edhor1608/create-edhor-stack"
  },
  "dependencies": {
    "@clack/prompts": "^0.10.0",
    "picocolors": "^1.1.1",
    "fs-extra": "^11.3.0"
  },
  "devDependencies": {
    "@types/fs-extra": "^11.0.4",
    "@types/node": "^22.15.21",
    "typescript": "^5.8.3"
  }
}
```

**Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true,
    "resolveJsonModule": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "templates"]
}
```

**Step 3: Create .gitignore**

```
node_modules/
dist/
*.log
.DS_Store
```

**Step 4: Create minimal src/index.ts**

```typescript
#!/usr/bin/env node
console.log("create-edhor-stack");
```

**Step 5: Install dependencies and verify**

Run: `cd /Users/jonas/repos/create-edhor-stack && bun install`
Expected: Dependencies installed successfully

**Step 6: Test CLI runs**

Run: `cd /Users/jonas/repos/create-edhor-stack && bun run dev`
Expected: Outputs "create-edhor-stack"

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: project foundation with package.json and tsconfig"
```

---

## Task 2: CLI Entry Point with Clack

**Files:**
- Modify: `src/index.ts`
- Create: `src/prompts.ts`
- Create: `src/types.ts`

**Step 1: Create src/types.ts**

```typescript
export interface ProjectConfig {
  name: string;
  apps: ("web" | "mobile")[];
  packages: ("ui" | "database" | "auth")[];
  backend: "none" | "convex" | "drizzle";
  testing: boolean;
  ci: boolean;
}
```

**Step 2: Create src/prompts.ts**

```typescript
import * as p from "@clack/prompts";
import pc from "picocolors";
import type { ProjectConfig } from "./types.js";

export async function runPrompts(projectName?: string): Promise<ProjectConfig | null> {
  p.intro(pc.bgCyan(pc.black(" create-edhor-stack ")));

  const project = await p.group(
    {
      name: () =>
        p.text({
          message: "Project name",
          initialValue: projectName || "my-app",
          validate: (value) => {
            if (!value) return "Project name is required";
            if (!/^[a-z0-9-]+$/.test(value)) return "Use lowercase letters, numbers, and hyphens only";
          },
        }),

      apps: () =>
        p.multiselect({
          message: "Which apps do you want?",
          options: [
            { value: "web", label: "Web (TanStack Start)", hint: "recommended" },
            { value: "mobile", label: "Mobile (Expo + React Native)" },
          ],
          initialValues: ["web"],
          required: true,
        }),

      backend: () =>
        p.select({
          message: "Backend setup?",
          options: [
            { value: "none", label: "None", hint: "external API" },
            { value: "convex", label: "Convex", hint: "real-time serverless" },
            { value: "drizzle", label: "Drizzle + PostgreSQL", hint: "traditional" },
          ],
          initialValue: "none",
        }),

      packages: ({ results }) =>
        p.multiselect({
          message: "Additional packages?",
          options: [
            { value: "ui", label: "UI (shadcn/ui + Tailwind)", hint: "recommended" },
            ...(results.backend === "drizzle"
              ? [{ value: "auth", label: "Auth (Better Auth)" }]
              : []),
          ],
          required: false,
        }),

      testing: () =>
        p.confirm({
          message: "Add testing setup? (Vitest + Playwright)",
          initialValue: true,
        }),

      ci: () =>
        p.confirm({
          message: "Add GitHub Actions CI?",
          initialValue: true,
        }),
    },
    {
      onCancel: () => {
        p.cancel("Setup cancelled.");
        process.exit(0);
      },
    }
  );

  return project as ProjectConfig;
}
```

**Step 3: Update src/index.ts**

```typescript
#!/usr/bin/env node
import * as p from "@clack/prompts";
import pc from "picocolors";
import { runPrompts } from "./prompts.js";

async function main() {
  const args = process.argv.slice(2);
  const projectName = args[0];

  const config = await runPrompts(projectName);
  if (!config) return;

  p.log.info(`Creating ${pc.cyan(config.name)}...`);
  p.log.step(`Apps: ${config.apps.join(", ")}`);
  p.log.step(`Backend: ${config.backend}`);
  p.log.step(`Testing: ${config.testing ? "yes" : "no"}`);
  p.log.step(`CI: ${config.ci ? "yes" : "no"}`);

  // TODO: scaffold project
  p.outro(pc.green("Done! (scaffolding not implemented yet)"));
}

main().catch(console.error);
```

**Step 4: Test prompts work**

Run: `cd /Users/jonas/repos/create-edhor-stack && bun run dev test-project`
Expected: Interactive prompts appear and complete

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: interactive prompts with @clack/prompts"
```

---

## Task 3: Base Template Files

**Files:**
- Create: `templates/base/package.json.hbs`
- Create: `templates/base/turbo.json`
- Create: `templates/base/biome.json`
- Create: `templates/base/tsconfig.json`
- Create: `templates/base/.gitignore`
- Create: `templates/base/.husky/pre-commit`
- Create: `templates/base/.lintstagedrc`
- Create: `templates/base/.node-version`

**Step 1: Create templates/base/package.json.hbs**

```json
{
  "name": "{{name}}",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "biome lint .",
    "format": "biome format --write .",
    "check": "biome check --write .",
    "clean": "turbo clean && rm -rf node_modules",
    "prepare": "husky"
  },
  "devDependencies": {
    "@biomejs/biome": "2.3.11",
    "husky": "^9.1.7",
    "lint-staged": "^16.1.0",
    "turbo": "^2.5.4",
    "typescript": "^5.8.3"
  },
  "packageManager": "bun@1.3.5"
}
```

**Step 2: Create templates/base/turbo.json**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".output/**", ".vinxi/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

**Step 3: Create templates/base/biome.json**

```json
{
  "$schema": "https://biomejs.dev/schemas/2.3.11/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "files": {
    "ignoreUnknown": true,
    "includes": ["apps/**/*.ts", "apps/**/*.tsx", "packages/**/*.ts", "packages/**/*.tsx"]
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "assist": {
    "actions": {
      "source": {
        "organizeImports": "on"
      }
    }
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": {
        "useExhaustiveDependencies": "warn",
        "noUnusedImports": "error",
        "noUnusedVariables": "warn"
      },
      "style": {
        "noNonNullAssertion": "off",
        "useConst": "error",
        "useImportType": "error"
      },
      "suspicious": {
        "noExplicitAny": "warn",
        "noConsole": "off"
      }
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "double",
      "trailingCommas": "es5",
      "semicolons": "always"
    }
  }
}
```

**Step 4: Create templates/base/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true
  }
}
```

**Step 5: Create templates/base/.gitignore**

```
# Dependencies
node_modules/

# Build outputs
dist/
.output/
.vinxi/
.expo/
build/

# Turbo
.turbo/

# Environment
.env
.env.local
.env.*.local

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Testing
coverage/
playwright-report/
test-results/
```

**Step 6: Create templates/base/.husky/pre-commit**

```bash
bunx lint-staged
```

**Step 7: Create templates/base/.lintstagedrc**

```json
{
  "*.{ts,tsx,js,jsx}": ["biome check --write"],
  "*.{json,md}": ["biome format --write"]
}
```

**Step 8: Create templates/base/.node-version**

```
22
```

**Step 9: Commit**

```bash
git add -A
git commit -m "feat: base template files (turbo, biome, husky)"
```

---

## Task 4: Scaffolding Logic

**Files:**
- Create: `src/scaffold.ts`
- Create: `src/utils.ts`
- Modify: `src/index.ts`

**Step 1: Create src/utils.ts**

```typescript
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function getTemplatesDir(): string {
  // In dev: ../templates, in dist: ../templates
  return path.resolve(__dirname, "..", "templates");
}

export function renderTemplate(content: string, vars: Record<string, string>): string {
  return content.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? "");
}
```

**Step 2: Create src/scaffold.ts**

```typescript
import fs from "fs-extra";
import path from "node:path";
import type { ProjectConfig } from "./types.js";
import { getTemplatesDir, renderTemplate } from "./utils.js";

export async function scaffoldProject(config: ProjectConfig, targetDir: string): Promise<void> {
  const templatesDir = getTemplatesDir();

  // Create target directory
  await fs.ensureDir(targetDir);

  // Copy base template
  await copyTemplate(path.join(templatesDir, "base"), targetDir, {
    name: config.name,
  });

  // Create apps and packages directories
  await fs.ensureDir(path.join(targetDir, "apps"));
  await fs.ensureDir(path.join(targetDir, "packages"));

  // Make husky pre-commit executable
  const preCommitPath = path.join(targetDir, ".husky", "pre-commit");
  if (await fs.pathExists(preCommitPath)) {
    await fs.chmod(preCommitPath, 0o755);
  }
}

async function copyTemplate(
  srcDir: string,
  destDir: string,
  vars: Record<string, string>
): Promise<void> {
  const entries = await fs.readdir(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    let destName = entry.name.replace(/\.hbs$/, "");
    const destPath = path.join(destDir, destName);

    if (entry.isDirectory()) {
      await fs.ensureDir(destPath);
      await copyTemplate(srcPath, destPath, vars);
    } else {
      let content = await fs.readFile(srcPath, "utf-8");

      // Render handlebars-style variables
      if (entry.name.endsWith(".hbs") || entry.name.endsWith(".json")) {
        content = renderTemplate(content, vars);
      }

      await fs.writeFile(destPath, content);
    }
  }
}
```

**Step 3: Update src/index.ts**

```typescript
#!/usr/bin/env node
import * as p from "@clack/prompts";
import pc from "picocolors";
import path from "node:path";
import fs from "fs-extra";
import { runPrompts } from "./prompts.js";
import { scaffoldProject } from "./scaffold.js";

async function main() {
  const args = process.argv.slice(2);
  const projectName = args[0];

  const config = await runPrompts(projectName);
  if (!config) return;

  const targetDir = path.resolve(process.cwd(), config.name);

  // Check if directory exists
  if (await fs.pathExists(targetDir)) {
    const overwrite = await p.confirm({
      message: `Directory ${pc.cyan(config.name)} already exists. Overwrite?`,
      initialValue: false,
    });

    if (!overwrite) {
      p.cancel("Setup cancelled.");
      return;
    }

    await fs.remove(targetDir);
  }

  const s = p.spinner();
  s.start("Creating project...");

  try {
    await scaffoldProject(config, targetDir);
    s.stop("Project created!");

    p.note(
      [
        `cd ${config.name}`,
        "bun install",
        "git init && git add -A && git commit -m 'Initial commit'",
        "bun dev",
      ].join("\n"),
      "Next steps"
    );

    p.outro(pc.green("Happy coding!"));
  } catch (error) {
    s.stop("Failed to create project");
    p.log.error(String(error));
    process.exit(1);
  }
}

main().catch(console.error);
```

**Step 4: Test scaffolding**

Run: `cd /Users/jonas/repos/create-edhor-stack && bun run dev /tmp/test-scaffold`
Expected: Project created in /tmp/test-scaffold with base files

**Step 5: Verify generated files**

Run: `ls -la /tmp/test-scaffold && cat /tmp/test-scaffold/package.json`
Expected: All base files present, package.json has correct project name

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: scaffolding logic copies base template"
```

---

## Task 5: TanStack Start Web App Template

**Files:**
- Create: `templates/apps/web/package.json`
- Create: `templates/apps/web/tsconfig.json`
- Create: `templates/apps/web/app.config.ts`
- Create: `templates/apps/web/src/routes/__root.tsx`
- Create: `templates/apps/web/src/routes/index.tsx`
- Create: `templates/apps/web/src/styles.css`
- Modify: `src/scaffold.ts`

**Step 1: Create templates/apps/web/package.json**

```json
{
  "name": "@{{name}}/web",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vinxi dev --port 3000",
    "build": "vinxi build",
    "start": "vinxi start"
  },
  "dependencies": {
    "@tanstack/react-router": "^1.132.0",
    "@tanstack/start": "^1.132.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "vinxi": "^0.5.5"
  },
  "devDependencies": {
    "@types/react": "^19.1.6",
    "@types/react-dom": "^19.1.5",
    "@vitejs/plugin-react": "^4.4.1",
    "vite-tsconfig-paths": "^5.1.4"
  }
}
```

**Step 2: Create templates/apps/web/tsconfig.json**

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

**Step 3: Create templates/apps/web/app.config.ts**

```typescript
import { defineConfig } from "@tanstack/start/config";
import viteTsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  vite: {
    plugins: [viteTsConfigPaths()],
  },
});
```

**Step 4: Create templates/apps/web/src/routes/__root.tsx**

```tsx
import { createRootRoute, Outlet } from "@tanstack/react-router";
import "../styles.css";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{{name}}</title>
      </head>
      <body>
        <Outlet />
      </body>
    </html>
  );
}
```

**Step 5: Create templates/apps/web/src/routes/index.tsx**

```tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>Welcome to {{name}}</h1>
      <p>Edit <code>src/routes/index.tsx</code> to get started.</p>
    </main>
  );
}
```

**Step 6: Create templates/apps/web/src/styles.css**

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family:
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    sans-serif;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}
```

**Step 7: Update src/scaffold.ts to handle web app**

Add after creating directories:

```typescript
// Copy selected apps
for (const app of config.apps) {
  const appSrc = path.join(templatesDir, "apps", app);
  const appDest = path.join(targetDir, "apps", app);

  if (await fs.pathExists(appSrc)) {
    await copyTemplate(appSrc, appDest, { name: config.name });
  }
}
```

**Step 8: Commit**

```bash
git add -A
git commit -m "feat: TanStack Start web app template"
```

---

## Task 6: STACK.md Best Practices

**Files:**
- Create: `STACK.md`

**Step 1: Create STACK.md**

Create comprehensive best practices documentation covering:
- Framework choices and when to use them
- Styling patterns (Tailwind v4, shadcn/ui)
- State management (React Query, Zustand, Convex)
- Database options (Drizzle vs Convex)
- Auth patterns (Better Auth)
- Testing strategies (Vitest, Playwright)
- Deployment patterns (Netlify, Vercel)
- Code organization conventions
- UI/accessibility guidelines (from meinungsmache CLAUDE.md)

This file serves as context for AI assistants setting up new features.

**Step 2: Commit**

```bash
git add STACK.md
git commit -m "docs: STACK.md best practices guide"
```

---

## Task 7: Additional App/Package Templates

**Files:**
- Create: `templates/apps/mobile/` (Expo template)
- Create: `templates/packages/ui/` (shadcn/ui setup)
- Create: `templates/extras/testing/` (Vitest + Playwright)
- Create: `templates/extras/ci/` (GitHub Actions)
- Update: `src/scaffold.ts` to handle all options

These follow the same pattern as Task 5 - create template files and update scaffold logic.

---

## Task 8: Publishing Setup

**Files:**
- Update: `README.md`
- Create: `.github/workflows/publish.yml`

**Step 1: Update README.md**

```markdown
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

**Optional:**
- Web app (TanStack Start)
- Mobile app (Expo + React Native)
- UI package (shadcn/ui + Tailwind)
- Backend (Convex or Drizzle + PostgreSQL)
- Auth (Better Auth)
- Testing (Vitest + Playwright)
- CI (GitHub Actions)

## Philosophy

See [STACK.md](./STACK.md) for our opinionated best practices.

## License

MIT
```

**Step 2: Test local build**

Run: `cd /Users/jonas/repos/create-edhor-stack && bun run build && ls dist/`
Expected: `index.js` in dist folder

**Step 3: Test built CLI**

Run: `node /Users/jonas/repos/create-edhor-stack/dist/index.js /tmp/final-test`
Expected: CLI runs and creates project

**Step 4: Commit and tag**

```bash
git add -A
git commit -m "docs: README and publishing setup"
git tag v0.1.0
```

**Step 5: Publish to npm**

Run: `cd /Users/jonas/repos/create-edhor-stack && npm publish`
Expected: Package published to npm registry

---

## Task Order Summary

| Task | Description | Dependencies |
|------|-------------|--------------|
| 1 | Project foundation | None |
| 2 | CLI with clack prompts | Task 1 |
| 3 | Base template files | Task 1 |
| 4 | Scaffolding logic | Tasks 2, 3 |
| 5 | Web app template | Task 4 |
| 6 | STACK.md best practices | None (can parallel) |
| 7 | Additional templates | Task 5 |
| 8 | Publishing | All above |

---

## Testing Checklist

After each task, verify:
- [ ] `bun run dev` runs without errors
- [ ] Generated project has correct structure
- [ ] Generated package.json has substituted variables
- [ ] Husky pre-commit is executable
- [ ] `cd generated-project && bun install && bun dev` works
