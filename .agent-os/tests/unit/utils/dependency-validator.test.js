import { describe, it, expect } from 'vitest';
import path from 'node:path';
import dep from '../../../utils/dependency-validator.js';
const { DependencyValidator } = dep;

describe('DependencyValidator', () => {
  it('verifies Node version meets minimum', () => {
    const validator = new DependencyValidator(path.resolve(process.cwd(), '.agent-os'));
    const result = validator.verifyNodeVersion(18);
    expect(result.required).toBe('>=18');
    expect(typeof result.passed).toBe('boolean');
  });
});


