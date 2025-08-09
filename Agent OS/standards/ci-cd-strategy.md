# CI/CD Strategy for Agent-OS Projects

## Context
GitHub Actions-based CI/CD for React (frontend) + Spring Boot (backend) + Dockerized stack (Postgres, InfluxDB, Prometheus, Grafana).

### Goals
- Automate linting, testing, coverage enforcement
- Build and scan Docker images
- Enforce vulnerability scanning and coverage gates
- Provide optional preview environments for PRs

### Key Practices
1. **Lint & Format**: ESLint + Prettier for frontend, Checkstyle/Spotless for backend.
2. **Unit & Integration Tests**: Jest + Vitest for React; JUnit + Jacoco for Spring Boot.
3. **Coverage Gate**: Fail build if <85% coverage.
4. **Docker Build**: Multi-stage builds for frontend & backend with minimal base images.
5. **Security Scans**:
   - Dependency scans: OWASP Dep-Check, npm audit, Snyk
   - Container scans: Trivy
   - Optional SAST: CodeQL
6. **Deploy Previews**: Use ephemeral environments (e.g., Uffizzi) to review PRs.
7. **Lessons Learned Integration**: Capture deployment insights and update CI/CD processes based on lessons learned.

See `ci-example-workflow.yml` for implementation example.
**Reference:** See `@~/.agent-os/lessons-learned/categories/deployment/README.md` for deployment lessons.
