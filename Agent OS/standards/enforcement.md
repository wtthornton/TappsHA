# Agent OS Standards Enforcement

## Overview
This document defines the mandatory enforcement rules for Agent OS compliance across all projects. These rules ensure consistent quality, maintainability, and adherence to established standards.

## Mandatory Compliance Rules

### 1. Feature Scoring Framework (MANDATORY)
**ALWAYS** score all features before development using the 4-dimension framework:

#### Required Scoring Dimensions
- **Business Impact (1-10)**: How much does this improve Agent-OS effectiveness?
- **Developer Productivity (1-10)**: How much faster/better will developers code with this feature?
- **Implementation Complexity (1-10)**: How difficult is this to build and maintain?
- **Adoption Likelihood (1-10)**: How likely are developers to actively use this feature?

#### Phase Classification Criteria
- **Phase 1 Criteria**: Developer Productivity ≥ 8/10 OR Combined Score ≥ 32/40
- **Phase 2 Criteria**: Developer Productivity ≥ 7/10 OR Combined Score ≥ 28/40
- **Phase 3+ Criteria**: All other features requiring executive approval
- **Elimination Criteria**: Developer Productivity < 6/10 OR Combined Score < 24/40

#### Required Documentation
- **ALWAYS** use `.agent-os/templates/feature-scoring-template.md`
- **ALWAYS** document scoring justification for each dimension
- **ALWAYS** include threshold analysis and phase classification
- **ALWAYS** make implementation decision (Proceed/Defer/Eliminate)

### 2. Technology Stack Validation (MANDATORY)
**ALWAYS** validate technology choices against Context7 before implementation:

#### Context7 Validation Requirements
- [ ] Technology choices validated against Context7 documentation
- [ ] Current versions confirmed via Context7
- [ ] Best practices verified via Context7
- [ ] Compatibility checked across components

#### Agent OS Standards Compliance
- [ ] Spring Boot 3.3+ (Java 21 LTS) for backend
- [ ] React 19 with TypeScript 5 for frontend
- [ ] PostgreSQL 17 with pgvector for database
- [ ] OpenAI GPT-4o for AI capabilities
- [ ] Docker 24 for containerization

### 3. Task Tracking Standards (MANDATORY)
**ALWAYS** update tasks.md file immediately after completing any subtask:

#### Immediate Update Requirements
- **ALWAYS** mark completed subtasks with `[x]` immediately after completion
- **NEVER** wait until the end of a session to update task progress
- **ALWAYS** add progress notes for completed sections
- **ALWAYS** update completion percentages and overall progress
- **ALWAYS** document session summaries with completed tasks and next priorities

#### Task File Structure Requirements
- **Required Sections**: Tasks, Recent Completion Summary, Next Priority Tasks, Overall Progress
- **Progress Documentation**: Include timestamps, detailed descriptions, and next steps
- **Quality Standards**: Clear task names, sufficient detail, chronological order
- **Integration**: Reference tasks.md in commit messages and pull requests

#### Task Update Protocol
1. **Immediate Updates**: Mark subtasks as `[x]` immediately upon completion
2. **Progress Notes**: Add detailed notes explaining what was accomplished
3. **Compliance Check**: Run `node compliance-checker.js --detailed` after each subtask
4. **Session Summaries**: Document completed work and next priorities
5. **Validation**: Verify all task updates before ending development sessions

#### Automatic Compliance Checking (MANDATORY)
**ALWAYS** run compliance check after every subtask completion:

##### Compliance Check Requirements
- **ALWAYS** execute `node compliance-checker.js --detailed` after marking subtask as `[x]`
- **ALWAYS** verify compliance score remains ≥85% after each change
- **ALWAYS** address any new violations before proceeding to next subtask
- **ALWAYS** document compliance status in progress notes
- **ALWAYS** update compliance metrics in task tracking

##### Compliance Check Integration
```bash
# After completing any subtask:
node compliance-checker.js --detailed

# Expected output:
# ✅ Compliance Score: 95%
# ✅ Standards Adherence: 100%
# ✅ Code Quality: Excellent
# ✅ No new violations detected
```

##### Compliance Failure Protocol
- **If compliance score drops below 85%**: Fix violations immediately
- **If new violations detected**: Address before next subtask
- **If standards violations found**: Document and resolve as priority
- **If quality issues identified**: Refactor code to meet standards

### 4. Lessons Learned Capture (MANDATORY)
**ALWAYS** capture lessons learned for significant tasks:

#### Required Lesson Structure
- **ALWAYS** use `.agent-os/templates/lessons-learned-template.md`
- **ALWAYS** include context, action taken, results, and key insights
- **ALWAYS** provide specific, actionable recommendations
- **ALWAYS** assess impact level, scope, and urgency
- **ALWAYS** include follow-up actions and standards integration

#### Lesson Categories
- **Development**: Code patterns, architecture decisions, technical challenges
- **Process**: Workflow improvements, team collaboration, project management
- **Technology**: Tool selection, integration challenges, performance optimization
- **Security**: Security implementations, vulnerability management, compliance
- **Performance**: Optimization strategies, monitoring, scalability
- **Team**: Communication, collaboration, knowledge sharing
- **Other**: Any other significant learnings

### 5. Code Style Standards (MANDATORY)
**ALWAYS** follow established code style standards:

#### Java/Spring Boot Standards
- **ALWAYS** use 2 spaces indentation (never tabs)
- **ALWAYS** use 100 chars soft max line length
- **ALWAYS** use PascalCase for classes, camelCase for variables/functions
- **ALWAYS** follow Controller → Service → Repository pattern
- **ALWAYS** implement proper exception handling with @ControllerAdvice
- **ALWAYS** use SLF4J for logging

#### TypeScript/React Standards
- **ALWAYS** use 2 spaces indentation (never tabs)
- **ALWAYS** use 100 chars soft max line length
- **ALWAYS** use PascalCase for components, camelCase for variables/functions
- **ALWAYS** use functional components with hooks
- **ALWAYS** use proper TypeScript types
- **ALWAYS** use TanStack Query for data fetching

#### CSS/TailwindCSS Standards
- **ALWAYS** use mobile-first approach (≤400px xs breakpoint)
- **ALWAYS** use TailwindCSS 4.x utilities
- **ALWAYS** implement responsive design
- **ALWAYS** follow accessibility standards (WCAG 2.2 AA)

### 6. Architecture Standards (MANDATORY)
**ALWAYS** follow layered architecture patterns:

#### Backend Architecture
- **ALWAYS** implement Controller → Service → Repository pattern
- **ALWAYS** maintain clear separation of concerns
- **ALWAYS** use JPA/Hibernate with PostgreSQL
- **ALWAYS** implement Spring Security with OAuth 2.1
- **ALWAYS** use Spring Boot Actuator for monitoring

#### Frontend Architecture
- **ALWAYS** use component-based structure
- **ALWAYS** use Context API for lightweight state management
- **ALWAYS** use TanStack Query for data fetching
- **ALWAYS** implement proper error boundaries
- **ALWAYS** use loading states for better UX

### 7. Security Standards (MANDATORY)
**ALWAYS** implement comprehensive security measures:

#### Authentication & Authorization
- **ALWAYS** use Spring Security with OAuth 2.1
- **ALWAYS** implement JWT token validation
- **ALWAYS** use role-based access control (RBAC)
- **ALWAYS** implement input validation
- **ALWAYS** use HTTPS/TLS 1.3

#### Data Protection
- **ALWAYS** encrypt sensitive data at rest
- **ALWAYS** use parameterized queries (JPA)
- **ALWAYS** implement proper session management
- **ALWAYS** follow OWASP Top-10 compliance
- **ALWAYS** implement security headers

### 8. Performance Standards (MANDATORY)
**ALWAYS** meet performance targets:

#### Backend Performance
- **ALWAYS** achieve P95 response time ≤ 200ms
- **ALWAYS** configure connection pooling
- **ALWAYS** implement caching (Redis)
- **ALWAYS** use async processing for heavy operations
- **ALWAYS** use Spring Boot Actuator + Prometheus monitoring

#### Frontend Performance
- **ALWAYS** achieve Time to Interactive (TTI) ≤ 2s on LTE
- **ALWAYS** use code splitting with React.lazy()
- **ALWAYS** implement proper loading states
- **ALWAYS** use TanStack Query caching
- **ALWAYS** implement performance monitoring

### 9. Testing Standards (MANDATORY)
**ALWAYS** achieve comprehensive test coverage:

#### Unit Tests
- **ALWAYS** achieve ≥85% branch coverage
- **ALWAYS** test all public methods
- **ALWAYS** use mock objects appropriately
- **ALWAYS** manage test data properly

#### Integration Tests
- **ALWAYS** test critical paths
- **ALWAYS** test database integration
- **ALWAYS** test API integration
- **ALWAYS** test error scenarios

#### E2E Tests
- **ALWAYS** use Cypress for e2e tests
- **ALWAYS** test critical user journeys
- **ALWAYS** test cross-browser compatibility
- **ALWAYS** test mobile responsiveness

### 10. Documentation Standards (MANDATORY)
**ALWAYS** complete all documentation requirements:

#### API Documentation
- **ALWAYS** create OpenAPI/Swagger documentation
- **ALWAYS** document all endpoints
- **ALWAYS** include request/response examples
- **ALWAYS** document error codes

#### Code Documentation
- **ALWAYS** use JavaDoc for public APIs
- **ALWAYS** use TSDoc for exported TypeScript
- **ALWAYS** keep README files updated
- **ALWAYS** maintain architecture documentation

#### Deployment Documentation
- **ALWAYS** create environment setup guide
- **ALWAYS** document deployment procedures
- **ALWAYS** document configuration management
- **ALWAYS** create troubleshooting guide

### 11. Deployment Validation Standards (MANDATORY)
**ALWAYS** validate deployment before considering it complete:

#### Pre-Deployment Validation
- **ALWAYS** run `.agent-os/scripts/validate-deployment.sh` before deployment
- **ALWAYS** verify CSS file size >10KB (not 0 bytes) for frontend builds
- **ALWAYS** check Docker port mappings match container service ports
- **ALWAYS** validate all npm dependencies are installed and compatible
- **ALWAYS** test database migrations in development environment first

#### Technology Stack Validation
- **ALWAYS** use Tailwind CSS 3.x (stable) - AVOID 4.x in production
- **ALWAYS** implement development authentication bypass for localhost testing
- **ALWAYS** verify PostCSS configuration for Tailwind 3.x
- **ALWAYS** check TypeScript path aliases are configured correctly

#### Service Accessibility Testing
- **ALWAYS** verify frontend accessible at expected port (curl -I http://localhost:5173)
- **ALWAYS** confirm backend health endpoint responding (curl -I http://localhost:8080/api/actuator/health)
- **ALWAYS** validate CSS and JavaScript files are properly generated and accessible
- **ALWAYS** test authentication flow or development bypass is working

#### Common Issue Prevention
- **ALWAYS** check for 0-byte CSS files (indicates Tailwind build failure)
- **ALWAYS** verify port mappings: `"5173:80"` for Nginx frontend, not `"5173:5173"`
- **ALWAYS** implement development bypass: `window.location.hostname === 'localhost'`
- **ALWAYS** test database migrations before production deployment
- **ALWAYS** validate all UI component dependencies are installed

#### Post-Deployment Validation
- **ALWAYS** run comprehensive accessibility tests after deployment
- **ALWAYS** verify all services are responding correctly
- **ALWAYS** check that proper styling is applied (not default browser styles)
- **ALWAYS** document any issues encountered and solutions applied

## Compliance Validation

### Automated Compliance Checking
**ALWAYS** use the automated compliance checker:

```bash
# Run compliance check
node .agent-os/tools/compliance-checker.js

# Check specific categories
node .agent-os/tools/compliance-checker.js --category security
node .agent-os/tools/compliance-checker.js --category performance
```

### Manual Compliance Checklist
**ALWAYS** use `.agent-os/templates/compliance-checklist-template.md` for manual validation:

#### Pre-Development Validation
- [ ] Feature scoring completed and documented
- [ ] Technology stack validated against Context7
- [ ] Task tracking structure established
- [ ] Documentation templates prepared

#### Development Validation
- [ ] Code style standards followed
- [ ] Architecture patterns implemented
- [ ] Security measures implemented
- [ ] Performance targets met
- [ ] Test coverage requirements satisfied

#### Post-Development Validation
- [ ] Task tracking updated immediately
- [ ] Lessons learned captured
- [ ] Documentation completed
- [ ] Quality gates passed

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

## Enforcement Mechanisms

### Automated Enforcement
- **CI/CD Integration**: Automated compliance checks in build pipeline
- **Pre-commit Hooks**: Validate code style and security before commits
- **Automated Testing**: Ensure test coverage requirements are met
- **Performance Monitoring**: Track performance metrics in real-time

### Manual Enforcement
- **Code Reviews**: Mandatory review of all code changes
- **Architecture Reviews**: Review architectural decisions
- **Security Reviews**: Validate security implementations
- **Documentation Reviews**: Ensure documentation completeness

### Compliance Reporting
- **Weekly Reports**: Track compliance metrics
- **Monthly Reviews**: Comprehensive compliance assessment
- **Quarterly Audits**: Deep-dive compliance analysis
- **Annual Assessments**: Full standards compliance review

## Violation Handling

### Minor Violations
- **Warning**: First-time minor violations
- **Documentation**: Record violation and corrective action
- **Training**: Provide additional training if needed
- **Follow-up**: Verify correction in next review

### Major Violations
- **Immediate Stop**: Halt development until violation is corrected
- **Root Cause Analysis**: Identify why violation occurred
- **Corrective Action**: Implement fixes and preventive measures
- **Process Update**: Update standards if needed

### Critical Violations
- **Emergency Review**: Immediate team review
- **Process Suspension**: Suspend development until resolved
- **Executive Notification**: Notify leadership of critical issues
- **Standards Revision**: Update standards to prevent recurrence

## Continuous Improvement

### Standards Evolution
- **Regular Review**: Quarterly review of all standards
- **Feedback Integration**: Incorporate team feedback
- **Industry Alignment**: Align with industry best practices
- **Technology Updates**: Update for new technologies

### Process Optimization
- **Automation**: Increase automated compliance checking
- **Tooling**: Improve compliance tools and templates
- **Training**: Enhance team training and onboarding
- **Documentation**: Improve standards documentation

### Metrics and KPIs
- **Compliance Rate**: Track overall compliance percentage
- **Violation Rate**: Monitor violation frequency
- **Resolution Time**: Track time to resolve violations
- **Team Satisfaction**: Measure team satisfaction with standards

## Templates and Tools

### Required Templates
- **Feature Scoring**: `.agent-os/templates/feature-scoring-template.md`
- **Task Updates**: `.agent-os/templates/task-update-template.md`
- **Lessons Learned**: `.agent-os/templates/lessons-learned-template.md`
- **Compliance Checklist**: `.agent-os/templates/compliance-checklist-template.md`

### Required Tools
- **Compliance Checker**: `.agent-os/tools/compliance-checker.js`
- **Feature Scoring Calculator**: Automated scoring calculations
- **Task Tracking Validator**: Validate task tracking compliance
- **Lessons Learned Tracker**: Track and categorize lessons

## Success Metrics

### Compliance Targets
- **Overall Compliance**: ≥95% compliance rate
- **Security Compliance**: 100% security compliance
- **Performance Compliance**: ≥90% performance compliance
- **Documentation Compliance**: ≥85% documentation completeness

### Quality Targets
- **Code Quality**: ≥90% code quality score
- **Test Coverage**: ≥85% branch coverage
- **Performance**: Meet all performance targets
- **Security**: Zero security vulnerabilities

### Process Targets
- **Task Tracking**: 100% immediate task updates
- **Lessons Learned**: Capture lessons for all significant tasks
- **Feature Scoring**: Score all features before development
- **Standards Validation**: Validate all technology choices

---

**Document Version**: 2.0
**Last Updated**: 2025-01-27
**Next Review**: 2025-04-27
**Compliance**: Agent OS Standards v2.0 