#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';

interface ValidationError {
  file: string;
  line: number;
  message: string;
  suggestion?: string;
}

/**
 * Validates API contracts and interfaces
 */
function validateContracts(dir: string): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!fs.existsSync(dir)) {
    console.log(`⚠️  Directory does not exist: ${dir}`);
    return errors;
  }

  try {
    const files = fs.readdirSync(dir, { withFileTypes: true });

    files.forEach(file => {
      if (file.isDirectory()) {
        errors.push(...validateContracts(path.join(dir, file.name)));
      } else if (file.name.endsWith('.ts') || file.name.endsWith('.tsx')) {
        const filePath = path.join(dir, file.name);
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Check for interface definitions
        if (content.includes('interface') || content.includes('type')) {
          // Validate interface naming conventions
          const interfaceMatches = content.match(/interface\s+(\w+)/g);
          if (interfaceMatches) {
            interfaceMatches.forEach(match => {
              const interfaceName = match.replace('interface ', '');
              if (!interfaceName.match(/^[A-Z][a-zA-Z0-9]*$/)) {
                errors.push({
                  file: filePath,
                  line: 1,
                  message: `Interface name '${interfaceName}' should be PascalCase`,
                  suggestion: `Rename to follow PascalCase convention`,
                });
              }
            });
          }
          
          // Check for proper export statements
          if (content.includes('interface') && !content.includes('export')) {
            errors.push({
              file: filePath,
              line: 1,
              message: 'Interfaces should be exported for reuse',
              suggestion: 'Add export keyword to interface definitions',
            });
          }
        }
      }
    });
  } catch (error) {
    console.log(`❌ Error validating contracts in ${dir}: ${error}`);
  }

  return errors;
}

/**
 * Formats validation errors for display
 */
function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) {
    return '✅ All contracts pass validation!';
  }

  const grouped = errors.reduce((acc, error) => {
    if (!acc[error.file]) {
      acc[error.file] = [];
    }
    acc[error.file].push(error);
    return acc;
  }, {} as Record<string, ValidationError[]>);

  let output = `❌ Found ${errors.length} contract validation errors:\n\n`;

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

const args = process.argv.slice(2);
const targetPaths = args.length > 0 ? args : ['contracts', 'src'];

console.log('🔍 Validating API contracts...\n');

let hasErrors = false;
const allErrors: ValidationError[] = [];

targetPaths.forEach(targetPath => {
  const fullPath = path.resolve(targetPath);
  console.log(`Checking: ${fullPath}`);
  
  const errors = validateContracts(fullPath);
  
  if (errors.length > 0) {
    hasErrors = true;
    allErrors.push(...errors);
  }
});

if (allErrors.length > 0) {
  console.log('\n' + formatValidationErrors(allErrors));
} else {
  console.log('✅ No contract validation errors found!');
}

if (hasErrors) {
  process.exit(1);
} else {
  process.exit(0);
}
