# Basic Authentication Only Specification

## 📋 **Overview**

This specification defines the complete removal of OAuth2 support and implementation of basic username/password authentication only for the TappHA application.

## 🎯 **Objective**

- **Remove all OAuth2 dependencies and configurations**
- **Implement basic HTTP authentication only**
- **Update roadmap and product documentation**
- **Ensure clean, secure authentication system**

## 🔧 **Technical Requirements**

### 1. **Backend Changes**

#### 1.1 **Dependencies Removal**
- Remove `spring-boot-starter-oauth2-client` from `pom.xml`
- Remove all OAuth2-related imports and classes
- Remove OAuth2 configuration from `application.yml`

#### 1.2 **Security Configuration**
- Implement pure HTTP Basic authentication
- Remove all OAuth2-related security configurations
- Update `SecurityConfig.java` to use only basic auth
- Remove `CustomOAuth2User` and related OAuth2 compatibility classes

#### 1.3 **Controller Updates**
- Update all controllers to use `UserDetails` instead of `OAuth2User`
- Remove OAuth2-specific authentication logic
- Implement proper basic authentication endpoints

#### 1.4 **Service Layer Updates**
- Update all services to work with basic authentication
- Remove OAuth2-specific service methods
- Implement proper user management with basic auth

### 2. **Frontend Changes**

#### 2.1 **Authentication Service**
- Remove OAuth2 authentication logic
- Implement basic authentication service
- Update login/logout flows
- Handle basic auth headers properly

#### 2.2 **UI Components**
- Update login forms to use username/password
- Remove OAuth2-specific UI components
- Implement proper error handling for basic auth

### 3. **Configuration Updates**

#### 3.1 **Environment Variables**
- Remove OAuth2-related environment variables
- Update configuration documentation
- Clean up unused configuration properties

#### 3.2 **Documentation Updates**
- Update API documentation
- Update deployment guides
- Update security documentation

## 📁 **File Changes Required**

### Backend Files to Modify

1. **`backend/pom.xml`**
   - Remove OAuth2 client dependency
   - Clean up unused dependencies

2. **`backend/src/main/resources/application.yml`**
   - Remove OAuth2 configuration section
   - Update security configuration

3. **`backend/src/main/java/com/tappha/homeassistant/TappHaApplication.java`**
   - Remove OAuth2 auto-configuration exclusions
   - Clean up main application class

4. **`backend/src/main/java/com/tappha/homeassistant/config/SecurityConfig.java`**
   - Implement pure basic authentication
   - Remove OAuth2-related configurations

5. **`backend/src/main/java/com/tappha/homeassistant/security/CustomOAuth2User.java`**
   - **DELETE** - No longer needed

6. **`backend/src/main/java/com/tappha/homeassistant/security/CustomUserPrincipal.java`**
   - Update to implement `UserDetails` only
   - Remove OAuth2 compatibility

7. **`backend/src/main/java/com/tappha/homeassistant/security/CustomAuthenticationProvider.java`**
   - Simplify to basic authentication only
   - Remove OAuth2-specific logic

8. **`backend/src/main/java/com/tappha/homeassistant/controller/AuthController.java`**
   - Update to use basic authentication
   - Remove OAuth2-specific endpoints

9. **All other controllers and services**
   - Update to use `UserDetails` instead of `OAuth2User`
   - Remove OAuth2-specific logic

### Frontend Files to Modify

1. **`frontend/src/contexts/AuthContext.tsx`**
   - Remove OAuth2 authentication logic
   - Implement basic authentication context

2. **`frontend/src/services/api/auth.ts`**
   - Update to use basic authentication
   - Remove OAuth2-specific API calls

3. **`frontend/src/components/`**
   - Update login components
   - Remove OAuth2-specific UI elements

### Documentation Files to Update

1. **`.agent-os/product/roadmap.md`**
   - Update authentication strategy
   - Remove OAuth2 references

2. **`README.md`**
   - Update authentication documentation
   - Remove OAuth2 setup instructions

3. **`BASIC_AUTH_README.md`**
   - Update to reflect OAuth2 removal
   - Clean up documentation

## 🔄 **Implementation Steps**

### Phase 1: Backend Cleanup
1. Remove OAuth2 dependencies from `pom.xml`
2. Clean up `application.yml` configuration
3. Update `TappHaApplication.java`
4. Implement pure basic authentication in `SecurityConfig.java`
5. Delete OAuth2-specific classes
6. Update all controllers and services

### Phase 2: Frontend Cleanup
1. Update authentication context
2. Update API services
3. Update UI components
4. Remove OAuth2-specific code

### Phase 3: Documentation Updates
1. Update roadmap
2. Update README files
3. Update API documentation
4. Update deployment guides

### Phase 4: Testing and Validation
1. Test basic authentication
2. Verify all endpoints work
3. Test frontend integration
4. Validate security configuration

## ✅ **Success Criteria**

- [ ] All OAuth2 dependencies removed
- [ ] Basic authentication working properly
- [ ] All endpoints accessible with basic auth
- [ ] Frontend updated to use basic auth
- [ ] Documentation updated
- [ ] No OAuth2 redirection issues
- [ ] Clean, secure authentication system

## 🚀 **Deployment Strategy**

1. **Development Environment**
   - Test basic authentication locally
   - Verify all functionality works
   - Update documentation

2. **Production Deployment**
   - Deploy updated application
   - Test authentication in production
   - Monitor for any issues

## 📊 **Risk Assessment**

- **Low Risk**: Basic authentication is well-established
- **Medium Risk**: Breaking changes to authentication system
- **Mitigation**: Comprehensive testing and gradual rollout

## 🎯 **Timeline**

- **Phase 1**: 2-3 hours (Backend cleanup)
- **Phase 2**: 1-2 hours (Frontend cleanup)
- **Phase 3**: 1 hour (Documentation updates)
- **Phase 4**: 1-2 hours (Testing and validation)

**Total Estimated Time**: 5-8 hours
