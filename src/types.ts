export interface ProjectConfig {
  name: string;
  apps: ("web" | "mobile")[];
  packages: ("ui" | "shared" | "auth" | "stripe")[];
  database: "none" | "postgres" | "convex";
  api?: "none" | "hono" | "elysia";
  testing: boolean;
  ci: boolean;
  deployment: boolean;
}
