# Agent OS Tools

Consolidated developer tools for the Agent OS Development Framework.

## 🚀 Quick Start

### Installation
```bash
# Install dependencies
npm install

# Check Agent OS status
npm run status
```

### Basic Usage
```bash
# Run full compliance check
npm run check

# Start real-time validation
npm run watch

# Validate specific standards
npm run validate

# Manage lessons learned
npm run lessons
```

## 🛠️ Available Tools

### 1. Agent OS CLI (`agent-os-cli.js`)
Main entry point for all Agent OS operations.

```bash
# Show help
node agent-os-cli.js help

# Check compliance
node agent-os-cli.js check

# Start real-time monitoring
node agent-os-cli.js watch

# Validate standards
node agent-os-cli.js validate

# Manage lessons learned
node agent-os-cli.js lessons

# Check status
node agent-os-cli.js status
```

### 2. Compliance Checker (`compliance-checker.js`)
Comprehensive validation against Agent OS standards.

**Features:**
- Technology stack validation (Spring Boot 3.3+, React 19, PostgreSQL 17)
- Code style validation (TypeScript 5, 2 spaces, 100 chars max)
- Security compliance (OAuth 2.1, input validation, no hardcoded secrets)
- Architecture validation (Controller → Service → Repository pattern)
- Testing validation (≥85% branch coverage)

### 3. Standards Validator (`standards-validator.js`)
Validates project against specific Agent OS standards.

```bash
# Validate all standards
node standards-validator.js

# Validate specific standard
node standards-validator.js --standard security
node standards-validator.js --standard code-style
node standards-validator.js --standard testing
```

### 4. Lessons Tracker (`lessons-tracker.js`)
Manages lessons learned and insights.

```bash
# Capture new lesson
node lessons-tracker.js --capture

# List all lessons
node lessons-tracker.js --list

# Apply lessons to current project
node lessons-tracker.js --apply
```

### 5. Cursor Integration (`cursor-integration.js`)
Real-time validation and Cursor AI integration.

```bash
# Start real-time monitoring
node cursor-integration.js watch

# Generate compliance report
node cursor-integration.js check
```

## 📊 Compliance Standards

### Technology Stack
- **Backend:** Spring Boot 3.3+ (Java 21 LTS)
- **Frontend:** React 19 with TypeScript 5
- **Database:** PostgreSQL 17 with pgvector extension
- **Runtime:** Docker 24, Compose V2
- **Observability:** Prometheus v2.50, Grafana 11

### Code Style
- **TypeScript 5** for all runtime code
- **2 spaces** indentation (no tabs)
- **100 characters** max line length
- **PascalCase** for components, **camelCase** for variables/functions
- **Functional components** with hooks (React)

### Security
- **No hardcoded secrets** - use environment variables
- **Input validation** for all user inputs
- **SQL injection prevention** with @Param annotations
- **HTTPS/TLS 1.3** for all communications
- **OWASP Top-10** compliance

### Architecture
- **Controller → Service → Repository** pattern
- **Proper Spring annotations** (@RestController, @Service, @Repository)
- **Exception handling** with @ControllerAdvice
- **Spring Security** with OAuth 2.1
- **Observability** with Spring Boot Actuator

### Testing
- **≥85% branch coverage** requirement
- **Unit tests** for all new functionality
- **Integration tests** for critical paths
- **Security testing** for new features
- **Performance testing** for scalability

## 🎯 Compliance Thresholds

### Critical Violations (Blocking)
- Security vulnerabilities = 0
- Hardcoded secrets = 0
- Missing critical dependencies = 0
- Architecture violations = 0

### Recommended Thresholds
- Overall compliance score ≥ 85%
- Security compliance score = 100%
- Testing coverage ≥ 85%
- Code quality score ≥ 80%

## 📈 Usage Examples

### Daily Development Workflow
```bash
# 1. Start with compliance check
npm run check

# 2. Start real-time monitoring
npm run watch

# 3. During development, validate specific standards
npm run validate --standard security

# 4. Capture lessons learned
npm run lessons --capture

# 5. Apply lessons to current project
npm run lessons --apply
```

### CI/CD Integration
```bash
# Pre-commit hook
node agent-os-cli.js check

# CI pipeline
npm run check && npm run validate

# Generate compliance report
node agent-os-cli.js check --report
```

### Project Setup
```bash
# Check current status
npm run status

# Validate all standards
npm run validate --all

# List available lessons
npm run lessons --list
```

## 🔧 Configuration

### Environment Variables
```bash
# Compliance thresholds
COMPLIANCE_THRESHOLD=85
CRITICAL_VIOLATIONS_MAX=0
WARNING_VIOLATIONS_MAX=10

# Dashboard settings
DASHBOARD_UPDATE_INTERVAL=30000
REPORT_RETENTION_DAYS=30

# CI/CD integration
CI_MODE=true
BLOCK_ON_CRITICAL=true
```

### Custom Standards
Add custom validation rules by extending the standards validator:

```javascript
// Add custom validation
class CustomStandardsValidator extends StandardsValidator {
  validateCustomRule(filePath, content) {
    // Your custom validation logic
    return violations;
  }
}
```

## 📁 Directory Structure

```
.agent-os/tools/
├── agent-os-cli.js          # Main CLI entry point
├── compliance-checker.js     # Unified compliance checking
├── cursor-integration.js     # Cursor AI integration
├── standards-validator.js    # Standards validation
├── lessons-tracker.js        # Lessons learned tracking
├── package.json             # Dependencies
└── README.md               # This file

.agent-os/internal/tools/    # Internal framework tools
├── cursor-init-backup.js
├── lesson-impact-tracker.js
├── lesson-quality-validator.js
├── lesson-template-generator.js
├── lesson-categorizer.js
├── cursor-rule-optimizer.js
├── cursor-analytics.js
├── hybrid-md-processor.js
├── md-executor.js
├── documentation-analyzer.js
├── statistical-analysis.js
├── update-cursor-init.js
└── production-deployment.js
```

## 🚨 Troubleshooting

### Common Issues

**Tool not found:**
```bash
# Install dependencies
npm install

# Check Node.js version (requires >=18.0.0)
node --version
```

**No violations detected:**
```bash
# Check if files are being scanned
node agent-os-cli.js check --verbose

# Verify file patterns
find . -name "*.java" -o -name "*.ts" -o -name "*.tsx"
```

**Standards not loading:**
```bash
# Check standards directory
ls -la .agent-os/standards/

# Verify standards files
cat .agent-os/standards/tech-stack.md
```

### Debug Mode
```bash
# Enable verbose logging
DEBUG=compliance node agent-os-cli.js check

# Check specific validation
node agent-os-cli.js validate --standard security --verbose
```

## 📚 References

### Standards Documentation
- **Technology Stack:** `@~/.agent-os/standards/tech-stack.md`
- **Code Style:** `@~/.agent-os/standards/code-style.md`
- **Best Practices:** `@~/.agent-os/standards/best-practices.md`
- **Security Compliance:** `@~/.agent-os/standards/security-compliance.md`
- **Testing Strategy:** `@~/.agent-os/standards/testing-strategy.md`
- **Enforcement:** `@~/.agent-os/standards/enforcement.md`

### Related Documentation
- **Agent OS Fundamentals:** `@~/.agent-os/AGENT-OS-FUNDAMENTALS.md`
- **Quick Start Guide:** `@~/.agent-os/QUICK-START-GUIDE.md`
- **Compliance Checklist:** `@~/.agent-os/checklists/compliance-checklist.md`

## 🤝 Contributing

### Adding New Validations
1. Extend the `StandardsValidator` class
2. Add validation method for your rule
3. Update the main validation flow
4. Add tests for your validation
5. Update documentation

### Reporting Issues
- **GitHub Issues:** Report bugs and feature requests
- **Discussions:** Share ideas and improvements
- **Pull Requests:** Submit code improvements

## 📄 License

MIT License - see LICENSE file for details.

---

**Agent OS Tools** - Ensuring standards compliance through automation and real-time feedback. 