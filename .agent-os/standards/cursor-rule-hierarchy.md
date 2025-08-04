# Cursor Rule Hierarchy

## Purpose
A tiered system for classifying enforcement levels across all Cursor rules, allowing scalable governance without stifling innovation.

### Tiers
1. **Always**
   - Non-negotiable; applied to all branches and environments.
   - Examples: Security hardening, SBOM generation, forbidden imports.
2. **Auto**
   - Default recommendations by Cursor AI; can be bypassed with approval.
   - Examples: Performance suggestions, lint autofixes, refactoring hints.
3. **Agent**
   - AI-assisted optimizations or project enhancements.
   - Examples: PRD generation, doc auto-linking, AI-based test generation.

### Key Practices
- Store rules in `.cursor/rules` with MDC format.
- Attach **policy tags** like `SECURITY`, `QUALITY`, `OBSERVABILITY`.
- Integrate into **CI/CD**: fail PR on Always violations; warn on Auto; annotate on Agent.
