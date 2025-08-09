# Agent OS Compliance Checklist Template

## Project Information
- **Project Name**: [Enter project name]
- **Phase**: [Phase 1/2/3+]
- **Date**: [YYYY-MM-DD]
- **Reviewer**: [Name]
- **Team Members**: [List of team members]

## Pre-Development Compliance

### Feature Scoring Compliance
**MANDATORY**: All features must be scored before development

- [ ] **Feature scoring completed** for all new features
  - [ ] Business Impact scored (1-10)
  - [ ] Developer Productivity scored (1-10)
  - [ ] Implementation Complexity scored (1-10)
  - [ ] Adoption Likelihood scored (1-10)
  - [ ] Combined score calculated (Total/40)
  - [ ] Phase classification applied (Phase 1/2/3+)
  - [ ] Implementation decision made (Proceed/Defer/Eliminate)

- [ ] **Feature scoring documented** in project files
  - [ ] Scoring justification provided for each dimension
  - [ ] Threshold analysis completed
  - [ ] Priority ranking assigned
  - [ ] Resource allocation determined

### Technology Stack Validation
**MANDATORY**: All technology choices validated against Context7

- [ ] **Context7 validation completed**
  - [ ] Technology choices validated against Context7 documentation
  - [ ] Current versions confirmed via Context7
  - [ ] Best practices verified via Context7
  - [ ] Compatibility checked across components

- [ ] **Agent OS standards compliance**
  - [ ] Spring Boot 3.3+ (Java 21 LTS) for backend
  - [ ] React 19 with TypeScript 5 for frontend
  - [ ] PostgreSQL 17 with pgvector for database
  - [ ] OpenAI GPT-4o for AI capabilities
  - [ ] Docker 24 for containerization

### Planning Compliance
- [ ] **Task tracking structure** established
  - [ ] Main tasks.md file created
  - [ ] Sub-task specifications created
  - [ ] Progress tracking system established
  - [ ] Lessons learned capture planned

- [ ] **Documentation structure** prepared
  - [ ] API documentation templates ready
  - [ ] Code documentation standards established
  - [ ] Deployment documentation templates ready
  - [ ] User documentation templates ready

## Development Compliance

### Code Style Compliance
**MANDATORY**: All code must follow Agent OS standards

- [ ] **Java/Spring Boot standards**
  - [ ] 2 spaces indentation used
  - [ ] 100 chars soft max line length
  - [ ] PascalCase for classes
  - [ ] camelCase for variables/functions
  - [ ] Controller → Service → Repository pattern
  - [ ] Proper exception handling implemented
  - [ ] SLF4J logging used

- [ ] **TypeScript/React standards**
  - [ ] 2 spaces indentation used
  - [ ] 100 chars soft max line length
  - [ ] PascalCase for components
  - [ ] camelCase for variables/functions
  - [ ] Functional components with hooks
  - [ ] Proper TypeScript types
  - [ ] TanStack Query for data fetching

- [ ] **CSS/TailwindCSS standards**
  - [ ] Mobile-first approach used
  - [ ] TailwindCSS 4.x utilities
  - [ ] Responsive design implemented
  - [ ] Accessibility standards followed

### Architecture Compliance
**MANDATORY**: Follow layered architecture patterns

- [ ] **Backend architecture**
  - [ ] Controller layer (REST API)
  - [ ] Service layer (Business Logic)
  - [ ] Repository layer (Data Access)
  - [ ] Database layer (PostgreSQL/InfluxDB)
  - [ ] Clear separation of concerns

- [ ] **Frontend architecture**
  - [ ] Component-based structure
  - [ ] State management with Context API
  - [ ] Data fetching with TanStack Query
  - [ ] Proper error boundaries
  - [ ] Loading states implemented

### Security Compliance
**MANDATORY**: Implement comprehensive security measures

- [ ] **Authentication & Authorization**
  - [ ] Spring Security with OAuth 2.1
  - [ ] JWT token validation
  - [ ] Role-based access control (RBAC)
  - [ ] Input validation implemented
  - [ ] HTTPS/TLS 1.3 used

- [ ] **Data Protection**
  - [ ] Sensitive data encrypted at rest
  - [ ] Parameterized queries used (JPA)
  - [ ] Proper session management
  - [ ] OWASP Top-10 compliance
  - [ ] Security headers implemented

### Performance Compliance
**MANDATORY**: Meet performance targets

- [ ] **Backend performance**
  - [ ] P95 response time ≤ 200ms
  - [ ] Connection pooling configured
  - [ ] Caching implemented (Redis)
  - [ ] Async processing for heavy operations
  - [ ] Spring Boot Actuator + Prometheus monitoring

- [ ] **Frontend performance**
  - [ ] Time to Interactive (TTI) ≤ 2s on LTE
  - [ ] Code splitting with React.lazy()
  - [ ] Proper loading states
  - [ ] TanStack Query caching
  - [ ] Performance monitoring implemented

### Testing Compliance
**MANDATORY**: Achieve comprehensive test coverage

- [ ] **Unit tests**
  - [ ] ≥85% branch coverage achieved
  - [ ] All public methods tested
  - [ ] Mock objects used appropriately
  - [ ] Test data properly managed

- [ ] **Integration tests**
  - [ ] Critical paths tested
  - [ ] Database integration tested
  - [ ] API integration tested
  - [ ] Error scenarios tested

- [ ] **E2E tests**
  - [ ] Cypress tests implemented
  - [ ] Critical user journeys tested
  - [ ] Cross-browser testing
  - [ ] Mobile responsiveness tested

## Post-Development Compliance

### Documentation Compliance
**MANDATORY**: Complete all documentation requirements

- [ ] **API documentation**
  - [ ] OpenAPI/Swagger documentation
  - [ ] All endpoints documented
  - [ ] Request/response examples
  - [ ] Error codes documented

- [ ] **Code documentation**
  - [ ] JavaDoc for public APIs
  - [ ] TSDoc for exported TypeScript
  - [ ] README files updated
  - [ ] Architecture documentation

- [ ] **Deployment documentation**
  - [ ] Environment setup guide
  - [ ] Deployment procedures
  - [ ] Configuration management
  - [ ] Troubleshooting guide

### Task Tracking Compliance
**MANDATORY**: Update task tracking immediately

- [ ] **Task updates completed**
  - [ ] All completed subtasks marked with `[x]`
  - [ ] Progress notes added for completed sections
  - [ ] Session summary documented
  - [ ] Next priority tasks clearly identified
  - [ ] Overall progress percentage updated

- [ ] **Sub-task specifications updated**
  - [ ] Sub-task specifications in `.agent-os/specs/*/tasks.md` updated
  - [ ] Implementation notes added
  - [ ] Files created/modified documented
  - [ ] Test coverage added documented

### Lessons Learned Compliance
**MANDATORY**: Capture lessons learned

- [ ] **Lessons captured**
  - [ ] Lessons captured for significant tasks
  - [ ] Lessons follow template structure
  - [ ] Lessons include actionable recommendations
  - [ ] Lessons properly categorized and tagged
  - [ ] High-impact lessons identified for integration

- [ ] **Standards integration**
  - [ ] Standards updated based on lessons
  - [ ] Templates created based on lessons
  - [ ] Tools developed based on lessons
  - [ ] Team communication completed

## Quality Gates

### Security Quality Gate
- [ ] No hardcoded secrets in code
- [ ] All sensitive data encrypted
- [ ] Input validation implemented
- [ ] SQL injection prevention
- [ ] OWASP Top-10 compliance

### Code Quality Gate
- [ ] ≤5 TODO/FIXME items per service
- [ ] ≥85% branch coverage
- [ ] All public methods documented
- [ ] Proper exception handling
- [ ] Consistent naming conventions

### Performance Quality Gate
- [ ] P95 response time ≤200ms
- [ ] Memory usage within limits
- [ ] Database queries optimized
- [ ] Connection pooling configured
- [ ] Caching implemented where appropriate

### User Experience Quality Gate
- [ ] Mobile-first design implemented
- [ ] Accessibility standards met
- [ ] Loading states implemented
- [ ] Error handling user-friendly
- [ ] Performance targets met

## Compliance Validation

### Pre-Development Validation
- [ ] Feature scoring completed and documented
- [ ] Technology stack validated against Context7
- [ ] Task tracking structure established
- [ ] Documentation templates prepared

### Development Validation
- [ ] Code style standards followed
- [ ] Architecture patterns implemented
- [ ] Security measures implemented
- [ ] Performance targets met
- [ ] Test coverage requirements satisfied

### Post-Development Validation
- [ ] Task tracking updated immediately
- [ ] Lessons learned captured
- [ ] Documentation completed
- [ ] Quality gates passed

## Compliance Score

### Overall Compliance
- **Pre-Development**: [X]% (Target: 100%)
- **Development**: [X]% (Target: 100%)
- **Post-Development**: [X]% (Target: 100%)
- **Overall Score**: [X]% (Target: 100%)

### Compliance Categories
- **Feature Scoring**: [X]% (Target: 100%)
- **Technology Stack**: [X]% (Target: 100%)
- **Code Style**: [X]% (Target: 100%)
- **Architecture**: [X]% (Target: 100%)
- **Security**: [X]% (Target: 100%)
- **Performance**: [X]% (Target: 100%)
- **Testing**: [X]% (Target: 100%)
- **Documentation**: [X]% (Target: 100%)
- **Task Tracking**: [X]% (Target: 100%)
- **Lessons Learned**: [X]% (Target: 100%)

## Action Items

### Critical Issues (Must Fix)
```markdown
- [ ] [Issue 1]: [Description and fix required]
- [ ] [Issue 2]: [Description and fix required]
- [ ] [Issue 3]: [Description and fix required]
```

### Important Issues (Should Fix)
```markdown
- [ ] [Issue 1]: [Description and fix required]
- [ ] [Issue 2]: [Description and fix required]
- [ ] [Issue 3]: [Description and fix required]
```

### Minor Issues (Nice to Fix)
```markdown
- [ ] [Issue 1]: [Description and fix required]
- [ ] [Issue 2]: [Description and fix required]
- [ ] [Issue 3]: [Description and fix required]
```

## Approval

### Team Approval
- **Product Owner**: [Name] - [Approved/Rejected] - [Date]
- **Lead Developer**: [Name] - [Approved/Rejected] - [Date]
- **Team Member 1**: [Name] - [Approved/Rejected] - [Date]
- **Team Member 2**: [Name] - [Approved/Rejected] - [Date]

### Executive Approval (if Phase 3+)
- **Executive**: [Name] - [Approved/Rejected] - [Date]

## Next Review

### Review Schedule
- **Next Review Date**: [YYYY-MM-DD]
- **Review Type**: [Pre-Development/Development/Post-Development]
- **Reviewer**: [Name]

### Review Preparation
- [ ] Compliance checklist updated
- [ ] Standards reviewed for changes
- [ ] Templates updated if needed
- [ ] Team notified of review

---

**Template Version**: 1.0
**Last Updated**: 2025-01-27
**Compliance**: Agent OS Standards v1.0
**Next Review**: [YYYY-MM-DD] 