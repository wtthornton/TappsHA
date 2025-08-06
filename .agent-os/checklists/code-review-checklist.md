# TappHA Code Review Checklist

## Context7 Documentation Compliance

### Before Approving Any PR:

#### Core Library Patterns
- [ ] **React Components**: Verified against `/reactjs/react.dev` patterns
  - Functional components with hooks
  - Proper prop types and interfaces
  - Current React 19 patterns
- [ ] **Spring Boot**: Checked against `/spring-projects/spring-boot` v3.5.3 docs
  - Controller patterns
  - Security configuration
  - REST API conventions
- [ ] **Home Assistant Integration**: Validated against official HA docs
  - WebSocket API patterns (`/home-assistant/developers.home-assistant`)
  - Authentication flow (auth_required → auth → auth_ok)
  - Event subscription patterns
- [ ] **PostgreSQL**: Verified against `/context7/postgresql-17` documentation
  - Query patterns
  - Schema design
  - Index usage

#### Documentation Verification Process
1. **Identify libraries used** in the PR
2. **Check Context7 for current patterns** using the usage guide
3. **Verify implementation matches** official documentation
4. **Document any deviations** and reasoning

#### Specific Checks for TappHA

**Home Assistant WebSocket Implementation:**
- [ ] Uses proper ping-pong heartbeat mechanism
- [ ] Implements unique `id` fields for request/response correlation
- [ ] Subscribes to `state_changed` events correctly
- [ ] Enables `coalesce_messages` feature
- [ ] Handles HA-specific error codes

**Spring Boot REST Controllers:**
- [ ] Follows official controller patterns
- [ ] Implements proper exception handling
- [ ] Uses correct HTTP status codes
- [ ] Follows OAuth 2.1 authentication patterns

**React Component Standards:**
- [ ] Uses current hooks patterns
- [ ] Follows component composition principles
- [ ] Implements proper TypeScript interfaces

## General Code Quality

### Architecture & Design
- [ ] Follows Controller → Service → Repository pattern
- [ ] Proper separation of concerns
- [ ] Clean, readable code structure

### Testing
- [ ] Unit tests included for new functionality
- [ ] Integration tests for API endpoints
- [ ] Test coverage ≥80% for modified code

### Security
- [ ] No hardcoded credentials or secrets
- [ ] Proper input validation
- [ ] SQL injection prevention
- [ ] XSS prevention in frontend

### Performance
- [ ] No obvious performance bottlenecks
- [ ] Database queries optimized
- [ ] Frontend rendering optimized

### Documentation
- [ ] Code comments for complex logic
- [ ] API documentation updated
- [ ] README updated if needed

## Context7 Fallback Rules

**When Context7 patterns don't apply:**
- [ ] Documented reasoning for deviation
- [ ] Reference to Agent OS standards used instead
- [ ] Team lead approval for significant deviations

## Approval Process

### Required Checks
1. ✅ Context7 documentation verified
2. ✅ Code quality standards met
3. ✅ Tests passing
4. ✅ Security review completed
5. ✅ **Sub-task specifications updated** (NEW REQUIREMENT)

### Sub-Task Specification Verification
- [ ] **Main tasks.md updated**: All completed work reflected
- [ ] **Sub-task specs updated**: Related `.agent-os/specs/*/tasks.md` files marked complete
- [ ] **Sync verified**: Main tasks align with sub-task specifications
- [ ] **No orphaned sub-tasks**: All implemented features have corresponding sub-task updates

### Sign-off
- [ ] **Developer**: Self-reviewed using this checklist
- [ ] **Reviewer**: All items verified, including sub-task specification updates
- [ ] **Ready to merge**: All checks passed, task tracking complete

---

**Last Updated**: 2025-01-27  
**Version**: 1.0  
**For**: TappHA Development Team