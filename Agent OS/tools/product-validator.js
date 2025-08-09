#!/usr/bin/env node

/**
 * Agent OS Product Tech Stack Validator
 * Ensures .agent-os/product/tech-stack.md is used as the authoritative source
 * for all base project operations (base/backend, base/frontend, base/src)
 * 
 * Usage: node .agent-os/tools/product-validator.js [base-project-path]
 */

const fs = require('fs');
const path = require('path');

class ProductValidator {
  constructor() {
    this.baseProjectPath = process.argv[2] || '.';
    this.agentOsPath = path.join(__dirname, '..');
    this.productTechStackPath = path.join(this.agentOsPath, 'product', 'tech-stack.md');
    this.standardsTechStackPath = path.join(this.agentOsPath, 'standards', 'tech-stack.md');
    
    this.validationResults = {
      productTechStackExists: false,
      productTechStackContent: null,
      standardsTechStackContent: null,
      baseProjectStructure: {},
      validationErrors: [],
      recommendations: []
    };
  }

  /**
   * Main validation process
   */
  async validate() {
    console.log('🔍 Agent OS Product Tech Stack Validator');
    console.log('==========================================\n');

    // Step 1: Check if product tech stack exists
    await this.checkProductTechStack();

    // Step 2: Load tech stack contents
    await this.loadTechStackContents();

    // Step 3: Validate base project structure
    await this.validateBaseProjectStructure();

    // Step 4: Generate recommendations
    await this.generateRecommendations();

    // Step 5: Display results
    this.displayResults();

    return this.validationResults;
  }

  /**
   * Check if .agent-os/product/tech-stack.md exists
   */
  async checkProductTechStack() {
    console.log('📋 Checking product tech stack file...');
    
    if (fs.existsSync(this.productTechStackPath)) {
      this.validationResults.productTechStackExists = true;
      console.log('✅ .agent-os/product/tech-stack.md exists');
    } else {
      this.validationResults.productTechStackExists = false;
      this.validationResults.validationErrors.push({
        type: 'CRITICAL',
        message: '.agent-os/product/tech-stack.md does not exist',
        recommendation: 'Create .agent-os/product/tech-stack.md with project-specific technology stack'
      });
      console.log('❌ .agent-os/product/tech-stack.md does not exist');
    }
  }

  /**
   * Load tech stack contents for comparison
   */
  async loadTechStackContents() {
    console.log('\n📖 Loading tech stack contents...');

    // Load product tech stack if it exists
    if (this.validationResults.productTechStackExists) {
      try {
        this.validationResults.productTechStackContent = fs.readFileSync(this.productTechStackPath, 'utf8');
        console.log('✅ Product tech stack loaded');
      } catch (error) {
        this.validationResults.validationErrors.push({
          type: 'ERROR',
          message: `Failed to read product tech stack: ${error.message}`,
          recommendation: 'Check file permissions and content'
        });
        console.log('❌ Failed to read product tech stack');
      }
    }

    // Load standards tech stack for reference
    try {
      this.validationResults.standardsTechStackContent = fs.readFileSync(this.standardsTechStackPath, 'utf8');
      console.log('✅ Standards tech stack loaded for reference');
    } catch (error) {
      console.log('⚠️  Could not load standards tech stack for reference');
    }
  }

  /**
   * Validate base project structure (base/backend, base/frontend, base/src)
   */
  async validateBaseProjectStructure() {
    console.log('\n🏗️  Validating base project structure...');

    const baseDirectories = ['backend', 'frontend', 'src'];
    
    for (const dir of baseDirectories) {
      const dirPath = path.join(this.baseProjectPath, dir);
      const exists = fs.existsSync(dirPath);
      
      this.validationResults.baseProjectStructure[dir] = {
        exists,
        path: dirPath,
        files: exists ? this.getDirectoryFiles(dirPath) : []
      };

      if (exists) {
        console.log(`✅ ${dir}/ directory exists`);
        
        // Check for tech stack related files
        await this.validateDirectoryTechStack(dir, dirPath);
      } else {
        console.log(`⚠️  ${dir}/ directory does not exist`);
      }
    }
  }

  /**
   * Get files in a directory recursively
   */
  getDirectoryFiles(dirPath) {
    const files = [];
    
    try {
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          files.push({
            name: item,
            type: 'directory',
            path: fullPath,
            children: this.getDirectoryFiles(fullPath)
          });
        } else {
          files.push({
            name: item,
            type: 'file',
            path: fullPath,
            size: stat.size
          });
        }
      }
    } catch (error) {
      console.log(`⚠️  Could not read directory ${dirPath}: ${error.message}`);
    }
    
    return files;
  }

  /**
   * Validate tech stack compliance for a specific directory
   */
  async validateDirectoryTechStack(dirName, dirPath) {
    console.log(`  🔍 Validating ${dirName}/ tech stack compliance...`);

    // Check for package.json (frontend) or pom.xml (backend)
    const configFiles = {
      'frontend': ['package.json', 'vite.config.ts', 'tsconfig.json'],
      'backend': ['pom.xml', 'build.gradle', 'application.yml'],
      'src': ['package.json', 'tsconfig.json', 'vite.config.ts']
    };

    const filesToCheck = configFiles[dirName] || [];
    
    for (const file of filesToCheck) {
      const filePath = path.join(dirPath, file);
      if (fs.existsSync(filePath)) {
        console.log(`    ✅ ${file} exists`);
        
        // Validate against product tech stack if it exists
        if (this.validationResults.productTechStackExists) {
          await this.validateFileAgainstTechStack(filePath, dirName);
        }
      } else {
        console.log(`    ⚠️  ${file} not found`);
      }
    }
  }

  /**
   * Validate a specific file against the product tech stack
   */
  async validateFileAgainstTechStack(filePath, dirName) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Basic validation based on file type
      if (filePath.endsWith('package.json')) {
        await this.validatePackageJson(content, dirName);
      } else if (filePath.endsWith('pom.xml')) {
        await this.validatePomXml(content, dirName);
      } else if (filePath.endsWith('vite.config.ts')) {
        await this.validateViteConfig(content, dirName);
      }
    } catch (error) {
      this.validationResults.validationErrors.push({
        type: 'WARNING',
        message: `Could not validate ${filePath}: ${error.message}`,
        recommendation: 'Check file format and permissions'
      });
    }
  }

  /**
   * Validate package.json against tech stack
   */
  async validatePackageJson(content, dirName) {
    try {
      const pkg = JSON.parse(content);
      
      // Check for required dependencies based on tech stack
      const requiredDeps = {
        'frontend': ['react', 'typescript', 'vite'],
        'src': ['react', 'typescript', 'vite']
      };
      
      const deps = requiredDeps[dirName] || [];
      
      for (const dep of deps) {
        if (!pkg.dependencies?.[dep] && !pkg.devDependencies?.[dep]) {
          this.validationResults.validationErrors.push({
            type: 'WARNING',
            message: `${dep} dependency not found in ${dirName}/package.json`,
            recommendation: `Add ${dep} to package.json dependencies`
          });
        }
      }
    } catch (error) {
      this.validationResults.validationErrors.push({
        type: 'ERROR',
        message: `Invalid package.json in ${dirName}: ${error.message}`,
        recommendation: 'Fix package.json format'
      });
    }
  }

  /**
   * Validate pom.xml against tech stack
   */
  async validatePomXml(content, dirName) {
    // Check for Spring Boot and Java version
    if (!content.includes('spring-boot-starter-parent')) {
      this.validationResults.validationErrors.push({
        type: 'WARNING',
        message: 'Spring Boot parent not found in pom.xml',
        recommendation: 'Add spring-boot-starter-parent to pom.xml'
      });
    }
    
    if (!content.includes('<java.version>21</java.version>')) {
      this.validationResults.validationErrors.push({
        type: 'WARNING',
        message: 'Java 21 not specified in pom.xml',
        recommendation: 'Set java.version to 21 in pom.xml'
      });
    }
  }

  /**
   * Validate vite.config.ts against tech stack
   */
  async validateViteConfig(content, dirName) {
    if (!content.includes('@vitejs/plugin-react')) {
      this.validationResults.validationErrors.push({
        type: 'WARNING',
        message: 'React plugin not found in vite.config.ts',
        recommendation: 'Add @vitejs/plugin-react to vite configuration'
      });
    }
  }

  /**
   * Generate recommendations based on validation results
   */
  async generateRecommendations() {
    console.log('\n💡 Generating recommendations...');

    if (!this.validationResults.productTechStackExists) {
      this.validationResults.recommendations.push({
        priority: 'CRITICAL',
        action: 'Create .agent-os/product/tech-stack.md',
        description: 'Create the authoritative tech stack file for this project',
        example: this.generateTechStackTemplate()
      });
    }

    // Check if base project directories exist
    const missingDirs = Object.entries(this.validationResults.baseProjectStructure)
      .filter(([dir, info]) => !info.exists)
      .map(([dir]) => dir);

    if (missingDirs.length > 0) {
      this.validationResults.recommendations.push({
        priority: 'HIGH',
        action: 'Create missing base directories',
        description: `Create directories: ${missingDirs.join(', ')}`,
        example: `mkdir -p ${missingDirs.join(' ')}`
      });
    }

    // Add recommendations for tech stack alignment
    if (this.validationResults.productTechStackExists) {
      this.validationResults.recommendations.push({
        priority: 'MEDIUM',
        action: 'Validate tech stack alignment',
        description: 'Ensure all base project files align with .agent-os/product/tech-stack.md',
        example: 'Review package.json, pom.xml, and configuration files'
      });
    }
  }

  /**
   * Generate a tech stack template
   */
  generateTechStackTemplate() {
    return `# Project Tech Stack

## Frontend
- React: 19.1.0
- TypeScript: 5.8.3
- Vite: 7.0.4
- TailwindCSS: 4.1.11
- TanStack Query: 5.84.1

## Backend
- Spring Boot: 3.5.3
- Java: 21 LTS
- PostgreSQL: 17
- Kafka: Latest

## Development Tools
- ESLint: 9.30.1
- Prettier: 3.6.2
- Vitest: 3.2.4

## AI/ML
- OpenAI GPT-4o
- pgvector: 0.7
- LangChain: 0.2

## Observability
- Prometheus: Latest
- Grafana: Latest
- InfluxDB: 3 Core

## Containerization
- Docker: 24+
- Docker Compose: Latest`;
  }

  /**
   * Display validation results
   */
  displayResults() {
    console.log('\n📊 Validation Results');
    console.log('====================\n');

    // Display errors
    if (this.validationResults.validationErrors.length > 0) {
      console.log('❌ Validation Errors:');
      this.validationResults.validationErrors.forEach(error => {
        console.log(`  ${error.type}: ${error.message}`);
        console.log(`    Recommendation: ${error.recommendation}\n`);
      });
    } else {
      console.log('✅ No validation errors found');
    }

    // Display recommendations
    if (this.validationResults.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      this.validationResults.recommendations.forEach(rec => {
        console.log(`  ${rec.priority}: ${rec.action}`);
        console.log(`    ${rec.description}`);
        if (rec.example) {
          console.log(`    Example: ${rec.example}`);
        }
        console.log('');
      });
    }

    // Display summary
    console.log('📋 Summary:');
    console.log(`  Product Tech Stack: ${this.validationResults.productTechStackExists ? '✅ Exists' : '❌ Missing'}`);
    console.log(`  Base Directories: ${Object.values(this.validationResults.baseProjectStructure).filter(info => info.exists).length}/${Object.keys(this.validationResults.baseProjectStructure).length} exist`);
    console.log(`  Validation Errors: ${this.validationResults.validationErrors.length}`);
    console.log(`  Recommendations: ${this.validationResults.recommendations.length}`);
  }
}

// Main execution
if (require.main === module) {
  const validator = new ProductValidator();
  validator.validate().catch(error => {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  });
}

module.exports = ProductValidator; 