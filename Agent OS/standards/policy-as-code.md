# Policy-as-Code & Governance

## Purpose
Automate enforcement of rules across **code, CI/CD, and infrastructure**.

## Components
- **OPA/Rego Policies**: Enforce infrastructure & security standards.
- **Cursor Rules**: Code quality, test coverage, style, and AI usage.
- **CI/CD Integration**:
  - GitHub Actions step for **policy validation**.
  - **Fail builds** on critical policy breaches.
  - **Report coverage** of enforced vs suggested rules.

## Best Practice Stack
- OPA + Conftest for IaC and K8s.
- Sigstore & SLSA for **supply-chain security**.
- Cursor hooks for **AI-driven governance**.
