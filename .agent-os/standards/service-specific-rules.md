# Service-Specific Cursor Rules

## Purpose
Provide **fine-grained, domain-specific rules** for each service and technology stack.

## Examples
- **Stripe/Payments**:
  - Mandatory **idempotency for POST endpoints**.
  - Enforce **PCI-compliant logging**.
- **Next.js Frontend**:
  - Ensure **ISR and SEO meta tags**.
  - Pre-render analytics hooks in Agent mode.
- **Database/ORM**:
  - Auto-detect **N+1 queries**.
  - Suggest **index creation** via AI.
