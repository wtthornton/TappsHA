# Code Style Guide

## Context
Unified rules for TypeScript/React & Java/Spring Boot.

<conditional-block context-check="general-formatting">
IF this section read:
  SKIP
ELSE:
  READ:

### Indentation
- **2 spaces**

### Line Length
- Max 100 chars

### Naming Conventions
| Artifact | Convention | Example |
|----------|------------|---------|
| React components | PascalCase | `UserAvatar` |
| JS/TS | camelCase | `fetchUser` |
| Java | PascalCase | `OrderService` |
| Constants | UPPER_CASE | `MAX_RETRY` |

### Imports
- Auto‑sorted, absolute paths rooted at `src`.

### Lint & Format
- Prettier, ESLint (`airbnb`), Spotless, Checkstyle.

</conditional-block>
