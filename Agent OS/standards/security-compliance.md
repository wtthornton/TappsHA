# Security & Compliance Standard (Enhanced)

## Secure Defaults & Hardening
- Deny-by-default; TLS and headers enabled by default.
- Run containers as non-root; drop unneeded Linux capabilities.

## Dependency Management (SCA)
- Use OWASP Dep‑Check, Snyk, Dependabot; maintain SBOMs.

## Container & Infra Security
- Minimal base images (alpine/distroless), Trivy scans in CI.
- Scan IaC for misconfigurations (Checkov, AWS Config).

## Secret Management
- No secrets in code; use Vault, AWS Secrets Manager, or GitHub Secrets.
- Rotate secrets regularly; enable leak detection.

## OWASP Top 10 Compliance
- Robust authz; parameterized queries; proper crypto.
- Logging & alerting for suspicious activity.

## Security Lessons Learned
- **Capture:** Document security incidents, vulnerabilities, and mitigation strategies
- **Apply:** Update security standards based on lessons learned
- **Reference:** See `@~/.agent-os/lessons-learned/categories/operations/README.md` for security lessons

**Cursor Effect:** Avoids insecure code and **generates DevSecOps-ready pipelines and configs**.
