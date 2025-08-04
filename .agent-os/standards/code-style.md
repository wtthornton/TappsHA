# Code Style Guide (Enhanced for Cursor/Agent-OS)

## General Formatting
- Use Prettier and ESLint for JS/TS; Spotless and Checkstyle for Java.
- Auto-format on save; enforce style in CI.

## Naming Conventions
- **Java:** packages lowercase, Classes PascalCase, methods camelCase, constants UPPER_SNAKE_CASE.
- **TypeScript/JS:** variables/functions camelCase, React components PascalCase.

## Import & Structure
- Avoid Java wildcard imports; order: external → internal; remove unused automatically.
- **Spring Boot:** package by feature; root @SpringBootApplication class.
- **React:** functional components with hooks; co-locate component, test, style files.

## Code Style Lessons Learned
- **Capture:** Document code style insights and patterns that improve maintainability
- **Apply:** Update style guides based on lessons learned
- **Reference:** See `@~/.agent-os/lessons-learned/categories/development/README.md` for development lessons

**Cursor Effect:** Ensures **all AI-generated code matches style automatically**, reducing review cycles.
