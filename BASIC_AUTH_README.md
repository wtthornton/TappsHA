# Basic Authentication Setup

This document describes the basic username/password authentication implementation that replaces the OAuth2 authentication system.

## Overview

The application now uses basic HTTP authentication instead of OAuth2 for simplified development and testing. This implementation maintains compatibility with existing OAuth2User-based code by using a custom authentication provider.

## Default Users

The application automatically creates two default users on startup:

- **Username**: `admin`
- **Password**: `admin123`
- **Email**: `admin@tappha.local`
- **Roles**: `ADMIN`

- **Username**: `user`
- **Password**: `user123`
- **Email**: `user@tappha.local`
- **Roles**: `USER`

## Authentication Flow

1. **Basic HTTP Authentication**: Users authenticate using standard HTTP Basic Auth
2. **Custom Authentication Provider**: Converts UserDetails to CustomUserPrincipal for OAuth2User compatibility
3. **Database-Backed Users**: User information is stored in PostgreSQL database
4. **Password Encryption**: Passwords are encrypted using BCrypt

## API Endpoints

### Authentication Endpoints

- `GET /api/v1/auth/me` - Get current user information
- `POST /api/v1/auth/register` - Create a new user account
- `GET /api/v1/auth/health` - Health check endpoint

### Home Assistant Endpoints

All existing Home Assistant endpoints remain the same and work with the new authentication system:

- `POST /api/v1/home-assistant/connect` - Connect to Home Assistant
- `GET /api/v1/home-assistant/connections` - Get user connections
- `GET /api/v1/home-assistant/connections/{id}/status` - Get connection status
- `POST /api/v1/home-assistant/connections/{id}/test` - Test connection
- `DELETE /api/v1/home-assistant/connections/{id}` - Disconnect
- `GET /api/v1/home-assistant/connections/{id}/events` - Get events
- `GET /api/v1/home-assistant/connections/{id}/metrics` - Get metrics

## Testing Authentication

### Using curl

```bash
# Get current user info (requires authentication)
curl -u admin:admin123 http://localhost:8080/api/v1/auth/me

# Register a new user
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'

# Connect to Home Assistant (requires authentication)
curl -u admin:admin123 -X POST http://localhost:8080/api/v1/home-assistant/connect \
  -H "Content-Type: application/json" \
  -d '{
    "url": "http://localhost:8123",
    "token": "your-home-assistant-token",
    "connectionName": "My Home Assistant"
  }'
```

### Using Postman

1. Set the Authorization type to "Basic Auth"
2. Enter username and password
3. All API requests will include the authentication headers

## Configuration Changes

### Commented Out OAuth2 Configuration

The following OAuth2 configuration has been commented out:

**application.yml:**
```yaml
# OAuth2 configuration - COMMENTED OUT for basic authentication
# security:
#   oauth2:
#     client:
#       registration:
#         google:
#           client-id: ${GOOGLE_CLIENT_ID}
#           client-secret: ${GOOGLE_CLIENT_SECRET}
#           scope:
#             - email
#             - profile
```

**pom.xml:**
```xml
<!-- OAuth2 client dependency - COMMENTED OUT for basic authentication
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-client</artifactId>
</dependency>
-->
```

## New Components

### Security Configuration

- `SecurityConfig.java` - Main security configuration with basic authentication
- `CustomUserPrincipal.java` - Custom principal that implements OAuth2User interface
- `CustomAuthenticationProvider.java` - Authentication provider for basic auth

### User Management

- `UserService.java` - Service for user management operations
- `UserInitializationConfig.java` - Initializes default users on startup
- `AuthController.java` - Authentication endpoints

## Database Schema

The User entity includes:

- `id` (UUID) - Primary key
- `username` (String) - Unique username
- `email` (String) - Unique email address
- `password` (String) - BCrypt encrypted password
- `name` (String) - Display name
- `roles` (String) - Comma-separated roles
- `createdAt` (OffsetDateTime) - Creation timestamp
- `updatedAt` (OffsetDateTime) - Last update timestamp

## Security Features

- **Password Encryption**: BCrypt password hashing
- **Input Validation**: Comprehensive validation for all user inputs
- **CORS Configuration**: Proper CORS setup for frontend integration
- **CSRF Protection**: Disabled for API endpoints (enabled for forms if needed)
- **Role-Based Access**: Support for different user roles

## Migration from OAuth2

The implementation maintains backward compatibility by:

1. **CustomUserPrincipal**: Implements OAuth2User interface
2. **Attribute Mapping**: Maps username to email attribute for existing code
3. **Authentication Principal**: Controllers still use @AuthenticationPrincipal OAuth2User
4. **Database Compatibility**: Existing user data structure is preserved

## Production Considerations

For production deployment, consider:

1. **Strong Passwords**: Enforce password complexity requirements
2. **Rate Limiting**: Implement rate limiting on authentication endpoints
3. **Session Management**: Configure proper session timeouts
4. **HTTPS**: Ensure all communications use HTTPS
5. **Audit Logging**: Implement comprehensive audit logging
6. **User Management**: Add user management interfaces
7. **Password Reset**: Implement password reset functionality

## Troubleshooting

### Common Issues

1. **Authentication Failed**: Check username/password combination
2. **User Not Found**: Ensure user exists in database
3. **Database Connection**: Verify PostgreSQL connection
4. **CORS Issues**: Check CORS configuration for frontend integration

### Logs

Check application logs for authentication-related messages:

```bash
# View application logs
tail -f logs/application.log | grep -i auth
```

## Next Steps

1. **Frontend Integration**: Update frontend to use basic authentication
2. **User Management UI**: Create user management interface
3. **Password Reset**: Implement password reset functionality
4. **Advanced Security**: Add additional security features as needed
