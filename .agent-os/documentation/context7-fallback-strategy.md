# Context7 Fallback Strategy for TappHA

## Overview

This document defines when to use Context7 documentation versus Agent OS standards, ensuring consistent decision-making across the TappHA development team.

## Primary Source: Context7

### ✅ Always Use Context7 First For:

#### Library Documentation
- **React patterns and APIs** - `/reactjs/react.dev`
- **Spring Boot configuration** - `/spring-projects/spring-boot`
- **PostgreSQL queries and features** - `/context7/postgresql-17`
- **Home Assistant APIs** - `/home-assistant/developers.home-assistant`
- **TypeScript language features** - `/microsoft/typescript`

#### Current Best Practices
- Latest API patterns
- Recommended approaches
- Performance optimizations
- Security guidelines
- Deprecation warnings

#### Version-Specific Information
- Spring Boot 3.5.3 features
- PostgreSQL 17 capabilities
- React 19 improvements
- Home Assistant API changes

## Fallback: Agent OS Standards

### 🔄 Use Agent OS Standards When:

#### Context7 Gaps
- **Library not available** in Context7
- **Documentation incomplete** or outdated
- **Specific version not covered**
- **Context7 API unavailable**

#### Project-Specific Requirements
- **TappHA business logic** and workflows
- **Custom integrations** beyond standard libraries
- **Internal API patterns** and conventions
- **Project architecture decisions**

#### Agent OS Specifications
- **Technology stack choices** (tech-stack.md)
- **Code style standards** (code-style.md)
- **Security compliance** requirements
- **Testing strategies** and coverage requirements

## Decision Matrix

| Scenario | Use Context7 | Use Agent OS | Reasoning |
|----------|-------------|-------------|-----------|
| React hook implementation | ✅ | ❌ | Current patterns from official docs |
| Spring Boot controller pattern | ✅ | ❌ | Official Spring documentation |
| Home Assistant WebSocket auth | ✅ | ❌ | Official HA developer docs |
| TappHA-specific service design | ❌ | ✅ | Project-specific architecture |
| Database schema design | ❌ | ✅ | Business domain knowledge |
| Code formatting rules | ❌ | ✅ | Team consistency standards |
| OpenAI integration patterns | ❌ | ✅ | AI strategy is project-specific |

## Conflict Resolution

### When Context7 and Agent OS Conflict:

#### Technical Standards Conflicts
1. **Evaluate currency**: Is Context7 more up-to-date?
2. **Assess project fit**: Does Agent OS have project-specific reasons?
3. **Consult team lead**: Get architectural guidance
4. **Document decision**: Record reasoning for future reference

#### Example Resolution Process
```
Conflict: Context7 recommends React functional components only,
         Agent OS allows class components for legacy compatibility

Resolution:
1. Context7 shows current best practice (functional only)
2. Agent OS considers existing TappHA codebase
3. Decision: Use functional for new code, migrate legacy gradually
4. Document: Update Agent OS standards to align with Context7
```

## Practical Workflow

### Development Process
1. **Check Context7 first** for library patterns
2. **Verify Agent OS alignment** for project requirements
3. **Resolve conflicts** using decision matrix
4. **Document deviations** if Context7 patterns don't fit

### Code Review Process
1. **Reviewer checks Context7** for pattern validation
2. **Verify Agent OS compliance** for project standards
3. **Question deviations** and require documentation
4. **Update standards** if patterns have evolved

## Escalation Path

### When to Escalate:
- **Significant conflicts** between Context7 and Agent OS
- **Major architectural decisions** affecting multiple components
- **Performance vs. best practice** trade-offs
- **Security implications** of pattern choices

### Escalation Process:
1. **Document the conflict** with specific examples
2. **Present both approaches** with pros/cons
3. **Consult tech lead** for architectural guidance
4. **Update standards** based on decision
5. **Communicate changes** to development team

## Maintenance Strategy

### Regular Reviews
- **Monthly**: Check for Context7 updates affecting TappHA libraries
- **Quarterly**: Review Agent OS standards alignment with Context7
- **Per Release**: Validate no deprecated patterns in use

### Update Process
1. **Monitor Context7 changes** for used libraries
2. **Assess impact** on TappHA codebase
3. **Plan migration** if patterns have changed
4. **Update Agent OS standards** to maintain alignment

## Examples for TappHA

### Scenario 1: WebSocket Implementation
- **Context7**: `/home-assistant/developers.home-assistant` shows ping-pong pattern
- **Agent OS**: General WebSocket patterns
- **Decision**: Use Context7 HA-specific patterns
- **Reasoning**: TappHA integrates specifically with Home Assistant

### Scenario 2: Error Handling
- **Context7**: Spring Boot shows @ControllerAdvice patterns
- **Agent OS**: TappHA-specific error response format
- **Decision**: Use Context7 pattern, adapt response format
- **Reasoning**: Follow Spring conventions, customize output

### Scenario 3: Database Design
- **Context7**: PostgreSQL general patterns
- **Agent OS**: TappHA entity relationships and business rules
- **Decision**: Use Agent OS for schema, Context7 for queries
- **Reasoning**: Schema is domain-specific, queries follow SQL standards

## Success Metrics

### Consistency Indicators
- **Reduced conflicts** between Context7 and Agent OS guidance
- **Faster development** due to clear decision process
- **Better code quality** through current pattern usage
- **Team alignment** on documentation hierarchy

### Quality Measures
- **Code reviews** reference appropriate standards
- **Documentation** clearly indicates source of patterns
- **Deviations** are documented and justified
- **Standards** stay current with Context7 updates

---

**Last Updated**: 2025-01-27  
**Version**: 1.0  
**Authority**: TappHA Development Team Lead  
**Next Review**: 2025-02-27