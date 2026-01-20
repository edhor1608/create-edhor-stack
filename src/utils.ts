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
