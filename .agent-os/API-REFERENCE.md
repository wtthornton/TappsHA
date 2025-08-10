# 🔧 Agent OS API Reference
*Complete Reference for All Tools, Commands, and Interfaces*

## 📖 Table of Contents

- [🚀 Scripts](#-scripts)
- [🛠️ Tools](#️-tools)
- [📚 Standards](#-standards)
- [🔗 Workflows](#-workflows)
- [🎯 IDE Integration](#-ide-integration)
- [📊 Analysis Tools](#-analysis-tools)
- [🔧 Utilities](#-utilities)
- [📋 Templates](#-templates)
- [🚨 Error Codes](#-error-codes)

---

## 🚀 Scripts

### Setup Script
**File**: `.agent-os/scripts/setup.js`

```bash
# Interactive setup menu
node .agent-os/scripts/setup.js

# Check system status
node .agent-os/scripts/setup.js status

# Run validation
node .agent-os/scripts/setup.js validate

# Check compliance
node .agent-os/scripts/setup.js compliance

# Reset system
node .agent-os/scripts/setup.js reset

# Reinstall dependencies
node .agent-os/scripts/setup.js reinstall

# Restore from backup
node .agent-os/scripts/setup.js restore
```

**Options:**
- `--help` - Show help information
- `--verbose` - Detailed output
- `--quiet` - Minimal output

### Quick Start Script
**File**: `.agent-os/scripts/quick-start.js`

```bash
# Complete setup in one command
node .agent-os/scripts/quick-start.js

# Check dependencies only
node .agent-os/scripts/quick-start.js --check-deps

# Initialize Cursor only
node .agent-os/scripts/quick-start.js --cursor-only

# Validate installation only
node .agent-os/scripts/quick-start.js --validate-only
```

### Enhanced Integration Script
**File**: `.agent-os/scripts/start-enhanced-integration.js`

```bash
# Start all three integration phases
node .agent-os/scripts/start-enhanced-integration.js

# Check integration status
node .agent-os/scripts/start-enhanced-integration.js status

# Stop integration
node .agent-os/scripts/start-enhanced-integration.js stop

# Restart integration
node .agent-os/scripts/start-enhanced-integration.js restart

# Get information
node .agent-os/scripts/start-enhanced-integration.js info
```

---

## 🛠️ Tools

### Main CLI
**File**: `.agent-os/tools/agent-os-cli.js`

```bash
# Access main CLI
node .agent-os/tools/agent-os-cli.js

# View all commands
node .agent-os/tools/agent-os-cli.js --help

# Run specific tool
node .agent-os/tools/agent-os-cli.js --tool="compliance-checker"

# Execute with options
node .agent-os/tools/agent-os-cli.js --tool="refactoring-validator" --phase=1
```

**Available Tools:**
- `compliance-checker` - Standards compliance validation
- `refactoring-validator` - Refactoring validation
- `feature-scoring` - Feature value assessment
- `dependency-validator` - Environment validation
- `infrastructure-recovery` - Infrastructure monitoring

### Compliance Checker
**File**: `.agent-os/tools/compliance-checker.js`

```bash
# Quick compliance check
node .agent-os/tools/compliance-checker.js

# Detailed analysis
node .agent-os/tools/compliance-checker.js --detailed

# Generate report
node .agent-os/tools/compliance-checker.js --report

# Check specific area
node .agent-os/tools/compliance-checker.js --area="security"

# Fix violations automatically
node .agent-os/tools/compliance-checker.js --fix

# Export results
node .agent-os/tools/compliance-checker.js --export
```

**Areas:**
- `security` - Security standards and OWASP compliance
- `quality` - Code quality metrics and patterns
- `performance` - Performance benchmarks and optimization
- `testing` - Test coverage and quality
- `architecture` - Architectural patterns and standards

**Output Formats:**
- `--format=json` - JSON output
- `--format=csv` - CSV output
- `--format=html` - HTML report
- `--format=markdown` - Markdown report

### Refactoring Validator
**File**: `.agent-os/tools/refactoring-validator.js`

```bash
# Validate refactoring for Phase 1
node .agent-os/tools/refactoring-validator.js --phase=1 --validate

# Check refactoring impact
node .agent-os/tools/refactoring-validator.js --impact-analysis

# Generate refactoring plan
node .agent-os/tools/refactoring-validator.js --plan

# Validate specific changes
node .agent-os/tools/refactoring-validator.js --changes="file1.js,file2.js"

# Check architecture compliance
node .agent-os/tools/refactoring-validator.js --architecture
```

**Phases:**
- `1` - Foundation (Security, Error Handling)
- `2` - Integration (API, Services)
- `3` - Advanced Features (Performance, Quality)

**Validation Types:**
- `--validate` - Full validation
- `--quick` - Quick validation
- `--detailed` - Detailed analysis
- `--impact` - Impact analysis only

### Feature Scoring Framework
**File**: `.agent-os/tools/feature-scoring.js`

```bash
# Score a new feature
node .agent-os/tools/feature-scoring.js --feature="user-authentication"

# View feature recommendations
node .agent-os/tools/feature-scoring.js --recommendations

# Analyze feature complexity
node .agent-os/tools/feature-scoring.js --complexity-analysis

# Generate feature report
node .agent-os/tools/feature-scoring.js --report

# Export scoring data
node .agent-os/tools/feature-scoring.js --export
```

**Scoring Criteria:**
- `--business-value` - Business value (1-10)
- `--technical-complexity` - Technical complexity (1-10)
- `--user-impact` - User impact (1-10)
- `--maintenance-cost` - Maintenance cost (1-10)

---

## 📚 Standards

### Technology Stack
**File**: `.agent-os/standards/tech-stack.md`

```bash
# View technology stack
cat .agent-os/standards/tech-stack.md

# Check stack compliance
node .agent-os/tools/compliance-checker.js --area="tech-stack"
```

**Supported Stacks:**
- **Frontend**: React, Vue, Angular, Svelte
- **Backend**: Node.js, Java/Spring, Python/Django, Go
- **Database**: PostgreSQL, MySQL, MongoDB, Redis
- **Cloud**: AWS, Azure, GCP, DigitalOcean

### Code Style
**File**: `.agent-os/standards/code-style.md`

```bash
# View code style standards
cat .agent-os/standards/code-style.md

# Validate code style
node .agent-os/tools/compliance-checker.js --area="code-style"
```

**Style Categories:**
- **Naming Conventions** - Consistent naming patterns
- **Formatting** - Code formatting and structure
- **Documentation** - Code documentation standards
- **Error Handling** - Error handling patterns

### Security & Compliance
**File**: `.agent-os/standards/security-compliance.md`

```bash
# View security standards
cat .agent-os/standards/security-compliance.md

# Check security compliance
node .agent-os/tools/compliance-checker.js --area="security"
```

**Security Areas:**
- **Input Validation** - Data validation patterns
- **Authentication** - Authentication mechanisms
- **Authorization** - Access control patterns
- **Data Protection** - Encryption and data security
- **OWASP Compliance** - OWASP Top 10 compliance

---

## 🔗 Workflows

### Template Trigger Automation
**File**: `.agent-os/workflows/template-trigger-automation.js`

```bash
# Check for template triggers
node .agent-os/workflows/template-trigger-automation.js --check

# Generate context-specific checklist
node .agent-os/workflows/template-trigger-automation.js --checklist

# Apply automation rules
node .agent-os/workflows/template-trigger-automation.js --apply

# View available templates
node .agent-os/workflows/template-trigger-automation.js --list

# Generate phase-specific checklist
node .agent-os/workflows/template-trigger-automation.js --phase=1
```

**Template Types:**
- `phase-specific` - Phase-based templates
- `technology-specific` - Technology-specific templates
- `compliance-specific` - Compliance-focused templates
- `context-specific` - Context-aware templates

---

## 🎯 IDE Integration

### Cursor Integration
**File**: `.agent-os/tools/cursor/cursor-integrate.js`

```bash
# One-click Cursor integration
node .agent-os/tools/cursor/cursor-integrate.js

# Check integration status
node .agent-os/tools/cursor/cursor-integrate.js status

# Disconnect integration
node .agent-os/tools/cursor/cursor-integrate.js disconnect

# Update integration
node .agent-os/tools/cursor/cursor-integrate.js update
```

**Integration Features:**
- **Cursor Rules Generation** - Automatic .cursorrules creation
- **Real-time Monitoring** - File change monitoring
- **Standards Enforcement** - Real-time validation
- **Template Suggestions** - Context-aware templates

### Real-time Cursor Enhancement
**File**: `.agent-os/ide/real-time-cursor-enhancement.js`

```bash
# Start real-time monitoring
node .agent-os/ide/real-time-cursor-enhancement.js start

# Stop monitoring
node .agent-os/ide/real-time-cursor-enhancement.js stop

# Check monitoring status
node .agent-os/ide/real-time-cursor-enhancement.js status

# Configure monitoring
node .agent-os/ide/real-time-cursor-enhancement.js config
```

**Monitoring Features:**
- **File Watching** - Real-time file change detection
- **Validation** - Automatic validation on changes
- **Notifications** - Real-time feedback
- **Compliance Tracking** - Continuous compliance monitoring

---

## 📊 Analysis Tools

### Statistical Analysis
**File**: `.agent-os/tools/analysis/statistical-analysis.js`

```bash
# View development metrics
node .agent-os/tools/analysis/statistical-analysis.js

# Generate performance report
node .agent-os/tools/analysis/statistical-analysis.js --performance

# Export data for external analysis
node .agent-os/tools/analysis/statistical-analysis.js --export

# Analyze specific metrics
node .agent-os/tools/analysis/statistical-analysis.js --metrics="quality,performance"
```

**Available Metrics:**
- `quality` - Code quality metrics
- `performance` - Performance metrics
- `security` - Security metrics
- `testing` - Testing metrics
- `architecture` - Architecture metrics

### Documentation Analyzer
**File**: `.agent-os/tools/analysis/documentation-analyzer.js`

```bash
# Analyze documentation
node .agent-os/tools/analysis/documentation-analyzer.js

# Check documentation coverage
node .agent-os/tools/analysis/documentation-analyzer.js --coverage

# Generate documentation report
node .agent-os/tools/analysis/documentation-analyzer.js --report

# Validate documentation standards
node .agent-os/tools/analysis/documentation-analyzer.js --validate
```

---

## 🔧 Utilities

### Cross-Platform Shell
**File**: `.agent-os/utils/cross-platform-shell.js`

```javascript
const { CrossPlatformShell } = require('./.agent-os/utils/cross-platform-shell');

const shell = new CrossPlatformShell();

// Execute command safely
await shell.executeCommand('npm install && npm test');

// Execute with options
await shell.executeCommand('git status', { 
    cwd: './src',
    timeout: 30000 
});

// Check if command exists
const exists = await shell.commandExists('node');
```

**Methods:**
- `executeCommand(command, options)` - Execute shell command
- `commandExists(command)` - Check if command exists
- `getPlatform()` - Get current platform
- `isWindows()` - Check if running on Windows

### Dependency Validator
**File**: `.agent-os/utils/dependency-validator.js`

```javascript
const { DependencyValidator } = require('./.agent-os/utils/dependency-validator');

const validator = new DependencyValidator();

// Validate environment
await validator.validateEnvironment();

// Check specific dependency
await validator.checkDependency('node', '16.0.0');

// Validate all dependencies
await validator.validateAllDependencies();
```

**Validation Areas:**
- **Node.js Version** - Version compatibility
- **Package Dependencies** - NPM package validation
- **System Requirements** - OS and system validation
- **Environment Variables** - Required environment setup

### Infrastructure Recovery
**File**: `.agent-os/utils/infrastructure-recovery.js`

```javascript
const { InfrastructureRecovery } = require('./.agent-os/utils/infrastructure-recovery');

const recovery = new InfrastructureRecovery();

// Check infrastructure health
await recovery.checkHealth();

// Monitor specific service
await recovery.monitorService('database');

// Get health metrics
const metrics = await recovery.getHealthMetrics();
```

**Monitoring Areas:**
- **Database Health** - Database connection and performance
- **Service Health** - Service availability and performance
- **Resource Usage** - CPU, memory, disk usage
- **Network Health** - Network connectivity and latency

---

## 📋 Templates

### Refactoring Checklist
**File**: `.agent-os/templates/refactoring-checklist.md`

```bash
# View refactoring checklist
cat .agent-os/templates/refactoring-checklist.md

# Generate phase-specific checklist
node .agent-os/workflows/template-trigger-automation.js --template="refactoring" --phase=1
```

### Code Review Template
**File**: `.agent-os/templates/code-review-template.md`

```bash
# View code review template
cat .agent-os/templates/code-review-template.md

# Generate review checklist
node .agent-os/workflows/template-trigger-automation.js --template="code-review"
```

### Testing Template
**File**: `.agent-os/templates/testing-template.md`

```bash
# View testing template
cat .agent-os/templates/testing-template.md

# Generate test checklist
node .agent-os/workflows/template-trigger-automation.js --template="testing"
```

---

## 🚨 Error Codes

### Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| `E001` | Command not found | Check if you're in project root |
| `E002` | Permission denied | Fix file permissions |
| `E003` | Node.js version incompatible | Update to Node.js 16+ |
| `E004` | .agent-os directory missing | Run setup script |
| `E005` | Compliance score too low | Address violations |
| `E006` | Integration failed | Check integration status |

### Error Resolution

```bash
# Get detailed error information
node .agent-os/scripts/setup.js status --verbose

# Check error logs
cat .agent-os/logs/error.log

# Reset system on critical errors
node .agent-os/scripts/setup.js reset

# Get help for specific error
node .agent-os/scripts/setup.js --help
```

---

## 📊 Output Formats

### JSON Output
```bash
# Most tools support JSON output
node .agent-os/tools/compliance-checker.js --format=json

# Example output structure
{
  "status": "success",
  "score": 87,
  "violations": [],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### CSV Output
```bash
# Export data for external analysis
node .agent-os/tools/compliance-checker.js --format=csv --export

# Example output
Metric,Value,Target,Status
Security Score,95,90,✅
Code Quality,88,85,✅
Performance,92,90,✅
```

### HTML Report
```bash
# Generate HTML report
node .agent-os/tools/compliance-checker.js --format=html --report

# Report includes charts and detailed analysis
```

---

## 🔌 Plugin Development

### Creating Custom Tools

```javascript
// Create custom tool
class CustomTool {
    constructor() {
        this.name = 'Custom Tool';
        this.version = '1.0.0';
    }

    async execute(options = {}) {
        // Tool implementation
        return { success: true, data: 'Custom tool executed' };
    }

    async validate() {
        // Validation logic
        return { valid: true };
    }
}

// Export tool
module.exports = CustomTool;
```

### Tool Registration

```javascript
// Tools are automatically discovered
// Place in .agent-os/tools/ directory
// Follow naming convention: tool-name.js
```

---

## 📈 Performance Tuning

### Optimization Options

```bash
# Quick validation (faster)
node .agent-os/tools/compliance-checker.js --quick

# Parallel processing
node .agent-os/tools/compliance-checker.js --parallel

# Cache results
node .agent-os/tools/compliance-checker.js --cache

# Limit analysis scope
node .agent-os/tools/compliance-checker.js --scope="src/"
```

### Resource Management

```bash
# Monitor resource usage
node .agent-os/tools/analysis/statistical-analysis.js --resources

# Set memory limits
NODE_OPTIONS="--max-old-space-size=4096" node .agent-os/tools/compliance-checker.js

# Enable garbage collection monitoring
node --trace-gc .agent-os/tools/compliance-checker.js
```

---

*Last Updated: ${new Date().toISOString()}*
*Agent OS Version: 4.0*
*For user-friendly guides, see: `.agent-os/USER-GUIDE.md` and `.agent-os/QUICK-START-GUIDE.md`*
