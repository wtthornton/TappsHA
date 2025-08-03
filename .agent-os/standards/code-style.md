# Code Style Guide (Java/Spring & React/TypeScript)

## General Formatting
- Use Prettier and ESLint for JS/TS; Spotless and Checkstyle for Java.
- Auto-format on save and enforce in CI.

## Naming Conventions
- **Java:** Packages lowercase, Classes PascalCase, methods camelCase, constants UPPER_SNAKE_CASE.
- **TypeScript/JS:** Variables/functions camelCase, React components PascalCase.

## Import Organization
- Avoid Java wildcard imports; explicit imports only.
- Order: external libs → internal modules. Remove unused imports automatically.

## Structure
- Spring Boot: package by feature/domain; root @SpringBootApplication for scanning.
- React: functional components with hooks, co-locate component, test, and style files.
