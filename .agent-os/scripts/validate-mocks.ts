#!/usr/bin/env node

import { validateTestDirectory, formatValidationErrors } from '../testing/validators/mock-validator';
import * as path from 'path';
import * as process from 'process';
import * as fs from 'fs';

const args = process.argv.slice(2);

// Default to src directory if no args provided
const targetPaths = args.length > 0 ? args : ['src'];

console.log('🔍 Validating test mocks...\n');

let hasErrors = false;
const allErrors: any[] = [];

targetPaths.forEach(targetPath => {
  const fullPath = path.resolve(targetPath);
  console.log(`Checking: ${fullPath}`);
  
  // Check if directory exists before validating
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Directory does not exist: ${fullPath}`);
    console.log('   Skipping validation for this path.\n');
    return;
  }
  
  try {
    const errors = validateTestDirectory(fullPath);
    
    if (errors.length > 0) {
      hasErrors = true;
      allErrors.push(...errors);
    }
  } catch (error) {
    console.log(`❌ Error validating ${fullPath}: ${error}`);
    hasErrors = true;
  }
});

if (allErrors.length > 0) {
  console.log('\n' + formatValidationErrors(allErrors));
} else {
  console.log('✅ No validation errors found!');
}

if (hasErrors) {
  process.exit(1);
} else {
  process.exit(0);
}