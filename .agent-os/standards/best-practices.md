# Development Best Practices

## Context
Global guidelines for **Agent‑OS** projects (React 19.1 + Spring Boot 3.5.3 stack).

<conditional-block context-check="core-principles">
IF this Core Principles section already read in current context:
  SKIP: Re-reading this section
  NOTE: "Using Core Principles already in context"
ELSE:
  READ: The following principles

## Core Principles

### Mobile‑First & Accessible by Default
- Begin every feature at ≤ 400 px using Tailwind 4 custom **`xs`** breakpoint.  
- Progressive enhancement: add `sm`, `md`, `lg`, `xl`, `2xl` utilities only when needed.  
- Meet **WCAG 2.2 AA** contrast and keyboard‑navigation requirements.

### Simple, Stable & Secure
- Functional, immutable patterns (Java Lombok `@Value`, React hooks/pure functions).  
- Profile before tuning (JDK Flight Recorder, React Profiler).  
- OWASP Top‑10, Spring Security OAuth 2.2, Helmet.js in React.

### DRY, Types First
- Shared UI in `/apps/web/src/components/ui` using **shadcn/ui**.  
- Backend consolidated via internal BOM.

### Cloud‑Native, Container‑First
- **Multi‑arch Dockerfile**, each service defined in `docker-compose.yml`.  
- Use **distroless** images for minimal CVEs.

### Observability
- Metrics: Spring `/actuator/prometheus` (Prometheus 3.5), React analytics.  
- Traces: OpenTelemetry 1.52 (Java).  
- Grafana dashboards as JSON in `/observability/grafana/`.

### Testing & Quality Gates
- ≥85% branch coverage (`jacoco`, `vitest`).  
- Static analysis: Sonar, ESLint, Stylelint, Dependabot.  
- Performance budgets: TTI ≤ 1.8s (LTE), P95 backend ≤ 150ms.

</conditional-block>
