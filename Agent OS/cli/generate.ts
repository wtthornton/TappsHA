#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { program } from 'commander';
import * as handlebars from 'handlebars';

interface GeneratorConfig {
  type: 'component' | 'service' | 'test' | 'hook' | 'api';
  name: string;
  template?: string;
  options: Record<string, any>;
}

/**
 * Load template from file
 */
function loadTemplate(type: string, templateName?: string): string {
  const templatePath = path.join(
    __dirname,
    '..',
    'templates',
    'generators',
    type,
    `${templateName || 'default'}.hbs`
  );
  
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: ${templatePath}`);
  }
  
  return fs.readFileSync(templatePath, 'utf-8');
}

/**
 * Generate code from template
 */
function generateCode(config: GeneratorConfig): string {
  const template = loadTemplate(config.type, config.template);
  const compiled = handlebars.compile(template);
  
  const context = {
    name: config.name,
    ...config.options,
    // Helper functions
    camelCase: (str: string) => str.charAt(0).toLowerCase() + str.slice(1),
    pascalCase: (str: string) => str.charAt(0).toUpperCase() + str.slice(1),
    kebabCase: (str: string) => str.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, ''),
  };
  
  return compiled(context);
}

/**
 * Get output path for generated file
 */
function getOutputPath(type: string, name: string, options: any): string {
  const basePaths: Record<string, string> = {
    component: 'src/components',
    service: 'src/services',
    test: 'src/__tests__',
    hook: 'src/hooks',
    api: 'src/services/api',
  };
  
  const basePath = options.path || basePaths[type] || 'src';
  const fileName = getFileName(type, name, options);
  
  return path.join(basePath, fileName);
}

/**
 * Get file name based on type
 */
function getFileName(type: string, name: string, options: any): string {
  const extensions: Record<string, string> = {
    component: options.typescript ? '.tsx' : '.jsx',
    service: options.typescript ? '.ts' : '.js',
    test: options.typescript ? '.test.tsx' : '.test.jsx',
    hook: options.typescript ? '.ts' : '.js',
    api: options.typescript ? '.ts' : '.js',
  };
  
  const extension = extensions[type] || '.ts';
  
  if (type === 'test') {
    const targetName = options.target || name;
    return `${targetName}.test${extension}`;
  }
  
  return `${name}${extension}`;
}

/**
 * Write generated code to file
 */
function writeFile(filePath: string, content: string, options: any): void {
  const dir = path.dirname(filePath);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Check if file already exists
  if (fs.existsSync(filePath) && !options.force) {
    throw new Error(`File already exists: ${filePath}. Use --force to overwrite.`);
  }
  
  fs.writeFileSync(filePath, content);
}

// Set up CLI
program
  .name('agent-os-generate')
  .description('Generate code from Agent-OS templates')
  .version('1.0.0');

// Component generator
program
  .command('component <name>')
  .description('Generate a React component')
  .option('-t, --template <template>', 'Template to use', 'default')
  .option('--typescript', 'Use TypeScript', true)
  .option('--with-test', 'Generate test file')
  .option('--with-story', 'Generate Storybook story')
  .option('--path <path>', 'Output path')
  .option('-f, --force', 'Overwrite existing files')
  .action((name: string, options: any) => {
    try {
      const config: GeneratorConfig = {
        type: 'component',
        name,
        template: options.template,
        options,
      };
      
      const code = generateCode(config);
      const outputPath = getOutputPath('component', name, options);
      
      writeFile(outputPath, code, options);
      console.log(`✅ Generated component: ${outputPath}`);
      
      // Generate test if requested
      if (options.withTest) {
        const testConfig: GeneratorConfig = {
          type: 'test',
          name,
          template: 'component',
          options: { ...options, target: name },
        };
        
        const testCode = generateCode(testConfig);
        const testPath = getOutputPath('test', name, options);
        
        writeFile(testPath, testCode, options);
        console.log(`✅ Generated test: ${testPath}`);
      }
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  });

// Service generator
program
  .command('service <name>')
  .description('Generate a service')
  .option('-t, --template <template>', 'Template to use', 'default')
  .option('--singleton', 'Generate as singleton')
  .option('--with-test', 'Generate test file')
  .option('--typescript', 'Use TypeScript', true)
  .option('--path <path>', 'Output path')
  .option('-f, --force', 'Overwrite existing files')
  .action((name: string, options: any) => {
    try {
      const config: GeneratorConfig = {
        type: 'service',
        name,
        template: options.singleton ? 'singleton' : options.template,
        options,
      };
      
      const code = generateCode(config);
      const outputPath = getOutputPath('service', name, options);
      
      writeFile(outputPath, code, options);
      console.log(`✅ Generated service: ${outputPath}`);
      
      // Generate test if requested
      if (options.withTest) {
        const testConfig: GeneratorConfig = {
          type: 'test',
          name,
          template: options.singleton ? 'singleton-service' : 'service',
          options: { ...options, target: name },
        };
        
        const testCode = generateCode(testConfig);
        const testPath = getOutputPath('test', name, options);
        
        writeFile(testPath, testCode, options);
        console.log(`✅ Generated test: ${testPath}`);
      }
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  });

// Test generator
program
  .command('test <name>')
  .description('Generate a test file')
  .option('-t, --template <template>', 'Template to use')
  .option('--type <type>', 'Type of test (component, service, hook)', 'component')
  .option('--typescript', 'Use TypeScript', true)
  .option('--path <path>', 'Output path')
  .option('-f, --force', 'Overwrite existing files')
  .action((name: string, options: any) => {
    try {
      const config: GeneratorConfig = {
        type: 'test',
        name,
        template: options.template || options.type,
        options: { ...options, target: name },
      };
      
      const code = generateCode(config);
      const outputPath = getOutputPath('test', name, options);
      
      writeFile(outputPath, code, options);
      console.log(`✅ Generated test: ${outputPath}`);
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  });

// Hook generator
program
  .command('hook <name>')
  .description('Generate a React hook')
  .option('-t, --template <template>', 'Template to use', 'default')
  .option('--with-test', 'Generate test file')
  .option('--typescript', 'Use TypeScript', true)
  .option('--path <path>', 'Output path')
  .option('-f, --force', 'Overwrite existing files')
  .action((name: string, options: any) => {
    try {
      const config: GeneratorConfig = {
        type: 'hook',
        name,
        template: options.template,
        options,
      };
      
      const code = generateCode(config);
      const outputPath = getOutputPath('hook', name, options);
      
      writeFile(outputPath, code, options);
      console.log(`✅ Generated hook: ${outputPath}`);
      
      // Generate test if requested
      if (options.withTest) {
        const testConfig: GeneratorConfig = {
          type: 'test',
          name,
          template: 'hook',
          options: { ...options, target: name },
        };
        
        const testCode = generateCode(testConfig);
        const testPath = getOutputPath('test', name, options);
        
        writeFile(testPath, testCode, options);
        console.log(`✅ Generated test: ${testPath}`);
      }
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  });

// API service generator
program
  .command('api <name>')
  .description('Generate an API service')
  .option('-t, --template <template>', 'Template to use', 'default')
  .option('--with-test', 'Generate test file')
  .option('--typescript', 'Use TypeScript', true)
  .option('--path <path>', 'Output path')
  .option('-f, --force', 'Overwrite existing files')
  .action((name: string, options: any) => {
    try {
      const config: GeneratorConfig = {
        type: 'api',
        name,
        template: options.template,
        options,
      };
      
      const code = generateCode(config);
      const outputPath = getOutputPath('api', name, options);
      
      writeFile(outputPath, code, options);
      console.log(`✅ Generated API service: ${outputPath}`);
      
      // Generate test if requested
      if (options.withTest) {
        const testConfig: GeneratorConfig = {
          type: 'test',
          name,
          template: 'api-service',
          options: { ...options, target: name },
        };
        
        const testCode = generateCode(testConfig);
        const testPath = getOutputPath('test', name, options);
        
        writeFile(testPath, testCode, options);
        console.log(`✅ Generated test: ${testPath}`);
      }
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  });

// Parse arguments
program.parse(process.argv);