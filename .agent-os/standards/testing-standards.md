# Testing Standards for Agent-OS Projects

**Version**: 1.0.0  
**Last Updated**: January 27, 2025  
**Status**: Draft  

## Overview

This document defines mandatory testing standards to prevent common issues and enable single-pass development.

## Core Principles

1. **Test First, Fix Never**: Write tests correctly the first time
2. **Mock Reality**: Mocks must behave exactly like real implementations
3. **Fail Fast**: Catch issues before code execution
4. **Document Everything**: No implicit assumptions

## Testing Stack

### Required Tools
- **Test Runner**: Vitest 0.34.0+
- **Testing Library**: @testing-library/react 14.0+
- **Mocking**: Vitest built-in mocks
- **Coverage**: Vitest coverage with c8
- **Validation**: Custom pre-test validators

### Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { validateMocks } from '.agent-os/testing/validators';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [
      './.agent-os/testing/setup/global-mocks.ts',
      './.agent-os/testing/setup/browser-apis.ts',
      './src/test-setup.ts'
    ],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'test/'],
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    },
    onConsoleLog: (log) => {
      if (log.includes('Warning:')) return false;
      return true;
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@testing': path.resolve(__dirname, './.agent-os/testing')
    }
  }
});
```

## Mock Standards

### 1. API Client Mocks

```typescript
// CORRECT: Mock returns data directly
import { createApiMock } from '@testing/factories';

const mockApi = createApiMock({
  '/v1/auth/login': { 
    success: true, 
    token: 'mock-token' 
  }
});

// INCORRECT: Don't wrap in { data: ... }
const mockApi = {
  post: vi.fn().mockResolvedValue({ 
    data: { success: true } // ❌ Wrong!
  })
};
```

### 2. Singleton Service Mocks

```typescript
// CORRECT: Use factory function
import { mockSingleton } from '@testing/patterns';

mockSingleton('services/AuthService', 'AuthService', {
  login: vi.fn().mockResolvedValue({ success: true }),
  logout: vi.fn().mockResolvedValue({ success: true }),
  getUser: vi.fn().mockReturnValue({ id: '1', name: 'Test' })
});

// INCORRECT: Direct mock
vi.mock('services/AuthService'); // ❌ Won't work with singletons
```

### 3. Browser API Mocks

```typescript
// Use centralized mocks from .agent-os
import { setupBrowserMocks } from '@testing/setup/browser-apis';

beforeEach(() => {
  setupBrowserMocks(); // Sets up localStorage, sessionStorage, etc.
});
```

## Test Structure

### Component Tests

```typescript
import { renderWithProviders, userEvent } from '@testing/utils';
import { screen, waitFor } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  // Setup
  const defaultProps = {
    onSubmit: vi.fn(),
    initialValue: 'test'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Render helper
  const renderComponent = (props = {}) => {
    return renderWithProviders(
      <MyComponent {...defaultProps} {...props} />
    );
  };

  // Tests organized by user behavior
  describe('when user submits form', () => {
    it('should validate input', async () => {
      renderComponent();
      
      const input = screen.getByRole('textbox', { name: /email/i });
      const submitButton = screen.getByRole('button', { name: /submit/i });
      
      await userEvent.clear(input);
      await userEvent.type(input, 'invalid-email');
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
      });
    });

    it('should call onSubmit with valid data', async () => {
      renderComponent();
      
      const input = screen.getByRole('textbox', { name: /email/i });
      const submitButton = screen.getByRole('button', { name: /submit/i });
      
      await userEvent.clear(input);
      await userEvent.type(input, 'test@example.com');
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(defaultProps.onSubmit).toHaveBeenCalledWith({
          email: 'test@example.com'
        });
      });
    });
  });
});
```

### Service Tests

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { AuthService } from './AuthService';
import { mockApiClient } from '@testing/mocks';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AuthService();
  });

  describe('login', () => {
    it('should return user data on success', async () => {
      const credentials = { username: 'test', password: 'pass' };
      const mockResponse = { 
        success: true, 
        user: { id: '1', name: 'Test' } 
      };

      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.login(credentials);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/v1/auth/login',
        credentials
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
      const credentials = { username: 'test', password: 'wrong' };
      
      mockApiClient.post.mockRejectedValueOnce(
        new Error('Invalid credentials')
      );

      await expect(service.login(credentials)).rejects.toThrow(
        'Invalid credentials'
      );
    });
  });
});
```

## Common Patterns

### 1. Async Testing

```typescript
// CORRECT: Use waitFor for async updates
await waitFor(() => {
  expect(screen.getByText(/success/i)).toBeInTheDocument();
});

// INCORRECT: No wait for async
fireEvent.click(button);
expect(screen.getByText(/success/i)).toBeInTheDocument(); // ❌ May fail
```

### 2. User Interactions

```typescript
// CORRECT: Use userEvent for realistic interactions
await userEvent.type(input, 'test value');
await userEvent.click(button);

// ACCEPTABLE: fireEvent for simple cases
fireEvent.change(input, { target: { value: 'test' } });
```

### 3. Error Testing

```typescript
// CORRECT: Test error UI, not console
await waitFor(() => {
  expect(screen.getByRole('alert')).toHaveTextContent(/error occurred/i);
});

// INCORRECT: Only checking console
expect(console.error).toHaveBeenCalled(); // ❌ Not user-facing
```

## Pre-Test Validation

### Mock Validator

```typescript
// .agent-os/testing/validators/mock-validator.ts
export function validateMocks(testFile: string) {
  const errors = [];

  // Check for wrapped data in mocks
  if (testFile.includes('mockResolvedValue({ data:')) {
    errors.push('API mocks should not wrap responses in { data: ... }');
  }

  // Check for proper singleton mocking
  if (testFile.includes("vi.mock('") && testFile.includes('Service')) {
    if (!testFile.includes('getInstance')) {
      errors.push('Singleton services must be mocked with getInstance');
    }
  }

  return errors;
}
```

### Pre-Commit Hook

```bash
#!/bin/bash
# .husky/pre-commit

# Run mock validation
npm run validate:mocks

# Run type checking
npm run type-check

# Run linting
npm run lint

# Run tests for changed files
npm run test:changed
```

## Test Data Management

### Factories

```typescript
// .agent-os/testing/factories/user.ts
import { faker } from '@faker-js/faker';

export const createUser = (overrides = {}) => ({
  id: faker.string.uuid(),
  username: faker.internet.userName(),
  email: faker.internet.email(),
  roles: ['USER'],
  createdAt: faker.date.past(),
  ...overrides
});

// Usage
const testUser = createUser({ roles: ['ADMIN'] });
```

### Fixtures

```typescript
// .agent-os/testing/fixtures/api-responses.ts
export const fixtures = {
  auth: {
    loginSuccess: {
      success: true,
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      user: createUser()
    },
    loginError: {
      success: false,
      error: 'Invalid credentials'
    }
  }
};
```

## Debugging Helpers

### Test Utilities

```typescript
// .agent-os/testing/debug.ts
export const debug = {
  // Log all mock calls
  logMocks: (mocks: Record<string, any>) => {
    Object.entries(mocks).forEach(([name, mock]) => {
      console.log(`\n=== ${name} calls ===`);
      mock.mock.calls.forEach((call: any[], i: number) => {
        console.log(`Call ${i}:`, call);
      });
    });
  },

  // Log component tree
  logComponent: () => {
    console.log('\n=== Component Tree ===');
    screen.debug();
  },

  // Log all queries
  logQueries: () => {
    console.log('\n=== Available Queries ===');
    console.log('Buttons:', screen.getAllByRole('button').map(b => b.textContent));
    console.log('Inputs:', screen.getAllByRole('textbox').map(i => i.getAttribute('name')));
  }
};
```

## Coverage Requirements

### Minimum Coverage
- Branches: 85%
- Functions: 85%
- Lines: 85%
- Statements: 85%

### Critical Path Coverage
- Authentication flows: 95%
- Data mutations: 90%
- Error handling: 100%

## Anti-Patterns to Avoid

### 1. Testing Implementation Details
```typescript
// ❌ BAD: Testing state directly
expect(component.state.isLoading).toBe(true);

// ✅ GOOD: Testing user-visible behavior
expect(screen.getByText(/loading/i)).toBeInTheDocument();
```

### 2. Excessive Mocking
```typescript
// ❌ BAD: Mocking everything
vi.mock('react'); // Never mock React!

// ✅ GOOD: Mock only external dependencies
vi.mock('./api-client');
```

### 3. Brittle Selectors
```typescript
// ❌ BAD: Using implementation details
screen.getByTestId('submit-btn-2');

// ✅ GOOD: Using accessible queries
screen.getByRole('button', { name: /submit/i });
```

## Enforcement

### CI/CD Pipeline
```yaml
test:
  stage: test
  script:
    - npm run validate:mocks
    - npm run test:coverage
    - npm run test:e2e
  coverage: '/Lines\s*:\s*(\d+\.\d+)%/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
```

## Migration Guide

For existing projects:
1. Install .agent-os testing utilities
2. Run mock migration script
3. Update test configurations
4. Fix failing tests using debug helpers
5. Add pre-commit hooks

---

**Approval**: Required from Tech Lead  
**Review Cycle**: Quarterly  
**Questions**: Contact the Testing Guild