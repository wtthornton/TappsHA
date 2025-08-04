# Development Best Practices (Enhanced for Cursor/Agent-OS)

## 1. Mobile‑First & Responsive Design
- **Rule:** Start every feature at ≤400px viewport; enhance progressively to larger breakpoints.
- **Actions:** Optimize for LCP and TTI; intuitive mobile navigation.
- **Cursor Effect:** Generates **responsive React/Tailwind components** by default.

## 2. Observability by Design
- **Rule:** Integrate logging, metrics, and tracing (OpenTelemetry + Micrometer) from the start.
- **Actions:** Define KPIs, dashboards, and alerts early.
- **Cursor Effect:** AI‑generated backends are **pre‑instrumented for monitoring**.

## 3. DRY, KISS & 12‑Factor Principles
- **Rule:** Avoid redundant logic; follow DRY, KISS, SOLID, 12‑Factor App.
- **Actions:** Modular and cloud‑ready microservices by design.
- **Cursor Effect:** Scaffolds **modular, maintainable, cloud‑deployable** code.

## 4. Performance & Fail‑Fast
- **Rule:** Validate inputs early; fail fast; add caching, async, and retries.
- **Actions:** Implement circuit breakers and fallback logic.
- **Cursor Effect:** Outputs **resilient, fault‑tolerant services**.

## 5. DevOps & Agile Embedded
- **Rule:** Treat CI/CD, IaC, and environment parity as part of development.
- **Actions:** Maintain Dockerfiles, GitHub Actions, reproducible environments.
- **Cursor Effect:** Generates **CI/CD‑ready microservices** without manual tweaks.
