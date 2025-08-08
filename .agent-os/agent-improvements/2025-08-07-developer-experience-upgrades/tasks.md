# Spec Tasks

- [ ] 1. Onboarding Doctor Command
  - [ ] 1.1 Write unit tests for `.agent-os/utils/dependency-validator.js` (skip `node_modules`)
  - [ ] 1.2 Implement `agent-os:doctor` script and JSON report output
  - [ ] 1.3 Add remediation suggestions with copyable commands
  - [ ] 1.4 Verify cross‑platform behavior via `.agent-os/utils/cross-platform-shell.js`
  - [ ] 1.5 Update docs under `.agent-os/README.md` and `.agent-os/DEVELOPER-GUIDE.md`

- [ ] 2. Cross‑Platform Shell Refactor
  - [ ] 2.1 Inventory scripts using chained shell operators
  - [ ] 2.2 Refactor to use `.agent-os/utils/cross-platform-shell.js`
  - [ ] 2.3 Add Windows PowerShell test routine in `.agent-os/testing/`
  - [ ] 2.4 Document patterns in `.agent-os/standards/cross-platform-command-execution.md`

- [ ] 3. Performance Optimizations for Validators
  - [ ] 3.1 Centralize ignore patterns and confirm `node_modules` is excluded
  - [ ] 3.2 Add incremental cache and worker pool scanning
  - [ ] 3.3 Profile before/after and store metrics in `.agent-os/reports/live-metrics.json`
  - [ ] 3.4 Ensure default runs complete <30s on medium repo

- [ ] 4. Documentation Consistency Guardrails
  - [ ] 4.1 Implement front‑matter and heading checks for specs/standards/templates
  - [ ] 4.2 Add auto‑suggested fixes and snippets
  - [ ] 4.3 Link violations to exact files in dashboard

- [ ] 5. Dashboard Enhancements
  - [ ] 5.1 Add real‑time status panels and trending metrics
  - [x] 5.2 Add doctor report endpoint to dashboard (`/doctor`) and surface readiness JSON
  - [ ] 5.3 Implement WebSocket updates for validators
  - [ ] 5.4 Add “Open in Editor” links to standards/rules

- [ ] 6. Spec & Template Pipeline + Hooks
  - [ ] 6.1 Ensure generator creates spec trio (spec, lite, technical)
  - [x] 6.2 Update pre‑commit to run fast checks only (<5s)
  - [ ] 6.3 Document workflow in `.agent-os/workflows/optimized-development-workflow.md`

- [ ] 7. Validation
  - [ ] 7.1 All unit tests pass
  - [ ] 7.2 CI full compliance passes with performance targets
  - [ ] 7.3 Update lessons learned and reports
