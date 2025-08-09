# Agent OS Best Practices

> **Proven development practices that ensure high-quality, maintainable, and scalable code**

Agent OS Best Practices are distilled from real-world development experience and designed to help developers write better code, avoid common pitfalls, and maintain high standards across all projects. These practices are technology-agnostic and can be applied to any development stack.

## 🎯 Core Development Principles

### **1. Quality-First Development**

#### **Write Tests First (TDD)**
```typescript
// ❌ Don't: Write code first, test later
export class UserService {
  createUser(userData: CreateUserRequest): User {
    // Implementation without tests
    return new User(userData);
  }
}

// ✅ Do: Write tests first, then implement
describe('UserService.createUser', () => {
  it('should create user with valid data', () => {
    // Arrange
    const userData = createMockUserData();
    const userService = new UserService();
    
    // Act
    const result = userService.createUser(userData);
    
    // Assert
    expect(result).toBeInstanceOf(User);
    expect(result.email).toBe(userData.email);
  });
});

export class UserService {
  createUser(userData: CreateUserRequest): User {
    // Implementation guided by tests
    return new User(userData);
  }
}
```

**Benefits**: 
- Catches bugs early
- Ensures code meets requirements
- Creates living documentation
- Improves code design

#### **Code Review Standards**
```typescript
// ❌ Don't: Skip code review
// Merge directly to main branch

// ✅ Do: Enforce code review process
// 1. Create feature branch
git checkout -b feature/user-management

// 2. Implement changes with tests
// 3. Run quality checks
npm run quality:check

// 4. Create pull request
// 5. Get approval from at least one reviewer
// 6. Merge after CI/CD passes
```

**Benefits**:
- Knowledge sharing across team
- Consistent code quality
- Early bug detection
- Learning opportunities

### **2. Security by Design**

#### **Input Validation**
```typescript
// ❌ Don't: Trust user input
export class UserController {
  createUser(req: Request, res: Response) {
    const user = req.body; // No validation
    userService.createUser(user);
  }
}

// ✅ Do: Validate all inputs
export class UserController {
  createUser(req: Request, res: Response) {
    try {
      // Validate input
      const userData = UserValidationSchema.parse(req.body);
      
      // Sanitize data
      const sanitizedData = this.sanitizeUserData(userData);
      
      // Process request
      const user = userService.createUser(sanitizedData);
      
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: 'Invalid input data' });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
  
  private sanitizeUserData(data: any): CreateUserRequest {
    return {
      name: DOMPurify.sanitize(data.name),
      email: data.email.toLowerCase().trim(),
      role: this.validateRole(data.role)
    };
  }
}
```

**Benefits**:
- Prevents injection attacks
- Ensures data integrity
- Reduces security vulnerabilities
- Improves user experience

#### **Authentication & Authorization**
```typescript
// ❌ Don't: Implement custom auth logic
function checkAccess(user: User, resource: string): boolean {
  // Custom, potentially insecure logic
  return user.role === 'admin' || user.id === resource.ownerId;
}

// ✅ Do: Use proven auth patterns
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'manager')
@Controller('users')
export class UserController {
  
  @Get(':id')
  @UseGuards(ResourceOwnershipGuard)
  async getUser(@Param('id') id: string, @CurrentUser() user: User) {
    // Resource ownership is automatically checked
    return this.userService.getUserById(id);
  }
}

// Resource ownership guard
@Injectable()
export class ResourceOwnershipGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const resourceId = request.params.id;
    
    // Check if user owns the resource or has admin access
    return user.role === 'admin' || 
           this.resourceService.isOwner(user.id, resourceId);
  }
}
```

**Benefits**:
- Consistent security implementation
- Reduced security bugs
- Easier security auditing
- Compliance with standards

---

## 🏗️ Architecture Best Practices

### **1. Clean Architecture**

#### **Separation of Concerns**
```typescript
// ❌ Don't: Mix business logic with presentation
export class UserController {
  async createUser(req: Request, res: Response) {
    // Business logic mixed with HTTP concerns
    const userData = req.body;
    
    // Validation logic
    if (!userData.email || !userData.name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Business rules
    if (userData.age < 18) {
      return res.status(400).json({ error: 'User must be 18 or older' });
    }
    
    // Data persistence
    const user = await User.create(userData);
    
    // Response formatting
    res.status(201).json({
      id: user.id,
      email: user.email,
      name: user.name
    });
  }
}

// ✅ Do: Separate concerns properly
export class UserController {
  constructor(
    private userService: UserService,
    private userValidator: UserValidator,
    private userMapper: UserMapper
  ) {}
  
  async createUser(req: Request, res: Response) {
    try {
      // 1. Validation (Input layer)
      const userData = this.userValidator.validate(req.body);
      
      // 2. Business logic (Service layer)
      const user = await this.userService.createUser(userData);
      
      // 3. Response formatting (Presentation layer)
      const response = this.userMapper.toResponse(user);
      res.status(201).json(response);
    } catch (error) {
      this.handleError(error, res);
    }
  }
}

// Service layer - pure business logic
export class UserService {
  async createUser(userData: CreateUserRequest): Promise<User> {
    // Business rules
    this.validateUserAge(userData.age);
    this.checkEmailAvailability(userData.email);
    
    // Create user
    const user = await this.userRepository.create(userData);
    
    // Business events
    await this.eventBus.publish(new UserCreatedEvent(user));
    
    return user;
  }
}
```

**Benefits**:
- Easier to test
- Better maintainability
- Clear responsibilities
- Easier to modify

#### **Dependency Injection**
```typescript
// ❌ Don't: Create dependencies directly
export class UserService {
  private userRepository = new UserRepository();
  private emailService = new EmailService();
  private logger = new Logger();
}

// ✅ Do: Use dependency injection
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private emailService: EmailService,
    private logger: Logger
  ) {}
}

// Configuration
@Module({
  providers: [
    UserService,
    UserRepository,
    EmailService,
    Logger
  ],
  exports: [UserService]
})
export class UserModule {}
```

**Benefits**:
- Easier testing with mocks
- Flexible configuration
- Better testability
- Loose coupling

### **2. API Design Best Practices**

#### **RESTful API Design**
```typescript
// ❌ Don't: Inconsistent API design
@Controller('api')
export class UserController {
  @Post('createUser')           // Inconsistent naming
  @Get('getUsers')              // Action-based URLs
  @Post('updateUser')           // Not RESTful
  
  @Post('deleteUser')           // Wrong HTTP method
  @Get('user/:id/process')      // Action in URL
}

// ✅ Do: Follow REST conventions
@Controller('api/users')
export class UserController {
  @Post()                       // POST /api/users
  async createUser(@Body() userData: CreateUserRequest) {}
  
  @Get()                        // GET /api/users
  async getUsers(@Query() query: UserQueryDto) {}
  
  @Get(':id')                   // GET /api/users/:id
  async getUser(@Param('id') id: string) {}
  
  @Put(':id')                   // PUT /api/users/:id
  async updateUser(@Param('id') id: string, @Body() userData: UpdateUserRequest) {}
  
  @Delete(':id')                // DELETE /api/users/:id
  async deleteUser(@Param('id') id: string) {}
}
```

**Benefits**:
- Consistent API design
- Better developer experience
- Easier to understand
- Standard HTTP semantics

#### **Error Handling**
```typescript
// ❌ Don't: Generic error responses
@Controller('users')
export class UserController {
  async getUser(@Param('id') id: string) {
    try {
      const user = await this.userService.getUserById(id);
      return user;
    } catch (error) {
      // Generic error handling
      throw new Error('Something went wrong');
    }
  }
}

// ✅ Do: Specific, actionable error responses
@Controller('users')
export class UserController {
  async getUser(@Param('id') id: string) {
    try {
      const user = await this.userService.getUserById(id);
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error('Failed to get user', { userId: id, error });
      throw new InternalServerErrorException('Failed to retrieve user');
    }
  }
}

// Global exception filter
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const message = exception.message;
      
      response.status(status).json({
        error: {
          code: status,
          message,
          timestamp: new Date().toISOString(),
          path: ctx.getRequest().url
        }
      });
    } else {
      response.status(500).json({
        error: {
          code: 500,
          message: 'Internal server error',
          timestamp: new Date().toISOString(),
          path: ctx.getRequest().url
        }
      });
    }
  }
}
```

**Benefits**:
- Better debugging
- Improved user experience
- Consistent error format
- Easier error handling

---

## 🧪 Testing Best Practices

### **1. Test Structure**

#### **Arrange-Act-Assert Pattern**
```typescript
// ❌ Don't: Mixed test structure
describe('UserService', () => {
  it('should create user', async () => {
    const userService = new UserService();
    const userData = { name: 'John', email: 'john@example.com' };
    
    const result = await userService.createUser(userData);
    
    expect(result.name).toBe('John');
    expect(result.email).toBe('john@example.com');
    
    // Additional assertions mixed in
    expect(mockRepository.save).toHaveBeenCalled();
    expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalled();
  });
});

// ✅ Do: Clear Arrange-Act-Assert structure
describe('UserService.createUser', () => {
  it('should create user successfully', async () => {
    // Arrange
    const userService = new UserService(mockRepository, mockEmailService);
    const userData = createMockUserData();
    const expectedUser = createMockUser(userData);
    
    mockRepository.save.mockResolvedValue(expectedUser);
    mockEmailService.sendWelcomeEmail.mockResolvedValue(undefined);
    
    // Act
    const result = await userService.createUser(userData);
    
    // Assert
    expect(result).toEqual(expectedUser);
    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining(userData)
    );
    expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalledWith(expectedUser);
  });
  
  it('should throw error if user already exists', async () => {
    // Arrange
    const userService = new UserService(mockRepository, mockEmailService);
    const userData = createMockUserData();
    
    mockRepository.existsByEmail.mockResolvedValue(true);
    
    // Act & Assert
    await expect(userService.createUser(userData))
      .rejects
      .toThrow('User with email already exists');
    
    expect(mockRepository.save).not.toHaveBeenCalled();
  });
});
```

**Benefits**:
- Clear test structure
- Easier to understand
- Better test maintenance
- Consistent test style

#### **Test Data Factories**
```typescript
// ❌ Don't: Hard-coded test data
describe('UserService', () => {
  it('should create user', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      age: 25,
      role: 'user'
    };
    // Test data scattered throughout tests
  });
});

// ✅ Do: Use test data factories
export class UserTestFactory {
  static createUserData(overrides: Partial<CreateUserRequest> = {}): CreateUserRequest {
    return {
      name: 'John Doe',
      email: 'john.doe@example.com',
      age: 25,
      role: 'user',
      ...overrides
    };
  }
  
  static createUser(overrides: Partial<User> = {}): User {
    return {
      id: 'user-123',
      name: 'John Doe',
      email: 'john.doe@example.com',
      age: 25,
      role: 'user',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      ...overrides
    };
  }
  
  static createUserList(count: number): User[] {
    return Array.from({ length: count }, (_, index) => 
      this.createUser({
        id: `user-${index + 1}`,
        name: `User ${index + 1}`,
        email: `user${index + 1}@example.com`
      })
    );
  }
}

// Usage in tests
describe('UserService.createUser', () => {
  it('should create user successfully', async () => {
    // Arrange
    const userData = UserTestFactory.createUserData();
    const expectedUser = UserTestFactory.createUser(userData);
    
    // ... rest of test
  });
  
  it('should handle validation errors', async () => {
    // Arrange
    const userData = UserTestFactory.createUserData({ 
      email: 'invalid-email' 
    });
    
    // ... rest of test
  });
});
```

**Benefits**:
- Consistent test data
- Easy to modify
- Reusable across tests
- Better test maintenance

### **2. Mocking Best Practices**

#### **Proper Mock Setup**
```typescript
// ❌ Don't: Incomplete mocking
describe('UserService', () => {
  let mockRepository: any;
  
  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn()
    };
  });
});

// ✅ Do: Complete, typed mocking
describe('UserService', () => {
  let mockRepository: jest.Mocked<UserRepository>;
  let mockEmailService: jest.Mocked<EmailService>;
  
  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      existsByEmail: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn()
    } as jest.Mocked<UserRepository>;
    
    mockEmailService = {
      sendWelcomeEmail: jest.fn(),
      sendPasswordResetEmail: jest.fn(),
      sendVerificationEmail: jest.fn()
    } as jest.Mocked<EmailService>;
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
});
```

**Benefits**:
- Type safety
- Complete mocking
- Better test reliability
- Easier debugging

---

## 🗄️ Database Best Practices

### **1. Entity Design**

#### **Proper JPA Annotations**
```java
// ❌ Don't: Missing important annotations
@Entity
public class User {
    private Long id;
    private String name;
    private String email;
    private Date createdAt;
    
    // Missing annotations, getters, setters
}

// ✅ Do: Complete entity with proper annotations
@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_users_email", columnList = "email", unique = true),
    @Index(name = "idx_users_created_at", columnList = "created_at")
})
public class User extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "name", nullable = false, length = 100)
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;
    
    @Column(name = "email", nullable = false, unique = true, length = 255)
    @Email(message = "Email must be valid")
    @NotBlank(message = "Email is required")
    private String email;
    
    @Column(name = "age")
    @Min(value = 18, message = "User must be at least 18 years old")
    @Max(value = 120, message = "User age cannot exceed 120")
    private Integer age;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private UserStatus status = UserStatus.PENDING_VERIFICATION;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserProfile> profiles = new ArrayList<>();
    
    // Business methods
    public void activate() {
        this.status = UserStatus.ACTIVE;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void deactivate() {
        this.status = UserStatus.INACTIVE;
        this.updatedAt = LocalDateTime.now();
    }
    
    public boolean isActive() {
        return UserStatus.ACTIVE.equals(this.status);
    }
    
    // Getters and setters
    // ... implement all getters and setters
}
```

**Benefits**:
- Data integrity
- Performance optimization
- Validation at entity level
- Clear business logic

#### **Repository Query Optimization**
```java
// ❌ Don't: N+1 query problems
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    List<User> findByStatus(UserStatus status);
    
    // This can cause N+1 queries
    List<User> findByOrganizationId(UUID organizationId);
}

// ✅ Do: Optimized queries with proper joins
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    
    // Optimized query with fetch joins
    @Query("SELECT DISTINCT u FROM User u " +
           "LEFT JOIN FETCH u.profiles " +
           "LEFT JOIN FETCH u.roles " +
           "WHERE u.status = :status")
    List<User> findByStatusWithProfilesAndRoles(@Param("status") UserStatus status);
    
    // Pagination with optimized queries
    @Query("SELECT u FROM User u " +
           "LEFT JOIN FETCH u.organization " +
           "WHERE u.organization.id = :organizationId " +
           "AND u.status = :status")
    Page<User> findByOrganizationIdAndStatus(
        @Param("organizationId") UUID organizationId,
        @Param("status") UserStatus status,
        Pageable pageable
    );
    
    // Native query for complex operations
    @Query(value = "SELECT u.id, u.name, u.email, u.status, " +
                   "COUNT(p.id) as profile_count " +
                   "FROM users u " +
                   "LEFT JOIN user_profiles p ON u.id = p.user_id " +
                   "WHERE u.organization_id = :orgId " +
                   "GROUP BY u.id, u.name, u.email, u.status " +
                   "HAVING COUNT(p.id) > :minProfiles",
           nativeQuery = true)
    List<UserSummary> findUsersWithProfileCount(
        @Param("orgId") UUID organizationId,
        @Param("minProfiles") long minProfiles
    );
    
    // Statistical queries
    @Query("SELECT u.status, COUNT(u) FROM User u GROUP BY u.status")
    List<Object[]> countUsersByStatus();
    
    @Query("SELECT u.organization.id, COUNT(u) " +
           "FROM User u " +
           "WHERE u.status = :status " +
           "GROUP BY u.organization.id " +
           "HAVING COUNT(u) > :minUsers")
    List<Object[]> findOrganizationsWithMinUsers(
        @Param("status") UserStatus status,
        @Param("minUsers") long minUsers
    );
}
```

**Benefits**:
- Better performance
- Reduced database calls
- Optimized data retrieval
- Statistical analysis capabilities

### **2. Migration Best Practices**

#### **Safe Database Migrations**
```sql
-- ❌ Don't: Destructive migrations
ALTER TABLE users DROP COLUMN old_field;
ALTER TABLE users RENAME TO new_users;

-- ✅ Do: Safe, reversible migrations
-- Migration: V001__add_user_profile_fields.sql

-- Add new columns (safe)
ALTER TABLE users ADD COLUMN profile_picture_url VARCHAR(500);
ALTER TABLE users ADD COLUMN bio TEXT;
ALTER TABLE users ADD COLUMN date_of_birth DATE;

-- Create indexes for performance
CREATE INDEX idx_users_profile_picture ON users(profile_picture_url);
CREATE INDEX idx_users_date_of_birth ON users(date_of_birth);

-- Migration: V002__migrate_old_profile_data.sql

-- Data migration (safe)
UPDATE users u 
SET profile_picture_url = p.picture_url,
    bio = p.bio,
    date_of_birth = p.date_of_birth
FROM user_profiles p 
WHERE u.id = p.user_id;

-- Migration: V003__remove_old_profile_table.sql

-- Remove old table after data migration (safe)
DROP TABLE user_profiles;
```

**Benefits**:
- Safe database evolution
- Data preservation
- Rollback capability
- Performance optimization

---

## 🚀 Performance Best Practices

### **1. Caching Strategies**

#### **Multi-Level Caching**
```typescript
// ❌ Don't: Single cache layer
export class UserService {
  async getUserById(id: string): Promise<User> {
    const cacheKey = `user:${id}`;
    let user = await this.cache.get(cacheKey);
    
    if (!user) {
      user = await this.userRepository.findById(id);
      await this.cache.set(cacheKey, user, 3600);
    }
    
    return user;
  }
}

// ✅ Do: Multi-level caching with fallbacks
export class UserService {
  async getUserById(id: string): Promise<User> {
    const cacheKey = `user:${id}`;
    
    // Level 1: Memory cache (fastest)
    let user = this.memoryCache.get(cacheKey);
    if (user) {
      return user;
    }
    
    // Level 2: Redis cache (fast)
    user = await this.redisCache.get(cacheKey);
    if (user) {
      this.memoryCache.set(cacheKey, user, 300); // 5 minutes
      return user;
    }
    
    // Level 3: Database (slowest)
    user = await this.userRepository.findById(id);
    if (user) {
      // Cache in both layers
      await this.redisCache.set(cacheKey, user, 3600); // 1 hour
      this.memoryCache.set(cacheKey, user, 300); // 5 minutes
    }
    
    return user;
  }
  
  async getUserByIds(ids: string[]): Promise<User[]> {
    // Batch cache operations
    const cacheKeys = ids.map(id => `user:${id}`);
    
    // Try memory cache first
    const memoryResults = this.memoryCache.mget(cacheKeys);
    const missingIds = ids.filter((_, index) => !memoryResults[index]);
    
    if (missingIds.length === 0) {
      return memoryResults;
    }
    
    // Try Redis cache for missing
    const redisResults = await this.redisCache.mget(
      missingIds.map(id => `user:${id}`)
    );
    
    // Fetch from database for remaining
    const dbUsers = await this.userRepository.findByIds(
      missingIds.filter((_, index) => !redisResults[index])
    );
    
    // Update caches
    await this.updateCaches(dbUsers);
    
    return this.mergeResults(ids, memoryResults, redisResults, dbUsers);
  }
}
```

**Benefits**:
- Faster response times
- Reduced database load
- Better user experience
- Scalable architecture

### **2. Database Query Optimization**

#### **Batch Operations**
```typescript
// ❌ Don't: N+1 queries
export class UserService {
  async getUsersWithProfiles(userIds: string[]): Promise<UserWithProfile[]> {
    const users = [];
    
    for (const userId of userIds) {
      const user = await this.userRepository.findById(userId);
      const profile = await this.profileRepository.findByUserId(userId);
      users.push({ ...user, profile });
    }
    
    return users;
  }
}

// ✅ Do: Batch operations with optimized queries
export class UserService {
  async getUsersWithProfiles(userIds: string[]): Promise<UserWithProfile[]> {
    // Single query with JOIN
    const usersWithProfiles = await this.userRepository
      .findByIdsWithProfiles(userIds);
    
    return usersWithProfiles;
  }
  
  async createUsers(users: CreateUserRequest[]): Promise<User[]> {
    // Batch insert
    const createdUsers = await this.userRepository.saveAll(users);
    
    // Batch email notifications
    const emailPromises = createdUsers.map(user => 
      this.emailService.sendWelcomeEmail(user)
    );
    
    // Send emails in parallel
    await Promise.all(emailPromises);
    
    return createdUsers;
  }
  
  async updateUsers(updates: UserUpdate[]): Promise<User[]> {
    // Batch update
    const updatePromises = updates.map(update =>
      this.userRepository.update(update.id, update.data)
    );
    
    return await Promise.all(updatePromises);
  }
}
```

**Benefits**:
- Reduced database calls
- Better performance
- Improved scalability
- Reduced latency

---

## 🔒 Security Best Practices

### **1. Authentication & Authorization**

#### **Secure Token Handling**
```typescript
// ❌ Don't: Insecure token storage
export class AuthService {
  login(credentials: LoginRequest): string {
    const token = this.generateToken(credentials);
    localStorage.setItem('token', token); // Insecure
    return token;
  }
}

// ✅ Do: Secure token handling
export class AuthService {
  private readonly tokenKey = 'auth_token';
  private readonly refreshTokenKey = 'refresh_token';
  
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await this.authApi.login(credentials);
      
      // Store tokens securely
      this.secureStorage.setItem(this.tokenKey, response.accessToken);
      this.secureStorage.setItem(this.refreshTokenKey, response.refreshToken);
      
      // Set token expiration
      this.setTokenExpiration(response.accessToken);
      
      return response;
    } catch (error) {
      this.logger.error('Login failed', { error, email: credentials.email });
      throw new AuthenticationError('Invalid credentials');
    }
  }
  
  private setTokenExpiration(token: string): void {
    try {
      const decoded = jwt_decode(token);
      const expiresAt = new Date(decoded.exp * 1000);
      
      // Set refresh timer
      const timeUntilExpiry = expiresAt.getTime() - Date.now();
      setTimeout(() => this.refreshToken(), timeUntilExpiry - 60000); // 1 minute before expiry
    } catch (error) {
      this.logger.error('Failed to decode token', { error });
    }
  }
  
  async refreshToken(): Promise<string> {
    try {
      const refreshToken = this.secureStorage.getItem(this.refreshTokenKey);
      if (!refreshToken) {
        throw new AuthenticationError('No refresh token available');
      }
      
      const response = await this.authApi.refresh(refreshToken);
      
      // Update tokens
      this.secureStorage.setItem(this.tokenKey, response.accessToken);
      this.secureStorage.setItem(this.refreshTokenKey, response.refreshToken);
      
      // Reset expiration timer
      this.setTokenExpiration(response.accessToken);
      
      return response.accessToken;
    } catch (error) {
      this.logger.error('Token refresh failed', { error });
      this.logout();
      throw new AuthenticationError('Token refresh failed');
    }
  }
  
  logout(): void {
    this.secureStorage.removeItem(this.tokenKey);
    this.secureStorage.removeItem(this.refreshTokenKey);
    this.clearTokenExpiration();
    
    // Clear any cached user data
    this.userCache.clear();
  }
}
```

**Benefits**:
- Secure token storage
- Automatic token refresh
- Proper logout handling
- Better security posture

---

## 📊 Monitoring & Observability

### **1. Comprehensive Logging**

#### **Structured Logging**
```typescript
// ❌ Don't: Basic console logging
export class UserService {
  async createUser(userData: CreateUserRequest): Promise<User> {
    console.log('Creating user:', userData);
    
    try {
      const user = await this.userRepository.create(userData);
      console.log('User created:', user.id);
      return user;
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  }
}

// ✅ Do: Structured logging with context
export class UserService {
  async createUser(userData: CreateUserRequest, context: RequestContext): Promise<User> {
    const logger = this.logger.child({
      operation: 'createUser',
      userId: context.userId,
      requestId: context.requestId,
      userEmail: userData.email
    });
    
    logger.info('Starting user creation', {
      userData: this.sanitizeUserData(userData),
      timestamp: new Date().toISOString()
    });
    
    try {
      // Validate input
      const validatedData = await this.validateUserData(userData);
      
      // Check business rules
      await this.checkBusinessRules(validatedData);
      
      // Create user
      const user = await this.userRepository.create(validatedData);
      
      logger.info('User created successfully', {
        userId: user.id,
        duration: Date.now() - context.startTime
      });
      
      // Publish event
      await this.eventBus.publish(new UserCreatedEvent(user, context));
      
      return user;
    } catch (error) {
      logger.error('User creation failed', {
        error: error.message,
        stack: error.stack,
        duration: Date.now() - context.startTime
      });
      
      // Track metrics
      this.metrics.increment('user.creation.failed', {
        error: error.constructor.name,
        email: userData.email
      });
      
      throw error;
    }
  }
}
```

**Benefits**:
- Better debugging
- Performance monitoring
- Error tracking
- Operational insights

---

## 🎯 Implementation Checklist

### **Before Starting Development**

- [ ] **Requirements Analysis**: Clear understanding of what to build
- [ ] **Architecture Design**: System design and component structure
- [ ] **Technology Selection**: Choose appropriate tools and frameworks
- [ ] **Security Review**: Identify security requirements and threats
- [ ] **Performance Requirements**: Define performance expectations

### **During Development**

- [ ] **Write Tests First**: Follow TDD approach
- [ ] **Code Review**: Get feedback on all changes
- [ ] **Quality Checks**: Run automated quality tools
- [ ] **Security Validation**: Check for security vulnerabilities
- [ ] **Performance Testing**: Validate performance characteristics

### **Before Deployment**

- [ ] **Integration Testing**: Test all components together
- [ ] **Security Audit**: Comprehensive security review
- [ ] **Performance Validation**: Load and stress testing
- [ ] **Documentation Review**: Ensure documentation is complete
- [ ] **Rollback Plan**: Prepare for potential issues

---

## 🚀 Ready to Apply These Practices?

**These best practices are designed to help you write better code, avoid common pitfalls, and maintain high quality standards.**

- **[Pattern Library](patterns.md)**: Implement proven patterns
- **[Tools Guide](tools.md)**: Use tools to enforce practices
- **[Getting Started](getting-started.md)**: Begin your journey
- **[Community Support](https://discord.gg/agent-os)**: Get help and share experiences

**Start implementing these practices today and transform your development process with Agent OS! 🚀**

---

## 🔗 Related Documentation

- **[Pattern Library](patterns.md)**: Proven development patterns
- **[Tools Guide](tools.md)**: Development tools and utilities
- **[Getting Started](getting-started.md)**: Quick start guide
- **[API Reference](api-reference.md)**: Complete API documentation
