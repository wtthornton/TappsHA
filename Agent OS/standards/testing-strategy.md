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

## Lessons Learned in Testing
- **Capture:** Document testing insights, patterns, and failures
- **Apply:** Update test strategies based on lessons learned
- **Reference:** See `@~/.agent-os/lessons-learned/categories/testing/README.md` for testing lessons

## Debugging Tools Integration
- **Dashboard Debug Page**: Custom debug interface for complex frontend features
- **Library Testing**: Automated library availability and functionality tests
- **Console Capture**: Real-time console log monitoring and analysis
- **Component Isolation**: Isolated testing environments for complex features
- **Reference**: See `.agent-os/agent-improvements/dashboard-modernization-lessons-learned.md` for debugging insights

**Cursor Effect:** Can auto‑generate **unit and integration tests** following project coverage & style.
