# Agent OS Dependency Management Standards

## 🎯 Purpose
This document establishes comprehensive dependency management standards based on lessons learned from multiple projects to prevent version conflicts, missing dependencies, and compatibility issues.

## 📊 Critical Success Factors

### Issue Distribution Analysis
- **Missing Dependencies**: 40% of build failures
- **Version Conflicts**: 30% of runtime errors  
- **Peer Dependency Issues**: 20% of installation problems
- **Lock File Conflicts**: 10% of team collaboration issues

## 🔒 Mandatory Dependency Patterns

### 1. Dependency Verification Pattern
```javascript
// MANDATORY: Include in every main application file
class DependencyVerifier {
  static verifyEnvironment() {
    // Check Node.js version
    const nodeVersion = process.version;
    const major = parseInt(nodeVersion.slice(1).split('.')[0]);
    const minor = parseInt(nodeVersion.slice(1).split('.')[1]);
    
    if (major < 18) {
      throw new Error(`Node.js ≥18.0.0 required, found ${nodeVersion}`);
    }
    
    console.log(`✅ Node.js ${nodeVersion} - Compatible`);
    return true;
  }
  
  static verifyDependencies() {
    const pkg = require('./package.json');
    const required = [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.devDependencies || {})
    ];
    
    const missing = [];
    const incompatible = [];
    
    for (const dep of required) {
      try {
        require.resolve(dep);
      } catch (e) {
        missing.push(dep);
      }
    }
    
    if (missing.length > 0) {
      console.error(`❌ Missing dependencies: ${missing.join(', ')}`);
      console.log(`📦 Run: npm install`);
      return false;
    }
    
    console.log(`✅ All ${required.length} dependencies verified`);
    return true;
  }
  
  static verifyCompatibility() {
    // Check for known incompatible combinations
    const pkg = require('./package.json');
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    
    // React 19 + TypeScript compatibility
    if (deps.react?.startsWith('19.') && deps.typescript) {
      const tsVersion = deps.typescript.replace('^', '').replace('~', '');
      if (parseFloat(tsVersion) < 5.0) {
        throw new Error('React 19 requires TypeScript ≥5.0');
      }
    }
    
    // Vitest + Jest compatibility check
    if (deps.vitest && deps.jest) {
      console.warn('⚠️  Both Vitest and Jest detected. Choose one testing framework.');
    }
    
    return true;
  }
}

// Execute verification on module load
if (require.main === module) {
  DependencyVerifier.verifyEnvironment();
  DependencyVerifier.verifyDependencies();
  DependencyVerifier.verifyCompatibility();
}
```

### 2. Package.json Template Standards
```json
{
  "name": "agent-os-project",
  "version": "1.0.0",
  "type": "module",
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  },
  "scripts": {
    "dev": "node scripts/verify-deps.js && vite",
    "build": "node scripts/verify-deps.js && tsc && vite build",
    "test": "node scripts/verify-deps.js && vitest",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "type-check": "tsc --noEmit",
    "verify": "npm run lint && npm run type-check && npm run test"
  },
  "dependencies": {
    "react": "19.0.0",
    "react-dom": "19.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "eslint": "^8.45.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.0",
    "typescript": "^5.0.2",
    "vite": "^4.4.5",
    "vitest": "^0.34.0"
  },
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0"
  },
  "overrides": {
    "semver": "^7.5.4"
  }
}
```

### 3. Version Locking Strategy
```bash
# MANDATORY: Always commit lock files
git add package-lock.json
git commit -m "Lock dependency versions"

# Use exact versions for critical dependencies
npm install --save-exact react@19.0.0
npm install --save-exact typescript@5.0.2

# Use ranges for less critical dependencies
npm install --save lodash@^4.17.21
```

## 📋 Compatibility Matrix

### Frontend Stack Compatibility
```yaml
react: "19.0.0"
typescript: "^5.0.2"
vite: "^4.4.5"
vitest: "^0.34.0"
eslint: "^8.45.0"
tailwindcss: "^3.3.0"

# Known Compatible Combinations
compatible_sets:
  - react: "19.0.0"
    typescript: "5.0.2"
    vite: "4.4.5"
    
  - react: "18.2.0"
    typescript: "4.9.5"
    vite: "4.3.9"

# Known Incompatible Combinations
incompatible_sets:
  - react: "19.0.0"
    typescript: "4.x"  # TypeScript <5.0 not compatible with React 19
    
  - vitest: "0.34.0"
    jest: "29.x"  # Don't use both testing frameworks
```

### Backend Stack Compatibility
```yaml
spring_boot: "3.3.0"
java: "21"
postgresql: "17"
testcontainers: "1.19.0"

# Known Compatible Combinations
compatible_sets:
  - spring_boot: "3.3.0"
    java: "21"
    postgresql: "17"
    flyway: "9.22.0"
    
# Known Incompatible Combinations
incompatible_sets:
  - spring_boot: "3.3.0"
    java: "17"  # Spring Boot 3.3+ requires Java 21
    
  - testcontainers: "1.19.0"
    h2: "2.2.x"  # Known conflicts with Flyway
```

## 🔧 Automated Dependency Management

### 1. Pre-commit Hook
```bash
#!/bin/sh
# .git/hooks/pre-commit

echo "🔍 Verifying dependencies..."
node scripts/verify-deps.js

if [ $? -ne 0 ]; then
  echo "❌ Dependency verification failed"
  exit 1
fi

echo "✅ Dependencies verified"
```

### 2. CI/CD Pipeline Integration
```yaml
# .github/workflows/dependencies.yml
name: Dependency Verification
on: [push, pull_request]

jobs:
  verify-deps:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Verify dependencies
        run: |
          node scripts/verify-deps.js
          npm audit --audit-level high
          npm outdated --long || true
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
```

### 3. Dependency Update Strategy
```bash
# Weekly dependency updates (automated)
npm update --save
npm audit fix
npm outdated

# Monthly major version updates (manual review)
npx npm-check-updates
npx npm-check-updates -u
npm install
npm test
```

## 🚨 Critical Dependency Issues & Solutions

### Issue 1: React 19 + TypeScript Compatibility
```bash
# Problem: React 19 requires TypeScript ≥5.0
# Solution:
npm install --save-exact typescript@5.0.2
npm install --save-exact @types/react@18.2.0
npm install --save-exact @types/react-dom@18.2.0
```

### Issue 2: Vitest + Jest Conflicts
```bash
# Problem: Both testing frameworks cause conflicts
# Solution: Choose one and remove the other
npm uninstall jest @types/jest
npm install --save-dev vitest @vitest/ui
```

### Issue 3: ESLint + TypeScript Configuration
```bash
# Problem: TypeScript parser conflicts
# Solution: Use compatible versions
npm install --save-dev @typescript-eslint/parser@6.0.0
npm install --save-dev @typescript-eslint/eslint-plugin@6.0.0
```

### Issue 4: Testcontainers + H2 Database
```bash
# Problem: Testcontainers conflicts with H2 in-memory database
# Solution: Disable Flyway in tests
# Add to test properties: spring.flyway.enabled=false
```

## 📊 Dependency Monitoring

### 1. Security Monitoring
```bash
# Daily security audit
npm audit
npm audit fix

# Use tools like Snyk for continuous monitoring
npx snyk test
npx snyk monitor
```

### 2. Performance Monitoring
```bash
# Bundle size analysis
npm install --save-dev webpack-bundle-analyzer
npx webpack-bundle-analyzer dist/static/js/*.js

# Dependency size impact
npx cost-of-modules
```

### 3. License Compliance
```bash
# Check licenses
npx license-checker
npx license-checker --summary
```

## 🎯 Quality Gates

### Gate 1: Dependency Verification
```bash
# Must pass before development
node scripts/verify-deps.js
npm audit --audit-level high
```

### Gate 2: Version Compatibility
```bash
# Must pass before build
node scripts/check-compatibility.js
npm outdated --long
```

### Gate 3: Security Compliance
```bash
# Must pass before deployment
npm audit --audit-level moderate
npx snyk test
```

## 📋 Troubleshooting Guide

### Common Issues & Solutions

#### "Module not found" errors
```bash
# Check if dependency is installed
npm ls <package-name>

# Install missing dependency
npm install <package-name>

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Version conflict errors
```bash
# Check for conflicting versions
npm ls --depth=0

# Use resolutions to force specific versions
# In package.json:
"resolutions": {
  "typescript": "5.0.2"
}
```

#### Peer dependency warnings
```bash
# Install peer dependencies
npm install <peer-dependency>

# Or suppress warnings (not recommended)
npm install --no-optional --legacy-peer-deps
```

## 🔄 Maintenance Schedule

### Daily
- [ ] Run `npm audit` on active projects
- [ ] Check for critical security updates

### Weekly  
- [ ] Update patch versions (`npm update`)
- [ ] Review dependency outdated list
- [ ] Update lock files

### Monthly
- [ ] Review major version updates
- [ ] Update compatibility matrix
- [ ] Audit unused dependencies
- [ ] Update documentation

---

## 📝 Compliance Checklist

### Before Development
- [ ] Node.js version ≥18.0.0 verified
- [ ] All dependencies installed and verified
- [ ] Compatibility matrix checked
- [ ] Lock files committed

### During Development
- [ ] New dependencies justified and documented
- [ ] Version ranges specified appropriately
- [ ] Peer dependencies installed
- [ ] Security audit passing

### Before Deployment
- [ ] Production dependencies optimized
- [ ] Bundle size analyzed
- [ ] Security scan completed
- [ ] License compliance verified

This dependency management framework ensures consistent, reliable, and secure dependency handling across all Agent OS projects.