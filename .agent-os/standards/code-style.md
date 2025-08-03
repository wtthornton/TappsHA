# Code Style Guide

## Context
Unified style rules for TypeScript/React and Java/Spring Boot.

<conditional-block context-check="general-formatting">
IF this General Formatting section already read in current context:
  SKIP
ELSE:
  READ: The following formatting rules

## General Formatting

### Indentation
- **2 spaces** everywhere; never tabs.

### Line Length
- 100 chars soft max; break intelligently.

### Naming Conventions
| Artifact | Convention | Example |
|----------|------------|---------|
| React components | PascalCase | `UserAvatar` |
| JS/TS variables & fns | camelCase | `fetchUser` |
| Java classes | PascalCase | `OrderService` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRY` |

### Imports
- Auto‑sorted (`eslint-plugin-import`, Gradle `spotless`).  
- Absolute paths rooted at `src` (`@/components/...`).

### Strings
- Single quotes; use template literals for interpolation.  

### Comments
- Explain **why**, not **what**.  
- JavaDoc for public APIs; TSDoc for exported TS.  

### Lint & Format
- **Prettier** + **ESLint** (`airbnb` + `@typescript-eslint` presets).  
- **Spotless** + **Checkstyle** (`google-format`) for Java.

</conditional-block>

## Related Style Guides
- `css-style.md` – Tailwind and utility‑first conventions  
- `html-style.md` – HTML semantics and accessibility guidelines  
- `javascript-style.md` – React patterns, strict TS, testing, and error handling  
