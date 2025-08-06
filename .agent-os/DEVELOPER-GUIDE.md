# Agent OS Developer Guide

## Quick Start

### Simplest Interface
```bash
# Interactive setup menu
node .agent-os/scripts/setup.js

# Direct quick start
node .agent-os/scripts/quick-start.js

# Main CLI
node .agent-os/tools/agent-os-cli.js
```

## Directory Structure

```
.agent-os/
├── scripts/              # 🚀 Simple developer interface
│   ├── setup.js          #    Interactive setup menu
│   ├── quick-start.js    #    Quick initialization
│   ├── production-deployment.js
│   └── start-real-time-integration.js
│
├── tools/                # 🛠️ Development tools (categorized)
│   ├── cursor/           #    Cursor IDE integration
│   │   ├── cursor-analytics.js
│   │   ├── cursor-init.js
│   │   └── cursor-rule-optimizer.js
│   ├── lessons/          #    Lessons learned management
│   │   ├── lesson-categorizer.js
│   │   ├── lesson-impact-tracker.js
│   │   ├── lesson-quality-validator.js
│   │   └── lesson-template-generator.js
│   ├── analysis/         #    Code and documentation analysis
│   │   ├── documentation-analyzer.js
│   │   └── statistical-analysis.js
│   ├── markdown/         #    Markdown processing
│   │   ├── hybrid-md-processor.js
│   │   └── md-executor.js
│   └── *.js             #    Main tools
│       ├── agent-os-cli.js
│       ├── compliance-checker.js
│       ├── refactoring-validator.js
│       └── validation-suite.js
│
├── utils/                # 🔧 Utility libraries
│   ├── dependency-validator.js
│   ├── cross-platform-shell.js
│   ├── feature-scoring.js
│   ├── infrastructure-recovery.js
│   └── index.js
│
├── workflows/            # ⚡ Automated workflows
│   └── template-trigger-automation.js
│
├── ide/                  # 🎯 IDE integrations
│   └── real-time-cursor-enhancement.js
│
├── testing/              # 🧪 Testing utilities
│   └── mock-factories.js
│
├── standards/            # 📋 Standards documentation
├── templates/            # 📄 Templates
└── internal/             # 🔒 Internal tools (legacy)
```

## Usage Patterns

### For Developers (Simple Interface)

```bash
# Start here - interactive menu
node .agent-os/scripts/setup.js

# Quick setup everything
node .agent-os/scripts/quick-start.js

# Check project health
node .agent-os/scripts/setup.js status

# Run validation
node .agent-os/scripts/setup.js validate
```

### For Advanced Users (Direct Tool Access)

```bash
# Main CLI
node .agent-os/tools/agent-os-cli.js [command]

# Validation tools
node .agent-os/tools/refactoring-validator.js --phase=1 --validate
node .agent-os/tools/compliance-checker.js
node .agent-os/tools/validation-suite.js

# Cursor integration
node .agent-os/tools/cursor/cursor-init.js
node .agent-os/tools/cursor/cursor-analytics.js

# Lessons management
node .agent-os/tools/lessons/lesson-categorizer.js
node .agent-os/tools/lessons/lesson-impact-tracker.js

# Analysis tools
node .agent-os/tools/analysis/documentation-analyzer.js
node .agent-os/tools/analysis/statistical-analysis.js
```

## Builder Methods Compliance

This organization aligns with [Builder Methods Agent OS](https://buildermethods.com/agent-os) standards:

### ✅ Standard Structure
- `tools/` - Development utilities (matches Builder Methods)
- `standards/` - Standards documentation (matches Builder Methods)  
- `scripts/` - Simple developer interface (our enhancement)

### ✅ Enhanced Organization
- **Categorized tools** - Logical grouping for maintainability
- **Simple entry points** - Easy developer onboarding
- **Clear separation** - Tools vs utilities vs workflows

### ✅ Developer Experience
- **Interactive setup** - `setup.js` provides guided interface
- **Quick start** - One-command initialization
- **Progressive disclosure** - Simple → Advanced usage patterns

## Common Workflows

### 1. New Developer Setup
```bash
node .agent-os/scripts/setup.js
# Select: 1 (quick-start)
```

### 2. Daily Development
```bash
# Check status
node .agent-os/scripts/setup.js status

# Run validation before commits
node .agent-os/scripts/setup.js validate
```

### 3. Standards Compliance
```bash
# Check compliance
node .agent-os/scripts/setup.js compliance

# Validate refactoring
node .agent-os/scripts/setup.js refactoring
```

### 4. Advanced Analysis
```bash
# Cursor analytics
node .agent-os/tools/cursor/cursor-analytics.js

# Documentation analysis
node .agent-os/tools/analysis/documentation-analyzer.js

# Lessons learned review
node .agent-os/tools/lessons/lesson-impact-tracker.js
```

## Integration with Cursor AI

The reorganized structure enhances Cursor AI integration:

1. **Real-time validation** - `ide/real-time-cursor-enhancement.js`
2. **Cursor-specific tools** - `tools/cursor/` directory
3. **Automated workflows** - `workflows/` directory
4. **Standards enforcement** - Direct integration with `.cursorrules`

## Benefits of New Organization

1. **Clarity** - Clear separation of concerns
2. **Maintainability** - Logical categorization  
3. **Developer Experience** - Simple entry points
4. **Standards Compliance** - Aligns with Builder Methods
5. **Scalability** - Easy to add new tools in correct categories

## Migration from Old Structure

Old scripts have been moved to appropriate new locations:
- `quick-start.js` → `scripts/quick-start.js`
- `internal/tools/cursor-*.js` → `tools/cursor/`
- `internal/tools/lesson-*.js` → `tools/lessons/`
- `automation/` → `workflows/`
- `integration/` → `ide/`

All functionality is preserved with improved organization.