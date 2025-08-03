# Development Best Practices

## Context
Global development guidelines for Agent OS projects (React + Spring Boot stack).

<conditional-block context-check="core-principles">
IF this Core Principles section already read in current context:
  SKIP: Re-reading this section
  NOTE: "Using Core Principles already in context"
ELSE:
  READ: The following principles

## Core Principles

### Mobile‑First & Accessible by Default
- Start every feature at ≤400 px using Tailwind’s custom **`xs`** breakpoint.  
- Progressive enhancement: add `sm`, `md`, `lg`, `xl`, `2xl` utilities only when needed.  
- Meet WCAG 2.2 AA contrast and keyboard‑navigation requirements.  

### Keep It Simple, Steady & Secure
- Prefer functional, immutable patterns in both Java (Lombok’s `@Value`) and React (hooks + pure functions).  
- Avoid premature optimisation; profile before tuning (JDK Flight Recorder, React Profiler).  
- Apply OWASP Top‑10 counter‑measures, enable Spring Security with OAuth 2.1, use Helmet in React adapters.  

### DRY, Types First
- Consolidate shared UI in `/apps/web/src/components/ui` using **shadcn/ui**.  
- Consolidate backend utilities into a versioned internal BOM.  

### Cloud‑Native, Container‑First
- Each service ships with a **Dockerfile** (multi‑arch) and appears in `docker-compose.yml`.  
- Images build via multi‑stage and distroless base images to minimise CVEs.  

### Observability
- Metrics: `/actuator/prometheus` (Spring), `@vercel/analytics` (React).  
- Traces: OpenTelemetry 1.28 + OTLP/HTTP exporter.  
- Dashboards exported as JSON under `/observability/grafana`.  

### Testing & Quality Gates
- **Unit ≥ 80 %** branch coverage (`jacoco`, `vitest`).  
- **Static analysis**: Sonar, ESLint, Stylelint, Dependabot.  
- **Performance budgets**: TTI ≤ 2 s on LTE, P95 backend ≤ 200 ms.  

</conditional-block>

<conditional-block context-check="dependencies" task-condition="choosing-external-library">
IF current task involves choosing an external library:
  IF Dependencies section already read in current context:
    SKIP: Re-reading this section
    NOTE: "Using Dependencies guidelines already in context"
  ELSE:
    READ: The following guidelines
ELSE:
  SKIP: Dependencies section not relevant to current task

## Dependencies

### Choosing Libraries
- Active maintenance: commits in last **90 days** & ≥ 5 k stars.  
- Compatible licence (Apache 2.0/MIT).  
- Proven security track‑record; pass **OSV** & **dependency‑track** scans.  
- Prefer **interfaces over implementations** to maintain swap‑ability.  

</conditional-block>
