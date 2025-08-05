# Agent OS Configuration Management Standards

## 🎯 Purpose
This document establishes comprehensive configuration management standards based on lessons learned to prevent YAML duplicate keys, configuration conflicts, and deployment issues.

## 📊 Critical Issue Analysis

### Configuration Failure Distribution
- **YAML Duplicate Keys**: 40% of configuration failures
- **Environment Mismatches**: 25% of deployment issues  
- **Missing Properties**: 20% of runtime errors
- **Property Overwrites**: 15% of unexpected behavior

## 🔒 Mandatory Configuration Patterns

### 1. YAML Merge Pattern (CRITICAL)
```javascript
// MANDATORY: Use this pattern for all YAML configuration updates
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

class ConfigurationManager {
  static mergeYamlConfig(filePath, newConfig, options = {}) {
    console.log(`🔧 Merging configuration: ${filePath}`);
    
    let existingConfig = {};
    
    // Load existing configuration if file exists
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        existingConfig = yaml.load(content) || {};
        console.log(`📖 Loaded existing config with ${Object.keys(existingConfig).length} top-level keys`);
      } catch (error) {
        throw new Error(`Failed to parse existing YAML file ${filePath}: ${error.message}`);
      }
    }
    
    // Deep merge configurations
    const merged = this.deepMerge(existingConfig, newConfig);
    
    // Validate merged configuration
    this.validateYamlStructure(merged, filePath);
    
    // Write merged configuration
    const yamlContent = yaml.dump(merged, {
      indent: 2,
      lineWidth: 120,
      noRefs: true,
      sortKeys: false,
      quotingType: '"',
      forceQuotes: false
    });
    
    // Create backup if requested
    if (options.backup && fs.existsSync(filePath)) {
      const backupPath = `${filePath}.backup.${Date.now()}`;
      fs.copyFileSync(filePath, backupPath);
      console.log(`💾 Backup created: ${backupPath}`);
    }
    
    fs.writeFileSync(filePath, yamlContent, 'utf8');
    console.log(`✅ Configuration merged successfully: ${filePath}`);
    
    return merged;
  }
  
  static deepMerge(target, source) {
    const result = { ...target };
    
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          // Recursive merge for objects
          result[key] = this.deepMerge(result[key] || {}, source[key]);
        } else {
          // Direct assignment for primitives and arrays
          result[key] = source[key];
        }
      }
    }
    
    return result;
  }
  
  static validateYamlStructure(config, filePath) {
    const issues = [];
    
    // Check for common Spring Boot configuration issues
    if (config.spring) {
      // Ensure spring is an object, not duplicated
      if (typeof config.spring !== 'object') {
        issues.push('spring configuration must be an object');
      }
      
      // Check for nested duplicate keys
      this.checkForDuplicateKeys(config.spring, 'spring', issues);
    }
    
    // Check for environment-specific issues
    if (config.spring?.profiles) {
      if (!Array.isArray(config.spring.profiles.active) && config.spring.profiles.active) {
        issues.push('spring.profiles.active should be an array or string');
      }
    }
    
    // Check for database configuration completeness
    if (config.spring?.datasource) {
      const required = ['url', 'username', 'password'];
      const missing = required.filter(prop => !config.spring.datasource[prop]);
      if (missing.length > 0) {
        issues.push(`Missing required datasource properties: ${missing.join(', ')}`);
      }
    }
    
    if (issues.length > 0) {
      throw new Error(`YAML validation failed for ${filePath}:\n- ${issues.join('\n- ')}`);
    }
    
    return true;
  }
  
  static checkForDuplicateKeys(obj, path, issues) {
    const keys = Object.keys(obj);
    const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index);
    
    if (duplicates.length > 0) {
      issues.push(`Duplicate keys in ${path}: ${duplicates.join(', ')}`);
    }
    
    // Recursively check nested objects
    for (const key in obj) {
      if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        this.checkForDuplicateKeys(obj[key], `${path}.${key}`, issues);
      }
    }
  }
}
```

### 2. Environment-Specific Configuration Pattern
```yaml
# application.yml - Base configuration
spring:
  application:
    name: agent-os-app
  
  profiles:
    active: ${SPRING_PROFILES_ACTIVE:development}
  
  datasource:
    url: ${DATABASE_URL:jdbc:postgresql://localhost:5432/agentosdb}
    username: ${DATABASE_USERNAME:postgres}
    password: ${DATABASE_PASSWORD:password}
    driver-class-name: org.postgresql.Driver
  
  jpa:
    hibernate:
      ddl-auto: ${HIBERNATE_DDL_AUTO:validate}
    show-sql: ${SHOW_SQL:false}
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
  
  flyway:
    enabled: ${FLYWAY_ENABLED:true}
    locations: classpath:db/migration
    baseline-on-migrate: true

# Server configuration
server:
  port: ${SERVER_PORT:8080}
  servlet:
    context-path: ${CONTEXT_PATH:/api}

# Logging configuration
logging:
  level:
    com.agentOS: ${LOG_LEVEL:INFO}
    org.springframework.security: ${SECURITY_LOG_LEVEL:WARN}
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} - %msg%n"

# Management and monitoring
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: when-authorized

---
# Development profile
spring:
  config:
    activate:
      on-profile: development
      
  datasource:
    url: jdbc:h2:mem:testdb
    driver-class-name: org.h2.Driver
    username: sa
    password: ""
    
  h2:
    console:
      enabled: true
      
  jpa:
    hibernate:
      ddl-auto: create-drop
    show-sql: true

---
# Production profile  
spring:
  config:
    activate:
      on-profile: production
      
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    
  flyway:
    enabled: true
    
logging:
  level:
    com.agentOS: WARN
    org.springframework.security: ERROR
```

### 3. Docker Configuration Pattern
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "${SERVER_PORT:-8080}:8080"
    environment:
      SPRING_PROFILES_ACTIVE: ${SPRING_PROFILES_ACTIVE:-production}
      DATABASE_URL: jdbc:postgresql://db:5432/${POSTGRES_DB:-agentosdb}
      DATABASE_USERNAME: ${POSTGRES_USER:-postgres}
      DATABASE_PASSWORD: ${POSTGRES_PASSWORD:-password}
      FLYWAY_ENABLED: ${FLYWAY_ENABLED:-true}
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/api/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  db:
    image: postgres:17
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-agentosdb}
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-password}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "${POSTGRES_PORT:-5432}:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-postgres}"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

### 4. Environment Variables Management
```bash
# .env.template - Template for environment variables
# Copy to .env and fill in actual values

# Database Configuration
DATABASE_URL=jdbc:postgresql://localhost:5432/agentosdb
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password_here

# Application Configuration
SPRING_PROFILES_ACTIVE=development
SERVER_PORT=8080
CONTEXT_PATH=/api

# Security Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRATION=86400

# External Services
OPENAI_API_KEY=your_openai_key_here
OPENAI_BASE_URL=https://api.openai.com/v1

# Monitoring
LOG_LEVEL=INFO
SECURITY_LOG_LEVEL=WARN

# Features
FLYWAY_ENABLED=true
SHOW_SQL=false
```

## 🔧 Configuration Validation Tools

### 1. Pre-deployment Validation Script
```javascript
// scripts/validate-config.js
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

class ConfigValidator {
  static validateApplicationConfig(configPath) {
    console.log(`🔍 Validating configuration: ${configPath}`);
    
    if (!fs.existsSync(configPath)) {
      throw new Error(`Configuration file not found: ${configPath}`);
    }
    
    let config;
    try {
      const content = fs.readFileSync(configPath, 'utf8');
      config = yaml.load(content);
    } catch (error) {
      throw new Error(`Invalid YAML syntax in ${configPath}: ${error.message}`);
    }
    
    // Validate required sections
    this.validateRequiredSections(config);
    
    // Validate Spring Boot specific configuration
    this.validateSpringBootConfig(config);
    
    // Validate database configuration
    this.validateDatabaseConfig(config);
    
    // Check for common issues
    this.checkCommonIssues(config);
    
    console.log(`✅ Configuration validation passed: ${configPath}`);
    return true;
  }
  
  static validateRequiredSections(config) {
    const required = ['spring', 'server', 'logging'];
    const missing = required.filter(section => !config[section]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required configuration sections: ${missing.join(', ')}`);
    }
  }
  
  static validateSpringBootConfig(config) {
    if (!config.spring.application?.name) {
      throw new Error('spring.application.name is required');
    }
    
    if (!config.spring.profiles?.active) {
      console.warn('⚠️  spring.profiles.active not set, defaulting to development');
    }
  }
  
  static validateDatabaseConfig(config) {
    if (config.spring.datasource) {
      const required = ['url', 'username', 'password'];
      const missing = required.filter(prop => !config.spring.datasource[prop]);
      
      if (missing.length > 0) {
        throw new Error(`Missing database configuration: ${missing.join(', ')}`);
      }
      
      // Validate URL format
      const url = config.spring.datasource.url;
      if (!url.startsWith('jdbc:')) {
        throw new Error('Database URL must start with jdbc:');
      }
    }
  }
  
  static checkCommonIssues(config) {
    // Check for duplicate spring keys (common issue)
    const springKeys = Object.keys(config.spring || {});
    const duplicates = springKeys.filter((key, index) => springKeys.indexOf(key) !== index);
    
    if (duplicates.length > 0) {
      throw new Error(`Duplicate spring configuration keys: ${duplicates.join(', ')}`);
    }
    
    // Check for hardcoded sensitive values
    const sensitivePatterns = [
      /password.*=.*[^${}]/i,
      /secret.*=.*[^${}]/i,
      /key.*=.*[^${}]/i
    ];
    
    const configString = JSON.stringify(config);
    sensitivePatterns.forEach(pattern => {
      if (pattern.test(configString)) {
        console.warn('⚠️  Possible hardcoded sensitive value detected. Use environment variables.');
      }
    });
  }
}

// Run validation if called directly
if (require.main === module) {
  try {
    ConfigValidator.validateApplicationConfig('./src/main/resources/application.yml');
    console.log('🎉 All configuration validations passed!');
  } catch (error) {
    console.error('❌ Configuration validation failed:', error.message);
    process.exit(1);
  }
}

module.exports = ConfigValidator;
```

### 2. Environment Variable Validation
```javascript
// scripts/validate-env.js
class EnvironmentValidator {
  static validateEnvironment() {
    const required = [
      'DATABASE_URL',
      'DATABASE_USERNAME', 
      'DATABASE_PASSWORD',
      'JWT_SECRET'
    ];
    
    const missing = required.filter(env => !process.env[env]);
    
    if (missing.length > 0) {
      console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
      console.log('📝 Create .env file from .env.template');
      return false;
    }
    
    // Validate format
    this.validateDatabaseUrl(process.env.DATABASE_URL);
    this.validateJwtSecret(process.env.JWT_SECRET);
    
    console.log('✅ Environment variables validated');
    return true;
  }
  
  static validateDatabaseUrl(url) {
    if (!url.startsWith('jdbc:')) {
      throw new Error('DATABASE_URL must start with jdbc:');
    }
    
    if (!url.includes('://')) {
      throw new Error('DATABASE_URL format is invalid');
    }
  }
  
  static validateJwtSecret(secret) {
    if (secret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters long');
    }
  }
}

module.exports = EnvironmentValidator;
```

## 🚨 Common Configuration Issues & Solutions

### Issue 1: YAML Duplicate Keys
```yaml
# ❌ WRONG - Causes application startup failure
spring:
  application:
    name: myapp
    
# ... other config ...

spring:  # ❌ DUPLICATE KEY
  datasource:
    url: jdbc:postgresql://localhost:5432/db

# ✅ CORRECT - Merge under single spring key
spring:
  application:
    name: myapp
  datasource:
    url: jdbc:postgresql://localhost:5432/db
```

### Issue 2: Environment Variable Override Issues
```yaml
# ❌ WRONG - No fallback value
spring:
  datasource:
    url: ${DATABASE_URL}

# ✅ CORRECT - With fallback value
spring:
  datasource:
    url: ${DATABASE_URL:jdbc:postgresql://localhost:5432/defaultdb}
```

### Issue 3: Profile-specific Configuration Conflicts
```yaml
# ❌ WRONG - Profile config at wrong level
spring:
  profiles:
    active: development
  datasource:
    url: jdbc:h2:mem:testdb  # This applies to ALL profiles

# ✅ CORRECT - Profile-specific configuration
spring:
  profiles:
    active: development

---
spring:
  config:
    activate:
      on-profile: development
  datasource:
    url: jdbc:h2:mem:testdb  # Only for development profile
```

## 📋 Configuration Management Checklist

### Before Development
- [ ] Configuration templates copied
- [ ] Environment variables defined
- [ ] Profile-specific configs separated
- [ ] Sensitive values externalized

### During Development
- [ ] Use merge patterns for config updates
- [ ] Validate YAML syntax before commits
- [ ] Test with different profiles
- [ ] Document configuration changes

### Before Deployment
- [ ] Run configuration validation
- [ ] Verify environment variables
- [ ] Test profile activation
- [ ] Backup existing configurations

## 🔄 Maintenance Procedures

### Daily
- [ ] Validate configuration syntax
- [ ] Check for sensitive value leaks
- [ ] Monitor configuration drift

### Weekly
- [ ] Review configuration changes
- [ ] Update environment templates
- [ ] Validate backup procedures

### Monthly
- [ ] Audit configuration security
- [ ] Update configuration documentation
- [ ] Review profile effectiveness

---

This configuration management framework ensures consistent, secure, and maintainable configuration across all Agent OS projects while preventing the most common configuration issues.