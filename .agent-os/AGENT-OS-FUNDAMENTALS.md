# Agent OS Fundamentals

## What is Agent OS?

Agent OS is a comprehensive development framework and methodology that provides:

1. **Standardized Development Process** - A systematic approach to building software with predefined standards, workflows, and quality gates
2. **Automated Compliance Checking** - Real-time validation against established standards for technology stack, code style, security, and architecture
3. **Lessons Learned Integration** - Systematic capture and application of insights across all development phases
4. **AI-Assisted Development** - Integration with Cursor AI for improved code generation and development efficiency

## Core Philosophy

Agent OS operates on the principle of **"Standards First, Automation Always"** - every development decision should align with established standards, and every process should be automated where possible.

## Directory Structure & Purpose

```
.agent-os/
├── standards/           # Mandatory compliance standards
├── instructions/        # Process workflows and execution rules
├── tools/              # Automated compliance checking and validation
├── lessons-learned/    # Captured insights and improvements
├── checklists/         # Validation checklists for each phase
├── templates/          # Reusable templates and patterns
├── specs/              # Feature specifications and requirements
├── product/            # Product strategy and roadmap
├── reports/            # Compliance reports and analytics
├── dashboard/          # Real-time compliance dashboard
└── cursor-rules/       # Cursor AI integration rules
```

## Mandatory Standards (ALWAYS Follow)

### 1. Technology Stack Standards
**Reference:** `@~/.agent-os/standards/tech-stack.md`
- **Backend:** Spring Boot 3.3+ (Java 21 LTS) with REST + gRPC + async events (Kafka)
- **Frontend:** React 19 stable with TypeScript 5
- **Database:** PostgreSQL 17 with pgvector extension
- **Time Series:** InfluxDB 3 Core (Docker)
- **AI/ML:** OpenAI GPT-4o, pgvector, LangChain 0.2
- **Build:** Vite 5.x, TailwindCSS 4.x + shadcn/ui
- **State:** TanStack Query 5, Context API
- **Runtime:** Docker 24, Compose V2
- **Observability:** Prometheus v2.50, Grafana 11, Loki 3

### 2. Code Style Standards
**Reference:** `@~/.agent-os/standards/code-style.md`
- TypeScript 5 for all runtime code
- Functional components with hooks
- 2 spaces indentation, 100 chars soft max
- PascalCase for components, camelCase for variables/functions
- Prettier + ESLint (airbnb + @typescript-eslint)
- Vitest + jsdom for unit tests, Cypress for e2e

### 3. Best Practices Standards
**Reference:** `@~/.agent-os/standards/best-practices.md`
- Mobile-first & accessible by default (≤400px xs breakpoint)
- Keep it simple, steady & secure
- DRY, types first
- Cloud-native, container-first
- Observability with Spring Boot Actuator + Prometheus
- Unit ≥80% branch coverage, static analysis

### 4. Security Standards
**Reference:** `@~/.agent-os/standards/security-compliance.md`
- Secure defaults & least privilege
- Dependency & library scanning
- Secrets management
- Container hardening
- Continuous monitoring

### 5. Testing Standards
**Reference:** `@~/.agent-os/standards/testing-strategy.md`
- Shift-left testing with early unit & integration tests
- Microservices testing pyramid
- Performance and resilience testing
- Security and compliance testing
- AI-aware continuous testing
- Risk-based test planning
- ≥85% branch coverage requirement

### 6. CI/CD Standards
**Reference:** `@~/.agent-os/standards/ci-cd-strategy.md`
- Automated linting, testing, coverage enforcement
- Docker build and security scanning
- Vulnerability scanning and coverage gates
- Preview environments for PRs

## Development Workflow

### 1. Pre-Development Checklist
**ALWAYS** run before starting any development:
```bash
# Check compliance status
node .agent-os/tools/full-compliance-check.js

# Verify standards are loaded
# Check @~/.agent-os/standards/ for all required standards
```

### 2. Task Execution Process
**ALWAYS** follow the structured task execution process:
1. **Load Context** - Load relevant spec, tasks.md, and standards
2. **Check Compliance** - Run compliance checker before starting
3. **Execute Tasks** - Follow Controller → Service → Repository pattern
4. **Update Progress** - Immediately update tasks.md after each subtask
5. **Run Tests** - Ensure all tests pass before proceeding
6. **Validate Compliance** - Run compliance checker after completion
7. **Update Lessons Learned** - Capture insights for future improvements

### 3. Code Generation Rules
**ALWAYS** follow these patterns:

#### Backend Code (Java/Spring Boot)
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

#### Frontend Code (React/TypeScript)
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

## Compliance Checking

### Automated Compliance Tools
**ALWAYS** use the built-in compliance checking tools:

```bash
# Full compliance check
node .agent-os/tools/full-compliance-check.js

# Real-time validation
node .agent-os/tools/cursor-integration.js watch

# Generate compliance report
node .agent-os/tools/compliance-checker.js --report
```

### Compliance Thresholds
- **Critical Violations:** 0 (blocking)
- **Overall Compliance Score:** ≥85%
- **Security Compliance:** 100%
- **Testing Coverage:** ≥85%
- **Code Quality Score:** ≥80%

### Compliance Categories
1. **Technology Stack** - Verify correct versions and dependencies
2. **Code Style** - Check formatting, naming conventions, structure
3. **Security** - Detect vulnerabilities, hardcoded secrets
4. **Architecture** - Verify patterns and design principles
5. **Testing** - Ensure adequate coverage and test quality
6. **Performance** - Check for performance issues and optimizations

## Lessons Learned Integration

### Capture Process
**ALWAYS** capture lessons learned after each task:
1. **Document Insights** - What worked, what didn't, why
2. **Update Standards** - Modify standards based on new insights
3. **Improve Processes** - Enhance workflows and checklists
4. **Share Knowledge** - Update documentation and templates

### Application Process
**ALWAYS** apply lessons learned:
1. **Check Lessons** - Review relevant lessons before starting
2. **Apply Patterns** - Use proven patterns and avoid known issues
3. **Update Standards** - Incorporate new insights into standards
4. **Validate Improvements** - Test new approaches and document results

## Cursor AI Integration

### Cursor Rules
**ALWAYS** use Cursor AI with Agent OS rules:
- **Standards Compliance** - All generated code must follow standards
- **Pattern Consistency** - Use established patterns and conventions
- **Quality Gates** - Validate against compliance requirements
- **Lessons Learned** - Apply captured insights automatically

### AI-Assisted Development
1. **Code Generation** - Generate code that follows standards
2. **Refactoring** - Improve existing code to meet standards
3. **Testing** - Generate comprehensive test suites
4. **Documentation** - Create clear, consistent documentation

## Task Tracking Standards

### Mandatory Task Updates
**ALWAYS** update tasks.md immediately after completing any subtask:
- Mark completed subtasks with `[x]` immediately after completion
- Add progress notes for completed sections
- Update completion percentages and overall progress
- Document session summaries with completed tasks and next priorities

### Task File Structure
- **Required Sections:** Tasks, Recent Completion Summary, Next Priority Tasks, Overall Progress
- **Progress Documentation:** Include timestamps, detailed descriptions, and next steps
- **Quality Standards:** Clear task names, sufficient detail, chronological order
- **Integration:** Reference tasks.md in development workflow and documentation

## Strategic Questions Framework

### Strategic Questions Location
**ALWAYS** save strategic questions in `.agent-os/product/strategic-questions/` directory:
- Use template format from `qa-template.md`
- Include proper document metadata
- Organize by logical categories
- Include critical priority questions clearly

### Strategic Questions Research
**ALWAYS** conduct deep research using multiple data sources:
- Follow answer template format from `answer-template.md`
- Save answer documents in `answers/` directory with timestamped filenames
- Provide evidence-based answers with comprehensive research findings
- Include implementation-ready recommendations

## Quality Assurance

### Pre-Submission Checklist
Before submitting any code, verify:
- [ ] Technology stack matches standards
- [ ] Code style follows conventions
- [ ] Best practices align with standards
- [ ] Security standards are followed
- [ ] CI/CD strategy is implemented
- [ ] Testing strategy meets requirements
- [ ] Architecture follows layered pattern
- [ ] Tests meet ≥85% branch coverage requirement
- [ ] Security measures are implemented
- [ ] Performance requirements are met
- [ ] Documentation is updated
- [ ] Strategic questions follow proper format and location standards
- [ ] All standards enforcement rules are followed

### Continuous Improvement
1. **Monitor Compliance** - Track compliance scores over time
2. **Identify Patterns** - Recognize recurring issues and opportunities
3. **Update Standards** - Refine standards based on lessons learned
4. **Enhance Tools** - Improve automation and validation capabilities
5. **Share Knowledge** - Document and share best practices

## Emergency Procedures

### Critical Violations
If critical violations are detected:
1. **Stop Development** - Immediately halt current work
2. **Assess Impact** - Evaluate severity and scope
3. **Fix Violations** - Address critical issues before proceeding
4. **Revalidate** - Run compliance check again
5. **Document** - Record the issue and resolution

### Standards Conflicts
If standards appear to conflict:
1. **Check Hierarchy** - Review standards priority order
2. **Consult Documentation** - Check for clarification in standards
3. **Apply Common Sense** - Use best judgment for safety/security
4. **Document Decision** - Record the decision and rationale
5. **Update Standards** - Clarify standards if needed

## Getting Started for New Agents

### First-Time Setup
1. **Load Fundamentals** - Read this document completely
2. **Check Standards** - Review all standards in `.agent-os/standards/`
3. **Run Compliance Check** - Execute full compliance check
4. **Review Reports** - Analyze compliance reports and dashboard
5. **Understand Workflow** - Study task execution process
6. **Practice Standards** - Apply standards to simple tasks first

### Daily Workflow
1. **Start with Compliance** - Run compliance check at start of day
2. **Load Context** - Load relevant specs and tasks
3. **Follow Process** - Execute tasks using structured process
4. **Update Progress** - Keep tasks.md current
5. **Validate Results** - Run compliance check after changes
6. **Capture Insights** - Document lessons learned

### Continuous Learning
1. **Review Standards** - Regularly review and understand standards
2. **Study Lessons** - Learn from captured insights
3. **Practice Patterns** - Apply established patterns consistently
4. **Contribute** - Share new insights and improvements
5. **Stay Updated** - Keep up with standards evolution

## Conclusion

Agent OS is a comprehensive framework that ensures consistent, high-quality development through:
- **Mandatory Standards** - Clear, enforceable development standards
- **Automated Compliance** - Real-time validation and feedback
- **Lessons Learned** - Continuous improvement through captured insights
- **AI Integration** - Enhanced development with Cursor AI
- **Quality Assurance** - Systematic quality gates and validation

**Remember:** Every development decision should align with Agent OS standards, and every process should leverage the automation and validation tools provided by the framework.

---

**Agent OS Fundamentals** - The foundation for consistent, high-quality development with automated compliance and continuous improvement. 