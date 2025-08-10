# 🚀 Agent OS User Guide
*Complete Guide to Standards, Tools, and Automation*

## 📖 Table of Contents

- [🎯 What is Agent OS?](#-what-is-agent-os)
- [⚡ Quick Start](#-quick-start)
- [🏗️ Core Features](#️-core-features)
- [🛠️ Tools & Automation](#️-tools--automation)
- [📚 Standards & Compliance](#-standards--compliance)
- [🔧 Daily Development Workflow](#-daily-development-workflow)
- [🚨 Troubleshooting](#-troubleshooting)
- [📋 Reference Cards](#-reference-cards)
- [🔗 Advanced Topics](#-advanced-topics)

---

## 🎯 What is Agent OS?

Agent OS is a comprehensive development framework that enforces code quality, security, and maintainability through automated standards, real-time validation, and intelligent guidance. It's designed to work seamlessly with Cursor.ai and other modern development tools.

### 🌟 Key Benefits

- **60%+ Development Speed Improvement** - Automated standards enforcement
- **95%+ Quality Scores** - Comprehensive validation and testing
- **100% First-Attempt Success** - Proven patterns and lessons learned
- **Zero Technical Debt** - Mandatory refactoring after each phase

### 🎯 Core Principles

1. **Mandatory Refactoring** - After each development phase
2. **Quality Gates** - Security, code quality, and performance standards
3. **Real-Time Validation** - Immediate feedback during development
4. **Lessons Learned Integration** - Continuous improvement from experience

---

## ⚡ Quick Start

### 🚀 First-Time Setup

```bash
# Navigate to your project root
cd your-project

# Run the interactive setup
node .agent-os/scripts/setup.js

# Or use quick start for immediate setup
node .agent-os/scripts/quick-start.js
```

### 🎯 Essential Commands

```bash
# Check system status
node .agent-os/scripts/setup.js status

# Run compliance check
node .agent-os/scripts/setup.js compliance

# Validate current state
node .agent-os/scripts/setup.js validate
```

### 🔗 Cursor.ai Integration

```bash
# One-click Cursor integration
node .agent-os/tools/cursor/cursor-integrate.js

# Start enhanced integration (all phases)
node .agent-os/scripts/start-enhanced-integration.js
```

---

## 🏗️ Core Features

### 📊 Feature Scoring Framework
Automatically evaluates feature value and complexity to guide development decisions.

```bash
# Score a new feature
node .agent-os/tools/feature-scoring.js --feature="user-authentication"

# View feature recommendations
node .agent-os/tools/feature-scoring.js --recommendations
```

**Scoring Criteria:**
- **Business Value** (1-10)
- **Technical Complexity** (1-10)
- **User Impact** (1-10)
- **Maintenance Cost** (1-10)

### 🔍 Compliance Checker
Real-time validation of code against established standards.

```bash
# Quick compliance check
node .agent-os/tools/compliance-checker.js

# Detailed analysis
node .agent-os/tools/compliance-checker.js --detailed

# Generate compliance report
node .agent-os/tools/compliance-checker.js --report
```

**Compliance Areas:**
- Security standards (OWASP compliance)
- Code quality metrics
- Performance benchmarks
- Testing coverage
- Architecture patterns

### 🔄 Refactoring Validator
Ensures refactoring efforts meet quality standards and maintain system integrity.

```bash
# Validate refactoring for Phase 1
node .agent-os/tools/refactoring-validator.js --phase=1 --validate

# Check refactoring impact
node .agent-os/tools/refactoring-validator.js --impact-analysis

# Generate refactoring plan
node .agent-os/tools/refactoring-validator.js --plan
```

### 📚 Lessons Learned Management
Captures and applies development insights for continuous improvement.

```bash
# Add a new lesson
node .agent-os/tools/lessons/lesson-categorizer.js --add

# Search lessons by category
node .agent-os/tools/lessons/lesson-categorizer.js --search="database"

# Generate lesson report
node .agent-os/tools/lessons/lesson-impact-tracker.js --report
```

---

## 🛠️ Tools & Automation

### 🎯 Main CLI Interface

```bash
# Access main CLI
node .agent-os/tools/agent-os-cli.js

# View all available commands
node .agent-os/tools/agent-os-cli.js --help

# Run specific tool
node .agent-os/tools/agent-os-cli.js --tool="compliance-checker"
```

### 🔧 Development Utilities

#### Cross-Platform Shell
```javascript
const { CrossPlatformShell } = require('./.agent-os/utils/cross-platform-shell');
const shell = new CrossPlatformShell();

// Execute commands safely across platforms
await shell.executeCommand('npm install && npm test');
```

#### Dependency Validator
```javascript
const { DependencyValidator } = require('./.agent-os/utils/dependency-validator');
const validator = new DependencyValidator();

// Validate environment before development
await validator.validateEnvironment();
```

#### Infrastructure Recovery
```javascript
const { InfrastructureRecovery } = require('./.agent-os/utils/infrastructure-recovery');
const recovery = new InfrastructureRecovery();

// Monitor infrastructure health
await recovery.checkHealth();
```

### 🤖 Template Automation

```bash
# Check for template triggers
node .agent-os/workflows/template-trigger-automation.js --check

# Generate context-specific checklist
node .agent-os/workflows/template-trigger-automation.js --checklist

# Apply automation rules
node .agent-os/workflows/template-trigger-automation.js --apply
```

---

## 📚 Standards & Compliance

### 🏛️ Architecture Standards

#### Controller → Service → Repository Pattern
```java
@RestController
public class UserController {
    private final UserService userService;
    
    public UserController(UserService userService) {
        this.userService = userService;
    }
    
    @PostMapping("/users")
    public ResponseEntity<User> createUser(@Valid @RequestBody UserRequest request) {
        return ResponseEntity.ok(userService.createUser(request));
    }
}
```

#### React Component Structure
```typescript
// Functional component with hooks
const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
    const [isEditing, setIsEditing] = useState(false);
    
    // Custom hooks for business logic
    const { updateUser, loading } = useUserManagement();
    
    return (
        <div className="user-profile">
            {/* Component content */}
        </div>
    );
};
```

### 🔐 Security Standards

#### Input Validation
```java
@Valid @RequestBody UserRequest request  // ✅ Correct
UserRequest request                      // ❌ Incorrect - missing validation
```

#### Environment Variables
```java
String token = System.getenv("API_TOKEN");  // ✅ Correct
String token = "sk-abc123";                 // ❌ Incorrect - hardcoded secret
```

#### SQL Injection Prevention
```java
// Use parameterized queries
@Query("SELECT u FROM User u WHERE u.email = :email")
User findByEmail(@Param("email") String email);
```

### 🧪 Testing Standards

#### Test Coverage Requirements
- **Unit Tests**: ≥85% coverage
- **Integration Tests**: All API endpoints
- **E2E Tests**: Critical user journeys
- **Performance Tests**: P95 ≤200ms response time

#### Test Structure
```typescript
describe('UserService', () => {
    beforeEach(() => {
        setupBrowserMocks();  // Automatically included
    });
    
    it('should create user successfully', async () => {
        // Test implementation
    });
});
```

---

## 🔧 Daily Development Workflow

### 🌅 Morning Routine

```bash
# 1. Check system status
node .agent-os/scripts/setup.js status

# 2. Run quick validation
node .agent-os/scripts/setup.js validate

# 3. Check compliance score
node .agent-os/scripts/setup.js compliance
```

### 💻 During Development

```bash
# Real-time monitoring is active
# Automatic validation on file changes
# Immediate feedback on standards violations
```

### 🌆 End of Day

```bash
# 1. Run full compliance check
node .agent-os/tools/compliance-checker.js --detailed

# 2. Update lessons learned
node .agent-os/tools/lessons/lesson-categorizer.js --add

# 3. Plan next day's refactoring
node .agent-os/tools/refactoring-validator.js --plan
```

### 📅 Phase Completion

```bash
# After completing Phase 1 (Foundation)
node .agent-os/tools/refactoring-validator.js --phase=1 --validate

# After completing Phase 2 (Integration)
node .agent-os/tools/refactoring-validator.js --phase=2 --validate

# After completing Phase 3 (Advanced Features)
node .agent-os/tools/refactoring-validator.js --phase=3 --validate
```

---

## 🚨 Troubleshooting

### ❌ Common Issues

#### "Command not found" Errors
```bash
# Ensure you're in the project root
pwd  # Should show your project directory

# Check if .agent-os directory exists
ls -la .agent-os

# Verify Node.js installation
node --version  # Should be 16+ or 18+
```

#### Permission Denied
```bash
# Check file permissions
ls -la .agent-os/scripts/

# Fix permissions if needed
chmod +x .agent-os/scripts/*.js
```

#### Compliance Score Too Low
```bash
# Run detailed analysis
node .agent-os/tools/compliance-checker.js --detailed

# Address specific violations
node .agent-os/tools/compliance-checker.js --fix

# Check specific areas
node .agent-os/tools/compliance-checker.js --area="security"
```

### 🔧 System Recovery

```bash
# Reset to clean state
node .agent-os/scripts/setup.js reset

# Reinstall dependencies
node .agent-os/scripts/setup.js reinstall

# Restore from backup
node .agent-os/scripts/setup.js restore
```

### 📞 Getting Help

1. **Check Documentation**: `.agent-os/README.md`
2. **Run Help Commands**: `--help` flag on any tool
3. **Review Lessons**: `.agent-os/lessons-learned/`
4. **Check Status**: `node .agent-os/scripts/setup.js status`

---

## 📋 Reference Cards

### 🚀 Quick Commands

| Task | Command |
|------|---------|
| **Setup** | `node .agent-os/scripts/setup.js` |
| **Status** | `node .agent-os/scripts/setup.js status` |
| **Compliance** | `node .agent-os/tools/compliance-checker.js` |
| **Refactoring** | `node .agent-os/tools/refactoring-validator.js --phase=1` |
| **Cursor Integration** | `node .agent-os/tools/cursor/cursor-integrate.js` |

### 📊 Quality Gates

| Metric | Target | Check Command |
|--------|--------|---------------|
| **Security** | 100% encryption, 0 secrets | `--area="security"` |
| **Code Quality** | ≤5 TODOs, ≥85% tests | `--area="quality"` |
| **Performance** | P95 ≤200ms | `--area="performance"` |

### 🔄 Development Phases

| Phase | Focus | Refactoring Command |
|-------|-------|---------------------|
| **Phase 1** | Foundation | `--phase=1 --validate` |
| **Phase 2** | Integration | `--phase=2 --validate` |
| **Phase 3** | Advanced | `--phase=3 --validate` |

---

## 🔗 Advanced Topics

### 🎛️ Custom Configuration

Create `.agent-os/config/custom-config.json`:
```json
{
  "compliance": {
    "security": {
      "minEncryptionCoverage": 95,
      "maxHardcodedSecrets": 0
    },
    "quality": {
      "minTestCoverage": 90,
      "maxTodoItems": 3
    }
  },
  "refactoring": {
    "autoTrigger": true,
    "phaseValidation": true
  }
}
```

### 🔌 Plugin Development

```javascript
// Create custom tool
class CustomTool {
    async execute() {
        // Tool implementation
    }
}

// Register with Agent OS
module.exports = CustomTool;
```

### 📈 Metrics & Analytics

```bash
# View development metrics
node .agent-os/tools/analysis/statistical-analysis.js

# Generate performance report
node .agent-os/tools/analysis/statistical-analysis.js --performance

# Export data for external analysis
node .agent-os/tools/analysis/statistical-analysis.js --export
```

---

## 🎉 Getting Started Checklist

- [ ] **Environment Setup**
  - [ ] Node.js 16+ installed
  - [ ] Project root directory identified
  - [ ] .agent-os directory present

- [ ] **Initial Configuration**
  - [ ] Run `node .agent-os/scripts/setup.js`
  - [ ] Complete interactive setup
  - [ ] Verify system status

- [ ] **Cursor Integration**
  - [ ] Run `node .agent-os/tools/cursor/cursor-integrate.js`
  - [ ] Verify .cursorrules file created
  - [ ] Test real-time validation

- [ ] **First Development Session**
  - [ ] Run compliance check
  - [ ] Address any violations
  - [ ] Begin development with standards enforcement

---

## 📚 Additional Resources

- **README**: `.agent-os/README.md` - System overview
- **Standards**: `.agent-os/standards/` - Detailed standards documentation
- **Templates**: `.agent-os/templates/` - Development templates
- **Lessons**: `.agent-os/lessons-learned/` - Experience-based guidance
- **Tools**: `.agent-os/tools/` - All available tools and utilities

---

## 🤝 Support & Community

For questions, issues, or contributions:

1. **Check Documentation** - Comprehensive guides and examples
2. **Review Lessons Learned** - Real-world experience and solutions
3. **Run Help Commands** - Built-in assistance on all tools
4. **Contribute Back** - Share lessons learned and improvements

---

*Last Updated: ${new Date().toISOString()}*
*Agent OS Version: 4.0*
