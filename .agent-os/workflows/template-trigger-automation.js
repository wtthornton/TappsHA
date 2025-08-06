#!/usr/bin/env node

/**
 * Template Trigger Automation for Agent OS
 * Automatically triggers the right task templates at the right development phases
 * to catch issues as early as possible in the development lifecycle.
 */

const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

// Import Agent OS utilities for validation
const { DependencyValidator } = require('../utils/dependency-validator.js');
const FeatureScoringFramework = require('../utils/feature-scoring.js');
const InfrastructureRecovery = require('../utils/infrastructure-recovery.js');

class TemplateTriggerAutomation {
  constructor() {
    this.projectRoot = process.cwd();
    this.templatesPath = path.join(__dirname, '../templates');
    this.triggeredTemplates = new Set();
    this.currentPhase = this.detectCurrentPhase();
    
    // Validation utilities
    this.dependencyValidator = new DependencyValidator();
    this.featureScoring = new FeatureScoringFramework();
    this.infrastructureRecovery = new InfrastructureRecovery();
    
    this.initializeWatchers();
    this.runInitialValidation();
  }

  /**
   * Detect current development phase
   */
  detectCurrentPhase() {
    // Check for phase indicators
    if (fs.existsSync('.agent-os/product/phase1-completion-status.md')) {
      const content = fs.readFileSync('.agent-os/product/phase1-completion-status.md', 'utf8');
      if (content.includes('COMPLETE')) {
        if (fs.existsSync('.agent-os/product/phase2-completion-status.md')) {
          return 'advanced-features';
        }
        return 'integration';
      }
    }
    
    if (fs.existsSync('src') || fs.existsSync('backend') || fs.existsSync('frontend')) {
      return 'foundation';
    }
    
    return 'planning';
  }

  /**
   * Initialize file watchers for automatic template triggering
   */
  initializeWatchers() {
    console.log('🤖 Initializing template trigger automation...');
    
    // Watch for new developer setup
    this.watchForNewDeveloperSetup();
    
    // Watch for new service/controller creation
    this.watchForServiceCreation();
    
    // Watch for API endpoint creation
    this.watchForApiEndpointCreation();
    
    // Watch for feature planning
    this.watchForFeaturePlanning();
    
    // Watch for deployment preparation
    this.watchForDeploymentPreparation();
    
    // Watch for dependency changes
    this.watchForDependencyChanges();
    
    // Watch for infrastructure changes
    this.watchForInfrastructureChanges();
    
    console.log('✅ Template trigger automation active');
  }

  /**
   * Run initial validation when automation starts
   */
  async runInitialValidation() {
    console.log('🚀 Running initial development session validation...');
    
    // Trigger daily health check template
    await this.triggerTemplate('daily-development-health-check', {
      trigger: 'session-start',
      phase: this.currentPhase,
      auto: true
    });
  }

  /**
   * Watch for new developer setup indicators
   */
  watchForNewDeveloperSetup() {
    // Watch for package.json creation or major changes
    chokidar.watch('package.json', { ignoreInitial: true })
      .on('add', () => this.onNewDeveloperSetup('package.json created'))
      .on('change', () => this.onPackageJsonChange());
    
    // Watch for Docker setup
    chokidar.watch('docker-compose.yml', { ignoreInitial: true })
      .on('add', () => this.onNewDeveloperSetup('Docker configuration added'));
    
    // Watch for first code files
    chokidar.watch('src/**/*', { ignoreInitial: true })
      .on('add', (filePath) => {
        if (this.isFirstCodeFile(filePath)) {
          this.onNewDeveloperSetup('First code file created');
        }
      });
  }

  /**
   * Watch for new service/controller creation
   */
  watchForServiceCreation() {
    const servicePatterns = [
      'src/**/*Service.java',
      'src/**/*Controller.java', 
      'src/**/*Repository.java',
      'backend/**/*Service.java',
      'backend/**/*Controller.java'
    ];

    servicePatterns.forEach(pattern => {
      chokidar.watch(pattern, { ignoreInitial: true }).on('add', (filePath) => {
        this.onServiceCreation(filePath);
      });
    });
  }

  /**
   * Watch for API endpoint creation
   */
  watchForApiEndpointCreation() {
    const apiPatterns = [
      'src/**/*Controller.java',
      'backend/**/*Controller.java',
      'src/api/**/*.ts',
      'frontend/src/api/**/*.ts'
    ];

    apiPatterns.forEach(pattern => {
      chokidar.watch(pattern, { ignoreInitial: true })
        .on('add', (filePath) => this.onApiEndpointCreation(filePath, 'new'))
        .on('change', (filePath) => {
          // Check if new endpoints were added
          if (this.hasNewApiEndpoints(filePath)) {
            this.onApiEndpointCreation(filePath, 'modified');
          }
        });
    });
  }

  /**
   * Watch for feature planning activities
   */
  watchForFeaturePlanning() {
    const featurePlanningPatterns = [
      'specs/**/*.md',
      '.agent-os/product/**/*.md',
      'features/**/*.md',
      '**/*roadmap*.md',
      '**/*backlog*.json',
      '**/*features*.json'
    ];

    featurePlanningPatterns.forEach(pattern => {
      chokidar.watch(pattern, { ignoreInitial: true })
        .on('add', (filePath) => this.onFeaturePlanning(filePath, 'new'))
        .on('change', (filePath) => this.onFeaturePlanning(filePath, 'modified'));
    });
  }

  /**
   * Watch for deployment preparation
   */
  watchForDeploymentPreparation() {
    const deploymentPatterns = [
      '.github/workflows/**/*.yml',
      'Dockerfile',
      'docker-compose.prod.yml',
      'k8s/**/*.yml',
      'helm/**/*.yml'
    ];

    deploymentPatterns.forEach(pattern => {
      chokidar.watch(pattern, { ignoreInitial: true })
        .on('add', (filePath) => this.onDeploymentPreparation(filePath))
        .on('change', (filePath) => this.onDeploymentPreparation(filePath));
    });
  }

  /**
   * Watch for dependency changes
   */
  watchForDependencyChanges() {
    const dependencyFiles = ['package.json', 'package-lock.json', 'pom.xml', 'build.gradle'];
    
    dependencyFiles.forEach(file => {
      if (fs.existsSync(file)) {
        chokidar.watch(file, { ignoreInitial: true }).on('change', () => {
          this.onDependencyChange(file);
        });
      }
    });
  }

  /**
   * Watch for infrastructure changes
   */
  watchForInfrastructureChanges() {
    const infraFiles = [
      'docker-compose*.yml',
      'application.yml',
      'application.properties',
      '.env*'
    ];

    infraFiles.forEach(pattern => {
      chokidar.watch(pattern, { ignoreInitial: true }).on('change', (filePath) => {
        this.onInfrastructureChange(filePath);
      });
    });
  }

  /**
   * Handle new developer setup
   */
  async onNewDeveloperSetup(trigger) {
    console.log(`👋 New developer setup detected: ${trigger}`);
    
    await this.triggerTemplate('environment-setup-validation', {
      trigger,
      phase: 'foundation',
      priority: 'critical',
      description: 'Validate development environment setup and Agent OS integration'
    });
  }

  /**
   * Handle package.json changes
   */
  async onPackageJsonChange() {
    console.log('📦 Package.json change detected');
    
    // Run immediate dependency validation
    const result = this.dependencyValidator.validateEnvironment();
    
    if (!result.overall) {
      await this.triggerTemplate('dependency-validation-failure', {
        trigger: 'package.json-change',
        issues: result.issues || ['Environment validation failed'],
        priority: 'critical'
      });
    }
  }

  /**
   * Handle new service creation
   */
  async onServiceCreation(filePath) {
    console.log(`🏗️  New service/controller detected: ${filePath}`);
    
    const serviceType = this.determineServiceType(filePath);
    
    if (this.currentPhase === 'foundation') {
      await this.triggerTemplate('security-first-development', {
        trigger: `new-${serviceType}`,
        filePath,
        phase: 'foundation',
        priority: 'high',
        description: `Apply security-first patterns to new ${serviceType}`
      });
    } else if (this.currentPhase === 'integration') {
      await this.triggerTemplate('service-architecture-validation', {
        trigger: `new-${serviceType}`,
        filePath,
        phase: 'integration',
        priority: 'high',
        description: `Validate architecture patterns for new ${serviceType}`
      });
    }
  }

  /**
   * Handle API endpoint creation
   */
  async onApiEndpointCreation(filePath, changeType) {
    console.log(`🌐 API endpoint ${changeType}: ${filePath}`);
    
    await this.triggerTemplate('api-integration-validation', {
      trigger: `api-${changeType}`,
      filePath,
      phase: this.currentPhase,
      priority: 'high',
      description: 'Validate API design and integration patterns'
    });
  }

  /**
   * Handle feature planning
   */
  async onFeaturePlanning(filePath, changeType) {
    console.log(`📋 Feature planning ${changeType}: ${filePath}`);
    
    // Run feature scoring if possible
    try {
      const features = await this.extractFeaturesFromFile(filePath);
      if (features.length > 0) {
        const results = this.featureScoring.scoreFeatures(features);
        
        if (results.analysis.eliminationCandidates.length > 0) {
          await this.triggerTemplate('feature-elimination-warning', {
            trigger: 'low-value-features-detected',
            filePath,
            eliminationCandidates: results.analysis.eliminationCandidates,
            priority: 'medium'
          });
        }
      }
    } catch (error) {
      console.warn('Could not analyze features for scoring:', error.message);
    }

    await this.triggerTemplate('feature-value-validation', {
      trigger: `feature-planning-${changeType}`,
      filePath,
      phase: 'advanced-features',
      priority: 'medium',
      description: 'Validate feature value and prioritization'
    });
  }

  /**
   * Handle deployment preparation
   */
  async onDeploymentPreparation(filePath) {
    console.log(`🚀 Deployment preparation detected: ${filePath}`);
    
    await this.triggerTemplate('performance-optimization-validation', {
      trigger: 'deployment-preparation',
      filePath,
      phase: 'advanced-features',
      priority: 'critical',
      description: 'Validate performance and optimization before deployment'
    });
  }

  /**
   * Handle dependency changes
   */
  async onDependencyChange(filePath) {
    console.log(`📦 Dependency change: ${filePath}`);
    
    // Run immediate validation
    const result = this.dependencyValidator.validateEnvironment();
    
    if (!result.overall) {
      console.log('⚠️  Dependency validation failed after change');
      console.log('💡 Run: npm install or fix dependency issues');
    }
  }

  /**
   * Handle infrastructure changes
   */
  async onInfrastructureChange(filePath) {
    console.log(`🏗️  Infrastructure change: ${filePath}`);
    
    // Run infrastructure health check
    try {
      const health = await this.infrastructureRecovery.assessInfrastructureHealth({
        runRecovery: false,
        includeChecks: ['containers', 'ports', 'dependencies']
      });

      if (health.overall !== 'healthy') {
        console.log('⚠️  Infrastructure health issues after configuration change');
        health.recommendations.forEach(rec => {
          console.log(`💡 ${rec}`);
        });
      }
    } catch (error) {
      console.warn('Could not check infrastructure health:', error.message);
    }
  }

  /**
   * Trigger a specific template with context
   */
  async triggerTemplate(templateName, context) {
    const templateKey = `${templateName}-${context.trigger}`;
    
    // Avoid duplicate triggers within short time windows
    if (this.triggeredTemplates.has(templateKey)) {
      console.log(`⏭️  Template ${templateName} already triggered recently`);
      return;
    }

    console.log(`\n📋 TRIGGERING TEMPLATE: ${templateName}`);
    console.log(`🎯 Context: ${context.description || context.trigger}`);
    console.log(`⭐ Priority: ${context.priority || 'normal'}`);
    console.log(`📍 Phase: ${context.phase || this.currentPhase}`);
    
    if (context.filePath) {
      console.log(`📄 File: ${context.filePath}`);
    }

    // Show template checklist based on template name
    this.displayTemplateChecklist(templateName, context);
    
    // Mark as triggered
    this.triggeredTemplates.add(templateKey);
    
    // Clear trigger after 5 minutes to allow re-triggering
    setTimeout(() => {
      this.triggeredTemplates.delete(templateKey);
    }, 5 * 60 * 1000);
  }

  /**
   * Display template checklist
   */
  displayTemplateChecklist(templateName, context) {
    switch (templateName) {
      case 'environment-setup-validation':
        this.displayEnvironmentSetupChecklist();
        break;
      case 'security-first-development':
        this.displaySecurityFirstChecklist(context);
        break;
      case 'service-architecture-validation':
        this.displayArchitectureValidationChecklist(context);
        break;
      case 'api-integration-validation':
        this.displayApiIntegrationChecklist(context);
        break;
      case 'feature-value-validation':
        this.displayFeatureValueChecklist(context);
        break;
      case 'performance-optimization-validation':
        this.displayPerformanceValidationChecklist(context);
        break;
      case 'daily-development-health-check':
        this.displayDailyHealthCheckChecklist();
        break;
      default:
        console.log(`📋 Template checklist for ${templateName} not yet implemented`);
    }
  }

  /**
   * Display environment setup checklist
   */
  displayEnvironmentSetupChecklist() {
    console.log(`
📋 ENVIRONMENT SETUP VALIDATION CHECKLIST:

□ Node.js Version Check (≥18)
  Run: node .agent-os/utils/dependency-validator.js

□ Technology Stack Validation
  • Spring Boot 3.3+ configured
  • React 19 with TypeScript 5
  • PostgreSQL 17 with pgvector
  • Docker 24 with Compose V2

□ Infrastructure Health Check
  Run: node .agent-os/utils/infrastructure-recovery.js

□ Agent OS Utilities Integration
  • Verify .agent-os/utils/ available
  • Test dependency validator
  • Test cross-platform shell
  • Test mock factories

□ Security Foundation Setup
  • Environment variables configured
  • Input validation framework ready
  • Authentication framework prepared

□ Testing Foundation Setup
  • Mock factories configured
  • Vitest + jsdom setup
  • Coverage reporting ≥85% requirement
`);
  }

  /**
   * Display security-first development checklist
   */
  displaySecurityFirstChecklist(context) {
    console.log(`
🔒 SECURITY-FIRST DEVELOPMENT CHECKLIST:
📄 File: ${context.filePath}

□ Data Classification
  • Identify sensitive data (PII, credentials, tokens)
  • Define encryption requirements
  • Plan secure storage strategy

□ Input Validation Implementation
  @PostMapping("/api/endpoint")
  public ResponseEntity<?> processData(@Valid @RequestBody DataRequest request)

□ Security Validation
  Run: node .agent-os/tools/compliance-checker.js --security
  • No hardcoded secrets ✓
  • Input validation present ✓
  • SQL injection prevention ✓
  • Proper error handling ✓

□ Authentication & Authorization
  • OAuth 2.1 implementation
  • Role-based access control
  • Token management strategy
`);
  }

  /**
   * Display architecture validation checklist
   */
  displayArchitectureValidationChecklist(context) {
    console.log(`
🏗️  SERVICE ARCHITECTURE VALIDATION CHECKLIST:
📄 File: ${context.filePath}

□ Controller → Service → Repository Pattern
  @RestController (Controller only calls Service)
  @Service @Transactional (Service handles business logic)
  @Repository (Repository handles data access)

□ Dependency Injection Validation
  • Constructor injection used
  • No circular dependencies
  • Proper Spring annotations

□ Architecture Compliance Check
  Run: node .agent-os/tools/compliance-checker.js --architecture

□ Observability Setup
  • Spring Boot Actuator endpoints
  • Prometheus metrics configured
  • Structured logging implemented
  • Health checks implemented
`);
  }

  /**
   * Display API integration checklist
   */
  displayApiIntegrationChecklist(context) {
    console.log(`
🌐 API INTEGRATION VALIDATION CHECKLIST:
📄 File: ${context.filePath}

□ RESTful API Standards
  • Proper HTTP verbs (GET, POST, PUT, DELETE)
  • Consistent URL patterns (/api/v1/resources)
  • Proper HTTP status codes
  • Standardized error responses

□ Request/Response Validation
  @Valid @RequestBody for all POST/PUT endpoints

□ Integration Testing
  import { createApiClientMock } from '.agent-os/testing/mock-factories.js';

□ Testing Coverage
  • Happy path tests
  • Error condition tests
  • Authentication tests
  • Rate limiting tests
`);
  }

  /**
   * Display feature value checklist
   */
  displayFeatureValueChecklist(context) {
    console.log(`
🎯 FEATURE VALUE VALIDATION CHECKLIST:
📄 File: ${context.filePath}

□ Feature Impact Assessment
  const feature = {
    name: '[FEATURE_NAME]',
    importance: [1-10], // Business value
    complexity: [1-10], // Development effort
    impact: [1-10]      // Developer productivity impact
  };

□ Scoring Validation
  • Weighted score ≥ 6.0 (minimum threshold)
  • Impact score ≥ 6 (meaningful improvement)
  • ROI ratio ≥ 1.0 (impact/complexity)

□ Implementation Decision
  • High Priority (≥8.0): Implement immediately
  • Medium Priority (6.0-7.9): Standard process
  • Low Priority (4.0-5.9): Defer to later phase
  • Eliminate (<4.0): Remove from backlog
`);
  }

  /**
   * Display performance validation checklist
   */
  displayPerformanceValidationChecklist(context) {
    console.log(`
⚡ PERFORMANCE & OPTIMIZATION VALIDATION CHECKLIST:
📄 File: ${context.filePath}

□ Performance Benchmarks
  • Backend P95 ≤ 200ms
  • Frontend TTI ≤ 2s
  • Memory usage within limits
  • Database queries optimized

□ Infrastructure Health
  Run: node .agent-os/utils/infrastructure-recovery.js --comprehensive

□ Code Quality Final Check
  Run: node .agent-os/tools/compliance-checker.js --comprehensive
  • Overall compliance ≥ 85%
  • No critical violations
  • All TODO/FIXME addressed

□ Deployment Readiness
  • Rollback procedures tested
  • Health checks configured
  • Monitoring alerts active
`);
  }

  /**
   * Display daily health check checklist
   */
  displayDailyHealthCheckChecklist() {
    console.log(`
🌅 DAILY DEVELOPMENT HEALTH CHECK:

□ Quick Environment Check
  Run: node .agent-os/utils/dependency-validator.js --quick

□ Infrastructure Status
  Run: node .agent-os/utils/infrastructure-recovery.js --quick

□ Task Priority Review
  • Review tasks.md current priorities
  • Validate task compliance requirements
  • Confirm resource availability

□ Standards Awareness
  • Current phase requirements reviewed
  • Agent OS utilities ready
  • Testing patterns confirmed
`);
  }

  /**
   * Helper methods
   */
  isFirstCodeFile(filePath) {
    // Simple heuristic: if there are very few files in src
    const srcFiles = fs.readdirSync('src', { recursive: true });
    return srcFiles.length <= 3;
  }

  determineServiceType(filePath) {
    if (filePath.includes('Controller')) return 'controller';
    if (filePath.includes('Service')) return 'service';
    if (filePath.includes('Repository')) return 'repository';
    return 'component';
  }

  hasNewApiEndpoints(filePath) {
    // Simple check: look for @RequestMapping, @GetMapping, etc.
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const apiAnnotations = /@(RequestMapping|GetMapping|PostMapping|PutMapping|DeleteMapping)/g;
      const matches = content.match(apiAnnotations);
      return matches && matches.length > 0;
    } catch (error) {
      return false;
    }
  }

  async extractFeaturesFromFile(filePath) {
    // Basic feature extraction from markdown or JSON files
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      if (filePath.endsWith('.json')) {
        const data = JSON.parse(content);
        return Array.isArray(data) ? data : data.features || [];
      }
      
      // Extract from markdown (basic pattern)
      const features = [];
      const lines = content.split('\n');
      
      lines.forEach(line => {
        if (line.match(/^#+\s+/) || line.match(/^[-*]\s+\w/)) {
          const name = line.replace(/^#+\s+/, '').replace(/^[-*]\s+/, '').trim();
          if (name.length > 5) {
            features.push({
              name,
              description: `Feature from ${path.basename(filePath)}`,
              importance: 5,
              complexity: 5,
              impact: 5
            });
          }
        }
      });
      
      return features.slice(0, 10); // Limit to prevent noise
    } catch (error) {
      return [];
    }
  }

  /**
   * Start the automation
   */
  start() {
    console.log('🤖 Template Trigger Automation Started');
    console.log(`📍 Current Phase: ${this.currentPhase}`);
    console.log('🎯 Watching for development activities...');
    console.log('📋 Templates will trigger automatically based on file changes and development patterns');
    console.log('\n✨ Start coding to see automatic template triggers!\n');
  }
}

module.exports = TemplateTriggerAutomation;

// CLI usage
if (require.main === module) {
  const automation = new TemplateTriggerAutomation();
  automation.start();
}