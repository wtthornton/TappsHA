# Agent OS Standards Enforcement

## Overview

This document defines the mandatory enforcement rules for Agent OS standards compliance. **ALL** code generation must follow these rules without exception.

## Mandatory Technology Stack

### Backend (Java/Spring Boot)
**ALWAYS** use:
- Spring Boot 3.3+ (Java 21 LTS)
- Spring Security with OAuth 2.1
- JPA/Hibernate with PostgreSQL 17
- Spring Boot Actuator for monitoring
- SLF4J for logging
- @Async for background processing
- Controller → Service → Repository pattern

### Frontend (React/TypeScript)
**ALWAYS** use:
- React 19 stable with TypeScript 5
- Functional components with hooks
- TanStack Query 5 for data fetching
- Context API for lightweight state
- TailwindCSS 4.x + shadcn/ui
- Vitest + jsdom for unit tests
- Cypress for e2e tests

### Database
**ALWAYS** use:
- PostgreSQL 17 with pgvector extension
- InfluxDB 3 Core for time-series data
- JPA/Hibernate for ORM
- Connection pooling
- Proper indexing strategies

### AI/ML
**ALWAYS** use:
- OpenAI GPT-4o for NLP
- pgvector for vector embeddings
- LangChain 0.2 for AI applications
- Async/await patterns for API calls

### Infrastructure
**ALWAYS** use:
- Docker 24 with Compose V2
- GitHub Actions for CI/CD
- Prometheus v2.50 + Grafana 11
- Loki 3 for logging
- Multi-stage Docker builds

## Mandatory Code Style

### Java/Spring Boot
```java
// ALWAYS use these patterns:
@RestController
@RequestMapping("/api/v1")
public class ExampleController {
    
    private final ExampleService exampleService;
    
    public ExampleController(ExampleService exampleService) {
        this.exampleService = exampleService;
    }
    
    @GetMapping("/examples")
    public ResponseEntity<List<ExampleDto>> getExamples() {
        return ResponseEntity.ok(exampleService.findAll());
    }
}
```

### TypeScript/React
```typescript
// ALWAYS use these patterns:
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface ExampleProps {
  id: string;
}

export const ExampleComponent: React.FC<ExampleProps> = ({ id }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['example', id],
    queryFn: () => fetchExample(id),
  });
  
  if (isLoading) return <div>Loading...</div>;
  
  return <div>{data?.name}</div>;
};
```

### CSS/TailwindCSS
```css
/* ALWAYS use mobile-first approach */
.example-component {
  @apply p-4 text-sm; /* xs: ≤400px */
  
  @apply sm:p-6 sm:text-base; /* sm: 640px+ */
  @apply md:p-8 md:text-lg; /* md: 768px+ */
  @apply lg:p-10 lg:text-xl; /* lg: 1024px+ */
}
```

## Mandatory Architecture Patterns

### Layered Architecture
```
Controller Layer (REST API)
    ↓
Service Layer (Business Logic)
    ↓
Repository Layer (Data Access)
    ↓
Database Layer (PostgreSQL/InfluxDB)
```

### Security Patterns
```java
// ALWAYS implement security
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/public/**").permitAll()
                .anyRequest().authenticated()
            )
            .build();
    }
}
```

### Error Handling
```java
// ALWAYS implement proper error handling
@ControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception ex) {
        log.error("Unexpected error", ex);
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new ErrorResponse("Internal server error"));
    }
}
```

## Mandatory Testing Patterns

### Unit Tests (Java)
```java
@ExtendWith(MockitoExtension.class)
class ExampleServiceTest {
    
    @Mock
    private ExampleRepository repository;
    
    @InjectMocks
    private ExampleService service;
    
    @Test
    void shouldReturnExample() {
        // given
        Example example = new Example("test");
        when(repository.findById(1L)).thenReturn(Optional.of(example));
        
        // when
        Example result = service.findById(1L);
        
        // then
        assertThat(result).isEqualTo(example);
    }
}
```

### Unit Tests (TypeScript)
```typescript
import { render, screen } from '@testing-library/react';
import { ExampleComponent } from './ExampleComponent';

describe('ExampleComponent', () => {
  it('should render example', () => {
    render(<ExampleComponent id="1" />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
```

## Mandatory Performance Standards

### Backend Performance
- P95 response time ≤ 200ms
- Use connection pooling
- Implement proper caching (Redis)
- Use async processing for heavy operations
- Monitor with Spring Boot Actuator + Prometheus

### Frontend Performance
- Time to Interactive (TTI) ≤ 2s on LTE
- Use code splitting with React.lazy()
- Implement proper loading states
- Use TanStack Query for caching
- Monitor with @vercel/analytics

## Mandatory Security Standards

### Authentication & Authorization
- Use Spring Security with OAuth 2.1
- Implement JWT token validation
- Use role-based access control (RBAC)
- Validate all inputs
- Use HTTPS/TLS 1.3

### Data Protection
- Encrypt sensitive data at rest
- Use parameterized queries (JPA)
- Implement proper session management
- Follow OWASP Top-10 guidelines
- Use Helmet.js for security headers

## Mandatory Observability

### Metrics
```java
// ALWAYS expose metrics
@RestController
public class MetricsController {
    
    @GetMapping("/actuator/prometheus")
    public String metrics() {
        return "application_requests_total{method=\"GET\"} 42";
    }
}
```

### Logging
```java
// ALWAYS use structured logging
@Slf4j
public class ExampleService {
    
    public void processExample(Example example) {
        log.info("Processing example: {}", example.getId());
        // ... processing logic
        log.debug("Example processed successfully: {}", example);
    }
}
```

### Tracing
```java
// ALWAYS implement distributed tracing
@RestController
public class ExampleController {
    
    @GetMapping("/examples")
    public ResponseEntity<List<Example>> getExamples() {
        Span span = tracer.spanBuilder("getExamples").startSpan();
        try (var scope = span.makeCurrent()) {
            // ... implementation
            return ResponseEntity.ok(examples);
        } finally {
            span.end();
        }
    }
}
```

## Validation Checklist

Before generating any code, verify:

### Technology Stack
- [ ] Spring Boot 3.3+ (Java 21 LTS) for backend
- [ ] React 19 with TypeScript 5 for frontend
- [ ] PostgreSQL 17 with pgvector for database
- [ ] InfluxDB 3 Core for time-series data
- [ ] OpenAI GPT-4o for AI capabilities
- [ ] Docker 24 for containerization

### Code Style
- [ ] 2 spaces indentation
- [ ] 100 chars soft max line length
- [ ] PascalCase for components/classes
- [ ] camelCase for variables/functions
- [ ] Functional components with hooks
- [ ] Proper TypeScript types

### Architecture
- [ ] Controller → Service → Repository pattern
- [ ] Clear separation of concerns
- [ ] Proper exception handling
- [ ] Security implementation
- [ ] Observability setup

### Testing
- [ ] Unit tests with ≥80% branch coverage
- [ ] Integration tests for critical paths
- [ ] E2E tests with Cypress
- [ ] Static analysis tools

### Performance
- [ ] Backend P95 ≤ 200ms
- [ ] Frontend TTI ≤ 2s on LTE
- [ ] Proper caching implementation
- [ ] Database optimization

### Security
- [ ] Input validation
- [ ] Authentication/Authorization
- [ ] HTTPS/TLS implementation
- [ ] OWASP Top-10 compliance

## Enforcement Rules

### Strict Compliance
- **NEVER** deviate from these standards without explicit approval
- **ALWAYS** reference this document when making technology decisions
- **ALWAYS** follow the established patterns and conventions
- **ALWAYS** use the specified versions and configurations

### Code Review Requirements
- All code must pass static analysis
- All code must meet test coverage requirements
- All code must follow security guidelines
- All code must meet performance standards

### Documentation Requirements
- All public APIs must have JavaDoc/TSDoc
- All configuration must be documented
- All deployment procedures must be documented
- All operational procedures must be documented

## References

- Technology Stack: `@~/.agent-os/standards/tech-stack.md`
- Code Style: `@~/.agent-os/standards/code-style.md`
- Best Practices: `@~/.agent-os/standards/best-practices.md`
- JavaScript Style: `@~/.agent-os/standards/code-style/javascript-style.md`
- HTML Style: `@~/.agent-os/standards/code-style/html-style.md`
- CSS Style: `@~/.agent-os/standards/code-style/css-style.md`
- Lessons Learned Framework: `@~/.agent-os/lessons-learned/README.md`

## Lessons Learned Integration Standards

### Mandatory Lessons Learned Protocol

**ALWAYS** capture lessons learned after completing any significant development task or milestone.

**MANDATORY**: Every task list must include a lessons learned sub-task as the final sub-task of each main task.

### Lessons Learned Requirements

#### 1. Capture Triggers
- **ALWAYS** capture lessons after sub-task completion
- **ALWAYS** capture lessons after milestone completion
- **ALWAYS** capture lessons after incident resolution
- **ALWAYS** capture lessons after performance optimizations
- **ALWAYS** capture lessons after security implementations
- **MANDATORY**: Include lessons learned sub-task in every task list

#### 2. Capture Process
```markdown
# Lesson Capture Process
1. Use appropriate category directory
2. Follow lesson template structure
3. Include all required sections
4. Add appropriate tags for searching
5. Link to related lessons and standards
```

#### 3. Integration Process
- **ALWAYS** review lessons weekly during active development
- **ALWAYS** integrate high-impact lessons into standards
- **ALWAYS** update Cursor rules with new patterns
- **ALWAYS** communicate changes to all teams
- **ALWAYS** monitor adoption and effectiveness

#### 4. Validation Checklist for Lessons Learned
Before completing any development session, verify:
- [ ] Lessons are captured for significant tasks
- [ ] Lessons follow template structure
- [ ] Lessons include actionable recommendations
- [ ] Lessons are properly categorized and tagged
- [ ] High-impact lessons are identified for integration
- [ ] Every task list includes lessons learned sub-tasks
- [ ] Lessons learned sub-tasks are marked complete after task completion

### Lessons Learned File Structure Standards

#### Required Sections
```markdown
# Lesson Template
- Lesson Information (Date, Project, Phase, Priority)
- Context (What was the situation?)
- Action Taken (What was done?)
- Results (What were the outcomes?)
- Key Insights (What did we learn?)
- Recommendations (What should we do differently?)
- Impact Assessment (How significant is this lesson?)
- Related Lessons (Links to related experiences)
- Follow-up Actions (What needs to be done?)
- Tags (Categories for searching)
```

### Enforcement Rules for Lessons Learned

#### Strict Compliance
- **NEVER** complete significant development without capturing lessons
- **ALWAYS** use the standard lesson template
- **ALWAYS** include actionable recommendations
- **ALWAYS** categorize lessons appropriately
- **ALWAYS** link to related lessons and standards
- **MANDATORY**: Include lessons learned sub-task in every task list
- **MANDATORY**: Complete lessons learned sub-task after each main task

#### Quality Standards
- **ALWAYS** provide clear context and background
- **ALWAYS** describe specific actions taken
- **ALWAYS** document measurable outcomes
- **ALWAYS** include technical and process insights
- **ALWAYS** provide specific, actionable recommendations

## Task Tracking Standards

### Mandatory Task Update Protocol

**ALWAYS** update the corresponding `tasks.md` file immediately after completing any subtask, not at the end of a session.

### Task Update Requirements

#### 1. Immediate Updates
- **ALWAYS** mark completed subtasks with `[x]` immediately after completion
- **ALWAYS** add progress notes for completed sections
- **ALWAYS** update completion percentages
- **NEVER** wait until the end of a session to update tasks

#### 2. Progress Documentation
```markdown
- [x] 1.1 Write tests for new database entities
  - **Progress Note**: Unit tests implemented with 95% coverage
  - **Completed**: 2025-08-03 19:45
  - **Next**: 1.2 Create database migration script
```

#### 3. Session Summary Updates
After each development session, add:
```markdown
## Session Summary - YYYY-MM-DD HH:MM

### ✅ Completed in This Session
- [x] Task 1.1: Description of what was completed
- [x] Task 2.3: Description of what was completed

### 🔄 Next Priority Tasks
- [ ] Task 1.2: Next immediate task
- [ ] Task 2.4: Next immediate task

### 📊 Progress Update
- **Overall Progress**: X% Complete
- **Sections Complete**: X/Y major sections
- **Remaining Work**: Brief description
```

#### 4. Validation Checklist for Task Updates
Before ending any development session, verify:
- [ ] All completed subtasks are marked with `[x]`
- [ ] Progress notes are added for completed sections
- [ ] Session summary is documented
- [ ] Next priority tasks are clearly identified
- [ ] Overall progress percentage is updated
- [ ] Remaining work is documented

### Task File Structure Standards

#### Required Sections
```markdown
# Spec Tasks

## Tasks
- [ ] 1. **Major Section Title**
  - [ ] 1.1 Subtask description
  - [ ] 1.2 Subtask description
  - **Progress Note**: Current status and next steps

## Recent Completion Summary
### ✅ Completed in Latest Session (YYYY-MM-DD)
- Description of major accomplishments

### 🔄 Next Priority Tasks
- List of immediate next steps

## Overall Progress: X% Complete
- **Completed Sections**: List of completed major sections
- **Remaining Work**: Brief description of remaining work
```

### Enforcement Rules for Task Tracking

#### Strict Compliance
- **NEVER** complete a subtask without updating the tasks.md file
- **ALWAYS** update tasks immediately after completion
- **ALWAYS** document progress notes for context
- **ALWAYS** maintain accurate completion percentages

#### Quality Standards
- **ALWAYS** use clear, descriptive task names
- **ALWAYS** provide sufficient detail in progress notes
- **ALWAYS** maintain chronological order of updates
- **ALWAYS** cross-reference with related documentation

#### Integration with Development Workflow
- **ALWAYS** check tasks.md before starting new work
- **ALWAYS** update tasks.md after completing work
- **ALWAYS** reference tasks.md in commit messages
- **ALWAYS** include task updates in pull request descriptions 