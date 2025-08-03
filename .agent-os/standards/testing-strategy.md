# Testing Strategy & Quality Standards

## Testing Trophy Approach
- Emphasize unit + integration + some E2E tests.
- Include static analysis (linters, type checks) as foundational layer.

## Tools
- Backend: JUnit 5, Mockito, Testcontainers, Jacoco.
- Frontend: Jest + React Testing Library, Cypress/Playwright for E2E.

## Coverage Targets
- Aim for ~80% meaningful coverage.
- Fail CI if coverage drops below threshold (~70%).

## AI-Assisted Testing
- Use AI to scaffold tests; always review generated tests for correctness.

## CI Integration
- Run all tests on every PR; fail fast on errors.
- Track flaky tests and improve continuously.
