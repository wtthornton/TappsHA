# Spec Requirements Document

> Spec: Agent‑OS Unified Testing Improvements
> Created: 2025-08-08
> Version: 1.0
> Owner: Agent‑OS
> Status: Draft
> Next Review: 2025-08-15

## Overview

Unify and uplift testing across Agent‑OS: audit all features, APIs, and UIs; align tools; create/update/delete tests to reach ≥80% branch coverage in `.agent-os` scope and surface coverage/health in the unified dashboard. Keep stack minimal: Vitest + jsdom for Node/DOM, Testing Library for UI snippets, no new external deps.

## Goals
- Achieve ≥80% branch coverage for Agent‑OS utilities, tools, and UI endpoints
- Standardize test structure, naming, and helpers
- Fast feedback: <30s for fast checks; coverage for full run
- Integrate coverage summary into dashboard `/metrics`

## In Scope
- Unit tests for `.agent-os/tools` (doctor, dashboard, analyzers)
- Integration tests for CLI scripts and routes (via supertest‑style http wrapper or Node http)
- UI smoke tests for unified `/app` HTML generation
- Documentation analyzer validation

## Out of Scope
- Backend Java services and app frontend workspace

## Deliverables
- Test plan and coverage thresholds
- Tests under `.agent-os/testing` following conventions
- Scripts: `agent-os:test`, `agent-os:test:coverage` with CI‑friendly output
- Dashboard metrics reads coverage and displays in Overview

## Risks/Mitigations
- Mixed ESM/CJS: keep tests in Node ESM with Vitest, import via createRequire when needed
- Flaky file IO: use temp directories and mocks


