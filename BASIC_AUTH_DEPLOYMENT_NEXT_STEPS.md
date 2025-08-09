# Basic Authentication Deployment - Next Steps

## Current Status

✅ **Completed:**
- OAuth2 configuration commented out
- Basic authentication implementation created
- Custom user principal and authentication provider implemented
- User service and initialization configured
- Default users created (admin/admin123, user/user123)

❌ **Issue:** Application still redirects to Google OAuth

## Immediate Next Steps

### 1. **Debug OAuth2 Redirection Issue**

The application is still redirecting to Google OAuth despite our changes. This suggests there might be:

- **Environment variables** with OAuth2 configuration
- **Spring Boot auto-configuration** that's still active
- **Cached configuration** from previous runs
- **Other OAuth2-related beans** that need to be excluded

### 2. **Testing Strategy**

#### Option A: Complete OAuth2 Removal
```bash
# 1. Stop all running processes
Get-Process | Where-Object {$_.ProcessName -like "*java*"} | Stop-Process -Force

# 2. Clear any cached configuration
Remove-Item -Recurse -Force target/classes/com/tappha/homeassistant/config/SecurityConfig.class -ErrorAction SilentlyContinue

# 3. Start with minimal configuration
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dspring.profiles.active=dev -Dlogging.level.org.springframework.security=DEBUG"
```

#### Option B: Gradual Security Enablement
1. Start with security completely disabled
2. Test basic endpoints work
3. Gradually enable security features
4. Test authentication step by step

### 3. **Alternative Approach: Fresh Start**

If the OAuth2 issue persists, consider:

1. **Create a new branch** for basic authentication
2. **Start with minimal Spring Boot application**
3. **Add security configuration incrementally**
4. **Test each step before proceeding**

### 4. **Verification Steps**

Once the application starts without OAuth2 redirection:

```bash
# Test basic endpoint (should work without authentication)
curl http://localhost:8080/api/test/health

# Test authentication endpoint
curl -u admin:admin123 http://localhost:8080/api/v1/auth/me

# Test protected endpoint
curl -u admin:admin123 http://localhost:8080/api/v1/homeassistant/connections
```

### 5. **Frontend Integration**

After backend authentication is working:

1. **Update frontend authentication service** to use basic auth
2. **Remove OAuth2-related frontend code**
3. **Test login flow** with username/password
4. **Update API calls** to include basic auth headers

### 6. **Production Deployment**

Once testing is complete:

1. **Update Docker configuration** for basic auth
2. **Configure environment variables** for production users
3. **Update documentation** with new authentication method
4. **Test deployment** in staging environment

## Files Modified

### Backend Files Created/Modified:
- `SecurityConfig.java` - Basic authentication configuration
- `CustomUserPrincipal.java` - Custom user principal
- `CustomAuthenticationProvider.java` - Authentication provider
- `UserService.java` - User management service
- `AuthController.java` - Authentication endpoints
- `UserInitializationConfig.java` - User initialization
- `application.yml` - OAuth2 configuration commented out
- `pom.xml` - OAuth2 dependency commented out

### Documentation:
- `BASIC_AUTH_README.md` - Basic authentication documentation
- `BASIC_AUTH_DEPLOYMENT_NEXT_STEPS.md` - This file

## Commands to Run

```bash
# Navigate to backend directory
cd backend

# Stop any running processes
Get-Process | Where-Object {$_.ProcessName -like "*java*"} | Stop-Process -Force

# Clean and compile
mvn clean compile -DskipTests

# Start application with debug logging
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dspring.profiles.active=dev -Dlogging.level.org.springframework.security=DEBUG"

# Test endpoints
Invoke-WebRequest -Uri "http://localhost:8080/api/test/health" -UseBasicParsing
Invoke-WebRequest -Uri "http://localhost:8080/api/v1/auth/me" -Headers @{Authorization="Basic YWRtaW46YWRtaW4xMjM="}
```

## Expected Results

After successful deployment:

1. **Application starts** without OAuth2 redirection
2. **Basic endpoints** respond correctly
3. **Authentication endpoints** work with username/password
4. **Protected endpoints** require authentication
5. **Default users** are created automatically

## Troubleshooting

If OAuth2 redirection persists:

1. **Check environment variables** for OAuth2 configuration
2. **Review Spring Boot auto-configuration** logs
3. **Exclude additional OAuth2 auto-configurations**
4. **Consider creating minimal test application** to isolate the issue

