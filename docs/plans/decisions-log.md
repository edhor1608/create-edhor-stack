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
