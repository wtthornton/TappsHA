# Development Best Practices (Enhanced for Cursor/Agent-OS)

## 1. Feature Impact Scoring (MANDATORY FIRST)
- **Rule:** Score every feature on Business Impact, Developer Productivity, Implementation Complexity, and Adoption Likelihood (1-10 scale) before development.
- **Actions:** Apply phase classification thresholds (Phase 1: ≥8/10 productivity, Phase 2: ≥7/10 productivity), eliminate features <6/10 productivity impact.
- **Cursor Effect:** AI prioritizes **maximum impact features** that directly improve developer productivity and code quality.
- **Reference:** See `@~/.agent-os/standards/feature-scoring.md` for complete framework.

## 2. Mobile‑First & Responsive Design
- **Rule:** Start every feature at ≤400px viewport; enhance progressively to larger breakpoints.
- **Actions:** Optimize for LCP and TTI; intuitive mobile navigation.
- **Cursor Effect:** Generates **responsive React/Tailwind components** by default.

## 3. Observability by Design
- **Rule:** Integrate logging, metrics, and tracing (OpenTelemetry + Micrometer) from the start.
- **Actions:** Define KPIs, dashboards, and alerts early.
- **Cursor Effect:** AI‑generated backends are **pre‑instrumented for monitoring**.

## 4. DRY, KISS & 12‑Factor Principles
- **Rule:** Avoid redundant logic; follow DRY, KISS, SOLID, 12‑Factor App.
- **Actions:** Modular and cloud‑ready microservices by design.
- **Cursor Effect:** Scaffolds **modular, maintainable, cloud‑deployable** code.

## 5. Performance & Fail‑Fast
- **Rule:** Validate inputs early; fail fast; add caching, async, and retries.
- **Actions:** Implement circuit breakers and fallback logic.
- **Cursor Effect:** Outputs **resilient, fault‑tolerant services**.

## 6. DevOps & Agile Embedded
- **Rule:** Treat CI/CD, IaC, and environment parity as part of development.
- **Actions:** Maintain Dockerfiles, GitHub Actions, reproducible environments.
- **Cursor Effect:** Generates **CI/CD‑ready microservices** without manual tweaks.

## 7. Lessons Learned Integration
- **Rule:** Capture and apply lessons learned systematically across all development phases.
- **Actions:** Document insights, update standards, and integrate into Cursor AI rules.
- **Cursor Effect:** AI generates **continuously improved code patterns** based on project history.
- **Reference:** See `@~/.agent-os/lessons-learned/README.md` for complete framework.

## 8. Database Query Compatibility (CRITICAL)
- **Rule:** Write only HQL-compatible queries; avoid database-specific functions.
- **Actions:** 
  - NEVER use `EXTRACT(EPOCH FROM ...)`, `DATE_TRUNC`, or `FUNCTION('DATE_TRUNC')` in HQL
  - Move complex calculations to service layer
  - Test queries with H2 in-memory database
- **Cursor Effect:** AI generates **portable, database-agnostic queries** that work across environments.
- **Reference:** See `@~/.agent-os/lessons-learned/2025-01-27-deployment-fixes.md` for examples.

## 9. Repository Method Signatures
- **Rule:** Follow Spring Data JPA constraints for repository methods.
- **Actions:**
  - Never return `Optional<Entity>` with `Pageable` parameter - use `List<Entity>`
  - Add @DataJpaTest for all repositories
  - Validate method signatures in code reviews
- **Cursor Effect:** AI generates **Spring Data JPA compliant repository methods**.

## 10. Container Native Dependencies
- **Rule:** Document and install all native library dependencies in containers.
- **Actions:**
  - For Alpine Linux: `RUN apk add --no-cache libstdc++ libgomp`
  - Test with production base images during development
  - Use feature flags for components with native dependencies
- **Cursor Effect:** AI generates **container-ready Dockerfiles** with proper dependencies.

## 11. Spring Configuration Validation
- **Rule:** Provide all required beans and avoid circular dependencies.
- **Actions:**
  - Always provide TaskScheduler for WebSocket heartbeat
  - Never use `allow-circular-references: true` in production
  - Test configurations with integration tests
- **Cursor Effect:** AI generates **properly configured Spring components** without circular dependencies.

## 12. Pre-Deployment Validation
- **Rule:** Run comprehensive validation before every deployment.
- **Actions:**
  - Execute `.agent-os/scripts/validate-deployment.sh`
  - Check for database-specific functions
  - Validate repository signatures
  - Test container startup locally
- **Cursor Effect:** AI includes **deployment validation steps** in generated CI/CD pipelines.
- **Reference:** See `@~/.agent-os/enhancements/deployment-validation-framework.md` for framework details.
