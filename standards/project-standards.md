# TappsHA Project Standards

## Overview
This document extends Agent OS standards with TappsHA-specific requirements and best practices.

## Core Principles (Extending Agent OS)

### Mobile-First & Accessible by Default
- Start every feature at ≤400 px using Tailwind's custom **`xs`** breakpoint
- Progressive enhancement: add `sm`, `md`, `lg`, `xl`, `2xl` utilities only when needed
- Meet WCAG 2.2 AA contrast and keyboard-navigation requirements
- **TappsHA Extension**: Focus on touch-friendly interfaces for mobile users

### Keep It Simple, Steady & Secure
- Prefer functional, immutable patterns in both Java (Lombok's `@Value`) and React (hooks + pure functions)
- Avoid premature optimisation; profile before tuning (JDK Flight Recorder, React Profiler)
- Apply OWASP Top-10 counter-measures, enable Spring Security with OAuth 2.1, use Helmet in React adapters
- **TappsHA Extension**: Implement role-based access control (RBAC) for different user types

### DRY, Types First
- Consolidate shared UI in `/src/components/ui` using **shadcn/ui**
- Consolidate backend utilities into a versioned internal BOM
- **TappsHA Extension**: Create reusable business logic components

### Cloud-Native, Container-First
- Each service ships with a **Dockerfile** (multi-arch) and appears in `docker-compose.yml`
- Images build via multi-stage and distroless base images to minimise CVEs
- **TappsHA Extension**: Implement microservices architecture with clear service boundaries

### Observability
- Metrics: `/actuator/prometheus` (Spring), `@vercel/analytics` (React)
- Traces: OpenTelemetry 1.28 + OTLP/HTTP exporter
- Dashboards exported as JSON under `/observability/grafana`
- **TappsHA Extension**: Add business metrics and user behavior tracking

### Testing & Quality Gates
- **Unit ≥ 80%** branch coverage (`jacoco`, `vitest`)
- **Static analysis**: Sonar, ESLint, Stylelint, Dependabot
- **Performance budgets**: TTI ≤ 2 s on LTE, P95 backend ≤ 200 ms
- **TappsHA Extension**: Add integration tests for business workflows

## TappsHA-Specific Standards

### Architecture Standards
- **Frontend**: React 19 + TypeScript 5 + Vite
- **Backend**: Spring Boot 3.3+ (Java 21 LTS)
- **Database**: PostgreSQL 17 with pgvector extension
- **AI Integration**: OpenAI GPT-4o, LangChain 0.2
- **State Management**: TanStack Query 5 + Context API
- **Styling**: TailwindCSS 4.x + shadcn/ui

### Development Workflow
1. **Planning**: Use `@plan-product` for new features
2. **Analysis**: Use `@analyze-product` for improvements
3. **Specification**: Use `@create-spec` for detailed specs
4. **Execution**: Use `@execute-tasks` for implementation

### Code Organization
```
src/
├── components/         # Reusable UI components
│   ├── ui/            # shadcn/ui components
│   └── business/      # Business-specific components
├── pages/             # Page components
├── hooks/             # Custom React hooks
├── utils/             # Utility functions
├── types/             # TypeScript type definitions
├── services/          # API service layer
└── constants/         # Application constants
```

### Naming Conventions
- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Files**: kebab-case (e.g., `user-profile.tsx`)
- **Functions**: camelCase (e.g., `getUserData`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **Types**: PascalCase with descriptive names (e.g., `UserProfileData`)

### Documentation Standards
- **README**: Project overview and setup instructions
- **Component Docs**: JSDoc comments for all components
- **API Docs**: OpenAPI/Swagger documentation
- **Architecture**: Keep implementation documents current

### Security Standards
- **Authentication**: OAuth 2.1 with PKCE
- **Authorization**: Role-based access control (RBAC)
- **Data Protection**: Encrypt sensitive data at rest and in transit
- **Input Validation**: Validate all user inputs
- **Error Handling**: Don't expose sensitive information in error messages

### Performance Standards
- **Frontend**: First Contentful Paint ≤ 1.5s
- **Backend**: P95 response time ≤ 200ms
- **Database**: Query optimization and indexing
- **Bundle Size**: Keep JavaScript bundle under 500KB
- **Images**: Optimize and use appropriate formats

### Accessibility Standards
- **WCAG 2.2 AA**: Minimum compliance level
- **Keyboard Navigation**: All interactive elements accessible
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Color Contrast**: Minimum 4.5:1 ratio for normal text
- **Focus Management**: Clear focus indicators

## Quality Assurance

### Code Review Checklist
- [ ] Follows TypeScript-first approach
- [ ] Implements mobile-first responsive design
- [ ] Includes accessibility considerations
- [ ] Has appropriate test coverage
- [ ] Follows security best practices
- [ ] Performance considerations addressed
- [ ] Documentation updated

### Testing Requirements
- **Unit Tests**: ≥80% branch coverage
- **Integration Tests**: Critical user workflows
- **E2E Tests**: Key business processes
- **Accessibility Tests**: Automated and manual testing
- **Performance Tests**: Load testing for critical paths

### Deployment Standards
- **Environment**: Separate dev, staging, and production
- **CI/CD**: Automated testing and deployment
- **Monitoring**: Health checks and alerting
- **Rollback**: Ability to quickly revert changes
- **Security**: Regular security scans and updates

---
*Created: 2025-08-02*
*Last Updated: 2025-08-02*
*Status: Active* 