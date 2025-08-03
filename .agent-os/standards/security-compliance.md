# Security & Compliance Standard

## Context
Aligns with OWASP, AWS Well-Architected Security, and Google's BeyondCorp (Zero Trust).

### 1. Secure Defaults & Least Privilege
- Deny-by-default, explicit allow for APIs and networks
- Enforce HTTPS, HSTS, CSP, secure cookies
- Minimal database and cloud permissions

### 2. Dependency & Library Scanning
- Automate SCA scans (Dep Check, npm audit, Snyk)
- Enable Dependabot and monitor GitHub advisories
- Update Docker base images regularly

### 3. Secrets Management
- No plaintext secrets in code
- Use GitHub Secrets, AWS Secrets Manager, or Vault
- Rotate and monitor secrets, enable secret scanning

### 4. Container Hardening
- Minimal base images (alpine/distroless)
- Run containers as non-root
- Apply seccomp/AppArmor profiles
- Drop unneeded Linux capabilities

### 5. Continuous Monitoring
- Enable logging, auditing, and CI/CD gates
- Optional: CodeQL, OWASP ZAP baseline in CI
- Incident response plan & automated alerting
