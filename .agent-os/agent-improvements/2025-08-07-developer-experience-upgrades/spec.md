# Spec Requirements Document

> Spec: Agent OS Developer Experience Upgrades
> Created: 2025-08-07

## Overview

Elevate Agent OS developer experience with targeted improvements, refactors, and small features that reduce friction, speed up validation, and make the framework delightful to adopt. Focus areas: onboarding, cross‑platform reliability, performance, documentation consistency, and actionable dashboards.

## User Stories

### Faster Onboarding with One Command

As a developer new to Agent OS, I want a single command that validates my environment and sets up recommended scripts, so I can start using the tooling in minutes without manual troubleshooting.

The system provides an `agent-os:doctor` workflow that checks Node version, required files, repo layout, and reports fixes with copy‑paste commands.

### Reliable Cross‑Platform Execution

As a Windows developer using PowerShell, I want Agent OS tools to run exactly the same as on macOS/Linux, so I never fight shell differences or broken chained commands.

All scripts internally route through a cross‑platform shell utility, eliminating `&&` vs `;` issues and ensuring consistent exit codes and logs.

### Snappy Compliance and Clear Actions

As a contributor, I want compliance checks to finish quickly and tell me exactly what to do, so I can fix issues without digging through logs.

The validator skips heavy directories by default, uses incremental scanning, and outputs precise, copyable fixes and links to standards.

## Spec Scope

1. **Onboarding Doctor Command** – Introduce `npm run agent-os:doctor` that leverages `.agent-os/utils/dependency-validator.js` to verify Node ≥18, file structure, and required scripts; prints actionable remediation.
2. **Cross‑Platform Shell Adoption** – Refactor internal scripts and CLI utilities to consistently use `.agent-os/utils/cross-platform-shell.js` to normalize command execution across PowerShell, bash, and zsh.
3. **Performance Optimizations** – Enhance validators and analyzers to skip `node_modules`, `.git`, `dist`, and large binaries by default; add incremental and parallel file scanning with caching.
4. **Documentation Consistency Guardrails** – Add lightweight checks for YAML front‑matter, required headings, and cross‑references in standards/spec/templates; auto‑suggest fixes.
5. **Developer Dashboard Enhancements** – Upgrade internal dashboard to show real‑time compliance status, trending metrics, and one‑click actions to open related docs or run fixes.
6. **Spec & Template Quality Pipeline** – Enforce use of `.agent-os/instructions/create-spec.md` patterns automatically when generating new specs; ensure `spec.md` + `spec-lite.md` + `technical-spec.md` created together.
7. **Quality Gates & Hooks** – Extend pre‑commit hook to run fast checks only (no full scans), block on critical violations, and provide quick remediation links.

## Out of Scope

- New external dependencies or heavy frameworks; remain Node 18+, vanilla JS, Markdown‑first.
- Large feature rewrites of the dashboard UI; focus on incremental UX wins.
- Replacing the existing rule system or standards structure.

## Expected Deliverable

1. `npm run agent-os:doctor` completes in <5s and reports environment readiness with remediation steps.
2. Compliance and docs checks finish in <30s on medium repos by default due to skipping and caching.
3. Internal dashboard surfaces real‑time statuses and provides one‑click links to relevant `.agent-os/standards/*.md` and `.cursor/rules/*.mdc` files.

---

References: `@~/.agent-os/standards/tech-stack.md`, `@~/.agent-os/standards/code-style.md`, `@~/.agent-os/standards/best-practices.md`, `.agent-os/agent-improvements/tech-stack.md`, `.agent-os/instructions/create-spec.md`

