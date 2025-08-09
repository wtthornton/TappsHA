#!/usr/bin/env node

/**
 * Enhanced Real-Time Cursor Integration for Agent OS
 * Leverages all Agent OS utilities, standards, and lessons learned for maximum early issue detection
 */

const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

// Import all Agent OS utilities
const { DependencyValidator, CircularDependencyDetector } = require('../utils/dependency-validator.js');
const CrossPlatformShell = require('../utils/cross-platform-shell.js');
const InfrastructureRecovery = require('../utils/infrastructure-recovery.js');
const FeatureScoringFramework = require('../utils/feature-scoring.js');
const ComplianceChecker = require('../tools/compliance-checker.js');

class EnhancedCursorIntegration {
  constructor() {
    this.dependencyValidator = new DependencyValidator();
    this.circularDetector = new CircularDependencyDetector();
    this.shell = new CrossPlatformShell();
    this.infrastructureRecovery = new InfrastructureRecovery();
    this.featureScoring = new FeatureScoringFramework();
    this.complianceChecker = new ComplianceChecker();
    
    this.realTimeState = {
      lastEnvironmentCheck: 0,
      lastInfrastructureCheck: 0,
      activeFeatures: new Map(),
      complianceHistory: [],
      currentPhase: this.detectCurrentPhase(),
      issuePreventionActive: true
    };
    
    this.initializeWatchers();
  }

  /**
   * Initialize file watchers for real-time monitoring
   */
  initializeWatchers() {
    console.log('🚀 Initializing enhanced real-time monitoring...');
    
    // Watch for new features being planned
    this.watchFeaturePlanning();
    
    // Watch for package.json changes
    this.watchDependencyChanges();
    
    // Watch for infrastructure configuration changes
    this.watchInfrastructureChanges();
    
    // Watch for code changes with comprehensive validation
    this.watchCodeChanges();
    
    console.log('✅ Real-time monitoring active');
  }

  /**
   * Watch for feature planning files to apply scoring immediately
   */
  watchFeaturePlanning() {
    const featurePaths = [
      'specs/**/*.md',
      '.agent-os/product/**/*.md',
      'roadmap*.md',
      'backlog*.json',
      'features*.json'
    ];

    featurePaths.forEach(pattern => {
      chokidar.watch(pattern, { ignoreInitial: true }).on('change', (filePath) => {
        this.onFeaturePlanningChange(filePath);
      });
    });
  }

  /**
   * Handle feature planning file changes
   */
  async onFeaturePlanningChange(filePath) {
    console.log(`📋 Feature planning detected: ${filePath}`);
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Extract features from markdown or JSON
      const features = this.extractFeaturesFromContent(content, filePath);
      
      if (features.length > 0) {
        console.log(`🎯 Scoring ${features.length} features for early scope management...`);
        
        const results = this.featureScoring.scoreFeatures(features);
        
        // Immediate feedback on feature quality
        if (results.analysis.eliminationCandidates.length > 0) {
          console.log(`⚠️  WARNING: ${results.analysis.eliminationCandidates.length} features recommended for elimination:`);
          results.analysis.eliminationCandidates.forEach(feature => {
            console.log(`  ❌ ${feature.name} (Score: ${feature.scores.weighted}/10)`);
          });
        }

        // Highlight quick wins
        if (results.analysis.quickWins.length > 0) {
          console.log(`⚡ QUICK WINS identified: ${results.analysis.quickWins.length} high-impact, low-complexity features`);
          results.analysis.quickWins.slice(0, 3).forEach(feature => {
            console.log(`  ✨ ${feature.name} (Impact: ${feature.scores.impact}, Complexity: ${feature.scores.complexity})`);
          });
        }

        // Save feature scoring report
        const reportPath = path.join(path.dirname(filePath), `feature-scoring-${Date.now()}.json`);
        this.featureScoring.generateReport(results, reportPath);
        
        console.log(`📊 Feature scoring report saved: ${reportPath}`);
      }
      
    } catch (error) {
      console.error(`❌ Error processing feature planning file: ${error.message}`);
    }
  }

  /**
   * Watch for package.json changes to validate dependencies immediately
   */
  watchDependencyChanges() {
    const packageFiles = ['package.json', 'package-lock.json', 'pom.xml', 'build.gradle'];
    
    packageFiles.forEach(file => {
      if (fs.existsSync(file)) {
        chokidar.watch(file, { ignoreInitial: true }).on('change', () => {
          this.onDependencyChange(file);
        });
      }
    });
  }

  /**
   * Handle dependency file changes
   */
  async onDependencyChange(filePath) {
    console.log(`📦 Dependency change detected: ${filePath}`);
    
    // Immediate environment validation
    const envResult = this.dependencyValidator.validateEnvironment({
      minNodeVersion: 18,
      checkPackageJson: true
    });

    if (!envResult.overall) {
      console.log('🚨 CRITICAL: Environment validation failed after dependency change!');
      console.log('💡 Suggestion: Run npm install or fix dependency issues before continuing');
      
      // Suggest fixes
      if (envResult.dependencies && !envResult.dependencies.passed) {
        console.log(`   Missing dependencies: ${envResult.dependencies.missingModules.join(', ')}`);
        console.log(`   Run: npm install`);
      }
    } else {
      console.log('✅ Environment validation passed');
    }

    // Check for technology stack compliance
    this.validateTechnologyStackCompliance(filePath);
  }

  /**
   * Watch for infrastructure configuration changes
   */
  watchInfrastructureChanges() {
    const infraFiles = [
      'docker-compose.yml',
      'docker-compose.*.yml',
      'Dockerfile',
      '.env',
      'application.yml',
      'application.properties'
    ];

    infraFiles.forEach(pattern => {
      chokidar.watch(pattern, { ignoreInitial: true }).on('change', (filePath) => {
        this.onInfrastructureChange(filePath);
      });
    });
  }

  /**
   * Handle infrastructure configuration changes
   */
  async onInfrastructureChange(filePath) {
    console.log(`🏗️  Infrastructure change detected: ${filePath}`);
    
    // Run immediate infrastructure health check
    try {
      const healthResults = await this.infrastructureRecovery.assessInfrastructureHealth({
        runRecovery: false, // Don't auto-recover on config changes
        includeChecks: ['containers', 'ports', 'dependencies']
      });

      if (healthResults.overall !== 'healthy') {
        console.log('⚠️  Infrastructure health issues detected after configuration change:');
        healthResults.issues.forEach(issue => {
          console.log(`   ❌ ${issue}`);
        });
        
        console.log('💡 Recommendations:');
        healthResults.recommendations.forEach(rec => {
          console.log(`   📝 ${rec}`);
        });
      } else {
        console.log('✅ Infrastructure health check passed');
      }
      
    } catch (error) {
      console.error(`❌ Infrastructure health check failed: ${error.message}`);
    }
  }

  /**
   * Watch for code changes with enhanced validation
   */
  watchCodeChanges() {
    const codePatterns = [
      'src/**/*.{js,ts,tsx,java}',
      'backend/**/*.{java,yml}',
      'frontend/**/*.{ts,tsx}',
      'test/**/*.{js,ts,java}'
    ];

    codePatterns.forEach(pattern => {
      chokidar.watch(pattern, { ignoreInitial: true }).on('change', (filePath) => {
        this.onCodeChange(filePath);
      });
    });
  }

  /**
   * Handle code file changes with comprehensive validation
   */
  async onCodeChange(filePath) {
    console.log(`💻 Code change detected: ${filePath}`);
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // 1. Immediate compliance check
      const violations = await this.complianceChecker.validateCode(filePath, content);
      
      // 2. Circular dependency detection for JavaScript/TypeScript
      if (filePath.match(/\.(js|ts|tsx)$/)) {
        this.detectCircularDependencies(filePath, content);
      }
      
      // 3. Security validation
      this.performSecurityValidation(filePath, content);
      
      // 4. Architecture pattern validation
      this.validateArchitecturePatterns(filePath, content);
      
      // 5. Testing requirement check
      this.checkTestingRequirements(filePath);
      
      // 6. Real-time suggestions
      this.provideRealTimeSuggestions(filePath, content, violations);
      
    } catch (error) {
      console.error(`❌ Error processing code change: ${error.message}`);
    }
  }

  /**
   * Detect circular dependencies in real-time
   */
  detectCircularDependencies(filePath, content) {
    try {
      // Extract imports/requires
      const imports = this.extractImports(content);
      
      imports.forEach(importPath => {
        this.circularDetector.trackCall(`${filePath}->${importPath}`);
      });
      
      this.circularDetector.endCall();
      
    } catch (error) {
      if (error.message.includes('Circular dependency detected')) {
        console.log('🚨 CRITICAL: Circular dependency detected!');
        console.log(`   ${error.message}`);
        console.log('💡 Suggestion: Refactor to break the circular dependency');
      }
    }
  }

  /**
   * Perform real-time security validation
   */
  performSecurityValidation(filePath, content) {
    const securityIssues = [];
    
    // Check for hardcoded secrets
    const secretPatterns = [
      /password\s*=\s*["'][^"']+["']/gi,
      /token\s*=\s*["'][^"']+["']/gi,
      /secret\s*=\s*["'][^"']+["']/gi,
      /api_key\s*=\s*["'][^"']+["']/gi
    ];

    secretPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        securityIssues.push(`Potential hardcoded secret detected: ${matches[0]}`);
      }
    });

    // Check for SQL injection vulnerabilities
    if (content.includes('SELECT') || content.includes('INSERT') || content.includes('UPDATE')) {
      if (!content.includes('@Param') && !content.includes('PreparedStatement')) {
        securityIssues.push('Potential SQL injection vulnerability - use @Param or PreparedStatement');
      }
    }

    if (securityIssues.length > 0) {
      console.log('🔒 SECURITY ISSUES detected:');
      securityIssues.forEach(issue => {
        console.log(`   🚨 ${issue}`);
      });
    }
  }

  /**
   * Validate architecture patterns in real-time
   */
  validateArchitecturePatterns(filePath, content) {
    const issues = [];
    
    // Check Controller -> Service -> Repository pattern for Java files
    if (filePath.includes('controller') && filePath.endsWith('.java')) {
      if (!content.includes('@RestController') && !content.includes('@Controller')) {
        issues.push('Controller class should have @RestController or @Controller annotation');
      }
      if (content.includes('repository.') && !content.includes('service.')) {
        issues.push('Controller should not directly access Repository - use Service layer');
      }
    }

    // Check Service layer patterns
    if (filePath.includes('service') && filePath.endsWith('.java')) {
      if (!content.includes('@Service')) {
        issues.push('Service class should have @Service annotation');
      }
    }

    // Check Repository patterns
    if (filePath.includes('repository') && filePath.endsWith('.java')) {
      if (!content.includes('@Repository')) {
        issues.push('Repository class should have @Repository annotation');
      }
    }

    // Check React component patterns
    if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
      if (content.includes('class ') && content.includes('extends Component')) {
        issues.push('Use functional components with hooks instead of class components');
      }
    }

    if (issues.length > 0) {
      console.log('🏗️  ARCHITECTURE ISSUES detected:');
      issues.forEach(issue => {
        console.log(`   ⚠️  ${issue}`);
      });
    }
  }

  /**
   * Check testing requirements in real-time
   */
  checkTestingRequirements(filePath) {
    // Skip test files themselves
    if (filePath.includes('test') || filePath.includes('spec')) return;
    
    const testPatterns = [
      filePath.replace(/\.(js|ts|tsx|java)$/, '.test.$1'),
      filePath.replace(/\.(js|ts|tsx|java)$/, '.spec.$1'),
      filePath.replace('/src/', '/test/').replace(/\.(js|ts|tsx)$/, '.test.$1'),
      filePath.replace('/main/', '/test/')
    ];

    const hasTest = testPatterns.some(testPath => fs.existsSync(testPath));
    
    if (!hasTest) {
      console.log('🧪 TEST MISSING:');
      console.log(`   ⚠️  No test file found for ${filePath}`);
      console.log(`   💡 Suggestion: Create test file at one of these locations:`);
      testPatterns.slice(0, 2).forEach(testPath => {
        console.log(`      📄 ${testPath}`);
      });
    }
  }

  /**
   * Provide real-time suggestions based on current context
   */
  provideRealTimeSuggestions(filePath, content, violations) {
    const suggestions = [];
    
    // Phase-specific suggestions
    const currentPhase = this.realTimeState.currentPhase;
    
    if (currentPhase === 'foundation' && !this.hasSecurityImplementation(content)) {
      suggestions.push('Foundation Phase: Add security validation and encryption for sensitive data');
    }
    
    if (currentPhase === 'integration' && !this.hasProperLogging(content)) {
      suggestions.push('Integration Phase: Add structured logging with proper levels');
    }
    
    // Utility usage suggestions
    if (content.includes('execSync') || content.includes('exec(')) {
      suggestions.push('Use CrossPlatformShell from Agent OS utilities for better cross-platform compatibility');
    }
    
    if (content.includes('require.resolve') || content.includes('import(')) {
      suggestions.push('Use DependencyValidator from Agent OS utilities for safer dependency checking');
    }

    // Mock factory suggestions for test files
    if ((filePath.includes('test') || filePath.includes('spec')) && content.includes('vi.fn()')) {
      suggestions.push('Use standardized mock factories from .agent-os/testing/mock-factories.js');
    }

    if (suggestions.length > 0) {
      console.log('💡 REAL-TIME SUGGESTIONS:');
      suggestions.forEach(suggestion => {
        console.log(`   ✨ ${suggestion}`);
      });
    }
  }

  /**
   * Extract features from content (markdown or JSON)
   */
  extractFeaturesFromContent(content, filePath) {
    const features = [];
    
    if (filePath.endsWith('.json')) {
      try {
        const data = JSON.parse(content);
        if (Array.isArray(data)) {
          return data.filter(item => item.name && item.description);
        } else if (data.features) {
          return data.features;
        }
      } catch (error) {
        console.warn('Could not parse JSON for feature extraction');
      }
    }
    
    // Extract from markdown (basic pattern matching)
    const featurePattern = /(?:^|\n)(?:#+\s+|[-*]\s+)(.+)/g;
    let match;
    
    while ((match = featurePattern.exec(content)) !== null) {
      const name = match[1].trim();
      if (name.length > 5) { // Basic filter for meaningful feature names
        features.push({
          name,
          description: `Feature extracted from ${path.basename(filePath)}`,
          importance: 5,
          complexity: 5,
          impact: 5,
          category: 'extracted'
        });
      }
    }
    
    return features.slice(0, 10); // Limit to prevent noise
  }

  /**
   * Extract imports from code content
   */
  extractImports(content) {
    const imports = [];
    
    // JavaScript/TypeScript imports
    const importPattern = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
    const requirePattern = /require\(['"]([^'"]+)['"]\)/g;
    
    let match;
    while ((match = importPattern.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    while ((match = requirePattern.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    return imports;
  }

  /**
   * Detect current development phase
   */
  detectCurrentPhase() {
    // Check for phase indicators in the codebase
    if (fs.existsSync('.agent-os/product/phase1-completion-status.md')) {
      const content = fs.readFileSync('.agent-os/product/phase1-completion-status.md', 'utf8');
      if (content.includes('COMPLETE')) return 'integration';
    }
    
    if (fs.existsSync('src') || fs.existsSync('backend')) {
      return 'foundation';
    }
    
    return 'planning';
  }

  /**
   * Check if content has security implementation
   */
  hasSecurityImplementation(content) {
    const securityPatterns = [
      /@Secured/,
      /@PreAuthorize/,
      /SecurityConfig/,
      /encryptionService/,
      /validateInput/
    ];
    
    return securityPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Check if content has proper logging
   */
  hasProperLogging(content) {
    const loggingPatterns = [
      /private static final Logger/,
      /logger\.(info|debug|warn|error)/,
      /console\.log/
    ];
    
    return loggingPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Validate technology stack compliance
   */
  validateTechnologyStackCompliance(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const issues = [];
      
      if (filePath === 'package.json') {
        const packageData = JSON.parse(content);
        
        // Check React version
        if (packageData.dependencies?.react && !packageData.dependencies.react.includes('19')) {
          issues.push('React version should be 19.x according to tech stack standards');
        }
        
        // Check TypeScript version
        if (packageData.devDependencies?.typescript && !packageData.devDependencies.typescript.includes('5')) {
          issues.push('TypeScript version should be 5.x according to tech stack standards');
        }
      }
      
      if (filePath === 'pom.xml') {
        // Check Spring Boot version
        if (!content.includes('3.3') && !content.includes('3.4') && !content.includes('3.5')) {
          issues.push('Spring Boot version should be 3.3+ according to tech stack standards');
        }
        
        // Check Java version
        if (!content.includes('<java.version>21</java.version>')) {
          issues.push('Java version should be 21 LTS according to tech stack standards');
        }
      }
      
      if (issues.length > 0) {
        console.log('📚 TECHNOLOGY STACK COMPLIANCE ISSUES:');
        issues.forEach(issue => {
          console.log(`   ⚠️  ${issue}`);
        });
      }
      
    } catch (error) {
      console.warn(`Could not validate tech stack compliance for ${filePath}: ${error.message}`);
    }
  }

  /**
   * Start real-time monitoring
   */
  start() {
    console.log('🚀 Enhanced Agent OS real-time integration started');
    console.log('📊 Monitoring:');
    console.log('   📦 Dependencies & Environment');
    console.log('   🏗️  Infrastructure Configuration');
    console.log('   💻 Code Changes & Compliance');
    console.log('   📋 Feature Planning & Scoring');
    console.log('   🔒 Security & Architecture');
    console.log('   🧪 Testing Requirements');
    
    // Run initial environment check
    this.dependencyValidator.validateEnvironment({
      minNodeVersion: 18,
      checkPackageJson: true
    });
    
    // Run initial infrastructure check
    this.infrastructureRecovery.assessInfrastructureHealth({
      runRecovery: false,
      includeChecks: ['containers', 'ports']
    }).then(results => {
      if (results.overall === 'healthy') {
        console.log('✅ Initial infrastructure health check passed');
      } else {
        console.log('⚠️  Infrastructure health issues detected. Run with --recover to attempt fixes.');
      }
    });

    console.log('\n🎯 Real-time Agent OS integration active. Start coding to see immediate feedback!');
  }
}

module.exports = EnhancedCursorIntegration;

// CLI usage
if (require.main === module) {
  const integration = new EnhancedCursorIntegration();
  integration.start();
}