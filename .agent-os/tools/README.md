# Agent OS Compliance Tools

Automated compliance checking tools for Agent OS standards with real-time validation and feedback.

## 🚀 Quick Start

### Installation
```bash
# Install dependencies
npm install

# Install global tools
npm run install:tools
```

### Basic Usage
```bash
# Check entire codebase
npm run check

# Check specific file
npm run check:file path/to/file.java

# Start real-time validation
npm run watch

# Generate compliance report
npm run validate

# Open compliance dashboard
npm run report
```

## 📊 Features

### Automated Compliance Checking
- **Technology Stack Validation** - Verify Spring Boot 3.3+, React 19, PostgreSQL 17, etc.
- **Code Style Validation** - Check indentation, line length, naming conventions
- **Security Validation** - Detect hardcoded secrets, SQL injection vulnerabilities
- **Architecture Validation** - Verify Controller → Service → Repository pattern
- **Testing Validation** - Ensure ≥85% branch coverage

### Real-Time Feedback
- **Immediate validation** on file changes
- **Auto-fix suggestions** for common violations
- **Compliance scoring** (0-100%)
- **Violation categorization** (Critical/Warning)
- **Trend analysis** over time

### CI/CD Integration
- **Automated compliance checks** on every PR
- **Block merges** on critical violations
- **Generate compliance reports** in PR comments
- **Track compliance metrics** over time

## 🛠️ Tools

### Compliance Checker (`compliance-checker.js`)
Comprehensive validation against all Agent OS standards.

```bash
# Check entire codebase
node compliance-checker.js

# Check specific file
node compliance-checker.js path/to/file.java

# Generate detailed report
node compliance-checker.js --report
```

**Features:**
- Validates against all .agent-os standards
- Generates compliance scores
- Categorizes violations (Critical/Warning)
- Provides detailed violation reports
- Exits with error code for CI/CD integration

### Cursor Integration (`cursor-integration.js`)
Real-time validation and feedback during development.

```bash
# Real-time file watching
node cursor-integration.js watch

# Check specific file
node cursor-integration.js check path/to/file.ts

# Generate comprehensive report
node cursor-integration.js check
```

**Features:**
- Real-time validation on file changes
- Auto-fix suggestions for violations
- Compliance dashboard updates
- Improvement suggestions
- HTML dashboard generation

## 📋 Compliance Standards

### Technology Stack
- **Spring Boot 3.3+** (Java 21 LTS)
- **React 19** with TypeScript 5
- **PostgreSQL 17** with pgvector extension
- **Docker 24** with Compose V2
- **Prometheus v2.50 + Grafana 11**

### Code Style
- **2 spaces indentation** (no tabs)
- **100 characters max** line length
- **PascalCase** for components/classes
- **camelCase** for variables/functions
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

### Warning Thresholds
- Code style violations < 10 per file
- Performance warnings < 5 per module
- Documentation gaps < 3 per feature
- Test coverage gaps < 15%

## 📈 Compliance Dashboard

### Real-Time Metrics
- **Overall compliance score** (0-100%)
- **Category-specific scores** (Technology Stack, Code Style, Security, etc.)
- **Violation count** by severity (Critical/Warning)
- **Trend analysis** showing improvement over time

### Dashboard Features
- **Interactive HTML dashboard** with real-time updates
- **Violation tracking** with file and line numbers
- **Improvement suggestions** for each violation
- **Historical compliance data** for trend analysis
- **Export capabilities** for reporting

### Access Dashboard
```bash
# Generate and open dashboard
npm run report

# Manual dashboard access
open .agent-os/dashboard/compliance-dashboard.html
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
Add custom validation rules by extending the compliance checker:

```javascript
// Add custom validation
class CustomComplianceChecker extends ComplianceChecker {
  validateCustomRule(filePath, content) {
    // Your custom validation logic
    return violations;
  }
}
```

## 🚀 CI/CD Integration

### GitHub Actions
The compliance tools integrate with the CI/CD pipeline via `.github/workflows/standards-compliance.yml`:

- **Automated compliance checks** on every PR
- **Block merges** on critical violations
- **Generate compliance reports** in PR comments
- **Track compliance metrics** over time

### Pre-commit Hooks
```bash
# Add to .git/hooks/pre-commit
#!/bin/sh
node .agent-os/tools/compliance-checker.js
if [ $? -ne 0 ]; then
  echo "❌ Critical compliance violations found. Commit blocked."
  exit 1
fi
```

## 📊 Reporting

### Compliance Reports
- **JSON reports** for programmatic access
- **HTML dashboards** for visual analysis
- **PR comments** with compliance summaries
- **Trend analysis** for continuous improvement

### Report Locations
- **Compliance reports:** `.agent-os/reports/compliance-report.json`
- **Dashboard:** `.agent-os/dashboard/compliance-dashboard.html`
- **CI/CD artifacts:** Available in GitHub Actions

## 🔍 Troubleshooting

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
node compliance-checker.js --verbose

# Verify file patterns
ls **/*.java **/*.ts **/*.tsx
```

**CI/CD failures:**
```bash
# Check compliance report generation
node cursor-integration.js check

# Verify critical violations
node -e "
const report = JSON.parse(require('fs').readFileSync('.agent-os/reports/compliance-report.json', 'utf8'));
console.log('Critical violations:', report.violations.filter(v => v.type === 'CRITICAL').length);
"
```

### Debug Mode
```bash
# Enable verbose logging
DEBUG=compliance node compliance-checker.js

# Check specific validation
node compliance-checker.js --validate-security path/to/file.java
```

## 📚 References

### Standards Documentation
- **Technology Stack:** `@~/.agent-os/standards/tech-stack.md`
- **Code Style:** `@~/.agent-os/standards/code-style.md`
- **Best Practices:** `@~/.agent-os/standards/best-practices.md`
- **Security Compliance:** `@~/.agent-os/standards/security-compliance.md`
- **Testing Strategy:** `@~/.agent-os/standards/testing-strategy.md`
- **Enforcement:** `@~/.agent-os/standards/enforcement.md`

### Related Tools
- **Compliance Checklist:** `@~/.agent-os/checklists/compliance-checklist.md`
- **Cursor Rules:** `.cursor/rules/automated-compliance.mdc`
- **CI/CD Workflow:** `.github/workflows/standards-compliance.yml`

## 🤝 Contributing

### Adding New Validations
1. Extend the `ComplianceChecker` class
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

**Agent OS Compliance Tools** - Ensuring standards compliance through automation and real-time feedback. 