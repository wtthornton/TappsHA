# Development Environment Validation Checklist

**Document Version:** 1.0  
**Created:** 2025-08-05  
**Status:** MANDATORY for all development sessions

## Pre-Development Session Checklist

### 🔍 Environment Assessment
- [ ] **Shell Type Identified**
  - [ ] PowerShell vs Unix shell determined
  - [ ] Command execution strategy adapted accordingly
  - [ ] Platform-specific limitations documented

- [ ] **Service Dependencies Mapped**
  - [ ] Required services identified (Database, Cache, etc.)
  - [ ] Optional services identified (Kafka, Redis, etc.)
  - [ ] Graceful degradation strategy planned

- [ ] **Development Tools Verified**
  - [ ] Docker/Docker Compose available
  - [ ] Build tools accessible (Maven, npm, etc.)
  - [ ] Database connectivity confirmed

### 🚀 Container Infrastructure Validation

#### Core Services Check
- [ ] **PostgreSQL Database**
  - [ ] Container health: `docker ps --filter "name=postgres"`
  - [ ] Connection test: Database accessible on port 5432
  - [ ] Schema validation: Latest migrations applied

- [ ] **InfluxDB (Time Series)**
  - [ ] Container health: `docker ps --filter "name=influxdb"`
  - [ ] API accessible on port 8086
  - [ ] Health endpoint responding

- [ ] **Prometheus (Monitoring)**
  - [ ] Container health: `docker ps --filter "name=prometheus"`
  - [ ] Web UI accessible on port 9090
  - [ ] Configuration valid

#### Optional Services Assessment
- [ ] **Kafka Event Streaming**
  - [ ] Cluster ID consistency verified
  - [ ] Zookeeper health confirmed
  - [ ] Alternative: Event processing disabled gracefully

- [ ] **Redis Caching**
  - [ ] Service availability checked
  - [ ] Alternative: In-memory caching configured

### 📋 Application Configuration Validation

#### Spring Boot Backend
- [ ] **Compilation Status**
  - [ ] Lombok annotations properly configured
  - [ ] All @Slf4j annotations uncommented
  - [ ] Maven/Gradle build successful

- [ ] **Configuration Files**
  - [ ] application.yml environment-specific settings
  - [ ] Database connection parameters correct
  - [ ] Optional services properly configured or disabled

- [ ] **Dependency Management**
  - [ ] External service dependencies identified
  - [ ] Conditional configurations implemented
  - [ ] Auto-configuration exclusions documented

#### Frontend Application
- [ ] **Build Environment**
  - [ ] Node.js version compatibility
  - [ ] Package dependencies installed
  - [ ] TypeScript compilation successful

- [ ] **Test Configuration**
  - [ ] Test framework properly configured
  - [ ] Mock services available
  - [ ] API endpoint connectivity

## Development Workflow Validation

### 🔧 Service Isolation Testing
- [ ] **Independent Service Startup**
  - [ ] Core services start without optional dependencies
  - [ ] Application gracefully handles missing services
  - [ ] Development workflow unblocked by service issues

- [ ] **Dependency Chain Analysis**
  - [ ] Critical path dependencies identified
  - [ ] Optional dependencies clearly marked
  - [ ] Fallback mechanisms tested

### 🗄️ Database Schema Validation
- [ ] **Migration Status**
  - [ ] Flyway enabled for development environment
  - [ ] Latest migration scripts applied successfully
  - [ ] Schema version consistency verified

- [ ] **Entity Testing**
  - [ ] JPA entities compile successfully
  - [ ] Repository tests pass with current schema
  - [ ] Foreign key relationships validated

- [ ] **Test Data Management**
  - [ ] Test database isolated from development
  - [ ] Sample data available for development
  - [ ] Data cleanup procedures documented

## Issue Resolution Procedures

### 🚨 Critical Issue Protocols

#### Service Startup Failures
1. **Immediate Assessment**
   - [ ] Check container logs: `docker logs service_name --tail 20`
   - [ ] Verify port conflicts
   - [ ] Confirm configuration syntax

2. **Isolation Strategy**
   - [ ] Start core services first: `docker-compose up -d postgres influxdb`
   - [ ] Add optional services incrementally
   - [ ] Use `--no-deps` flag for problematic services

3. **Alternative Approaches**
   - [ ] Disable problematic service temporarily
   - [ ] Use embedded alternatives (H2 database, in-memory cache)
   - [ ] Document workaround for team knowledge

#### Compilation/Build Failures
1. **Immediate Diagnosis**
   - [ ] Check build tool output for specific errors
   - [ ] Verify dependency versions
   - [ ] Confirm annotation processing

2. **Common Fix Patterns**
   - [ ] Lombok annotations: Ensure class-level annotations uncommented
   - [ ] Kafka dependencies: Exclude auto-configurations if service unavailable
   - [ ] Database connections: Verify connection strings and credentials

3. **Recovery Steps**
   - [ ] Clean build artifacts: `mvn clean` or `npm run clean`
   - [ ] Update dependencies: Check for version conflicts
   - [ ] Restart development environment

### 📊 Environment Health Monitoring

#### Continuous Validation
- [ ] **Service Health Checks**
  - [ ] Automated health endpoints configured
  - [ ] Regular connectivity testing
  - [ ] Performance baseline established

- [ ] **Resource Monitoring**
  - [ ] Memory usage within acceptable limits
  - [ ] CPU utilization normal
  - [ ] Disk space sufficient

- [ ] **Development Productivity Metrics**
  - [ ] Build time acceptable (< 2 minutes for incremental)
  - [ ] Test execution time reasonable (< 30 seconds for unit tests)
  - [ ] Hot reload functionality working

## Session Documentation Requirements

### 📝 Pre-Session Documentation
```markdown
## Environment Status Report
- **Date:** [YYYY-MM-DD]
- **Shell:** [PowerShell/Bash/Zsh]
- **Services Running:** [List of active services]
- **Known Issues:** [Any ongoing problems]
- **Workarounds Active:** [Temporary solutions in place]
```

### 📈 Post-Session Updates
```markdown
## Session Completion Status
- **Services Modified:** [Changes made to infrastructure]
- **Configuration Updates:** [Settings changed]
- **Issues Resolved:** [Problems fixed during session]
- **New Issues Discovered:** [Problems found for future resolution]
- **Environment Ready For:** [Next development task]
```

## Quality Gates

### 🎯 Session Readiness Criteria
Before proceeding with development tasks:

1. **Core Infrastructure** (MANDATORY)
   - [ ] Database accessible and schema current
   - [ ] Build tools functional
   - [ ] Basic application compilation successful

2. **Development Workflow** (MANDATORY)  
   - [ ] Code changes can be tested
   - [ ] Logs accessible for debugging
   - [ ] Development server can start

3. **Optional Enhancements** (NICE-TO-HAVE)
   - [ ] All services running optimally
   - [ ] Full integration testing possible
   - [ ] Performance monitoring active

### 🔄 Continuous Improvement
- [ ] **Lessons Learned Captured**
  - [ ] Critical fixes documented in `.agent-os/lessons-learned/`
  - [ ] New patterns added to standards
  - [ ] Team knowledge updated

- [ ] **Standards Enhancement**
  - [ ] Development patterns refined
  - [ ] Automation opportunities identified
  - [ ] Documentation gaps filled

---

**Validation Frequency:** Every development session start  
**Compliance Level:** MANDATORY for Task readiness  
**Review Period:** Weekly for continuous improvement  
**Owner:** Development Team Lead