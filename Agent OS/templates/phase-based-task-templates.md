# Phase-Based Task Templates for Early Issue Detection

## Overview
These templates automatically inject Agent OS standards validation and early issue detection at the appropriate development phases, ensuring maximum compliance and quality.

## Foundation Phase Task Templates

### Template: Environment Setup Validation
**When to Use**: Before any code development begins
**Auto-Trigger**: Project initialization, new developer onboarding

```markdown
## Environment Setup Validation

### Pre-Development Checklist
- [ ] **Node.js Version Check**
  ```bash
  node .agent-os/utils/dependency-validator.js
  ```
  - Verify Node.js ≥18
  - Validate npm ≥8

- [ ] **Technology Stack Validation**  
  - [ ] Verify Spring Boot 3.3+ configured
  - [ ] Verify React 19 with TypeScript 5
  - [ ] Verify PostgreSQL 17 with pgvector
  - [ ] Verify Docker 24 with Compose V2

- [ ] **Infrastructure Health Check**
  ```bash
  node .agent-os/utils/infrastructure-recovery.js
  ```
  - Database connectivity: ✅/❌
  - Container health: ✅/❌  
  - Port availability: ✅/❌
  - Network connectivity: ✅/❌

- [ ] **Agent OS Utilities Integration**
  - [ ] Verify `.agent-os/utils/` available
  - [ ] Test dependency validator
  - [ ] Test cross-platform shell
  - [ ] Test mock factories

### Early Issue Prevention
- [ ] **Security Foundation**
  - [ ] Environment variables configured (no hardcoded secrets)
  - [ ] Input validation framework setup
  - [ ] Authentication/authorization framework ready
  
- [ ] **Testing Foundation**
  - [ ] Mock factories configured
  - [ ] Testing framework setup (Vitest + jsdom)
  - [ ] Coverage reporting configured (≥85% requirement)

### Success Criteria
- [ ] All environment validations pass
- [ ] Infrastructure health score = 100%
- [ ] Agent OS utilities fully integrated
- [ ] Security framework operational
- [ ] Testing framework operational
```

### Template: Security-First Development
**When to Use**: Before implementing any data handling or API endpoints
**Auto-Trigger**: Creating new services, controllers, or data models

```markdown
## Security-First Development Checklist

### Pre-Implementation Security Review
- [ ] **Data Classification**
  - [ ] Identify sensitive data (PII, credentials, tokens)
  - [ ] Define encryption requirements
  - [ ] Plan secure storage strategy

- [ ] **Input Validation Strategy**
  ```java
  // MANDATORY: All user inputs must be validated
  @PostMapping("/api/endpoint")
  public ResponseEntity<?> processData(@Valid @RequestBody DataRequest request) {
      // Implementation with validation
  }
  ```

- [ ] **Authentication & Authorization**
  - [ ] OAuth 2.1 implementation planned
  - [ ] Role-based access control defined
  - [ ] Token management strategy defined

### Implementation Security Checks
- [ ] **Code Security Validation**
  ```bash
  # Run security scan on new code
  node .agent-os/tools/compliance-checker.js --security
  ```
  - No hardcoded secrets: ✅/❌
  - Input validation present: ✅/❌
  - SQL injection prevention: ✅/❌
  - Proper error handling: ✅/❌

- [ ] **Infrastructure Security**
  - [ ] Container security configured
  - [ ] Database access secured
  - [ ] API endpoints secured
  - [ ] HTTPS/TLS 1.3 enforced

### Success Criteria
- [ ] Security compliance score = 100%
- [ ] All sensitive data encrypted
- [ ] All inputs validated
- [ ] Authentication/authorization implemented
- [ ] Security tests written and passing
```

## Integration Phase Task Templates

### Template: Service Architecture Validation
**When to Use**: Before creating new services or controllers
**Auto-Trigger**: Adding new @Service, @Controller, or @Repository classes

```markdown
## Service Architecture Validation

### Architecture Pattern Compliance
- [ ] **Controller → Service → Repository Pattern**
  ```java
  // ✅ CORRECT: Controller only calls Service
  @RestController
  public class UserController {
      private final UserService userService; // No direct repository access
  }
  
  // ✅ CORRECT: Service handles business logic
  @Service
  @Transactional
  public class UserService {
      private final UserRepository userRepository; // Repository access here
  }
  ```

- [ ] **Dependency Injection Validation**
  - [ ] All dependencies injected via constructor
  - [ ] No circular dependencies detected
  - [ ] Proper Spring annotations used

### Real-Time Architecture Validation
- [ ] **Automated Architecture Check**
  ```bash
  # Validate architecture patterns
  node .agent-os/tools/compliance-checker.js --architecture
  ```
  - Controller pattern compliance: ✅/❌
  - Service layer compliance: ✅/❌
  - Repository pattern compliance: ✅/❌
  - No architectural violations: ✅/❌

- [ ] **Circular Dependency Detection**
  ```javascript
  const { CircularDependencyDetector } = require('.agent-os/utils/dependency-validator.js');
  // Automatic detection during build
  ```

### Performance & Monitoring Integration
- [ ] **Observability Setup**
  - [ ] Spring Boot Actuator endpoints enabled
  - [ ] Prometheus metrics configured
  - [ ] Structured logging implemented
  - [ ] Health checks implemented

### Success Criteria
- [ ] Architecture compliance score = 100%
- [ ] No circular dependencies
- [ ] All services properly layered
- [ ] Monitoring and logging active
- [ ] Performance benchmarks met
```

### Template: API Integration Validation
**When to Use**: Before implementing new API endpoints or external integrations
**Auto-Trigger**: Adding @RequestMapping or external API calls

```markdown
## API Integration Validation

### API Design Compliance
- [ ] **RESTful API Standards**
  - [ ] Proper HTTP verbs (GET, POST, PUT, DELETE)
  - [ ] Consistent URL patterns (/api/v1/resources)
  - [ ] Proper HTTP status codes
  - [ ] Standardized error responses

- [ ] **Request/Response Validation**
  ```java
  // MANDATORY: All API requests must be validated
  @PostMapping("/api/v1/users")
  public ResponseEntity<UserResponse> createUser(
      @Valid @RequestBody CreateUserRequest request) {
      // Implementation
  }
  ```

### Integration Testing Requirements
- [ ] **Mock Factory Usage**
  ```typescript
  import { createApiClientMock } from '.agent-os/testing/mock-factories.js';
  
  const apiMock = createApiClientMock({
    '/api/v1/users': { id: 1, email: 'test@example.com' }
  });
  ```

- [ ] **Integration Test Coverage**
  - [ ] Happy path tests
  - [ ] Error condition tests
  - [ ] Authentication tests
  - [ ] Rate limiting tests

### External API Integration
- [ ] **Infrastructure Health Check**
  ```bash
  # Check external service connectivity
  node .agent-os/utils/infrastructure-recovery.js --external
  ```

- [ ] **Cross-Platform Command Usage**
  ```javascript
  const shell = new CrossPlatformShell();
  // ALWAYS use for API deployment commands
  shell.executeCommand('docker-compose up -d api-service');
  ```

### Success Criteria
- [ ] API design follows REST standards
- [ ] All endpoints properly tested
- [ ] Integration tests pass
- [ ] External services healthy
- [ ] Error handling comprehensive
```

## Advanced Features Phase Task Templates

### Template: Feature Value Validation
**When to Use**: Before implementing any new feature
**Auto-Trigger**: Creating new feature branches or specs

```markdown
## Feature Value Validation

### Pre-Implementation Feature Scoring
- [ ] **Feature Impact Assessment**
  ```javascript
  const FeatureScoringFramework = require('.agent-os/utils/feature-scoring.js');
  
  const feature = {
    name: '[FEATURE_NAME]',
    description: '[FEATURE_DESCRIPTION]',
    importance: [1-10], // Business value
    complexity: [1-10], // Development effort
    impact: [1-10]      // Developer productivity impact
  };
  
  const score = framework.scoreFeature(feature);
  ```

- [ ] **Scoring Results Validation**
  - [ ] Weighted score ≥ 6.0 (minimum threshold)
  - [ ] Impact score ≥ 6 (meaningful productivity improvement)
  - [ ] ROI ratio ≥ 1.0 (impact/complexity)

### Feature Implementation Decision Matrix
- [ ] **High Priority (Score ≥ 8.0)**
  - [ ] Implement immediately
  - [ ] Allocate primary developer resources
  - [ ] Fast-track through phases

- [ ] **Medium Priority (Score 6.0-7.9)**
  - [ ] Implement in current phase
  - [ ] Standard development process
  - [ ] Regular review and validation

- [ ] **Low Priority (Score 4.0-5.9)**
  - [ ] Defer to later phase
  - [ ] Consider scope reduction
  - [ ] Re-evaluate against other features

- [ ] **Eliminate (Score < 4.0)**
  - [ ] Remove from backlog
  - [ ] Document elimination rationale
  - [ ] Notify stakeholders of decision

### Quick Wins Identification
- [ ] **High Impact, Low Complexity (Impact ≥8, Complexity ≤4)**
  - [ ] Fast-track implementation
  - [ ] Showcase early wins
  - [ ] Build development momentum

### Success Criteria
- [ ] Feature score ≥ 6.0 confirmed
- [ ] Implementation priority determined
- [ ] Resource allocation planned
- [ ] Success metrics defined
- [ ] Stakeholder approval obtained
```

### Template: Performance & Optimization Validation
**When to Use**: Before deploying features to production
**Auto-Trigger**: Creating production deployment PRs

```markdown
## Performance & Optimization Validation

### Performance Benchmark Validation
- [ ] **Backend Performance**
  - [ ] Response time P95 ≤ 200ms
  - [ ] Memory usage within limits
  - [ ] Database query optimization
  - [ ] Connection pooling configured

- [ ] **Frontend Performance**  
  - [ ] Time to Interactive (TTI) ≤ 2s
  - [ ] Lighthouse performance score ≥ 90
  - [ ] Bundle size optimization
  - [ ] Lazy loading implemented

### Infrastructure Optimization
- [ ] **Infrastructure Health Validation**
  ```bash
  # Comprehensive infrastructure check before deployment
  node .agent-os/utils/infrastructure-recovery.js --comprehensive
  ```
  - [ ] Database performance optimized
  - [ ] Container resource allocation
  - [ ] Network latency acceptable
  - [ ] Monitoring dashboards active

### Code Quality Final Check
- [ ] **Comprehensive Compliance Check**
  ```bash
  # Final compliance validation
  node .agent-os/tools/compliance-checker.js --comprehensive
  ```
  - [ ] Overall compliance score ≥ 85%
  - [ ] No critical violations
  - [ ] All TODO/FIXME items addressed
  - [ ] Documentation complete

### Deployment Readiness
- [ ] **Deployment Validation**
  - [ ] Rollback procedures tested
  - [ ] Health checks configured
  - [ ] Monitoring alerts active
  - [ ] Performance baselines established

### Success Criteria
- [ ] Performance benchmarks met
- [ ] Infrastructure optimized
- [ ] Code quality score ≥ 85%
- [ ] Deployment procedures validated
- [ ] Monitoring systems active
```

## Continuous Validation Templates

### Template: Daily Development Health Check
**When to Use**: Start of each development session
**Auto-Trigger**: Daily development startup

```markdown
## Daily Development Health Check

### Environment Status Validation
- [ ] **Quick Environment Check**
  ```bash
  # 30-second environment validation
  node .agent-os/utils/dependency-validator.js --quick
  ```

- [ ] **Infrastructure Status**
  ```bash
  # Quick infrastructure health check
  node .agent-os/utils/infrastructure-recovery.js --quick
  ```

### Development Session Preparation
- [ ] **Task Priority Review**
  - [ ] Review tasks.md current priorities
  - [ ] Validate task compliance requirements
  - [ ] Confirm resource availability

- [ ] **Standards Awareness**
  - [ ] Current phase requirements reviewed
  - [ ] Agent OS utilities ready
  - [ ] Testing patterns confirmed

### Success Criteria
- [ ] Environment healthy
- [ ] Infrastructure operational  
- [ ] Task priorities clear
- [ ] Standards compliance ready
```

### Template: Pre-Commit Validation
**When to Use**: Before every git commit
**Auto-Trigger**: Git pre-commit hooks

```markdown
## Pre-Commit Validation

### Comprehensive Code Validation
- [ ] **Full Compliance Check**
  ```bash
  # Comprehensive validation before commit
  node .agent-os/tools/compliance-checker.js
  ```
  - [ ] Security compliance: 100%
  - [ ] Architecture compliance: ≥95%
  - [ ] Code style compliance: ≥95%
  - [ ] Overall score: ≥85%

- [ ] **Testing Validation**
  - [ ] All tests passing
  - [ ] Coverage ≥85%
  - [ ] No test failures
  - [ ] Integration tests pass

### Task Tracking Update
- [ ] **Mandatory Task Updates**
  - [ ] tasks.md updated with progress
  - [ ] Completed subtasks marked [x]
  - [ ] Progress percentages updated
  - [ ] Session summary documented

### Success Criteria
- [ ] All validations pass
- [ ] Tests pass with coverage
- [ ] Task tracking updated
- [ ] Ready for code review
```

## Usage Instructions

### Automatic Template Integration
1. **Phase Detection**: Templates auto-activate based on current development phase
2. **File Watching**: Templates trigger based on file changes and development activities  
3. **Compliance Integration**: All templates integrate with Agent OS compliance checking
4. **Early Detection**: Issues caught at earliest possible moment in development lifecycle

### Template Customization
- Modify scoring thresholds based on project requirements
- Add project-specific validation steps
- Integrate with existing development workflows
- Customize automation triggers

### Success Metrics
- **Issue Prevention**: 80% reduction in post-development issues
- **Development Speed**: 60% faster development with early validation
- **Quality Score**: Maintain ≥85% compliance throughout development
- **Feature Value**: 100% of implemented features score above elimination threshold