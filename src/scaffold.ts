import { access, chmod, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ProjectConfig } from "./types.js";
import { getTemplatesDir, renderTemplate } from "./utils.js";

export async function scaffoldProject(config: ProjectConfig, targetDir: string): Promise<void> {
  const templatesDir = getTemplatesDir();

  await mkdir(targetDir, { recursive: true });

  // Copy base template
  await copyTemplate(path.join(templatesDir, "base"), targetDir, {
    name: config.name,
  });

  // Create apps and packages directories
  await mkdir(path.join(targetDir, "apps"), { recursive: true });
  await mkdir(path.join(targetDir, "packages"), { recursive: true });

  // Copy selected apps
  for (const app of config.apps) {
    const appSrc = path.join(templatesDir, "apps", app);
    const appDest = path.join(targetDir, "apps", app);

    if (await pathExists(appSrc)) {
      await copyTemplate(appSrc, appDest, { name: config.name });
    }
  }

  // Copy API framework template if selected
  if (config.api && config.api !== "none") {
    const apiSrc = path.join(templatesDir, "apps", `api-${config.api}`);
    const apiDest = path.join(targetDir, "apps", "api");

    if (await pathExists(apiSrc)) {
      await copyTemplate(apiSrc, apiDest, { name: config.name });
    }
  }

  // Copy selected packages
  for (const pkg of config.packages) {
    const pkgSrc = path.join(templatesDir, "packages", pkg);
    const pkgDest = path.join(targetDir, "packages", pkg);

    if (await pathExists(pkgSrc)) {
      await copyTemplate(pkgSrc, pkgDest, { name: config.name });
    }
  }

  // Remove deployment files if not enabled
  if (!config.deployment) {
    await rm(path.join(targetDir, "Dockerfile"), { force: true, recursive: true });
    await rm(path.join(targetDir, "fly.toml"), { force: true, recursive: true });
    await rm(path.join(targetDir, ".dockerignore"), { force: true, recursive: true });
  }

  // Make husky pre-commit executable
  const preCommitPath = path.join(targetDir, ".husky", "pre-commit");
  if (await pathExists(preCommitPath)) {
    await chmod(preCommitPath, 0o755);
  }
}

async function copyTemplate(
  srcDir: string,
  destDir: string,
  vars: Record<string, string>
): Promise<void> {
  await mkdir(destDir, { recursive: true });
  const entries = await readdir(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    let destName = entry.name.replace(/\.hbs$/, "");
    if (destName === "gitignore") {
      destName = ".gitignore";
    } else if (destName === "dockerignore") {
      destName = ".dockerignore";
    }
    const destPath = path.join(destDir, destName);

    if (entry.isDirectory()) {
      await mkdir(destPath, { recursive: true });
      await copyTemplate(srcPath, destPath, vars);
    } else {
      let content = await readFile(srcPath, "utf-8");

      // Render handlebars-style variables in template files
      const renderExtensions = [".hbs", ".json", ".tsx", ".ts", ".md", ".toml"];
      if (renderExtensions.some((ext) => entry.name.endsWith(ext))) {
        content = renderTemplate(content, vars);
      }

      await writeFile(destPath, content);
    }
  }
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}
