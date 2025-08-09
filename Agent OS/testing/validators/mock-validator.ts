import * as fs from 'fs';
import * as path from 'path';

interface ValidationError {
  file: string;
  line: number;
  message: string;
  suggestion?: string;
}

/**
 * Validates mock setup in test files
 */
export function validateMocks(testFile: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const content = fs.readFileSync(testFile, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // Check for wrapped data in mocks
    if (line.includes('mockResolvedValue({ data:') || line.includes('mockResolvedValueOnce({ data:')) {
      errors.push({
        file: testFile,
        line: index + 1,
        message: 'API mocks should not wrap responses in { data: ... }',
        suggestion: 'Remove the data wrapper - the API client already unwraps response.data',
      });
    }

    // Check for incorrect singleton mocking
    if (line.includes("vi.mock('") && line.includes('Service') && !content.includes('getInstance')) {
      const moduleMatch = line.match(/vi\.mock\(['"](.+)['"]/);
      if (moduleMatch) {
        errors.push({
          file: testFile,
          line: index + 1,
          message: 'Singleton services must be mocked with getInstance',
          suggestion: `Use mockSingleton('${moduleMatch[1]}', 'ServiceName', mockMethods)`,
        });
      }
    }

    // Check for missing await on async operations
    if (line.includes('expect(') && line.includes('()).toBe') && !line.includes('await')) {
      if (line.includes('async') || line.includes('Promise')) {
        errors.push({
          file: testFile,
          line: index + 1,
          message: 'Async operations should use await',
          suggestion: 'Add await before the expect statement',
        });
      }
    }

    // Check for direct localStorage access without setup
    if (line.includes('localStorage.') && !content.includes('setupBrowserMocks')) {
      errors.push({
        file: testFile,
        line: index + 1,
        message: 'localStorage used without proper mock setup',
        suggestion: "Import and call setupBrowserMocks() in beforeEach",
      });
    }

    // Check for fireEvent.click without waitFor
    if (line.includes('fireEvent.click') && !lines.slice(index, index + 5).some(l => l.includes('waitFor'))) {
      errors.push({
        file: testFile,
        line: index + 1,
        message: 'fireEvent.click should be followed by waitFor for async updates',
        suggestion: 'Use await waitFor(() => { ... }) after fireEvent.click',
      });
    }
  });

  return errors;
}

/**
 * Validates test structure
 */
export function validateTestStructure(testFile: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const content = fs.readFileSync(testFile, 'utf-8');

  // Check for describe blocks
  if (!content.includes('describe(')) {
    errors.push({
      file: testFile,
      line: 1,
      message: 'Test file should use describe blocks',
      suggestion: 'Organize tests with describe() blocks',
    });
  }

  // Check for beforeEach
  if (!content.includes('beforeEach')) {
    errors.push({
      file: testFile,
      line: 1,
      message: 'Test file should have beforeEach for setup',
      suggestion: 'Add beforeEach to clear mocks and set up test state',
    });
  }

  // Check for vi.clearAllMocks
  if (content.includes('beforeEach') && !content.includes('vi.clearAllMocks')) {
    errors.push({
      file: testFile,
      line: 1,
      message: 'beforeEach should clear all mocks',
      suggestion: 'Add vi.clearAllMocks() in beforeEach',
    });
  }

  return errors;
}

/**
 * Validates all test files in a directory
 */
export function validateTestDirectory(dir: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const files = fs.readdirSync(dir, { withFileTypes: true });

  files.forEach(file => {
    if (file.isDirectory()) {
      errors.push(...validateTestDirectory(path.join(dir, file.name)));
    } else if (file.name.endsWith('.test.ts') || file.name.endsWith('.test.tsx')) {
      const filePath = path.join(dir, file.name);
      errors.push(...validateMocks(filePath));
      errors.push(...validateTestStructure(filePath));
    }
  });

  return errors;
}

/**
 * Formats validation errors for display
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) {
    return '✅ All tests pass validation!';
  }

  const grouped = errors.reduce((acc, error) => {
    if (!acc[error.file]) {
      acc[error.file] = [];
    }
    acc[error.file].push(error);
    return acc;
  }, {} as Record<string, ValidationError[]>);

  let output = `❌ Found ${errors.length} validation errors:\n\n`;

  Object.entries(grouped).forEach(([file, fileErrors]) => {
    output += `📄 ${file}\n`;
    fileErrors.forEach(error => {
      output += `  Line ${error.line}: ${error.message}\n`;
      if (error.suggestion) {
        output += `    💡 ${error.suggestion}\n`;
      }
    });
    output += '\n';
  });

  return output;
}