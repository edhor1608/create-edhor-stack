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
