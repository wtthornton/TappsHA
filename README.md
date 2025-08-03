# TappsHA

## Project Overview
TappsHA is a modern web application built with Agent OS best practices for spec-driven agentic development.

## Tech Stack
- **Frontend**: React 19 + TypeScript 5 + Vite
- **Styling**: TailwindCSS 4.x + shadcn/ui
- **State Management**: TanStack Query 5 + Context API
- **Backend**: Spring Boot 3.3+ (Java 21 LTS)
- **Database**: PostgreSQL 17 with pgvector extension
- **AI Integration**: OpenAI GPT-4o, LangChain 0.2
- **Development**: Agent OS for AI-assisted development

## Project Structure
```
TappsHA/
├── .cursor/rules/          # Project-specific Cursor commands
├── src/                    # Application source code
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   └── types/             # TypeScript type definitions
├── docs/                   # Project documentation
├── implementation/         # Implementation plans and architecture
├── standards/             # Project-specific standards (extends Agent OS)
├── tests/                 # Test files
├── scripts/               # Build and deployment scripts
└── README.md             # This file
```

## Development Workflow
This project uses Agent OS for AI-assisted development:

### Available Commands (in Cursor)
- `@plan-product` - Analyze new codebase and create development plan
- `@analyze-product` - Analyze existing codebase for improvements
- `@create-spec` - Create detailed feature specifications
- `@execute-tasks` - Implement features and build code

### Agent OS Integration
- Standards: Extends Agent OS standards with project-specific requirements
- Instructions: Uses Agent OS workflows for consistent development
- Commands: Project-specific Cursor commands that leverage Agent OS

## Getting Started

### Prerequisites
- Node.js 18+
- Java 21 LTS
- Docker Desktop
- Cursor IDE with Agent OS integration

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Start development server: `npm run dev`

## Development Standards
This project follows Agent OS development standards:
- Mobile-first responsive design
- Accessibility by default (WCAG 2.2 AA)
- TypeScript-first development
- Comprehensive testing (≥80% coverage)
- Security-first approach (OWASP Top-10)

## Contributing
1. Follow Agent OS best practices
2. Use project-specific Cursor commands
3. Maintain code quality standards
4. Write comprehensive tests

## License
MIT License - see LICENSE file for details

---
*Built with Agent OS - Your system for spec-driven agentic development* 