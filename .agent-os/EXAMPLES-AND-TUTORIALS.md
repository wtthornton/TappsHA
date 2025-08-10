# 📚 Agent OS Examples & Tutorials
*Practical Examples and Step-by-Step Tutorials*

## 📖 Table of Contents

- [🚀 Getting Started Tutorials](#-getting-started-tutorials)
- [🔧 Common Development Tasks](#-common-development-tasks)
- [📊 Compliance & Quality Examples](#-compliance--quality-examples)
- [🔄 Refactoring Examples](#-refactoring-examples)
- [🎯 Feature Development Examples](#-feature-development-examples)
- [🔗 Integration Examples](#-integration-examples)
- [📱 Platform-Specific Examples](#-platform-specific-examples)
- [🏗️ Project Templates](#️-project-templates)

---

## 🚀 Getting Started Tutorials

### Tutorial 1: First-Time Setup (5 minutes)

**Goal**: Get Agent OS running in your project

**Prerequisites**: Node.js 16+, project directory

**Steps**:

1. **Navigate to your project**
   ```bash
   cd your-project-directory
   ```

2. **Verify .agent-os exists**
   ```bash
   ls -la .agent-os
   # Should show .agent-os directory
   ```

3. **Run quick setup**
   ```bash
   node .agent-os/scripts/quick-start.js
   ```

4. **Verify installation**
   ```bash
   node .agent-os/scripts/setup.js status
   # Should show "healthy" status
   ```

5. **Test basic functionality**
   ```bash
   node .agent-os/tools/compliance-checker.js
   # Should run without errors
   ```

**Expected Output**:
```
✅ Agent OS setup complete!
✅ System status: healthy
✅ Ready for development
```

### Tutorial 2: Cursor Integration (3 minutes)

**Goal**: Integrate Agent OS with Cursor.ai

**Prerequisites**: Agent OS installed, Cursor.ai installed

**Steps**:

1. **Start Cursor integration**
   ```bash
   node .agent-os/tools/cursor/cursor-integrate.js
   ```

2. **Verify .cursorrules created**
   ```bash
   ls -la .cursorrules
   cat .cursorrules
   ```

3. **Test real-time monitoring**
   ```bash
   # Make a small change to any file
   echo "# Test" >> README.md
   
   # Check if monitoring caught it
   node .agent-os/ide/real-time-cursor-enhancement.js status
   ```

4. **Verify integration**
   ```bash
   node .agent-os/tools/cursor/cursor-integrate.js status
   ```

**Expected Output**:
```
✅ Cursor integration complete!
✅ .cursorrules file created
✅ Real-time monitoring active
```

### Tutorial 3: Daily Workflow (2 minutes)

**Goal**: Learn the daily Agent OS workflow

**Prerequisites**: Agent OS running

**Steps**:

1. **Morning check**
   ```bash
   node .agent-os/scripts/setup.js status
   ```

2. **Quick validation**
   ```bash
   node .agent-os/scripts/setup.js validate
   ```

3. **During development**
   - Real-time monitoring is automatic
   - Immediate feedback on violations
   - Standards enforcement in real-time

4. **End of day**
   ```bash
   node .agent-os/scripts/setup.js compliance
   ```

**Expected Output**:
```
🌅 Morning: System healthy
💻 Development: Real-time validation active
🌆 Evening: Compliance score 87/100
```

---

## 🔧 Common Development Tasks

### Task 1: Adding a New Feature

**Scenario**: You want to add user authentication to your app

**Steps**:

1. **Score the feature**
   ```bash
   node .agent-os/tools/feature-scoring.js --feature="user-authentication"
   ```

2. **Check compliance before starting**
   ```bash
   node .agent-os/tools/compliance-checker.js --area="security"
   ```

3. **Generate development checklist**
   ```bash
   node .agent-os/workflows/template-trigger-automation.js --checklist --template="feature-development"
   ```

4. **Develop with real-time validation**
   - Write code
   - Get immediate feedback
   - Address violations as they occur

5. **Validate after completion**
   ```bash
   node .agent-os/tools/refactoring-validator.js --phase=1 --validate
   ```

**Example Output**:
```
🎯 Feature: user-authentication
📊 Score: 8.5/10 (High Value)
✅ Business Value: 9/10
✅ User Impact: 8/10
⚠️  Technical Complexity: 7/10
✅ Maintenance Cost: 3/10
```

### Task 2: Code Review Process

**Scenario**: You need to review code before merging

**Steps**:

1. **Generate review checklist**
   ```bash
   node .agent-os/workflows/template-trigger-automation.js --template="code-review"
   ```

2. **Run automated checks**
   ```bash
   node .agent-os/tools/compliance-checker.js --detailed
   ```

3. **Check specific areas**
   ```bash
   node .agent-os/tools/compliance-checker.js --area="security"
   node .agent-os/tools/compliance-checker.js --area="quality"
   ```

4. **Generate review report**
   ```bash
   node .agent-os/tools/compliance-checker.js --report --format=html
   ```

**Example Output**:
```
📋 Code Review Checklist Generated
🔍 Security: ✅ Passed (95/100)
🔍 Quality: ✅ Passed (88/100)
🔍 Performance: ✅ Passed (92/100)
📊 Overall Score: 91.7/100
```

### Task 3: Performance Optimization

**Scenario**: Your app is running slowly

**Steps**:

1. **Identify performance issues**
   ```bash
   node .agent-os/tools/analysis/statistical-analysis.js --performance
   ```

2. **Check specific metrics**
   ```bash
   node .agent-os/tools/compliance-checker.js --area="performance"
   ```

3. **Generate optimization plan**
   ```bash
   node .agent-os/tools/refactoring-validator.js --plan --focus="performance"
   ```

4. **Implement optimizations**
   - Follow generated plan
   - Use real-time validation
   - Monitor performance improvements

5. **Validate optimizations**
   ```bash
   node .agent-os/tools/analysis/statistical-analysis.js --performance --compare
   ```

**Example Output**:
```
🐌 Performance Issues Detected
⚠️  Response Time: P95 450ms (Target: ≤200ms)
⚠️  Memory Usage: 85% (Target: ≤70%)
⚠️  Database Queries: 15 N+1 queries detected
📋 Optimization Plan Generated
```

---

## 📊 Compliance & Quality Examples

### Example 1: Security Compliance Check

**Goal**: Ensure your code meets security standards

**Code to Check**:
```javascript
// ❌ Insecure code
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // No input validation
    // No rate limiting
    // No encryption
    res.json({ success: true });
});
```

**Security Check**:
```bash
node .agent-os/tools/compliance-checker.js --area="security" --detailed
```

**Expected Violations**:
```
❌ Security Violations Found
❌ Missing input validation
❌ No rate limiting
❌ No encryption
❌ Potential SQL injection
❌ Missing authentication
```

**Fixed Code**:
```javascript
// ✅ Secure code
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5 // limit each IP to 5 requests per windowMs
});

app.post('/login', 
    loginLimiter,
    [
        body('username').isLength({ min: 3 }).trim().escape(),
        body('password').isLength({ min: 8 })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const { username, password } = req.body;
        // Secure authentication logic
        res.json({ success: true });
    }
);
```

**Re-run Security Check**:
```bash
node .agent-os/tools/compliance-checker.js --area="security"
# Should show: ✅ Security: 100/100
```

### Example 2: Code Quality Validation

**Goal**: Ensure code meets quality standards

**Code to Check**:
```javascript
// ❌ Low quality code
function getUserData(id) {
    var data = null;
    if (id != null) {
        try {
            data = db.query("SELECT * FROM users WHERE id = " + id);
        } catch (e) {
            console.log("Error: " + e);
        }
    }
    return data;
}
```

**Quality Check**:
```bash
node .agent-os/tools/compliance-checker.js --area="quality" --detailed
```

**Expected Violations**:
```
❌ Quality Violations Found
❌ Using var instead of const/let
❌ Loose equality (!=)
❌ SQL injection vulnerability
❌ Generic error handling
❌ Inconsistent naming
❌ Missing JSDoc
```

**Fixed Code**:
```javascript
// ✅ High quality code
/**
 * Retrieves user data by ID
 * @param {string} userId - The user ID to look up
 * @returns {Promise<Object|null>} User data or null if not found
 * @throws {Error} If database query fails
 */
async function getUserData(userId) {
    if (!userId) {
        return null;
    }
    
    try {
        const userData = await db.query(
            'SELECT * FROM users WHERE id = ?',
            [userId]
        );
        return userData;
    } catch (error) {
        logger.error('Failed to fetch user data', { userId, error: error.message });
        throw new Error('Failed to retrieve user data');
    }
}
```

**Re-run Quality Check**:
```bash
node .agent-os/tools/compliance-checker.js --area="quality"
# Should show: ✅ Quality: 95/100
```

### Example 3: Testing Coverage Validation

**Goal**: Ensure adequate test coverage

**Current Test Coverage**:
```bash
node .agent-os/tools/compliance-checker.js --area="testing"
```

**Expected Output**:
```
🧪 Testing Coverage: 65/100
❌ Unit Tests: 60% (Target: ≥85%)
❌ Integration Tests: 40% (Target: ≥70%)
❌ E2E Tests: 20% (Target: ≥50%)
❌ Missing test files for: UserService, AuthController
```

**Add Missing Tests**:
```typescript
// tests/services/UserService.test.ts
import { UserService } from '../../src/services/UserService';
import { mockUserRepository } from '../mocks/UserRepository';

describe('UserService', () => {
    let userService: UserService;
    
    beforeEach(() => {
        userService = new UserService(mockUserRepository);
    });
    
    describe('createUser', () => {
        it('should create user successfully', async () => {
            const userData = { name: 'John Doe', email: 'john@example.com' };
            const result = await userService.createUser(userData);
            
            expect(result).toBeDefined();
            expect(result.name).toBe(userData.name);
            expect(result.email).toBe(userData.email);
        });
        
        it('should validate email format', async () => {
            const invalidUserData = { name: 'John', email: 'invalid-email' };
            
            await expect(userService.createUser(invalidUserData))
                .rejects.toThrow('Invalid email format');
        });
    });
});
```

**Re-run Testing Check**:
```bash
node .agent-os/tools/compliance-checker.js --area="testing"
# Should show: ✅ Testing: 88/100
```

---

## 🔄 Refactoring Examples

### Example 1: Phase 1 Refactoring (Foundation)

**Goal**: Complete foundation refactoring after Phase 1

**Current State**: Basic functionality implemented

**Refactoring Steps**:

1. **Run Phase 1 validation**
   ```bash
   node .agent-os/tools/refactoring-validator.js --phase=1 --validate
   ```

2. **Address security issues**
   ```bash
   node .agent-os/tools/compliance-checker.js --area="security" --fix
   ```

3. **Improve error handling**
   ```bash
   node .agent-os/tools/compliance-checker.js --area="quality" --fix
   ```

4. **Validate refactoring**
   ```bash
   node .agent-os/tools/refactoring-validator.js --phase=1 --validate
   ```

**Example Output**:
```
🔄 Phase 1 Refactoring Complete
✅ Security: 100/100 (was 65/100)
✅ Error Handling: 95/100 (was 40/100)
✅ Input Validation: 100/100 (was 30/100)
📊 Overall Improvement: +45 points
```

### Example 2: Architecture Refactoring

**Goal**: Improve code architecture

**Before (Monolithic Controller)**:
```javascript
// ❌ Poor architecture
app.post('/api/users', async (req, res) => {
    try {
        // Business logic mixed with HTTP handling
        const { name, email, password } = req.body;
        
        // Direct database access
        const user = await db.query(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, password]
        );
        
        // Response formatting
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

**After (Clean Architecture)**:
```javascript
// ✅ Clean architecture
// Controller
app.post('/api/users', userController.createUser);

// Service
class UserService {
    async createUser(userData) {
        const validatedData = await this.validateUserData(userData);
        const hashedPassword = await this.hashPassword(validatedData.password);
        return await this.userRepository.create({
            ...validatedData,
            password: hashedPassword
        });
    }
}

// Repository
class UserRepository {
    async create(userData) {
        return await db.query(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [userData.name, userData.email, userData.password]
        );
    }
}
```

**Validate Architecture**:
```bash
node .agent-os/tools/refactoring-validator.js --architecture
```

**Expected Output**:
```
🏗️ Architecture Validation Complete
✅ Separation of Concerns: 95/100
✅ Dependency Injection: 90/100
✅ Single Responsibility: 100/100
✅ Testability: 95/100
📊 Architecture Score: 95/100
```

---

## 🎯 Feature Development Examples

### Example 1: API Endpoint Development

**Goal**: Develop a secure user registration API

**Development Steps**:

1. **Score the feature**
   ```bash
   node .agent-os/tools/feature-scoring.js --feature="user-registration-api"
   ```

2. **Generate development checklist**
   ```bash
   node .agent-os/workflows/template-trigger-automation.js --checklist --template="api-development"
   ```

3. **Implement with real-time validation**
   ```typescript
   // User registration endpoint
   @Post('/register')
   @UseGuards(RateLimitGuard)
   async register(@Body() userData: CreateUserDto) {
       const user = await this.userService.createUser(userData);
       return this.authService.generateToken(user);
   }
   ```

4. **Validate implementation**
   ```bash
   node .agent-os/tools/compliance-checker.js --area="security"
   node .agent-os/tools/compliance-checker.js --area="quality"
   ```

5. **Test the endpoint**
   ```bash
   npm test -- --grep="User registration"
   ```

**Expected Output**:
```
🎯 Feature: user-registration-api
📊 Score: 8.8/10
✅ Security: 100/100
✅ Quality: 95/100
✅ Testing: 90/100
🚀 Ready for production
```

### Example 2: React Component Development

**Goal**: Create a reusable form component

**Development Steps**:

1. **Generate component template**
   ```bash
   node .agent-os/workflows/template-trigger-automation.js --template="react-component"
   ```

2. **Implement component**
   ```typescript
   interface FormFieldProps {
       label: string;
       name: string;
       type: 'text' | 'email' | 'password';
       required?: boolean;
       validation?: ValidationRule[];
   }
   
   const FormField: React.FC<FormFieldProps> = ({
       label,
       name,
       type,
       required = false,
       validation = []
   }) => {
       const [value, setValue] = useState('');
       const [errors, setErrors] = useState<string[]>([]);
       
       const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
           setValue(e.target.value);
           validateField(e.target.value, validation);
       };
       
       return (
           <div className="form-field">
               <label htmlFor={name}>{label}</label>
               <input
                   id={name}
                   name={name}
                   type={type}
                   value={value}
                   onChange={handleChange}
                   required={required}
               />
               {errors.length > 0 && (
                   <div className="errors">
                       {errors.map((error, index) => (
                           <span key={index} className="error">{error}</span>
                       ))}
                   </div>
               )}
           </div>
       );
   };
   ```

3. **Validate component**
   ```bash
   node .agent-os/tools/compliance-checker.js --area="quality"
   ```

4. **Test component**
   ```bash
   npm test -- --grep="FormField"
   ```

**Expected Output**:
```
🎯 Component: FormField
✅ Accessibility: 100/100
✅ Reusability: 95/100
✅ Testing: 90/100
✅ Performance: 95/100
🚀 Component ready for use
```

---

## 🔗 Integration Examples

### Example 1: Database Integration

**Goal**: Integrate PostgreSQL with your application

**Integration Steps**:

1. **Check database compliance**
   ```bash
   node .agent-os/tools/compliance-checker.js --area="database"
   ```

2. **Generate database checklist**
   ```bash
   node .agent-os/workflows/template-trigger-automation.js --checklist --template="database-integration"
   ```

3. **Implement connection**
   ```typescript
   // Database configuration
   const dbConfig = {
       host: process.env.DB_HOST || 'localhost',
       port: parseInt(process.env.DB_PORT || '5432'),
       database: process.env.DB_NAME || 'myapp',
       user: process.env.DB_USER || 'postgres',
       password: process.env.DB_PASSWORD,
       ssl: process.env.NODE_ENV === 'production',
       max: 20,
       idleTimeoutMillis: 30000,
       connectionTimeoutMillis: 2000,
   };
   
   // Connection pool
   const pool = new Pool(dbConfig);
   
   // Health check
   pool.on('connect', () => {
       logger.info('Database connected');
   });
   
   pool.on('error', (err) => {
       logger.error('Database error', err);
   });
   ```

4. **Validate integration**
   ```bash
   node .agent-os/tools/compliance-checker.js --area="database"
   ```

**Expected Output**:
```
🔗 Database Integration Complete
✅ Connection Pool: 100/100
✅ Security: 100/100
✅ Performance: 95/100
✅ Monitoring: 90/100
📊 Database Score: 96.3/100
```

### Example 2: External API Integration

**Goal**: Integrate with a third-party payment API

**Integration Steps**:

1. **Generate API integration checklist**
   ```bash
   node .agent-os/workflows/template-trigger-automation.js --checklist --template="api-integration"
   ```

2. **Implement secure integration**
   ```typescript
   // Payment service
   class PaymentService {
       private readonly apiKey: string;
       private readonly baseUrl: string;
       
       constructor() {
           this.apiKey = process.env.PAYMENT_API_KEY;
           this.baseUrl = process.env.PAYMENT_API_URL;
           
           if (!this.apiKey) {
               throw new Error('Payment API key not configured');
           }
       }
       
       async processPayment(paymentData: PaymentData): Promise<PaymentResult> {
           try {
               const response = await axios.post(
                   `${this.baseUrl}/payments`,
                   paymentData,
                   {
                       headers: {
                           'Authorization': `Bearer ${this.apiKey}`,
                           'Content-Type': 'application/json'
                       },
                       timeout: 10000
                   }
               );
               
               return response.data;
           } catch (error) {
               logger.error('Payment processing failed', { error: error.message });
               throw new PaymentError('Payment processing failed');
           }
       }
   }
   ```

3. **Validate security**
   ```bash
   node .agent-os/tools/compliance-checker.js --area="security"
   ```

**Expected Output**:
```
🔗 API Integration Complete
✅ Security: 100/100
✅ Error Handling: 95/100
✅ Timeout Configuration: 100/100
✅ Logging: 90/100
📊 Integration Score: 96.3/100
```

---

## 📱 Platform-Specific Examples

### Example 1: Windows Development

**Goal**: Develop on Windows with Agent OS

**Setup Steps**:

1. **Fix PowerShell execution policy**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

2. **Use Windows Terminal or PowerShell 7+**
   ```powershell
   # Check PowerShell version
   $PSVersionTable.PSVersion
   
   # Should be 7.0 or higher
   ```

3. **Run Agent OS commands**
   ```powershell
   node .agent-os/scripts/setup.js status
   node .agent-os/tools/compliance-checker.js
   ```

**Expected Output**:
```
✅ Windows Environment Detected
✅ PowerShell 7.3.4
✅ Execution Policy: RemoteSigned
✅ Agent OS Status: Healthy
```

### Example 2: macOS Development

**Goal**: Develop on macOS with Agent OS

**Setup Steps**:

1. **Fix permissions**
   ```bash
   sudo chown -R $(whoami) .agent-os/
   chmod +x .agent-os/scripts/*.js
   ```

2. **Check Homebrew**
   ```bash
   brew doctor
   brew update
   ```

3. **Run Agent OS**
   ```bash
   node .agent-os/scripts/setup.js status
   ```

**Expected Output**:
```
✅ macOS Environment Detected
✅ Homebrew: Healthy
✅ Permissions: Correct
✅ Agent OS Status: Healthy
```

### Example 3: Linux Development

**Goal**: Develop on Linux with Agent OS

**Setup Steps**:

1. **Fix permissions**
   ```bash
   sudo chown -R $USER:$USER .agent-os/
   chmod +x .agent-os/scripts/*.js
   ```

2. **Update packages**
   ```bash
   sudo apt update && sudo apt upgrade
   # OR
   sudo yum update
   ```

3. **Run Agent OS**
   ```bash
   node .agent-os/scripts/setup.js status
   ```

**Expected Output**:
```
✅ Linux Environment Detected
✅ Package Manager: Updated
✅ Permissions: Correct
✅ Agent OS Status: Healthy
```

---

## 🏗️ Project Templates

### Template 1: Full-Stack Application

**Goal**: Create a complete full-stack application

**Template Usage**:
```bash
node .agent-os/workflows/template-trigger-automation.js --template="full-stack-app"
```

**Generated Structure**:
```
my-fullstack-app/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── utils/
│   ├── tests/
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   └── models/
│   ├── tests/
│   └── package.json
├── shared/
│   ├── types/
│   └── utils/
└── .agent-os/
```

**Development Workflow**:
```bash
# 1. Setup project
node .agent-os/scripts/setup.js

# 2. Start development
npm run dev:frontend
npm run dev:backend

# 3. Real-time validation active
# 4. Phase-based refactoring
```

### Template 2: API Service

**Goal**: Create a REST API service

**Template Usage**:
```bash
node .agent-os/workflows/template-trigger-automation.js --template="api-service"
```

**Generated Structure**:
```
my-api-service/
├── src/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── models/
│   ├── middleware/
│   └── utils/
├── tests/
├── docs/
└── .agent-os/
```

**Development Workflow**:
```bash
# 1. Setup API service
node .agent-os/scripts/setup.js

# 2. Start development
npm run dev

# 3. Real-time validation
# 4. API documentation generation
```

---

## 🎯 Best Practices Summary

### 🚀 Development Workflow

1. **Always start with feature scoring**
2. **Use real-time validation during development**
3. **Refactor after each phase**
4. **Maintain ≥85% compliance score**
5. **Update lessons learned regularly**

### 🔒 Security Practices

1. **Never hardcode secrets**
2. **Always validate input**
3. **Use parameterized queries**
4. **Implement rate limiting**
5. **Enable HTTPS in production**

### 🧪 Testing Practices

1. **Write tests before implementation (TDD)**
2. **Maintain ≥85% test coverage**
3. **Test error conditions**
4. **Use meaningful test names**
5. **Mock external dependencies**

### 📊 Performance Practices

1. **Monitor response times**
2. **Optimize database queries**
3. **Use caching strategies**
4. **Implement pagination**
5. **Monitor resource usage**

---

*Last Updated: ${new Date().toISOString()}*
*Agent OS Version: 4.0*
*For additional examples, see: `.agent-os/USER-GUIDE.md` and `.agent-os/API-REFERENCE.md`*
