# Technical Spec: Agent-OS Testing Uplift

## Tools
- Vitest + jsdom (already present in `.agent-os`)
- Node `http` for route tests
- No new dependencies

## Structure
- Tests in `.agent-os/testing/__tests__/**.test.ts`
- Helpers in `.agent-os/testing/helpers/**`
- Coverage output `.agent-os/reports/coverage/`

## Work Items
- Tests for `tools/doctor.cjs` via spawned process mocks
- Tests for `tools/enhanced-dashboard.js` route handlers: `/`, `/app`, `/doctor`, `/metrics`, `/history`, `/api/standards`
- Tests for `tools/analysis/documentation-analyzer.js`
- Coverage gate: fail under 80%

## Scripts
- `agent-os:test` -> run vitest in `.agent-os`
- `agent-os:test:coverage` -> vitest --coverage, write summary to `live-metrics.json`

