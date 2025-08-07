# Agent OS Enhancement: Deployment Validation Framework

**Enhancement ID:** AOS-2025-001
**Date:** 2025-01-27
**Priority:** HIGH
**Status:** Proposed

## Overview

Based on deployment issues encountered in the TappHA project, this enhancement proposes a comprehensive deployment validation framework for Agent OS to prevent common deployment failures.

## Problem Statement

Current Agent OS projects face deployment failures due to:
1. Database query incompatibilities
2. Native library dependencies
3. Configuration issues
4. Lack of pre-deployment validation

## Proposed Solution

### 1. Automated Pre-Deployment Validation

Create `.agent-os/validation/pre-deployment.yml`:
```yaml
name: Pre-Deployment Validation
version: 1.0.0

validations:
  database:
    - name: HQL Compatibility Check
      type: pattern-search
      patterns:
        - pattern: "EXTRACT\\(EPOCH"
          severity: ERROR
          message: "PostgreSQL-specific EXTRACT(EPOCH) found. Use HQL-compatible alternative."
        - pattern: "DATE_TRUNC"
          severity: ERROR
          message: "PostgreSQL-specific DATE_TRUNC found. Use HQL-compatible alternative."
        - pattern: "FUNCTION\\('DATE_TRUNC'"
          severity: ERROR
          message: "Database-specific FUNCTION call found."
      
  repository:
    - name: Method Signature Validation
      type: pattern-search
      patterns:
        - pattern: "Optional<.*>.*Pageable"
          severity: ERROR
          message: "Optional with Pageable not supported. Use List instead."
          
  dependencies:
    - name: Native Library Check
      type: dockerfile-analysis
      checks:
        - base-image: alpine
          required-packages: [libstdc++, libgomp]
          when: 
            - dependency: onnxruntime
            - dependency: tensorflow
            
  configuration:
    - name: WebSocket Configuration
      type: spring-config
      checks:
        - if: websocket.heartbeat.enabled
          require: bean:TaskScheduler
          
  circular-dependencies:
    - name: Spring Bean Cycles
      type: spring-analysis
      allow-circular: false
```

### 2. Validation Script

Create `.agent-os/scripts/validate-deployment.sh`:
```bash
#!/bin/bash

# Agent OS Deployment Validator
# Prevents common deployment issues

set -e

echo "🔍 Agent OS Deployment Validation Starting..."

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Function to check HQL compatibility
check_hql_compatibility() {
    echo "Checking HQL compatibility..."
    
    # Check for PostgreSQL-specific functions
    if grep -r "EXTRACT(EPOCH" --include="*.java" backend/src 2>/dev/null; then
        echo -e "${RED}❌ ERROR: PostgreSQL-specific EXTRACT(EPOCH) found${NC}"
        ((ERRORS++))
    fi
    
    if grep -r "DATE_TRUNC" --include="*.java" backend/src 2>/dev/null; then
        echo -e "${RED}❌ ERROR: PostgreSQL-specific DATE_TRUNC found${NC}"
        ((ERRORS++))
    fi
    
    if grep -r "FUNCTION('DATE_TRUNC'" --include="*.java" backend/src 2>/dev/null; then
        echo -e "${RED}❌ ERROR: Database-specific FUNCTION calls found${NC}"
        ((ERRORS++))
    fi
}

# Function to check repository methods
check_repository_methods() {
    echo "Checking repository method signatures..."
    
    if grep -r "Optional.*Pageable" --include="*.java" backend/src 2>/dev/null; then
        echo -e "${RED}❌ ERROR: Optional with Pageable found in repository${NC}"
        echo "  Use List return type with Pageable instead"
        ((ERRORS++))
    fi
}

# Function to check Docker configuration
check_docker_config() {
    echo "Checking Docker configuration..."
    
    # Check if using Alpine
    if grep -q "alpine" backend/Dockerfile 2>/dev/null; then
        echo -e "${YELLOW}⚠ WARNING: Using Alpine Linux base image${NC}"
        echo "  Ensure native dependencies are installed"
        
        # Check for common native dependencies
        if ! grep -q "libstdc++" backend/Dockerfile; then
            echo -e "${YELLOW}⚠ WARNING: libstdc++ not found in Dockerfile${NC}"
            ((WARNINGS++))
        fi
    fi
}

# Function to check Spring configuration
check_spring_config() {
    echo "Checking Spring configuration..."
    
    # Check for circular references setting
    if grep -q "allow-circular-references: true" backend/src/main/resources/application.yml 2>/dev/null; then
        echo -e "${YELLOW}⚠ WARNING: Circular references allowed${NC}"
        echo "  Consider refactoring to remove circular dependencies"
        ((WARNINGS++))
    fi
}

# Function to check test coverage
check_test_coverage() {
    echo "Checking test coverage..."
    
    # Check for repository tests
    if [ -d "backend/src/test" ]; then
        repo_tests=$(find backend/src/test -name "*RepositoryTest.java" | wc -l)
        if [ "$repo_tests" -eq 0 ]; then
            echo -e "${YELLOW}⚠ WARNING: No repository tests found${NC}"
            ((WARNINGS++))
        fi
    fi
}

# Run all checks
echo "================================"
check_hql_compatibility
echo "================================"
check_repository_methods
echo "================================"
check_docker_config
echo "================================"
check_spring_config
echo "================================"
check_test_coverage
echo "================================"

# Summary
echo ""
echo "📊 Validation Summary:"
echo "  Errors: $ERRORS"
echo "  Warnings: $WARNINGS"

if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}❌ Deployment validation FAILED${NC}"
    echo "Please fix the errors before deploying"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠ Deployment validation passed with warnings${NC}"
    echo "Review warnings to prevent potential issues"
    exit 0
else
    echo -e "${GREEN}✅ Deployment validation PASSED${NC}"
    exit 0
fi
```

### 3. IDE Integration

Create `.agent-os/ide/validations.json`:
```json
{
  "name": "Agent OS Deployment Validations",
  "version": "1.0.0",
  "rules": [
    {
      "id": "aos-db-001",
      "name": "PostgreSQL-specific function in HQL",
      "pattern": "EXTRACT\\(EPOCH|DATE_TRUNC|FUNCTION\\('DATE_TRUNC'",
      "filePattern": "**/*.java",
      "severity": "error",
      "message": "Database-specific function detected. Use HQL-compatible alternative.",
      "quickFix": {
        "suggestion": "Move calculation to service layer or use native query"
      }
    },
    {
      "id": "aos-repo-001",
      "name": "Invalid repository method signature",
      "pattern": "Optional<[^>]+>\\s+\\w+\\([^)]*Pageable",
      "filePattern": "**/repository/**/*.java",
      "severity": "error",
      "message": "Optional with Pageable not supported. Use List return type."
    },
    {
      "id": "aos-docker-001",
      "name": "Alpine Linux native dependency",
      "pattern": "FROM.*alpine",
      "filePattern": "**/Dockerfile",
      "severity": "warning",
      "message": "Alpine Linux detected. Ensure native dependencies are properly installed.",
      "documentation": "https://agent-os.dev/docs/alpine-dependencies"
    }
  ]
}
```

### 4. GitHub Actions Integration

Create `.github/workflows/deployment-validation.yml`:
```yaml
name: Deployment Validation

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Run Agent OS Deployment Validation
      run: |
        chmod +x .agent-os/scripts/validate-deployment.sh
        .agent-os/scripts/validate-deployment.sh
        
    - name: Check HQL Compatibility
      run: |
        # Additional HQL checks
        if grep -r "EXTRACT(EPOCH" --include="*.java" .; then
          echo "::error::PostgreSQL-specific EXTRACT(EPOCH) found"
          exit 1
        fi
        
    - name: Validate Repository Methods
      run: |
        if grep -r "Optional.*Pageable" --include="*.java" .; then
          echo "::error::Invalid repository method signature found"
          exit 1
        fi
        
    - name: Test Container Startup
      run: |
        docker-compose build
        docker-compose up -d
        sleep 30
        docker-compose ps
        docker-compose logs --tail=50
        # Check if backend is running
        docker-compose ps | grep backend | grep Up || exit 1
```

### 5. Project Template Updates

Update `.agent-os/templates/spring-boot-project/`:

#### Repository Template
```java
package com.example.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;

public interface ExampleRepository extends JpaRepository<Example, Long> {
    
    // ✅ CORRECT: Use List with Pageable
    List<Example> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);
    
    // ✅ CORRECT: Use Optional without Pageable
    Optional<Example> findFirstByStatusOrderByCreatedAtDesc(String status);
    
    // ❌ WRONG: Don't use Optional with Pageable
    // Optional<Example> findByStatus(String status, Pageable pageable);
    
    // ✅ CORRECT: HQL-compatible query
    @Query("SELECT e FROM Example e WHERE e.createdAt > :date")
    List<Example> findRecent(@Param("date") LocalDateTime date);
    
    // ❌ WRONG: PostgreSQL-specific
    // @Query("SELECT AVG(EXTRACT(EPOCH FROM (e.endTime - e.startTime))) FROM Example e")
    
    // ✅ CORRECT: Use service layer for complex calculations
    @Query("SELECT e FROM Example e WHERE e.status = 'COMPLETED'")
    List<Example> findCompleted();
    // Then calculate averages in service layer
}
```

#### WebSocket Configuration Template
```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    @Bean
    public TaskScheduler webSocketTaskScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(2);
        scheduler.setThreadNamePrefix("websocket-");
        scheduler.initialize();
        return scheduler;
    }
    
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue")
              .setHeartbeatValue(new long[]{10000, 10000})
              .setTaskScheduler(webSocketTaskScheduler()); // Always provide scheduler
    }
}
```

### 6. Documentation Updates

Create `.agent-os/docs/deployment-troubleshooting.md`:
```markdown
# Deployment Troubleshooting Guide

## Common Issues and Solutions

### 1. HQL Query Errors

**Symptoms:**
- `QueryCreationException`
- `IllegalArgumentException: Validation failed for query`

**Common Causes:**
- PostgreSQL-specific functions (EXTRACT, DATE_TRUNC)
- Database-specific syntax

**Solutions:**
1. Use HQL-compatible functions
2. Move complex calculations to service layer
3. Use native queries (last resort)

### 2. Repository Method Errors

**Symptoms:**
- `IllegalStateException: Method has to have one of the following return types`

**Solution:**
Use List return type with Pageable, not Optional

### 3. Native Library Errors

**Symptoms:**
- `UnsatisfiedLinkError`
- `Error loading shared library`

**Solutions:**
1. Install required libraries in Dockerfile
2. Use full Linux distribution instead of Alpine
3. Disable features requiring native libraries

### 4. WebSocket Configuration Errors

**Symptoms:**
- `IllegalArgumentException: Heartbeat values configured but no TaskScheduler provided`

**Solution:**
Provide TaskScheduler bean for heartbeat configuration

### 5. Circular Dependency Errors

**Symptoms:**
- `BeanCurrentlyInCreationException`

**Solutions:**
1. Refactor to remove circular dependencies
2. Use @Lazy annotation
3. Temporarily allow circular references (not recommended)
```

## Implementation Plan

### Phase 1: Immediate (Week 1)
- [ ] Create validation scripts
- [ ] Add to existing projects
- [ ] Document common issues

### Phase 2: Short-term (Week 2-3)
- [ ] Create GitHub Actions workflow
- [ ] Update project templates
- [ ] Create IDE integration

### Phase 3: Long-term (Month 2)
- [ ] Build validation framework
- [ ] Create automated fixes
- [ ] Integrate with Agent OS CLI

## Success Metrics

- **Reduction in deployment failures:** Target 80% reduction
- **Time to resolution:** From 2-3 hours to < 30 minutes
- **Developer satisfaction:** Measured through feedback
- **Adoption rate:** 100% of new Agent OS projects

## Conclusion

This enhancement will significantly improve the deployment experience for Agent OS users by catching common issues before they cause failures. The validation framework will save developers hours of debugging time and ensure more reliable deployments.

---

**Status:** Ready for Review
**Author:** Agent OS Team
**Review Date:** 2025-02-01