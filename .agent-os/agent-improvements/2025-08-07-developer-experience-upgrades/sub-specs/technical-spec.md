# Technical Specification

This is the technical specification for the spec detailed in `.agent-os/agent-improvements/2025-08-07-developer-experience-upgrades/spec.md`.

## Technical Requirements

- Onboarding Doctor Command
  - Implement `npm run agent-os:doctor` using `.agent-os/utils/dependency-validator.js` to validate Node (>=18), file structure, and required scripts.
  - Print remediation steps with copyable commands using `.agent-os/utils/cross-platform-shell.js` for examples.
  - Output JSON summary to `.agent-os/reports/doctor-report.json`.

- Cross‑Platform Shell Adoption
  - Refactor internal CLI and scripts to execute via `.agent-os/utils/cross-platform-shell.js`.
  - Replace chained `&&` usage with unified execution calls; ensure deterministic exit codes.
  - Add Windows PowerShell tests to `.agent-os/testing` for key commands.

- Performance Optimizations
  - Centralize ignore patterns: `node_modules`, `.git`, `dist`, `build`, large binaries (`*.png`, `*.jpg`, `*.pdf`, `*.zip`).
  - Add incremental scan cache at `.agent-os/internal/cache/file-hash.json` keyed by mtime + size.
  - Enable parallel scanning with a worker pool (configurable, default CPU cores - 1).

- Documentation Consistency Guardrails
  - Validator to enforce YAML front‑matter fields (title, created, version, status, next review, owner) on standards/specs/templates.
  - Require headings: H1 title, Overview, Expected Deliverable for specs.
  - Auto‑suggest insertions and provide quick‑fix snippets.

- Developer Dashboard Enhancements
  - Extend `.agent-os/internal/dashboard/` to surface: latest compliance score, open violations, trending graphs.
  - Add “Open in Editor” links to `.agent-os/standards/*.md` and `.cursor/rules/*.mdc`.
  - Stream updates from validators via a lightweight WebSocket in `internal/dashboard/websocket/`.

- Spec & Template Quality Pipeline
  - Add a generator in `.agent-os/cli/generate.ts` to always create `spec.md`, `spec-lite.md`, and `sub-specs/technical-spec.md` together using `.agent-os/instructions/create-spec.md`.
  - Validate presence during CI checks.

- Quality Gates & Hooks
  - Update `hooks/pre-commit` to run fast checks only (<5s target): front‑matter validation, ignore pattern verification, and cached compliance summary.
  - Provide remediation hints and skip full scans; full scans remain in CI.

## External Dependencies (Conditional)

- None required. Use existing Node 18+, vanilla JS, and current utilities in `.agent-os/utils`.

## Notes

- Adhere to `@~/.agent-os/standards/tech-stack.md`, `@~/.agent-os/standards/code-style.md`, and `@~/.agent-os/standards/best-practices.md`.
- Respect the memory: do not run tests on `node_modules` and maintain cross‑platform compatibility.
