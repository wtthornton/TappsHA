# JavaScript / TypeScript Style Guide

## Language
- **TypeScript 5** for all runtime code; JavaScript only for configs.

## React
- Functional components with hooks.  
- Co-locate component, test, and styles in same folder.  
- Use **Suspense** + **lazy()** for code-splitting.  
- Prefer **server-side rendering** only if hydration cost justified; default to CSR/PWA for Windows targets.

## State Management
- TanStack Query for async caching, Context for lightweight local state.  
- Avoid Redux unless complex cross-slice orchestration needed.

## Error Handling
- Surface user-actionable messages; log stack traces to Loki via `@sentry/browser`.

## Testing
- **vitest** + **jsdom** for unit tests.  
- **cypress** for e2e; run headless in Docker for CI.

## Linting Rules Highlights
- No `any`; use unknown or generics.  
- Exhaustive deps for `useEffect`.  
- Avoid default exports; named exports improve tree-shaking.
