# Monorepo Directory Structure Standard

## Context
Full-stack Agent‑OS project with React frontend, Spring Boot backend, and observability stack.

```
my-project/
├── frontend/                 # React app
│   ├── package.json
│   ├── src/
│   └── Dockerfile
├── backend/                  # Spring Boot app
│   ├── pom.xml (or build.gradle)
│   ├── src/main/java/com/example/...
│   ├── src/main/resources/
│   └── Dockerfile
├── infrastructure/           # Infrastructure & observability
│   ├── docker-compose.yml
│   ├── prometheus/prometheus.yml
│   └── grafana/dashboards/
├── .github/workflows/        # CI/CD workflows
└── .cursor/rules/            # Cursor AI rule files (*.mdc)
```

### Notes
- Separate concerns for maintainability
- Supports targeted Cursor rules for frontend, backend, infra
- Works seamlessly with CI/CD and Agent‑OS
