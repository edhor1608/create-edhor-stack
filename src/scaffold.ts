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
