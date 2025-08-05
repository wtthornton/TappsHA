# Agent-OS Development Toolkit

## Overview

The Agent-OS Development Toolkit is a comprehensive framework designed to enable single-pass development by preventing errors before they occur. Based on extensive analysis of common development issues, this toolkit provides intelligent assistance, automated validation, and code generation capabilities.

## Key Features

### 🧪 Testing Infrastructure
- **Mock Factories**: Pre-configured mocks that match real API behavior
- **Singleton Patterns**: Proper mocking for singleton services
- **Browser API Mocks**: Complete browser environment simulation
- **Async Helpers**: Utilities for handling async operations in tests
- **Debug Tools**: Comprehensive debugging utilities for tests

### 🔧 Code Generation
- **Component Generator**: Create React components with tests
- **Service Generator**: Generate services with proper patterns
- **Test Generator**: Automatic test creation with proper mocks
- **Hook Generator**: Create custom React hooks
- **API Generator**: Generate API service layers

### ✅ Validation & Quality
- **Mock Validation**: Ensures mocks match implementations
- **Contract Testing**: Service contract validation
- **Import Validation**: Catches import issues early
- **Pre-commit Hooks**: Comprehensive validation before commits
- **Dependency Validation**: Compatibility checking

### 🎯 Error Prevention
- **Pattern Recognition**: Common error patterns and solutions
- **Real-time Validation**: IDE integration for immediate feedback
- **Auto-fix Suggestions**: Intelligent fix recommendations
- **Type Safety**: Strict TypeScript configurations

## Installation

```bash
# Install the toolkit
npm install @agent-os/toolkit --save-dev

# Set up pre-commit hooks
npx husky install
npx husky add .husky/pre-commit "npm run validate:all"

# Copy IDE settings
cp .agent-os/ide/vscode-settings.json .vscode/settings.json
```

## Quick Start

### 1. Generate a Component

```bash
npx agent-os generate component Button --with-test --with-story
```

This creates:
- `src/components/Button.tsx`
- `src/__tests__/Button.test.tsx`
- `src/stories/Button.stories.tsx`

### 2. Generate a Service

```bash
npx agent-os generate service UserService --singleton --with-test
```

This creates:
- `src/services/UserService.ts`
- `src/__tests__/UserService.test.ts`

### 3. Validate Your Tests

```bash
npm run validate:mocks
```

This checks for common mock setup issues and provides fixes.

## Testing Best Practices

### Mock Setup

```typescript
// ✅ CORRECT: API client returns data directly
import { createApiClientMock } from '@agent-os/toolkit/testing';

const mockApi = createApiClientMock();
mockApi.get.mockResolvedValue({ id: 1, name: 'Test' });

// ❌ INCORRECT: Don't wrap in { data: ... }
mockApi.get.mockResolvedValue({ data: { id: 1 } });
```

### Singleton Mocking

```typescript
// ✅ CORRECT: Use the singleton mock helper
import { mockSingleton } from '@agent-os/toolkit/testing';

mockSingleton('./AuthService', 'AuthService', {
  login: vi.fn(),
  logout: vi.fn(),
});
```

### Async Testing

```typescript
// ✅ CORRECT: Use async helpers
import { submitFormAndWaitForError } from '@agent-os/toolkit/testing';

await submitFormAndWaitForError(
  submitButton,
  /invalid email format/i
);
```

## Configuration

### TypeScript Configuration

Use the strict TypeScript template:

```json
{
  "extends": "./.agent-os/templates/tsconfig.strict.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### ESLint Configuration

Use the comprehensive ESLint config:

```json
{
  "extends": "./.agent-os/templates/eslintrc.strict.json"
}
```

## API Endpoints

Use centralized endpoint configuration:

```typescript
import { API_ENDPOINTS } from '@agent-os/toolkit/config';

// Use in services
const response = await api.post(API_ENDPOINTS.auth.login, credentials);

// Use in tests - same endpoints!
expect(mockApi.post).toHaveBeenCalledWith(API_ENDPOINTS.auth.login, credentials);
```

## Contract Testing

Define service contracts:

```typescript
import { ServiceContract } from '@agent-os/toolkit/contracts';

export const UserServiceContract: ServiceContract<UserService> = {
  name: 'UserService',
  version: '1.0.0',
  methods: {
    getUser: {
      input: z.object({ id: z.string() }),
      output: UserSchema,
      errors: [
        { code: 'USER_NOT_FOUND', message: 'User not found' }
      ]
    }
  }
};
```

## Debugging

Use the debug utilities:

```typescript
import { debug } from '@agent-os/toolkit/testing';

// In your test
debug.logMocks({ api: mockApi, auth: mockAuth });
debug.logComponent();
debug.logLocalStorage();
```

## Common Issues & Solutions

### Issue: Mock not returning expected data

```typescript
// Check 1: API client behavior
// The mock should return data directly, not wrapped

// Check 2: Clear mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});

// Check 3: Use debug tools
debug.logMockCalls(mockApi.get, 'API GET calls');
```

### Issue: TypeScript import errors

```typescript
// Use type imports for types
import type { User } from './types';

// Regular imports for values
import { getUser } from './api';
```

### Issue: Async test failures

```typescript
// Always use waitFor for async updates
await waitFor(() => {
  expect(screen.getByText('Success')).toBeInTheDocument();
});
```

## CLI Commands

```bash
# Generate code
agent-os generate component MyComponent
agent-os generate service MyService --singleton
agent-os generate test MyComponent --type component
agent-os generate hook useMyHook
agent-os generate api users

# Validation
npm run validate:mocks      # Validate test mocks
npm run validate:contracts  # Validate service contracts
npm run validate:deps      # Check dependency compatibility
npm run validate:all       # Run all validations

# Testing
npm test                   # Run tests
npm run test:coverage      # Run with coverage
npm run test:changed       # Test only changed files
```

## VS Code Integration

Install recommended extensions:

```bash
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension vitest.explorer
```

## Pre-commit Validation

The toolkit includes comprehensive pre-commit hooks that:

1. Run TypeScript type checking
2. Validate imports
3. Check mock setup
4. Run tests for changed files
5. Format code with Prettier
6. Check bundle size

## Dependency Compatibility

Check the compatibility matrix before updating dependencies:

```yaml
# .agent-os/dependencies/compatibility-matrix.yml
react:
  version: "19.1.1"
  compatible:
    - "@types/react": "19.1.1"
    - "react-dom": "19.1.1"
```

## Contributing

1. Follow the established patterns
2. Add tests for new features
3. Update documentation
4. Run validation before submitting

## Support

- Documentation: [agent-os.dev/docs](https://agent-os.dev/docs)
- Issues: [github.com/agent-os/toolkit/issues](https://github.com/agent-os/toolkit/issues)
- Discord: [discord.gg/agent-os](https://discord.gg/agent-os)

## License

MIT © Agent-OS Team