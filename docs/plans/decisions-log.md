# Decisions Log

## 2026-03-30: Replace `fs-extra` and `execa` in the CLI scaffold

### Context
The scaffold CLI depended on `fs-extra` for directory and file helpers and declared `execa` without using it. The package already runs on modern Node/Bun runtimes, so Node's built-in filesystem APIs cover the needed behavior.

### Decision
Replace `fs-extra` usage with `node:fs/promises`, remove the unused `execa` dependency, and add template `.dockerignore` generation alongside the existing deployment files.

### Rationale
This keeps the same scaffold behavior while reducing direct dependencies and aligns with the package replacement guidance from the JavaScript bloat review.

### Consequences
The CLI depends on fewer packages, generated deployment templates now include `.dockerignore`, and deployment-disabled scaffolds remove that file together with `Dockerfile` and `fly.toml`.

## ADR-2026-03-30-typescript-native-template-rollout

### Context

`create-edhor-stack` is both a TypeScript CLI and a scaffolder for Bun/Turborepo TypeScript projects. A native TypeScript rollout that only changes the CLI would leave newly generated projects on the old contract, while a full generated-project smoke fixture would expand scope beyond the current migration pass.

### Decision

Roll out the native TypeScript contract at two levels:

- the CLI repo itself gets `typecheck` and `typecheck:tsc`
- the shipped root and package templates get matching `typecheck` and `typecheck:tsc` scripts, plus a root `@typescript/native-preview` dependency and Turbo fallback task wiring

Skip the extra generated-project smoke fixture in this pass.

### Rationale

This keeps the change aligned with the purpose of the repo. The CLI becomes native-ready, and future scaffolded projects inherit the same contract immediately. Skipping the generated fixture keeps the branch focused and avoids turning one repo migration into a broader template QA project.

### Consequences

- the repo can be verified directly
- generated projects will expose native typecheck commands without additional manual setup
- template runtime compatibility is still validated later when a real generated project uses the updated templates

## ADR-2026-03-30-explicit-node-types-for-native-cli-check

### Context

After rebasing the rollout branch onto the newer `main`, the CLI source used `node:*` imports and `process`. Classic `tsc` still passed, but `tsgo` required explicit Node ambient types in the root config.

### Decision

Add `"types": ["node"]` to the root CLI `tsconfig.json`.

### Rationale

This is the smallest compatibility fix for the native checker and keeps the CLI contract explicit.

### Consequences

- `tsgo` and `tsc` align again on the CLI repo
- the change stays local to the root config and does not alter runtime behavior
