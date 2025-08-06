# Agent OS - Standards & Tools

## Overview

Agent OS provides comprehensive standards, tools, and templates for systematic software development with mandatory refactoring enforcement. Based on lessons learned from real-world projects like TappHA, Agent OS ensures code quality, security, and maintainability through phase-based development with strict quality gates.

## 🎯 Core Principles

### Mandatory Refactoring Enforcement
**ALWAYS** perform refactoring after each specification phase completion:
- **Phase 1**: Foundation refactoring (CRITICAL) - Security hardening, error handling
- **Phase 2**: Integration refactoring (HIGH) - API standardization, service decomposition  
- **Phase 3**: Advanced features refactoring (MEDIUM) - Code quality, architecture optimization

### Quality Gates
- **Security Gate**: 0 hardcoded secrets, 100% encryption coverage
- **Code Quality Gate**: ≤5 TODO items per service, ≥85% test coverage
- **Performance Gate**: P95 ≤200ms response time, optimized queries

## 📚 Standards Documentation

### Core Standards
- **Technology Stack**: `.agent-os/standards/tech-stack.md`
- **Code Style**: `.agent-os/standards/code-style.md`
- **Best Practices**: `.agent-os/standards/best-practices.md`
- **Security & Compliance**: `.agent-os/standards/security-compliance.md`
- **Testing Strategy**: `.agent-os/standards/testing-strategy.md`
- **CI/CD Strategy**: `.agent-os/standards/ci-cd-strategy.md`
- **Enforcement**: `.agent-os/standards/enforcement.md`

### Refactoring Standards
- **Phase-Based Refactoring**: Mandatory refactoring after each phase
- **Security Refactoring**: Immediate security implementation
- **Code Quality Refactoring**: Systematic quality improvement
- **Performance Refactoring**: Performance optimization and monitoring

## 🛠️ Tools & Automation

### Quick Start (New Developers)
```bash
# Interactive setup menu - Start here!
node .agent-os/scripts/setup.js

# Quick initialization of everything
node .agent-os/scripts/quick-start.js
```

### Main Development Tools
- **Main CLI**: `.agent-os/tools/agent-os-cli.js` - Primary interface
- **Compliance Checker**: `.agent-os/tools/compliance-checker.js`
- **Refactoring Validator**: `.agent-os/tools/refactoring-validator.js`
- **Validation Suite**: `.agent-os/tools/validation-suite.js`

### Categorized Tools
- **Cursor Integration**: `.agent-os/tools/cursor/` - IDE integration tools
- **Lessons Management**: `.agent-os/tools/lessons/` - Lessons learned tools
- **Analysis Tools**: `.agent-os/tools/analysis/` - Code and doc analysis
- **Markdown Processing**: `.agent-os/tools/markdown/` - Markdown tools

### Usage Examples
```bash
# New developer - start here
node .agent-os/scripts/setup.js

# Quick daily validation
node .agent-os/scripts/setup.js validate

# Validate refactoring for Phase 1
node .agent-os/tools/refactoring-validator.js --phase=1 --validate

# Check compliance with standards
node .agent-os/tools/compliance-checker.js

# Cursor IDE integration
node .agent-os/tools/cursor/cursor-init.js
```

## 📋 Checklists & Templates

### Phase Completion Checklists
- **Phase 1 Checklist**: `.agent-os/checklists/phase-completion-checklist.md`
- **Refactoring Checklist**: `.agent-os/templates/refactoring-checklist.md`
- **Compliance Checklist**: `.agent-os/checklists/compliance-checklist.md`

### Development Templates
- **Refactoring Template**: `.agent-os/templates/refactoring-checklist.md`
- **Code Review Template**: `.agent-os/templates/code-review-template.md`
- **Testing Template**: `.agent-os/templates/testing-template.md`

## 📖 Lessons Learned

### Development Lessons
- **Refactoring Lessons**: `.agent-os/lessons-learned/categories/development/refactoring-lessons.md`
- **Database Lessons**: `.agent-os/lessons-learned/categories/development/database-lessons.md`
- **Testing Lessons**: `.agent-os/lessons-learned/categories/development/testing-lessons.md`

### Key Insights from TappHA Project
- **Phase-based refactoring is critical** - Must happen systematically after each phase
- **Security vulnerabilities cannot wait** - Must be addressed immediately
- **Large services become unmaintainable** - Should be decomposed early
- **Comprehensive error handling prevents production issues**
- **Quantifiable quality metrics prevent technical debt accumulation**

## 🚀 Quick Start

### 1. Initialize Agent OS
```bash
# Copy Agent OS to your project
cp -r .agent-os/ your-project/

# Install dependencies
npm install
```

### 2. Validate Current State
```bash
# Check compliance with standards
node .agent-os/tools/compliance-checker.js

# Validate against tech stack
node .agent-os/tools/product-validator.js
```

### 3. Start Development with Refactoring
```bash
# Complete Phase 1 features
# Then immediately run refactoring validation
node .agent-os/tools/refactoring-validator.js --phase=1 --validate

# Use refactoring checklist
cp .agent-os/templates/refactoring-checklist.md phase-1-refactoring.md
# Fill out and complete checklist
```

## 📊 Quality Metrics

### Security Metrics
- **Hardcoded Secrets**: 0 tolerance
- **Encryption Coverage**: 100% for sensitive data
- **Input Validation**: 100% coverage
- **Security Vulnerabilities**: 0 tolerance

### Code Quality Metrics
- **TODO Count**: ≤5 per service
- **Test Coverage**: ≥85% branch coverage
- **Service Size**: Keep services focused (<500 lines)
- **Error Rate**: <1% for user actions

### Performance Metrics
- **Response Time**: P95 ≤200ms
- **Memory Usage**: Within defined limits
- **Database Performance**: Optimized queries
- **Connection Pooling**: Properly configured

## 🔧 Technology Stack

### Backend (Java/Spring Boot)
- Spring Boot 3.3+ (Java 21 LTS)
- Spring Security with OAuth 2.1
- JPA/Hibernate with PostgreSQL 17
- Spring Boot Actuator for monitoring

### Frontend (React/TypeScript)
- React 19 stable with TypeScript 5
- Functional components with hooks
- TanStack Query 5 for data fetching
- TailwindCSS 4.x + shadcn/ui

### Infrastructure
- Docker 24 with Compose V2
- PostgreSQL 17 with pgvector extension
- Prometheus v2.50 + Grafana 11
- GitHub Actions for CI/CD

## 🎯 Enforcement Rules

### Mandatory Requirements
1. **No Phase Completion Without Refactoring**: Refactoring is mandatory
2. **Quality Gates Must Pass**: All quality gates must pass before sign-off
3. **Metrics Must Be Documented**: All metrics must be documented
4. **Sign-off Required**: Both developer and reviewer sign-off required
5. **Documentation Required**: All refactoring must be documented

### Failure Handling
1. **Quality Gate Failure**: Phase cannot be completed until quality gates pass
2. **Security Issues**: Critical security issues must be resolved immediately
3. **Performance Issues**: Performance issues must be resolved before completion
4. **Test Coverage Issues**: Test coverage must meet requirements
5. **Documentation Issues**: Documentation must be complete

## 📈 Success Metrics

### Project Success Indicators
- **Zero Security Vulnerabilities**: No hardcoded secrets or security issues
- **High Code Quality**: ≤5 TODO items per service, ≥85% test coverage
- **Excellent Performance**: P95 ≤200ms response time
- **Comprehensive Documentation**: All public APIs documented
- **Systematic Refactoring**: Refactoring after each phase completion

### Quality Improvement
- **60% Development Speed Improvement**: Through systematic patterns
- **95%+ Quality Scores**: Through mandatory quality gates
- **100% First-Attempt Success Rates**: Through comprehensive standards
- **Zero Technical Debt Accumulation**: Through phase-based refactoring

## 🤝 Contributing

### Adding New Standards
1. Create standards document in `.agent-os/standards/`
2. Update enforcement rules in `.agent-os/standards/enforcement.md`
3. Add validation to compliance checker
4. Update this README

### Adding New Tools
1. Create tool in `.agent-os/tools/`
2. Add usage examples to this README
3. Update phase completion checklist
4. Test with real projects

### Adding Lessons Learned
1. Create lessons document in `.agent-os/lessons-learned/`
2. Include patterns and anti-patterns
3. Add implementation guidelines
4. Update relevant standards

## 📞 Support

### Getting Help
- **Standards Questions**: Check `.agent-os/standards/` documentation
- **Tool Issues**: Check tool documentation and examples
- **Best Practices**: Review `.agent-os/lessons-learned/` for patterns
- **Quality Gates**: Use refactoring validator and compliance checker

### Reporting Issues
1. Check existing documentation and lessons learned
2. Review standards enforcement rules
3. Use validation tools to identify issues
4. Create detailed issue report with context

---

**Agent OS**: Ensuring systematic, high-quality software development through mandatory refactoring and comprehensive standards enforcement.