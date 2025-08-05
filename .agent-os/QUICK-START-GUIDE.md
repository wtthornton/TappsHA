# Agent OS Quick Start Guide

## 🚀 First Steps for New Agents

### 1. Read the Fundamentals
**START HERE:** Read `@~/.agent-os/AGENT-OS-FUNDAMENTALS.md` completely before doing anything else.

### 2. Run Your First Compliance Check
```bash
# Navigate to project root
cd /path/to/your/project

# Run full compliance check
node .agent-os/tools/full-compliance-check.js

# Review the results
cat .agent-os/reports/full-compliance-summary.json
```

### 3. Understand the Standards
**MANDATORY:** Review these standards before any development:
- `@~/.agent-os/standards/tech-stack.md` - Technology choices
- `@~/.agent-os/standards/code-style.md` - Coding conventions
- `@~/.agent-os/standards/best-practices.md` - Development principles
- `@~/.agent-os/standards/security-compliance.md` - Security requirements
- `@~/.agent-os/standards/testing-strategy.md` - Testing approach
- `@~/.agent-os/standards/enforcement.md` - Mandatory rules

## 🔧 Daily Workflow

### Before Starting Work
```bash
# 1. Check compliance status
node .agent-os/tools/full-compliance-check.js

# 2. Load relevant context
# - Check tasks.md for current tasks
# - Review relevant specs
# - Understand current standards

# 3. Verify standards compliance
# - Ensure technology stack matches
# - Check code style requirements
# - Validate security standards
```

### During Development
```bash
# 1. Follow structured process
# - Load context (spec, tasks, standards)
# - Execute tasks systematically
# - Update tasks.md immediately after each subtask

# 2. Run tests frequently
# - Unit tests for new functionality
# - Integration tests for critical paths
# - Ensure ≥85% branch coverage

# 3. Validate compliance
# - Run compliance check after changes
# - Fix any violations immediately
# - Document lessons learned
```

### After Completing Work
```bash
# 1. Final compliance check
node .agent-os/tools/full-compliance-check.js

# 2. Update progress
# - Mark completed tasks in tasks.md
# - Add progress notes
# - Update completion percentages

# 3. Capture lessons learned
# - Document insights and improvements
# - Update standards if needed
# - Share knowledge with team
```

## 📋 Essential Commands

### Compliance Checking
```bash
# Full compliance check
node .agent-os/tools/full-compliance-check.js

# Real-time validation
node .agent-os/tools/cursor-integration.js watch

# Generate detailed report
node .agent-os/tools/compliance-checker.js --report

# Check specific file
node .agent-os/tools/compliance-checker.js path/to/file.java
```

### Task Management
```bash
# Find current tasks
find .agent-os -name "tasks.md" -exec grep -l "\[ \]" {} \;

# Update task progress
# Edit tasks.md and mark completed items with [x]

# Check overall progress
grep -r "Overall Progress" .agent-os/specs/*/tasks.md
```

### Standards Validation
```bash
# Check technology stack compliance
grep -r "Spring Boot\|React\|PostgreSQL" backend/ frontend/

# Verify code style
grep -r "import.*\*" backend/src/  # Check for wildcard imports

# Check security compliance
grep -r "password\|secret\|token" backend/src/  # Look for hardcoded secrets
```

## 🎯 Key Principles

### 1. Standards First
- **ALWAYS** check standards before making decisions
- **NEVER** deviate from standards without justification
- **ALWAYS** validate against compliance requirements

### 2. Automation Always
- **ALWAYS** use automated compliance checking
- **ALWAYS** run tests before committing
- **ALWAYS** validate with automated tools

### 3. Continuous Improvement
- **ALWAYS** capture lessons learned
- **ALWAYS** update standards based on insights
- **ALWAYS** share knowledge with team

### 4. Quality Gates
- **NEVER** commit code with critical violations
- **ALWAYS** ensure ≥85% test coverage
- **ALWAYS** validate security compliance

## 🚨 Emergency Procedures

### Critical Violations Detected
```bash
# 1. Stop development immediately
# 2. Assess the violation
node .agent-os/tools/compliance-checker.js --verbose

# 3. Fix the violation
# 4. Revalidate
node .agent-os/tools/full-compliance-check.js

# 5. Document the issue and resolution
```

### Standards Conflict
```bash
# 1. Check standards hierarchy
cat .agent-os/standards/enforcement.md

# 2. Consult documentation
# 3. Apply common sense for safety/security
# 4. Document decision and rationale
```

## 📊 Understanding Compliance Reports

### Compliance Score Interpretation
- **85-100%:** Excellent compliance
- **70-84%:** Good compliance, minor issues
- **50-69%:** Fair compliance, needs attention
- **<50%:** Poor compliance, requires immediate action

### Violation Types
- **CRITICAL:** Must fix immediately (blocking)
- **WARNING:** Should fix soon (non-blocking)
- **INFO:** Informational only

### Common Violations
1. **Code Style:** Line length, indentation, naming
2. **Security:** Hardcoded secrets, vulnerabilities
3. **Architecture:** Pattern violations, structure issues
4. **Testing:** Coverage gaps, missing tests
5. **Performance:** Inefficient code, resource issues

## 🔍 Troubleshooting

### Compliance Checker Not Working
```bash
# Check Node.js version (requires >=18.0.0)
node --version

# Install dependencies
cd .agent-os/tools && npm install

# Check for errors
node .agent-os/tools/full-compliance-check.js --verbose
```

### No Violations Detected
```bash
# Verify files are being scanned
node .agent-os/tools/compliance-checker.js --list-files

# Check file patterns
find . -name "*.java" -o -name "*.ts" -o -name "*.tsx"
```

### Standards Not Loading
```bash
# Check standards directory
ls -la .agent-os/standards/

# Verify standards files
cat .agent-os/standards/tech-stack.md
cat .agent-os/standards/code-style.md
```

## 📚 Next Steps

### 1. Deep Dive
- Read `@~/.agent-os/AGENT-OS-FUNDAMENTALS.md` completely
- Study all standards in `.agent-os/standards/`
- Understand the development workflow

### 2. Practice
- Start with simple tasks
- Apply standards consistently
- Use compliance checking regularly

### 3. Contribute
- Share insights and improvements
- Update standards based on lessons learned
- Help improve the framework

### 4. Stay Updated
- Monitor compliance trends
- Learn from lessons captured
- Keep up with standards evolution

## 🎯 Success Metrics

### Individual Success
- **Compliance Score:** ≥85%
- **Test Coverage:** ≥85%
- **Security Violations:** 0
- **Critical Violations:** 0

### Team Success
- **Consistent Standards:** All team members follow same standards
- **Automated Compliance:** Real-time validation working
- **Continuous Improvement:** Lessons learned being captured and applied
- **Quality Gates:** No code committed with violations

---

**Agent OS Quick Start Guide** - Get started with Agent OS in minutes, not hours. 