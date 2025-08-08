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

interface PackageJson {
  name: string;
  version: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
}

/**
 * Validates package.json dependencies
 */
function validateDependencies(packageJsonPath: string): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!fs.existsSync(packageJsonPath)) {
    console.log(`⚠️  Package.json does not exist: ${packageJsonPath}`);
    return errors;
  }

  try {
    const content = fs.readFileSync(packageJsonPath, 'utf-8');
    const packageJson: PackageJson = JSON.parse(content);
    
    // Check for required fields
    if (!packageJson.name) {
      errors.push({
        file: packageJsonPath,
        line: 1,
        message: 'Package.json missing name field',
        suggestion: 'Add a name field to package.json',
      });
    }
    
    if (!packageJson.version) {
      errors.push({
        file: packageJsonPath,
        line: 1,
        message: 'Package.json missing version field',
        suggestion: 'Add a version field to package.json',
      });
    }
    
    // Check for duplicate dependencies
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };
    
    const depNames = Object.keys(allDeps);
    const duplicates = depNames.filter((name, index) => depNames.indexOf(name) !== index);
    
    if (duplicates.length > 0) {
      errors.push({
        file: packageJsonPath,
        line: 1,
        message: `Duplicate dependencies found: ${duplicates.join(', ')}`,
        suggestion: 'Remove duplicate dependencies from either dependencies or devDependencies',
      });
    }
    
    // Check for common security issues
    const securityIssues = [
      { name: 'lodash', version: '4.17.21', issue: 'Known security vulnerability' },
      { name: 'moment', version: '2.29.4', issue: 'Large bundle size, consider alternatives' },
    ];
    
    securityIssues.forEach(issue => {
      if (allDeps[issue.name]) {
        errors.push({
          file: packageJsonPath,
          line: 1,
          message: `${issue.name}: ${issue.issue}`,
          suggestion: `Consider updating or replacing ${issue.name}`,
        });
      }
    });
    
  } catch (error) {
    console.log(`❌ Error validating dependencies in ${packageJsonPath}: ${error}`);
  }

  return errors;
}

/**
 * Validates node_modules consistency
 */
function validateNodeModules(projectRoot: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const nodeModulesPath = path.join(projectRoot, 'node_modules');
  
  if (!fs.existsSync(nodeModulesPath)) {
    console.log(`⚠️  node_modules does not exist: ${nodeModulesPath}`);
    return errors;
  }

  try {
    const packageJsonPath = path.join(projectRoot, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson: PackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };
      
      // Check if all dependencies are installed
      Object.keys(allDeps).forEach(depName => {
        const depPath = path.join(nodeModulesPath, depName);
        if (!fs.existsSync(depPath)) {
          errors.push({
            file: packageJsonPath,
            line: 1,
            message: `Dependency '${depName}' is not installed`,
            suggestion: `Run 'npm install' to install missing dependencies`,
          });
        }
      });
    }
  } catch (error) {
    console.log(`❌ Error validating node_modules: ${error}`);
  }

  return errors;
}

/**
 * Formats validation errors for display
 */
function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) {
    return '✅ All dependencies pass validation!';
  }

  const grouped = errors.reduce((acc, error) => {
    if (!acc[error.file]) {
      acc[error.file] = [];
    }
    acc[error.file].push(error);
    return acc;
  }, {} as Record<string, ValidationError[]>);

  let output = `❌ Found ${errors.length} dependency validation errors:\n\n`;

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
const targetPaths = args.length > 0 ? args : ['.'];

console.log('🔍 Validating dependencies...\n');

let hasErrors = false;
const allErrors: ValidationError[] = [];

targetPaths.forEach(targetPath => {
  const fullPath = path.resolve(targetPath);
  console.log(`Checking: ${fullPath}`);
  
  // Validate package.json
  const packageJsonPath = path.join(fullPath, 'package.json');
  const packageErrors = validateDependencies(packageJsonPath);
  
  // Validate node_modules
  const nodeModulesErrors = validateNodeModules(fullPath);
  
  const errors = [...packageErrors, ...nodeModulesErrors];
  
  if (errors.length > 0) {
    hasErrors = true;
    allErrors.push(...errors);
  }
});

if (allErrors.length > 0) {
  console.log('\n' + formatValidationErrors(allErrors));
} else {
  console.log('✅ No dependency validation errors found!');
}

if (hasErrors) {
  process.exit(1);
} else {
  process.exit(0);
}
