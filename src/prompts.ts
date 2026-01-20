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

      uiStyle: ({ results }) =>
        (results.packages as string[] | undefined)?.includes("ui")
          ? p.select({
              message: "UI style?",
              options: [
                { value: "new-york", label: "New York", hint: "recommended" },
                { value: "default", label: "Default" },
              ],
              initialValue: "new-york",
            })
          : Promise.resolve(undefined),

      uiBaseColor: ({ results }) =>
        (results.packages as string[] | undefined)?.includes("ui")
          ? p.select({
              message: "Base color?",
              options: [
                { value: "zinc", label: "Zinc", hint: "neutral" },
                { value: "slate", label: "Slate", hint: "cool" },
                { value: "stone", label: "Stone", hint: "warm" },
                { value: "neutral", label: "Neutral" },
                { value: "gray", label: "Gray" },
              ],
              initialValue: "zinc",
            })
          : Promise.resolve(undefined),

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
