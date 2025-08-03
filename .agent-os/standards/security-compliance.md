# Security & Compliance Standard

## Secure Defaults & Hardening
- Deny-by-default configs; enable TLS and security headers by default.
- Run containers as non-root; drop unnecessary Linux capabilities.

## Dependency Management (SCA)
- Use OWASP Dependency-Check, Snyk, Dependabot for vulnerability scanning.
- Maintain SBOM and update base images regularly.

## Container & Infra Security
- Minimal base images (alpine/distroless) and regular scanning (Trivy).
- Scan IaC for misconfigurations (Checkov, AWS Config).

## Secret Management
- Never commit secrets; use Vault, AWS Secrets Manager, or GitHub Secrets.
- Rotate secrets regularly and monitor for leaks.

## OWASP Top 10 Compliance
- Enforce robust authz checks; use parameterized queries & escaping.
- Avoid cryptographic failures; use vetted libraries.
- Monitor logs & alerts for suspicious activity.
