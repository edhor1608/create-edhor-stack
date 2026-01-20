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
