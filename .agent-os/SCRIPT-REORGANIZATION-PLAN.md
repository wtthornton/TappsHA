# Agent OS Script Reorganization Plan

## Current State Analysis
Based on Builder Methods Agent OS documentation at https://buildermethods.com/agent-os, our script organization needs alignment with their standards.

### Current Script Distribution
```
.agent-os/
├── quick-start.js (ROOT - should be in scripts/)
├── automation/
│   └── template-trigger-automation.js
├── integration/
│   └── real-time-cursor-enhancement.js
├── internal/tools/ (17 scripts - should be reorganized)
├── scripts/
│   └── start-real-time-integration.js
├── templates/
│   └── project-initialization.js
├── testing/
│   └── mock-factories.js
├── tools/ (13 scripts - proper location)
└── utils/ (5 scripts - proper location)
```

## Builder Methods Agent OS Standards Alignment

### 1. Standard Directory Structure
According to Builder Methods Agent OS:
- `~/.agent-os/instructions/` - Core instructions files
- `~/.agent-os/standards/` - Standards documentation
- `~/.agent-os/tools/` - Utility scripts (our current structure is correct)

### 2. Reorganization Plan

#### A. Keep Standard Structure (Correct)
- `.agent-os/tools/` - Main development tools ✅
- `.agent-os/utils/` - Utility libraries ✅  
- `.agent-os/testing/` - Testing utilities ✅
- `.agent-os/standards/` - Standards documentation ✅

#### B. Reorganize for Clarity and Maintainability

**Move to `.agent-os/scripts/` (Developer Interface)**
- `quick-start.js` → `scripts/quick-start.js`
- `start-real-time-integration.js` (already there)

**Reorganize `.agent-os/internal/tools/` → Multiple categories**
- `cursor-*.js` → `tools/cursor/`
- `lesson-*.js` → `tools/lessons/`
- `documentation-analyzer.js` → `tools/analysis/`
- `statistical-analysis.js` → `tools/analysis/`
- `production-deployment.js` → `scripts/`
- `md-executor.js` → `tools/markdown/`
- `hybrid-md-processor.js` → `tools/markdown/`

**Rename for clarity**
- `automation/` → `workflows/` (better describes function)
- `integration/` → `ide/` (IDE-specific integrations)
- `templates/` → Keep as-is (aligns with Builder Methods)

#### C. Create New Structure
```
.agent-os/
├── scripts/           # Simple developer interface scripts
│   ├── quick-start.js
│   ├── start-real-time-integration.js
│   └── production-deployment.js
├── tools/             # Development tools (categorized)
│   ├── cursor/        # Cursor IDE integration
│   ├── lessons/       # Lessons learned management
│   ├── analysis/      # Code and documentation analysis
│   ├── markdown/      # Markdown processing
│   └── *.js          # Main tools (existing)
├── workflows/         # Automated workflow triggers
├── ide/              # IDE-specific integrations
├── utils/            # Utility libraries ✅
├── testing/          # Testing utilities ✅
├── templates/        # Templates ✅
└── standards/        # Standards documentation ✅
```

## Implementation Steps

1. Create new directory structure
2. Move scripts to appropriate locations
3. Update all import paths and references
4. Create simplified developer interface
5. Update documentation
6. Test all script functionality

## Developer Experience Goals

### Simple Interface
Developers should be able to:
```bash
# Quick start - activate everything
node .agent-os/scripts/quick-start.js

# Real-time integration
node .agent-os/scripts/start-real-time-integration.js

# Main tool CLI
node .agent-os/tools/agent-os-cli.js
```

### Advanced Tools (Categorized)
```bash
# Cursor integration
node .agent-os/tools/cursor/cursor-analytics.js

# Lessons management  
node .agent-os/tools/lessons/lesson-categorizer.js

# Analysis tools
node .agent-os/tools/analysis/statistical-analysis.js
```

## Builder Methods Compliance

This reorganization aligns with Builder Methods Agent OS by:
- Maintaining standard `tools/` directory for main utilities
- Using clear categorization for maintainability  
- Providing simple developer interface in `scripts/`
- Following their documentation patterns
- Keeping instructions and standards separate from tools

## Benefits

1. **Clarity**: Clear separation of concerns
2. **Maintainability**: Logical categorization
3. **Developer Experience**: Simple entry points
4. **Standards Compliance**: Aligns with Builder Methods
5. **Scalability**: Easy to add new tools in correct categories