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

      database: () =>
        p.select({
          message: "Database?",
          options: [
            { value: "none", label: "None", hint: "external API" },
            { value: "postgres", label: "PostgreSQL", hint: "Drizzle ORM" },
            { value: "convex", label: "Convex", hint: "realtime DB + serverless functions" },
          ],
          initialValue: "none",
        }),

      api: ({ results }) =>
        results.database !== "convex"
          ? p.select({
              message: "API framework?",
              options: [
                { value: "none", label: "None", hint: "TanStack Start server functions" },
                { value: "hono", label: "Hono", hint: "lightweight, fast" },
                { value: "elysia", label: "Elysia", hint: "Bun-native, end-to-end type safety" },
              ],
              initialValue: "none",
            })
          : Promise.resolve("none"),

      packages: ({ results }) =>
        p.multiselect({
          message: "Additional packages?",
          options: [
            { value: "ui", label: "UI (shadcn/ui + Tailwind)", hint: "recommended" },
            { value: "shared", label: "Shared (types + schemas)", hint: "for web & mobile" },
            ...(results.database !== "none"
              ? [{ value: "auth", label: "Auth", hint: results.database === "convex" ? "Convex Auth" : "Better Auth" }]
              : []),
            { value: "stripe", label: "Stripe", hint: "payments" },
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

      deployment: () =>
        p.confirm({
          message: "Add deployment config? (Dockerfile + fly.toml)",
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
