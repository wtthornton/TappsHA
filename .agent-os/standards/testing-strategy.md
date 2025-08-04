# Testing Strategy & Quality Standards (Enhanced)

## Testing Trophy Approach
- Combine unit, integration, E2E tests, plus static analysis.

## Tools
- **Backend:** JUnit 5, Mockito, Testcontainers, Jacoco
- **Frontend:** Jest + React Testing Library; Cypress or Playwright for E2E

## Coverage Targets
- Aim ~80% meaningful coverage; CI fails below ~70%

## AI-Assisted Testing
- Use AI to scaffold repetitive tests; review for correctness.

## CI Integration
- Run all tests on each PR; fail fast; track flaky tests.

**Cursor Effect:** Can auto‑generate **unit and integration tests** following project coverage & style.
