# JavaScript/TypeScript Frontend Strategy (Enhanced)

## Component Patterns
- Use functional components with hooks; leverage custom hooks for logic reuse.
- Co-locate components with their tests and styles.

## State Management
- Colocate state locally; Context or small state libs only for shared/global state.

## SSR & Routing
- Prefer Next.js for SSR/SSG when SEO/performance matters.
- Dynamically import heavy modules for improved load times.

## Error Handling & Resilience
- Use React Error Boundaries for UI resilience.
- Log errors to monitoring (e.g., Sentry) with user-friendly fallback UIs.

## Performance
- Use memoization (React.memo, useMemo) and lazy loading for efficiency.

**Cursor Effect:** Generates **modern, production‑ready React code** with resilience and performance baked in.
