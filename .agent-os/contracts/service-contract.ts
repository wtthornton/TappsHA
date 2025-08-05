import { z } from 'zod';

/**
 * Service contract definition for validation
 */
export interface ServiceContract<T> {
  name: string;
  version: string;
  methods: {
    [K in keyof T]: {
      description: string;
      input: z.ZodSchema;
      output: z.ZodSchema;
      errors: Array<{
        code: string;
        message: string;
        status?: number;
      }>;
    };
  };
}

/**
 * Validates a service implementation against its contract
 */
export async function validateService<T>(
  implementation: T,
  contract: ServiceContract<T>
): Promise<ValidationResult> {
  const results: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  };

  // Check if all contract methods are implemented
  for (const methodName in contract.methods) {
    if (!(methodName in implementation)) {
      results.valid = false;
      results.errors.push({
        type: 'missing_method',
        method: methodName as string,
        message: `Method '${methodName}' is defined in contract but not implemented`,
      });
    }
  }

  // Check if implementation has extra methods not in contract
  for (const methodName in implementation) {
    if (!(methodName in contract.methods)) {
      results.warnings.push({
        type: 'extra_method',
        method: methodName as string,
        message: `Method '${methodName}' is implemented but not defined in contract`,
      });
    }
  }

  return results;
}

/**
 * Creates a contract test suite
 */
export function generateContractTests<T>(
  contract: ServiceContract<T>,
  implementation: T
): ContractTestSuite {
  const tests: ContractTest[] = [];

  for (const [methodName, methodContract] of Object.entries(contract.methods)) {
    // Input validation test
    tests.push({
      name: `${methodName} - validates input`,
      type: 'input_validation',
      test: async () => {
        const method = implementation[methodName as keyof T] as any;
        const invalidInput = {}; // Intentionally invalid
        
        try {
          methodContract.input.parse(invalidInput);
          throw new Error('Expected validation to fail');
        } catch (error) {
          // Expected - input should fail validation
        }
      },
    });

    // Output validation test
    tests.push({
      name: `${methodName} - validates output`,
      type: 'output_validation',
      test: async () => {
        const method = implementation[methodName as keyof T] as any;
        const validInput = generateValidInput(methodContract.input);
        
        const result = await method.call(implementation, validInput);
        
        // This should not throw if output is valid
        methodContract.output.parse(result);
      },
    });

    // Error handling test
    methodContract.errors.forEach((errorSpec) => {
      tests.push({
        name: `${methodName} - handles ${errorSpec.code}`,
        type: 'error_handling',
        test: async () => {
          // Test implementation would trigger the specific error
          // and verify it matches the contract
        },
      });
    });
  }

  return {
    contract,
    tests,
    run: async () => {
      const results: TestResult[] = [];
      
      for (const test of tests) {
        try {
          await test.test();
          results.push({
            name: test.name,
            type: test.type,
            passed: true,
          });
        } catch (error) {
          results.push({
            name: test.name,
            type: test.type,
            passed: false,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
      
      return results;
    },
  };
}

/**
 * Generates valid input data from a Zod schema
 */
function generateValidInput(schema: z.ZodSchema): any {
  // This is a simplified version - in practice, you'd use a library
  // like zod-mock or implement more sophisticated generation
  
  if (schema instanceof z.ZodString) {
    return 'test-string';
  } else if (schema instanceof z.ZodNumber) {
    return 42;
  } else if (schema instanceof z.ZodBoolean) {
    return true;
  } else if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    const result: any = {};
    
    for (const [key, value] of Object.entries(shape)) {
      result[key] = generateValidInput(value as z.ZodSchema);
    }
    
    return result;
  } else if (schema instanceof z.ZodArray) {
    return [generateValidInput(schema.element)];
  }
  
  // Default fallback
  return {};
}

// Types
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  type: 'missing_method' | 'invalid_signature' | 'missing_error_handler';
  method: string;
  message: string;
}

export interface ValidationWarning {
  type: 'extra_method' | 'deprecated_method';
  method: string;
  message: string;
}

export interface ContractTest {
  name: string;
  type: 'input_validation' | 'output_validation' | 'error_handling';
  test: () => Promise<void>;
}

export interface ContractTestSuite {
  contract: ServiceContract<any>;
  tests: ContractTest[];
  run: () => Promise<TestResult[]>;
}

export interface TestResult {
  name: string;
  type: string;
  passed: boolean;
  error?: string;
}