#!/usr/bin/env node
import * as p from "@clack/prompts";
import pc from "picocolors";
import { access, rm } from "node:fs/promises";
import path from "node:path";
import { runPrompts } from "./prompts.js";
import { scaffoldProject } from "./scaffold.js";

async function main() {
  const args = process.argv.slice(2);
  const projectName = args[0];

  const config = await runPrompts(projectName);
  if (!config) return;

  const targetDir = path.resolve(process.cwd(), config.name);

  if (await pathExists(targetDir)) {
    const overwrite = await p.confirm({
      message: `Directory ${pc.cyan(config.name)} already exists. Overwrite?`,
      initialValue: false,
    });

    if (!overwrite) {
      p.cancel("Setup cancelled.");
      return;
    }

    await rm(targetDir, { force: true, recursive: true });
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

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

main().catch(console.error);
