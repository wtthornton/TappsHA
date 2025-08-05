#!/usr/bin/env node

import { validateTestDirectory, formatValidationErrors } from '../testing/validators/mock-validator';
import * as path from 'path';
import * as process from 'process';

const args = process.argv.slice(2);

// Default to src directory if no args provided
const targetPaths = args.length > 0 ? args : ['src'];

console.log('🔍 Validating test mocks...\n');

let hasErrors = false;
const allErrors: any[] = [];

targetPaths.forEach(targetPath => {
  const fullPath = path.resolve(targetPath);
  console.log(`Checking: ${fullPath}`);
  
  const errors = validateTestDirectory(fullPath);
  
  if (errors.length > 0) {
    hasErrors = true;
    allErrors.push(...errors);
  }
});

console.log('\n' + formatValidationErrors(allErrors));

if (hasErrors) {
  process.exit(1);
} else {
  process.exit(0);
}