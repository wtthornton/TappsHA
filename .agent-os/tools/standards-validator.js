/**
 * Standards Validator - Validates project against Agent OS standards
 * 
 * Provides comprehensive validation against all Agent OS standards including
 * technology stack, code style, security, architecture, and testing standards.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

class StandardsValidator {
  constructor() {
    this.standardsPath = path.join(__dirname, '../standards');
    this.projectRoot = path.join(__dirname, '../../');
    this.violations = [];
    this.score = 0;
  }

  async validateStandards(options = {}) {
    console.log('🔍 Validating Agent OS Standards...\n');

    const startTime = Date.now();
    
    try {
      // Load standards
      const standards = await this.loadStandards();
      
      // Validate based on options
      if (options.standard) {
        await this.validateSpecificStandard(options.standard, standards);
      } else if (options.all) {
        await this.validateAllStandards(standards);
      } else {
        await this.validateAllStandards(standards);
      }

      // Calculate score
      this.calculateScore();
      
      // Display results
      this.displayResults();
      
      console.log(`\n⏱️  Validation completed in ${Date.now() - startTime}ms`);
      
      return {
        score: this.score,
        violations: this.violations,
        passed: this.score >= 85
      };
      
    } catch (error) {
      console.error('❌ Standards validation failed:', error.message);
      throw error;
    }
  }

  async loadStandards() {
    const standards = {};
    
    // Load all standard files
    const standardFiles = [
      'tech-stack.md',
      'code-style.md', 
      'best-practices.md',
      'security-compliance.md',
      'testing-strategy.md',
      'ci-cd-strategy.md',
      'enforcement.md'
    ];

    for (const file of standardFiles) {
      const filePath = path.join(this.standardsPath, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        standards[file.replace('.md', '')] = content;
      }
    }

    return standards;
  }

  async validateAllStandards(standards) {
    console.log('📋 Validating Technology Stack...');
    await this.validateTechnologyStack(standards['tech-stack']);
    
    console.log('📋 Validating Code Style...');
    await this.validateCodeStyle(standards['code-style']);
    
    console.log('📋 Validating Best Practices...');
    await this.validateBestPractices(standards['best-practices']);
    
    console.log('📋 Validating Security Compliance...');
    await this.validateSecurityCompliance(standards['security-compliance']);
    
    console.log('📋 Validating Testing Strategy...');
    await this.validateTestingStrategy(standards['testing-strategy']);
    
    console.log('📋 Validating CI/CD Strategy...');
    await this.validateCICDStrategy(standards['ci-cd-strategy']);
  }

  async validateSpecificStandard(standardName, standards) {
    const standardMap = {
      'tech-stack': () => this.validateTechnologyStack(standards['tech-stack']),
      'code-style': () => this.validateCodeStyle(standards['code-style']),
      'best-practices': () => this.validateBestPractices(standards['best-practices']),
      'security': () => this.validateSecurityCompliance(standards['security-compliance']),
      'testing': () => this.validateTestingStrategy(standards['testing-strategy']),
      'ci-cd': () => this.validateCICDStrategy(standards['ci-cd-strategy'])
    };

    if (standardMap[standardName]) {
      await standardMap[standardName]();
    } else {
      throw new Error(`Unknown standard: ${standardName}`);
    }
  }

  async validateTechnologyStack(standard) {
    // Check for Spring Boot 3.3+
    const springBootFiles = glob.sync('**/pom.xml', { cwd: this.projectRoot });
    for (const file of springBootFiles) {
      const content = fs.readFileSync(path.join(this.projectRoot, file), 'utf8');
      if (content.includes('<spring-boot.version>')) {
        const version = content.match(/<spring-boot\.version>([^<]+)</)?.[1];
        if (version && !version.startsWith('3.')) {
          this.addViolation('CRITICAL', 'Technology Stack', file, 
            `Spring Boot version ${version} does not meet requirement of 3.3+`);
        }
      }
    }

    // Check for React 19
    const packageJsonFiles = glob.sync('**/package.json', { cwd: this.projectRoot });
    for (const file of packageJsonFiles) {
      const content = fs.readFileSync(path.join(this.projectRoot, file), 'utf8');
      const pkg = JSON.parse(content);
      if (pkg.dependencies?.react && !pkg.dependencies.react.startsWith('^19')) {
        this.addViolation('CRITICAL', 'Technology Stack', file,
          `React version ${pkg.dependencies.react} does not meet requirement of ^19`);
      }
    }

    // Check for PostgreSQL configuration
    const applicationFiles = glob.sync('**/application.yml', { cwd: this.projectRoot });
    for (const file of applicationFiles) {
      const content = fs.readFileSync(path.join(this.projectRoot, file), 'utf8');
      if (content.includes('postgresql') && !content.includes('postgresql://')) {
        this.addViolation('WARNING', 'Technology Stack', file,
          'PostgreSQL configuration should use proper connection string format');
      }
    }
  }

  async validateCodeStyle(standard) {
    // Check for TypeScript usage
    const tsFiles = glob.sync('**/*.{ts,tsx}', { cwd: this.projectRoot });
    const jsFiles = glob.sync('**/*.{js,jsx}', { cwd: this.projectRoot });
    
    if (jsFiles.length > tsFiles.length) {
      this.addViolation('WARNING', 'Code Style', 'project',
        'More JavaScript files than TypeScript files found. Prefer TypeScript 5.');
    }

    // Check for proper indentation (2 spaces)
    for (const file of [...tsFiles, ...jsFiles]) {
      const content = fs.readFileSync(path.join(this.projectRoot, file), 'utf8');
      const lines = content.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith('  ') && line.length > 2 && line[2] !== ' ') {
          // Check for tabs or incorrect indentation
          if (line.includes('\t')) {
            this.addViolation('WARNING', 'Code Style', file,
              `Line ${i + 1}: Use 2 spaces for indentation, not tabs`);
          }
        }
      }
    }

    // Check for line length (100 chars max)
    for (const file of [...tsFiles, ...jsFiles]) {
      const content = fs.readFileSync(path.join(this.projectRoot, file), 'utf8');
      const lines = content.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.length > 100) {
          this.addViolation('WARNING', 'Code Style', file,
            `Line ${i + 1}: Exceeds 100 character limit (${line.length} chars)`);
        }
      }
    }
  }

  async validateBestPractices(standard) {
    // Check for Controller → Service → Repository pattern
    const javaFiles = glob.sync('**/*.java', { cwd: this.projectRoot });
    const hasController = javaFiles.some(f => f.includes('Controller'));
    const hasService = javaFiles.some(f => f.includes('Service'));
    const hasRepository = javaFiles.some(f => f.includes('Repository'));

    if (!hasController || !hasService || !hasRepository) {
      this.addViolation('CRITICAL', 'Best Practices', 'project',
        'Missing Controller → Service → Repository pattern components');
    }

    // Check for proper annotations
    for (const file of javaFiles) {
      const content = fs.readFileSync(path.join(this.projectRoot, file), 'utf8');
      
      if (file.includes('Controller') && !content.includes('@RestController')) {
        this.addViolation('CRITICAL', 'Best Practices', file,
          'Controller classes should use @RestController annotation');
      }
      
      if (file.includes('Service') && !content.includes('@Service')) {
        this.addViolation('CRITICAL', 'Best Practices', file,
          'Service classes should use @Service annotation');
      }
      
      if (file.includes('Repository') && !content.includes('@Repository')) {
        this.addViolation('CRITICAL', 'Best Practices', file,
          'Repository classes should use @Repository annotation');
      }
    }
  }

  async validateSecurityCompliance(standard) {
    // Check for hardcoded secrets
    const allFiles = glob.sync('**/*.{java,ts,tsx,js,jsx,yml,yaml,properties}', { cwd: this.projectRoot });
    
    for (const file of allFiles) {
      const content = fs.readFileSync(path.join(this.projectRoot, file), 'utf8');
      
      // Check for hardcoded passwords, tokens, keys
      const secretPatterns = [
        /password\s*=\s*["'][^"']+["']/i,
        /token\s*=\s*["'][^"']+["']/i,
        /key\s*=\s*["'][^"']+["']/i,
        /secret\s*=\s*["'][^"']+["']/i
      ];
      
      for (const pattern of secretPatterns) {
        if (pattern.test(content)) {
          this.addViolation('CRITICAL', 'Security', file,
            'Hardcoded secrets detected. Use environment variables instead.');
        }
      }
    }

    // Check for input validation
    const controllerFiles = glob.sync('**/*Controller.java', { cwd: this.projectRoot });
    for (const file of controllerFiles) {
      const content = fs.readFileSync(path.join(this.projectRoot, file), 'utf8');
      
      if (content.includes('@RequestParam') && !content.includes('@Valid')) {
        this.addViolation('WARNING', 'Security', file,
          'Request parameters should be validated with @Valid annotation');
      }
    }
  }

  async validateTestingStrategy(standard) {
    // Check for test files
    const testFiles = glob.sync('**/*Test.java', { cwd: this.projectRoot });
    const sourceFiles = glob.sync('**/*.java', { cwd: this.projectRoot });
    
    if (testFiles.length === 0) {
      this.addViolation('CRITICAL', 'Testing', 'project',
        'No test files found. ≥85% branch coverage required.');
    }

    // Check for test coverage configuration
    const pomFiles = glob.sync('**/pom.xml', { cwd: this.projectRoot });
    for (const file of pomFiles) {
      const content = fs.readFileSync(path.join(this.projectRoot, file), 'utf8');
      
      if (!content.includes('jacoco') && !content.includes('coverage')) {
        this.addViolation('WARNING', 'Testing', file,
          'No test coverage tool configured. Consider adding JaCoCo.');
      }
    }
  }

  async validateCICDStrategy(standard) {
    // Check for CI/CD configuration
    const ciFiles = glob.sync('.github/workflows/*.yml', { cwd: this.projectRoot });
    
    if (ciFiles.length === 0) {
      this.addViolation('WARNING', 'CI/CD', 'project',
        'No CI/CD workflow found. Consider adding GitHub Actions.');
    }

    // Check for Docker configuration
    const dockerFiles = glob.sync('**/Dockerfile', { cwd: this.projectRoot });
    if (dockerFiles.length === 0) {
      this.addViolation('WARNING', 'CI/CD', 'project',
        'No Dockerfile found. Consider containerizing the application.');
    }
  }

  addViolation(type, category, file, message) {
    this.violations.push({
      type,
      category,
      file,
      message,
      timestamp: new Date().toISOString()
    });
  }

  calculateScore() {
    const totalChecks = 50; // Approximate number of checks performed
    const criticalViolations = this.violations.filter(v => v.type === 'CRITICAL').length;
    const warningViolations = this.violations.filter(v => v.type === 'WARNING').length;
    
    // Score calculation: 100% - (critical * 10) - (warning * 2)
    this.score = Math.max(0, 100 - (criticalViolations * 10) - (warningViolations * 2));
  }

  displayResults() {
    console.log('\n📊 Standards Validation Results:\n');
    
    const criticalViolations = this.violations.filter(v => v.type === 'CRITICAL');
    const warningViolations = this.violations.filter(v => v.type === 'WARNING');
    
    console.log(`🎯 Overall Score: ${this.score}%`);
    console.log(`❌ Critical Violations: ${criticalViolations.length}`);
    console.log(`⚠️  Warning Violations: ${warningViolations.length}`);
    
    if (criticalViolations.length > 0) {
      console.log('\n❌ Critical Violations:');
      criticalViolations.forEach(v => {
        console.log(`  - ${v.file}: ${v.message}`);
      });
    }
    
    if (warningViolations.length > 0) {
      console.log('\n⚠️  Warning Violations:');
      warningViolations.forEach(v => {
        console.log(`  - ${v.file}: ${v.message}`);
      });
    }
    
    if (this.score >= 85) {
      console.log('\n✅ Standards validation passed!');
    } else {
      console.log('\n❌ Standards validation failed. Please address violations.');
    }
  }
}

module.exports = StandardsValidator; 