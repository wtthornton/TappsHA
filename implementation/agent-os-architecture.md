# Agent OS Architecture Document

## Overview
Agent OS is a system for better planning and executing software development tasks with AI agents. It provides structured workflows, standards, and instructions to transform AI coding agents into productive developers.

## System Architecture

### Core Components

#### 1. Standards System
**Location**: `~/.agent-os/standards/`
**Purpose**: Defines development standards and best practices

**Components**:
- `tech-stack.md` - Technology stack specifications
- `code-style.md` - General coding standards
- `best-practices.md` - Development best practices
- `code-style/` - Language-specific style guides
  - `css-style.md`, `html-style.md`, `js-style.md`
  - `php-style.md`, `python-style.md`, `react-style.md`
  - `ruby-style.md`, `sql-style.md`, `ts-style.md`

#### 2. Instructions System
**Location**: `~/.agent-os/instructions/`
**Purpose**: Provides AI agents with structured workflows

**Components**:
- `core/` - Core instruction files
  - `create-spec.md` - Specification creation workflow
  - `execute-tasks.md` - Task execution workflow
  - `execute-task.md` - Individual task execution
  - `analyze-product.md` - Product analysis workflow
- `meta/` - Meta instruction files
  - `pre-flight.md` - Pre-flight checks and setup

#### 3. Cursor Integration
**Location**: `.cursor/rules/`
**Purpose**: Provides Cursor IDE with Agent OS commands

**Components**:
- `plan-product.mdc` - New product planning
- `analyze-product.mdc` - Existing product analysis
- `create-spec.mdc` - Feature specification creation
- `execute-tasks.mdc` - Task execution and implementation

## Installation Structure

```
User Profile (~/.agent-os/)
├── standards/
│   ├── tech-stack.md
│   ├── code-style.md
│   ├── best-practices.md
│   └── code-style/
│       ├── css-style.md
│       ├── html-style.md
│       ├── js-style.md
│       ├── php-style.md
│       ├── python-style.md
│       ├── react-style.md
│       ├── ruby-style.md
│       ├── sql-style.md
│       └── ts-style.md
└── instructions/
    ├── core/
    │   ├── create-spec.md
    │   ├── execute-tasks.md
    │   ├── execute-task.md
    │   └── analyze-product.md
    └── meta/
        └── pre-flight.md

Project (.cursor/rules/)
├── plan-product.mdc
├── analyze-product.mdc
├── create-spec.mdc
└── execute-tasks.mdc
```

## Workflow Integration

### 1. Planning Phase
- **Command**: `@plan-product`
- **Purpose**: Analyze new codebase and create development plan
- **Output**: Architecture plan, tech stack recommendations, development roadmap

### 2. Analysis Phase
- **Command**: `@analyze-product`
- **Purpose**: Analyze existing codebase for improvements
- **Output**: Code quality assessment, technical debt analysis, improvement recommendations

### 3. Specification Phase
- **Command**: `@create-spec`
- **Purpose**: Create detailed feature specifications
- **Output**: Technical specifications, acceptance criteria, implementation plan

### 4. Execution Phase
- **Command**: `@execute-tasks`
- **Purpose**: Implement features and build code
- **Output**: Working code, tests, documentation, deployment

## Configuration and Customization

### Standards Customization
- Edit files in `~/.agent-os/standards/` to customize development standards
- Modify language-specific style guides in `~/.agent-os/standards/code-style/`
- Update tech stack specifications in `tech-stack.md`

### Instruction Customization
- Modify core workflows in `~/.agent-os/instructions/core/`
- Update meta instructions in `~/.agent-os/instructions/meta/`
- Customize pre-flight checks and setup procedures

### Cursor Integration
- Commands are available via `@` prefix in Cursor
- Each command triggers specific Agent OS workflows
- Commands can be customized by editing `.cursor/rules/*.mdc` files

## Best Practices

### 1. Standards Management
- Keep standards up-to-date with team practices
- Regularly review and update coding standards
- Ensure consistency across language-specific guides

### 2. Workflow Optimization
- Customize instructions based on project needs
- Adapt workflows for specific development methodologies
- Maintain clear documentation of customizations

### 3. Integration Usage
- Use appropriate commands for different development phases
- Follow the workflow: Plan → Analyze → Specify → Execute
- Leverage Agent OS for consistent development practices

## Maintenance and Updates

### Regular Updates
- Monitor Agent OS repository for updates
- Update standards and instructions as needed
- Keep Cursor integration commands current

### Backup and Version Control
- Backup customizations in version control
- Document any custom modifications
- Maintain consistency across team environments

## Troubleshooting

### Common Issues
1. **Missing Files**: Ensure Agent OS base installation is complete
2. **Cursor Commands Not Working**: Verify `.cursor/rules/` files exist
3. **Standards Not Applied**: Check file permissions and paths

### Verification Steps
1. Verify `~/.agent-os/` directory exists with required files
2. Check `.cursor/rules/` directory for command files
3. Test Cursor commands with `@` prefix
4. Validate standards and instructions are accessible

## TappsHA Integration

### Project-Specific Customization
- Agent OS standards extended for TappsHA requirements
- Project-specific Cursor commands in `.cursor/rules/`
- Custom implementation plans in `implementation/` directory

### Development Workflow
1. Use `@plan-product` for new feature planning
2. Use `@analyze-product` for code quality assessment
3. Use `@create-spec` for detailed specifications
4. Use `@execute-tasks` for implementation

---
*Created: 2025-08-02*
*Last Updated: 2025-08-02*
*Status: Active* 