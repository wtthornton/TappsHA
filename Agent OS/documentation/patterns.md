# Agent OS Pattern Library

> **Proven development patterns that accelerate your coding and improve quality**

The Agent OS Pattern Library contains battle-tested development patterns that have been refined through real-world projects. These patterns help you write better code faster, avoid common pitfalls, and maintain high quality standards.

## 🎯 Pattern Categories

### **Frontend Patterns** - Modern, responsive, and performant UI components
### **Backend Patterns** - Scalable, secure, and maintainable server-side code
### **Database Patterns** - Efficient data access and optimization strategies
### **Testing Patterns** - Comprehensive testing approaches for all scenarios
### **Security Patterns** - Built-in security best practices and validation
### **Performance Patterns** - Optimization strategies for speed and efficiency

---

## 🎨 Frontend Patterns

### React Component Patterns

#### **Smart Component Pattern**
```typescript
// Agent OS Pattern: Smart Component with Error Boundaries
import React, { useState, useEffect } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useApi } from '@/hooks/useApi';

interface UserProfileProps {
  userId: string;
  onUpdate?: (user: User) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ userId, onUpdate }) => {
  const { data: user, loading, error, refetch } = useApi(`/api/users/${userId}`);
  const [isEditing, setIsEditing] = useState(false);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBoundary error={error} onRetry={refetch} />;

  return (
    <div className="user-profile">
      {/* Component content */}
    </div>
  );
};
```

**Benefits**: Built-in error handling, loading states, and retry mechanisms

#### **Form Pattern with Validation**
```typescript
// Agent OS Pattern: Form with Comprehensive Validation
import { useForm } from '@/hooks/useForm';
import { validationSchema } from '@/schemas/userSchema';

export const UserForm: React.FC = () => {
  const { form, errors, handleSubmit, isSubmitting } = useForm({
    initialValues: { name: '', email: '', role: 'user' },
    validationSchema,
    onSubmit: async (values) => {
      // Form submission logic
    }
  });

  return (
    <form onSubmit={handleSubmit}>
      <Input
        name="name"
        value={form.name}
        error={errors.name}
        placeholder="Full Name"
      />
      {/* More form fields */}
    </form>
  );
};
```

**Benefits**: Automatic validation, error handling, and form state management

### Vue.js Patterns

#### **Composable Pattern**
```typescript
// Agent OS Pattern: Reusable Composable with TypeScript
import { ref, computed, watch } from 'vue';
import type { Ref } from 'vue';

export function useUserManagement() {
  const users: Ref<User[]> = ref([]);
  const selectedUser: Ref<User | null> = ref(null);
  const isLoading = ref(false);

  const activeUsers = computed(() => 
    users.value.filter(user => user.status === 'active')
  );

  const fetchUsers = async () => {
    isLoading.value = true;
    try {
      users.value = await api.getUsers();
    } catch (error) {
      handleError(error);
    } finally {
      isLoading.value = false;
    }
  };

  return {
    users: readonly(users),
    selectedUser: readonly(selectedUser),
    isLoading: readonly(isLoading),
    activeUsers,
    fetchUsers,
    selectUser: (user: User) => selectedUser.value = user
  };
}
```

**Benefits**: Type-safe, reusable logic with proper error handling

---

## ⚙️ Backend Patterns

### Spring Boot Patterns

#### **Service Layer Pattern**
```java
// Agent OS Pattern: Service with Comprehensive Error Handling
@Service
@Transactional
@Slf4j
public class UserService {
    
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final AuditService auditService;
    
    public UserService(UserRepository userRepository, 
                      EmailService emailService,
                      AuditService auditService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.auditService = auditService;
    }
    
    public UserDto createUser(CreateUserRequest request) {
        try {
            // Validate request
            validateCreateUserRequest(request);
            
            // Check for existing user
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new UserAlreadyExistsException("User with email already exists");
            }
            
            // Create user
            User user = User.builder()
                .email(request.getEmail())
                .name(request.getName())
                .role(Role.USER)
                .status(UserStatus.PENDING_VERIFICATION)
                .build();
            
            User savedUser = userRepository.save(user);
            
            // Send verification email
            emailService.sendVerificationEmail(savedUser);
            
            // Audit the action
            auditService.logUserCreation(savedUser.getId(), request.getRequestedBy());
            
            return UserMapper.toDto(savedUser);
            
        } catch (Exception e) {
            log.error("Failed to create user: {}", request.getEmail(), e);
            throw new UserCreationException("Failed to create user", e);
        }
    }
    
    private void validateCreateUserRequest(CreateUserRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request cannot be null");
        }
        if (StringUtils.isBlank(request.getEmail())) {
            throw new IllegalArgumentException("Email is required");
        }
        if (!EmailValidator.isValid(request.getEmail())) {
            throw new IllegalArgumentException("Invalid email format");
        }
    }
}
```

**Benefits**: Comprehensive error handling, validation, auditing, and logging

#### **Repository Pattern with Performance Optimization**
```java
// Agent OS Pattern: Repository with Performance Optimization
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    
    // Optimized query with proper indexing
    @Query("SELECT u FROM User u " +
           "LEFT JOIN FETCH u.profile " +
           "LEFT JOIN FETCH u.roles " +
           "WHERE u.status = :status " +
           "AND u.createdAt >= :since")
    Page<User> findActiveUsersSince(
        @Param("status") UserStatus status,
        @Param("since") LocalDateTime since,
        Pageable pageable
    );
    
    // Custom query for complex business logic
    @Query("SELECT u FROM User u " +
           "WHERE u.email = :email " +
           "AND u.status != 'DELETED'")
    Optional<User> findByEmailIgnoreDeleted(@Param("email") String email);
    
    // Native query for performance-critical operations
    @Query(value = "SELECT u.id, u.email, u.name, u.status " +
                   "FROM users u " +
                   "WHERE u.organization_id = :orgId " +
                   "AND u.status = 'ACTIVE' " +
                   "ORDER BY u.last_login_at DESC " +
                   "LIMIT :limit",
           nativeQuery = true)
    List<UserSummary> findActiveUsersByOrganization(
        @Param("orgId") UUID orgId,
        @Param("limit") int limit
    );
    
    // Statistical methods for analytics
    @Query("SELECT COUNT(u) FROM User u WHERE u.status = :status")
    long countByStatus(@Param("status") UserStatus status);
    
    @Query("SELECT u.organization.id, COUNT(u) " +
           "FROM User u " +
           "GROUP BY u.organization.id " +
           "HAVING COUNT(u) > :minUsers")
    List<Object[]> findOrganizationsWithMinUsers(@Param("minUsers") long minUsers);
}
```

**Benefits**: Optimized queries, proper indexing, and statistical analysis capabilities

### Node.js/Express Patterns

#### **Middleware Pattern with Error Handling**
```typescript
// Agent OS Pattern: Middleware with Comprehensive Error Handling
import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';
import { ApiError } from '@/utils/ApiError';
import { rateLimiter } from '@/middleware/rateLimiter';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Unhandled error:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    userId: req.user?.id,
    timestamp: new Date().toISOString()
  });

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      code: error.code,
      timestamp: new Date().toISOString()
    });
  }

  // Handle specific error types
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: error.message,
      timestamp: new Date().toISOString()
    });
  }

  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized access',
      timestamp: new Date().toISOString()
    });
  }

  // Default error response
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    timestamp: new Date().toISOString()
  });
};

// Rate limiting middleware
export const rateLimitMiddleware = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});
```

**Benefits**: Centralized error handling, rate limiting, and comprehensive logging

---

## 🗄️ Database Patterns

### Entity Design Patterns

#### **Base Entity Pattern**
```java
// Agent OS Pattern: Base Entity with Audit Trail
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @CreatedBy
    @Column(name = "created_by", updatable = false)
    private String createdBy;
    
    @LastModifiedBy
    @Column(name = "updated_by")
    private String updatedBy;
    
    @Version
    @Column(name = "version")
    private Long version;
    
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
    
    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;
    
    // Soft delete method
    public void softDelete() {
        this.isDeleted = true;
        this.deletedAt = LocalDateTime.now();
    }
    
    // Restore method
    public void restore() {
        this.isDeleted = false;
        this.deletedAt = null;
    }
    
    // Getters and setters
    // ... (implement all getters and setters)
}
```

**Benefits**: Consistent audit trail, soft delete support, and optimistic locking

#### **Audit Trail Pattern**
```java
// Agent OS Pattern: Comprehensive Audit Trail
@Entity
@Table(name = "audit_logs")
public class AuditLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "action_type", nullable = false)
    private AuditActionType actionType;
    
    @Column(name = "entity_type", nullable = false)
    private String entityType;
    
    @Column(name = "entity_id", nullable = false)
    private String entityId;
    
    @Column(name = "user_id")
    private String userId;
    
    @Column(name = "user_email")
    private String userEmail;
    
    @Column(name = "ip_address")
    private String ipAddress;
    
    @Column(name = "user_agent")
    private String userAgent;
    
    @Column(name = "old_values", columnDefinition = "TEXT")
    private String oldValues;
    
    @Column(name = "new_values", columnDefinition = "TEXT")
    private String newValues;
    
    @Column(name = "metadata", columnDefinition = "TEXT")
    private String metadata;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    // Audit log creation helper
    public static AuditLog create(
        AuditActionType actionType,
        String entityType,
        String entityId,
        String userId,
        String userEmail,
        String ipAddress,
        String userAgent,
        Object oldValues,
        Object newValues,
        Map<String, Object> metadata
    ) {
        AuditLog log = new AuditLog();
        log.actionType = actionType;
        log.entityType = entityType;
        log.entityId = entityId;
        log.userId = userId;
        log.userEmail = userEmail;
        log.ipAddress = ipAddress;
        log.userAgent = userAgent;
        log.oldValues = oldValues != null ? JsonUtils.toJson(oldValues) : null;
        log.newValues = newValues != null ? JsonUtils.toJson(newValues) : null;
        log.metadata = metadata != null ? JsonUtils.toJson(metadata) : null;
        return log;
    }
}
```

**Benefits**: Complete audit trail, compliance support, and debugging capabilities

---

## 🧪 Testing Patterns

### Unit Testing Patterns

#### **Service Testing Pattern**
```typescript
// Agent OS Pattern: Comprehensive Service Testing
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from '@/services/UserService';
import { UserRepository } from '@/repositories/UserRepository';
import { EmailService } from '@/services/EmailService';
import { createMockUser, createMockCreateUserRequest } from '@/test/factories';

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: vi.Mocked<UserRepository>;
  let mockEmailService: vi.Mocked<EmailService>;

  beforeEach(() => {
    mockUserRepository = {
      existsByEmail: vi.fn(),
      save: vi.fn(),
      findById: vi.fn(),
      findByEmail: vi.fn(),
      delete: vi.fn(),
    } as any;

    mockEmailService = {
      sendVerificationEmail: vi.fn(),
      sendPasswordResetEmail: vi.fn(),
      sendWelcomeEmail: vi.fn(),
    } as any;

    userService = new UserService(mockUserRepository, mockEmailService);
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      // Arrange
      const request = createMockCreateUserRequest();
      const mockUser = createMockUser();
      
      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockEmailService.sendVerificationEmail.mockResolvedValue(undefined);

      // Act
      const result = await userService.createUser(request);

      // Assert
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        status: 'PENDING_VERIFICATION'
      });
      
      expect(mockUserRepository.existsByEmail).toHaveBeenCalledWith(request.email);
      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          email: request.email,
          name: request.name,
          status: 'PENDING_VERIFICATION'
        })
      );
      expect(mockEmailService.sendVerificationEmail).toHaveBeenCalledWith(mockUser);
    });

    it('should throw error if user already exists', async () => {
      // Arrange
      const request = createMockCreateUserRequest();
      mockUserRepository.existsByEmail.mockResolvedValue(true);

      // Act & Assert
      await expect(userService.createUser(request))
        .rejects
        .toThrow('User with email already exists');
      
      expect(mockUserRepository.save).not.toHaveBeenCalled();
      expect(mockEmailService.sendVerificationEmail).not.toHaveBeenCalled();
    });

    it('should handle validation errors', async () => {
      // Arrange
      const request = createMockCreateUserRequest({ email: 'invalid-email' });

      // Act & Assert
      await expect(userService.createUser(request))
        .rejects
        .toThrow('Invalid email format');
    });
  });

  describe('getUserById', () => {
    it('should return user if found', async () => {
      // Arrange
      const userId = 'user-123';
      const mockUser = createMockUser({ id: userId });
      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Act
      const result = await userService.getUserById(userId);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    });

    it('should throw error if user not found', async () => {
      // Arrange
      const userId = 'user-123';
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.getUserById(userId))
        .rejects
        .toThrow('User not found');
    });
  });
});
```

**Benefits**: Comprehensive test coverage, clear arrange-act-assert pattern, and proper mocking

---

## 🔒 Security Patterns

### Authentication & Authorization

#### **JWT Token Pattern**
```typescript
// Agent OS Pattern: Secure JWT Implementation
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import { randomBytes } from 'crypto';

export class JwtService {
  private readonly secret: string;
  private readonly algorithm: string = 'HS256';
  private readonly expiresIn: string = '15m';
  private readonly refreshExpiresIn: string = '7d';

  constructor() {
    this.secret = process.env.JWT_SECRET || randomBytes(64).toString('hex');
  }

  async generateToken(payload: TokenPayload): Promise<string> {
    const sign = promisify(jwt.sign);
    
    return sign(payload, this.secret, {
      algorithm: this.algorithm,
      expiresIn: this.expiresIn,
      issuer: 'agent-os',
      audience: 'agent-os-users',
      subject: payload.userId,
      jwtid: randomBytes(16).toString('hex')
    });
  }

  async generateRefreshToken(payload: TokenPayload): Promise<string> {
    const sign = promisify(jwt.sign);
    
    return sign(payload, this.secret, {
      algorithm: this.algorithm,
      expiresIn: this.refreshExpiresIn,
      issuer: 'agent-os',
      audience: 'agent-os-refresh',
      subject: payload.userId,
      jwtid: randomBytes(16).toString('hex')
    });
  }

  async verifyToken(token: string): Promise<TokenPayload> {
    const verify = promisify(jwt.verify);
    
    try {
      const decoded = await verify(token, this.secret, {
        algorithms: [this.algorithm],
        issuer: 'agent-os',
        audience: 'agent-os-users'
      });
      
      return decoded as TokenPayload;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token has expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      }
      throw error;
    }
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded = await this.verifyToken(refreshToken);
      
      // Generate new tokens
      const newAccessToken = await this.generateToken(decoded);
      const newRefreshToken = await this.generateRefreshToken(decoded);
      
      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
}

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
}
```

**Benefits**: Secure token generation, proper validation, and refresh token support

---

## ⚡ Performance Patterns

### Caching Patterns

#### **Redis Caching Pattern**
```typescript
// Agent OS Pattern: Redis Caching with Fallback
import Redis from 'ioredis';
import { logger } from '@/utils/logger';

export class CacheService {
  private redis: Redis;
  private readonly defaultTTL: number = 3600; // 1 hour

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      keepAlive: 30000,
    });

    this.redis.on('error', (error) => {
      logger.error('Redis connection error:', error);
    });

    this.redis.on('connect', () => {
      logger.info('Redis connected successfully');
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl: number = this.defaultTTL): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      await this.redis.setex(key, ttl, serializedValue);
    } catch (error) {
      logger.error('Cache set error:', error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      logger.error('Cache delete error:', error);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      logger.error('Cache pattern invalidation error:', error);
    }
  }

  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl: number = this.defaultTTL
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Generate value if not in cache
    const value = await factory();
    
    // Store in cache
    await this.set(key, value, ttl);
    
    return value;
  }

  // Cache warming for critical data
  async warmCache<T>(
    keys: string[],
    factory: (key: string) => Promise<T>,
    ttl: number = this.defaultTTL
  ): Promise<void> {
    const promises = keys.map(async (key) => {
      try {
        const value = await factory(key);
        await this.set(key, value, ttl);
      } catch (error) {
        logger.error(`Cache warming failed for key ${key}:`, error);
      }
    });

    await Promise.allSettled(promises);
  }
}
```

**Benefits**: Efficient caching, fallback handling, and cache warming capabilities

---

## 🚀 How to Use These Patterns

### 1. **Choose Your Pattern**
Browse the pattern library and identify patterns that match your needs:
- **Frontend**: UI components, forms, state management
- **Backend**: Services, repositories, middleware
- **Database**: Entities, queries, optimization
- **Testing**: Unit tests, integration tests, mocks
- **Security**: Authentication, authorization, validation
- **Performance**: Caching, optimization, monitoring

### 2. **Apply the Pattern**
Copy the pattern code and adapt it to your project:
```bash
# Generate pattern template
npm run pattern:generate --type=service --name=UserService

# Apply pattern to existing code
npm run pattern:apply --type=repository --file=src/repositories/UserRepository.ts
```

### 3. **Customize for Your Stack**
Modify patterns to work with your specific technology stack:
```bash
# Configure for your stack
npm run config:set --stack=react-typescript-spring-boot

# Generate stack-specific patterns
npm run pattern:customize --stack=react-typescript-spring-boot
```

### 4. **Validate Implementation**
Ensure your implementation follows Agent OS quality standards:
```bash
# Run quality checks
npm run quality:check

# Validate against standards
npm run standard:validate --type=service

# Run performance tests
npm run performance:test
```

---

## 📚 Pattern Development

### Contributing New Patterns

We encourage you to contribute your own proven patterns to the library:

1. **Identify a Problem**: What development challenge does your pattern solve?
2. **Document the Solution**: Provide clear, working code examples
3. **Include Tests**: Show how to test the pattern implementation
4. **Add Benefits**: Explain why developers should use this pattern
5. **Submit PR**: Share your pattern with the community

### Pattern Validation

All patterns in the library are validated through:
- **Real-world Testing**: Used in production applications
- **Code Review**: Reviewed by experienced developers
- **Performance Analysis**: Tested for performance impact
- **Security Audit**: Verified for security best practices
- **Community Feedback**: Improved based on user experiences

---

## 🎯 Ready to Transform Your Code?

**These patterns are just the beginning. Agent OS provides hundreds of proven development patterns that can accelerate your coding and improve your quality.**

- **[Explore More Patterns](patterns/)**: Browse the complete pattern library
- **[Create Custom Patterns](patterns/custom.md)**: Build patterns for your specific needs
- **[Share Your Patterns](CONTRIBUTING.md)**: Contribute to the community
- **[Get Pattern Support](https://discord.gg/agent-os)**: Join our community for help

**Start using these patterns today and experience the Agent OS difference in your development process! 🚀**
