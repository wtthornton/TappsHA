# OAuth2 Redirection Issue Resolution Plan

## Problem Analysis

The application is still redirecting to Google OAuth despite:
- ✅ OAuth2 configuration commented out in application.yml
- ✅ OAuth2 dependency commented out in pom.xml
- ✅ OAuth2ClientAutoConfiguration excluded in main application
- ✅ SecurityAutoConfiguration excluded in main application

## Root Cause Analysis

The OAuth2 redirection is likely caused by one of these sources:

1. **Spring Boot OAuth2 Auto-configuration** - Some OAuth2 beans are still being auto-configured
2. **Cached Configuration** - Previous OAuth2 configuration is cached
3. **Environment Variables** - OAuth2 configuration in environment variables
4. **Spring Security Default Behavior** - Default security configuration redirecting to OAuth

## Solution Strategy

### Option 1: Complete OAuth2 Removal (Recommended)

1. **Remove OAuth2 dependency completely**
2. **Exclude all OAuth2 auto-configurations**
3. **Clear application cache**
4. **Test with minimal configuration**

### Option 2: Fresh Start Approach

1. **Create new branch** for basic authentication
2. **Start with minimal Spring Boot application**
3. **Add security configuration incrementally**
4. **Test each step before proceeding**

## Implementation Steps

### Step 1: Complete OAuth2 Removal

```bash
# 1. Stop all running processes
Get-Process | Where-Object {$_.ProcessName -like "*java*"} | Stop-Process -Force

# 2. Clear Maven cache
Remove-Item -Recurse -Force ~/.m2/repository/org/springframework/security/spring-security-oauth2-client -ErrorAction SilentlyContinue

# 3. Clean and rebuild
mvn clean compile -DskipTests

# 4. Start with debug logging
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dspring.profiles.active=dev -Dlogging.level.org.springframework.security=DEBUG -Dlogging.level.org.springframework.boot.autoconfigure=DEBUG"
```

### Step 2: Additional OAuth2 Exclusions

Update `TappHaApplication.java`:

```java
@SpringBootApplication(exclude = {
    OAuth2ClientAutoConfiguration.class,
    SecurityAutoConfiguration.class,
    // Add these if they exist in your Spring Boot version
    // OAuth2ClientRegistrationAutoConfiguration.class,
    // OAuth2ClientProperties.class
})
```

### Step 3: Environment Variable Check

```bash
# Check for OAuth2 environment variables
Get-ChildItem Env: | Where-Object {$_.Name -like "*OAUTH*" -or $_.Name -like "*GOOGLE*" -or $_.Name -like "*CLIENT*"}
```

### Step 4: Application Properties Override

Add to `application.yml`:

```yaml
spring:
  autoconfigure:
    exclude:
      - org.springframework.boot.autoconfigure.security.oauth2.client.OAuth2ClientAutoConfiguration
      - org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration
  security:
    oauth2:
      client:
        registration: {}  # Empty registration to override any defaults
```

### Step 5: Test with Minimal Configuration

1. **Start application** with security completely disabled
2. **Test basic endpoints** work without OAuth2 redirection
3. **Gradually enable security** features
4. **Test authentication** step by step

## Verification Steps

Once the application starts without OAuth2 redirection:

```bash
# Test basic endpoint (should work without authentication)
Invoke-WebRequest -Uri "http://localhost:8080/api/test/health" -UseBasicParsing

# Test authentication endpoint
Invoke-WebRequest -Uri "http://localhost:8080/api/v1/auth/me" -Headers @{Authorization="Basic YWRtaW46YWRtaW4xMjM="}

# Test protected endpoint
Invoke-WebRequest -Uri "http://localhost:8080/api/v1/homeassistant/connections" -Headers @{Authorization="Basic YWRtaW46YWRtaW4xMjM="}
```

## Expected Results

After successful implementation:

1. **Application starts** without OAuth2 redirection
2. **Basic endpoints** respond correctly
3. **Authentication endpoints** work with username/password
4. **Protected endpoints** require authentication
5. **Default users** are created automatically

## Fallback Plan

If OAuth2 redirection persists:

1. **Create new branch** for basic authentication
2. **Start with minimal Spring Boot application**
3. **Add security configuration incrementally**
4. **Test each step before proceeding**
5. **Migrate existing functionality** to new configuration

## Commands to Execute

```bash
# Navigate to backend directory
cd backend

# Stop all processes
Get-Process | Where-Object {$_.ProcessName -like "*java*"} | Stop-Process -Force

# Clear OAuth2 cache
Remove-Item -Recurse -Force ~/.m2/repository/org/springframework/security/spring-security-oauth2-client -ErrorAction SilentlyContinue

# Clean and compile
mvn clean compile -DskipTests

# Start with debug logging
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dspring.profiles.active=dev -Dlogging.level.org.springframework.security=DEBUG -Dlogging.level.org.springframework.boot.autoconfigure=DEBUG"

# Test endpoints
Start-Sleep -Seconds 20
Invoke-WebRequest -Uri "http://localhost:8080/api/test/health" -UseBasicParsing
Invoke-WebRequest -Uri "http://localhost:8080/api/v1/auth/me" -Headers @{Authorization="Basic YWRtaW46YWRtaW4xMjM="}
```

## Success Criteria

- ✅ Application starts without OAuth2 redirection
- ✅ Basic endpoints respond with 200 OK
- ✅ Authentication endpoints work with username/password
- ✅ Protected endpoints require authentication
- ✅ Default users are created automatically

