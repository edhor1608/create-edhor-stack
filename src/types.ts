export interface ProjectConfig {
  name: string;
  apps: ("web" | "mobile")[];
  packages: ("ui" | "database" | "auth")[];
  backend: "none" | "convex" | "drizzle";
  testing: boolean;
  ci: boolean;
}
