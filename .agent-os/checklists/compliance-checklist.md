# Automated Compliance Checklist

## Pre-Development Compliance

### Standards Review
- [ ] Review current .agent-os standards documentation
- [ ] Check for any recent standards updates
- [ ] Verify technology stack requirements
- [ ] Review security compliance requirements
- [ ] Check testing strategy requirements

### Environment Setup
- [ ] Install compliance checker tools
- [ ] Configure real-time validation
- [ ] Set up compliance dashboard
- [ ] Verify CI/CD integration
- [ ] Test compliance tools

### Baseline Assessment
- [ ] Run comprehensive compliance check on existing codebase
- [ ] Review current compliance score
- [ ] Identify critical violations
- [ ] Plan fixes for compliance issues
- [ ] Document baseline compliance state

## During Development Compliance

### Real-Time Validation
- [ ] Ensure real-time compliance validation is active
- [ ] Address immediate feedback on violations
- [ ] Maintain compliance score above 85%
- [ ] Fix critical violations immediately
- [ ] Address warnings as they appear

### Code Quality Standards
- [ ] Follow 2-space indentation (no tabs)
- [ ] Keep lines under 100 characters
- [ ] Use proper naming conventions (PascalCase/camelCase)
- [ ] Implement proper TypeScript types
- [ ] Use functional components with hooks (React)

### Security Standards
- [ ] No hardcoded secrets - use environment variables
- [ ] Implement proper input validation
- [ ] Use @Param annotations for dynamic SQL queries
- [ ] Follow OWASP Top-10 guidelines
- [ ] Implement proper authentication/authorization

### Architecture Standards
- [ ] Follow Controller → Service → Repository pattern
- [ ] Use proper Spring annotations (@RestController, @Service, @Repository)
- [ ] Implement proper exception handling
- [ ] Use Spring Security with OAuth 2.1
- [ ] Add Spring Boot Actuator for monitoring

### Testing Standards
- [ ] Write unit tests for all new functionality
- [ ] Maintain ≥85% branch coverage
- [ ] Write integration tests for critical paths
- [ ] Implement security testing for new features
- [ ] Add performance testing for scalability

## Post-Development Compliance

### Pre-Commit Validation
- [ ] Run comprehensive compliance check
- [ ] Fix all critical violations
- [ ] Address high-priority warnings
- [ ] Generate compliance report
- [ ] Update compliance dashboard

### Code Review Integration
- [ ] Include compliance report in PR description
- [ ] Reference task numbers in commit messages
- [ ] Document compliance improvements
- [ ] Update tasks.md with compliance status
- [ ] Cross-reference with standards documentation

### CI/CD Validation
- [ ] Verify CI/CD pipeline runs compliance checks
- [ ] Check that critical violations block merges
- [ ] Review compliance reports in PR comments
- [ ] Monitor compliance trends over time
- [ ] Address any CI/CD compliance failures

## Compliance Tools Usage

### Automated Compliance Checker
```bash
# Check entire codebase
node .agent-os/tools/compliance-checker.js

# Check specific file
node .agent-os/tools/compliance-checker.js path/to/file.java

# Generate comprehensive report
node .agent-os/tools/cursor-integration.js check
```

### Real-Time Validation
```bash
# Start file watching mode
node .agent-os/tools/cursor-integration.js watch

# Check specific file on save
node .agent-os/tools/cursor-integration.js check path/to/file.ts
```

### Compliance Dashboard
- [ ] Review compliance dashboard regularly
- [ ] Monitor compliance trends
- [ ] Track improvement suggestions
- [ ] Review violation patterns
- [ ] Update compliance goals

## Compliance Thresholds

### Critical Violations (Blocking)
- [ ] Security vulnerabilities = 0
- [ ] Hardcoded secrets = 0
- [ ] Missing critical dependencies = 0
- [ ] Architecture violations = 0

### Recommended Thresholds
- [ ] Overall compliance score ≥ 85%
- [ ] Security compliance score = 100%
- [ ] Testing coverage ≥ 85%
- [ ] Code quality score ≥ 80%

### Warning Thresholds
- [ ] Code style violations < 10 per file
- [ ] Performance warnings < 5 per module
- [ ] Documentation gaps < 3 per feature
- [ ] Test coverage gaps < 15%

## Compliance Categories

### Technology Stack Compliance
- [ ] Spring Boot 3.3+ (Java 21 LTS)
- [ ] React 19 with TypeScript 5
- [ ] PostgreSQL 17 with pgvector
- [ ] Docker 24 with Compose V2
- [ ] Prometheus v2.50 + Grafana 11

### Code Style Compliance
- [ ] 2 spaces indentation
- [ ] 100 characters max line length
- [ ] PascalCase for components/classes
- [ ] camelCase for variables/functions
- [ ] Proper TypeScript types

### Security Compliance
- [ ] No hardcoded secrets
- [ ] Input validation implemented
- [ ] SQL injection prevention
- [ ] HTTPS/TLS 1.3 usage
- [ ] OWASP Top-10 compliance

### Architecture Compliance
- [ ] Controller → Service → Repository pattern
- [ ] Proper Spring annotations
- [ ] Exception handling with @ControllerAdvice
- [ ] Spring Security with OAuth 2.1
- [ ] Observability with Actuator

### Testing Compliance
- [ ] ≥85% branch coverage
- [ ] Unit tests for all functionality
- [ ] Integration tests for critical paths
- [ ] Security testing for features
- [ ] Performance testing for scalability

## Compliance Reporting

### Daily Compliance Check
- [ ] Run compliance checker daily
- [ ] Review compliance dashboard
- [ ] Address new violations
- [ ] Update compliance metrics
- [ ] Document compliance improvements

### Weekly Compliance Review
- [ ] Review compliance trends
- [ ] Analyze violation patterns
- [ ] Update compliance goals
- [ ] Plan compliance improvements
- [ ] Share compliance insights

### Monthly Compliance Assessment
- [ ] Comprehensive compliance audit
- [ ] Review standards effectiveness
- [ ] Update compliance tools
- [ ] Plan standards improvements
- [ ] Document lessons learned

## Compliance Improvement

### Continuous Improvement
- [ ] Monitor compliance trends
- [ ] Identify recurring violations
- [ ] Update standards as needed
- [ ] Improve compliance tools
- [ ] Share best practices

### Standards Evolution
- [ ] Review standards quarterly
- [ ] Update based on lessons learned
- [ ] Incorporate new best practices
- [ ] Align with industry standards
- [ ] Validate standards effectiveness

### Team Training
- [ ] Regular compliance training
- [ ] Share compliance best practices
- [ ] Review compliance tools usage
- [ ] Discuss standards updates
- [ ] Celebrate compliance improvements

## Compliance Validation

### Pre-Submission Checklist
- [ ] All critical violations fixed
- [ ] Overall compliance score ≥ 85%
- [ ] Security compliance = 100%
- [ ] Testing coverage ≥ 85%
- [ ] Compliance report generated
- [ ] Tasks.md updated with compliance status
- [ ] Commit message references task numbers
- [ ] PR description includes compliance summary

### Quality Assurance
- [ ] Review compliance report accuracy
- [ ] Verify violation fixes
- [ ] Check compliance score calculation
- [ ] Validate standards enforcement
- [ ] Confirm CI/CD integration

### Documentation
- [ ] Update compliance documentation
- [ ] Document compliance improvements
- [ ] Record lessons learned
- [ ] Update standards as needed
- [ ] Share compliance insights

## References

### Standards Documentation
- **Technology Stack:** `@~/.agent-os/standards/tech-stack.md`
- **Code Style:** `@~/.agent-os/standards/code-style.md`
- **Best Practices:** `@~/.agent-os/standards/best-practices.md`
- **Security Compliance:** `@~/.agent-os/standards/security-compliance.md`
- **Testing Strategy:** `@~/.agent-os/standards/testing-strategy.md`
- **Enforcement:** `@~/.agent-os/standards/enforcement.md`

### Compliance Tools
- **Compliance Checker:** `.agent-os/tools/compliance-checker.js`
- **Cursor Integration:** `.agent-os/tools/cursor-integration.js`
- **Compliance Dashboard:** `.agent-os/dashboard/compliance-dashboard.html`
- **CI/CD Workflow:** `.github/workflows/standards-compliance.yml`

### Task Integration
- **Task Tracking:** `@~/.agent-os/checklists/task-tracking-checklist.md`
- **Lessons Learned:** `@~/.agent-os/lessons-learned/README.md`
- **Cursor Rules:** `.cursor/rules/automated-compliance.mdc` 