# Agent OS Deployment Checklist

## Pre-Deployment Validation

### 1. Technology Stack Validation
- [ ] **Tailwind CSS Version**: Use 3.x (stable), avoid 4.x in production
- [ ] **PostCSS Configuration**: Ensure proper config for Tailwind 3.x
- [ ] **Dependencies**: All npm packages installed and compatible
- [ ] **TypeScript Configuration**: Path aliases configured correctly
- [ ] **Vite Configuration**: Build process configured properly

### 2. Docker Configuration
- [ ] **Port Mappings**: Correct host:container mapping
  - Frontend (Nginx): `"5173:80"` ✅
  - Backend (Spring Boot): `"8080:8080"` ✅
- [ ] **Container Health**: All containers starting successfully
- [ ] **Volume Mounts**: Database persistence configured
- [ ] **Environment Variables**: Properly set for each service

### 3. Database & Migrations
- [ ] **Migration Scripts**: Tested in development environment
- [ ] **Column References**: All columns exist before creating indexes
- [ ] **PostgreSQL Functions**: Avoid database-specific functions in HQL
- [ ] **Flyway Configuration**: Enabled and properly configured

### 4. Authentication & Development
- [ ] **Development Bypass**: Implemented for localhost testing
- [ ] **Authentication Flow**: Proper login/logout handling
- [ ] **Protected Routes**: Correctly configured
- [ ] **Session Management**: Working properly

## Build Process Validation

### 1. Frontend Build
```bash
# Check CSS file generation
docker exec container-name ls -la /usr/share/nginx/html/assets/
docker exec container-name wc -c /usr/share/nginx/html/assets/*.css

# Verify CSS content (should be >10KB, not 0 bytes)
docker exec container-name head -c 1000 /usr/share/nginx/html/assets/*.css
```

### 2. Backend Build
```bash
# Check Spring Boot startup
docker-compose logs backend --tail=20

# Verify health endpoint
curl -I http://localhost:8080/api/actuator/health
```

### 3. Database Build
```bash
# Check database migrations
docker-compose logs postgres --tail=20

# Verify database connectivity
docker exec container-name psql -U username -d database -c "SELECT 1;"
```

## Service Accessibility Testing

### 1. Frontend Testing
- [ ] **HTTP Response**: `curl -I http://localhost:5173` returns 200
- [ ] **CSS Loading**: CSS file accessible and >10KB
- [ ] **JavaScript Loading**: JS files accessible
- [ ] **Authentication**: Login form or bypass working
- [ ] **UI Rendering**: Proper styling applied (not default browser)

### 2. Backend Testing
- [ ] **Health Check**: `/api/actuator/health` returns 200
- [ ] **API Endpoints**: Core endpoints responding
- [ ] **Database Connection**: Repository operations working
- [ ] **WebSocket**: If applicable, connection established

### 3. Monitoring Services
- [ ] **Grafana**: http://localhost:3000 accessible
- [ ] **Prometheus**: http://localhost:9090 accessible
- [ ] **Kafka UI**: http://localhost:8081 accessible (if applicable)

## Common Issues & Solutions

### 1. CSS Build Failures
**Symptoms**: 0-byte CSS files, default browser styling
**Solutions**:
- Downgrade Tailwind CSS to 3.x
- Add proper PostCSS configuration
- Check npm dependencies for UI components

### 2. Port Mapping Issues
**Symptoms**: `net::ERR_EMPTY_RESPONSE`, container healthy but inaccessible
**Solutions**:
- Verify `docker-compose.yml` port mappings
- Check container service ports (Nginx serves on 80, not 5173)
- Restart containers after configuration changes

### 3. Authentication Blocking
**Symptoms**: Can't access application without login
**Solutions**:
- Implement development bypass for localhost
- Add authentication bypass for testing
- Configure proper routing for unauthenticated users

### 4. Database Migration Failures
**Symptoms**: PostgreSQL container fails to start
**Solutions**:
- Comment out problematic migration statements
- Test migrations in development first
- Use proper column references

## Post-Deployment Validation

### 1. Automated Testing
```bash
# Run the validation script
.agent-os/scripts/validate-deployment.sh

# Check all services are accessible
curl -I http://localhost:5173
curl -I http://localhost:8080/api/actuator/health
```

### 2. Manual Testing
- [ ] **Frontend UI**: All pages load with proper styling
- [ ] **Authentication**: Login/logout flow works
- [ ] **API Integration**: Frontend can communicate with backend
- [ ] **Database Operations**: CRUD operations working
- [ ] **Monitoring**: Dashboards accessible and showing data

### 3. Performance Validation
- [ ] **Page Load Times**: <3 seconds for initial load
- [ ] **API Response Times**: <500ms for simple operations
- [ ] **Memory Usage**: Containers not exceeding limits
- [ ] **CPU Usage**: Reasonable resource consumption

## Rollback Procedures

### 1. Quick Rollback
```bash
# Stop all services
docker-compose down

# Revert to previous version
git checkout HEAD~1

# Restart with previous configuration
docker-compose up -d
```

### 2. Database Rollback
```bash
# Restore database from backup
docker exec container-name pg_restore -U username -d database backup.sql

# Or reset to clean state
docker-compose down -v
docker-compose up -d postgres
```

## Documentation Requirements

### 1. Deployment Notes
- [ ] **Configuration Changes**: Document all changes made
- [ ] **Issues Encountered**: Record problems and solutions
- [ ] **Performance Metrics**: Baseline measurements
- [ ] **Dependencies**: List all versions used

### 2. Lessons Learned
- [ ] **Update Standards**: Add to `.agent-os/standards/`
- [ ] **Update Lessons**: Add to `.agent-os/lessons-learned/`
- [ ] **Update Scripts**: Improve validation scripts
- [ ] **Update Checklists**: Refine this checklist

## Emergency Procedures

### 1. Service Unavailable
```bash
# Check container status
docker-compose ps

# Check logs
docker-compose logs service-name

# Restart specific service
docker-compose restart service-name
```

### 2. Database Issues
```bash
# Check database logs
docker-compose logs postgres

# Access database directly
docker exec -it container-name psql -U username -d database
```

### 3. Frontend Issues
```bash
# Rebuild frontend
docker-compose build frontend --no-cache
docker-compose up -d frontend

# Check CSS build
docker exec container-name ls -la /usr/share/nginx/html/assets/
```

## References

- [Tech Stack Standards](../standards/tech-stack.md)
- [Deployment Issues Lessons](../lessons-learned/categories/deployment/deployment-issues.md)
- [Validation Script](../scripts/validate-deployment.sh)

**Last Updated**: 2025-01-27
**Project**: TappHA
**Status**: Active
