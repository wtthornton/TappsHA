#!/usr/bin/env node

/**
 * Agent OS Project Initialization Script
 * 
 * This script implements the consolidated lessons learned from multiple projects
 * to ensure one-pass project initialization with minimal manual fixes required.
 * 
 * Based on patterns from:
 * - TappHA implementation lessons
 * - Validation suite development
 * - Frontend/backend integration issues
 * - Testing infrastructure challenges
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const yaml = require('js-yaml');

class AgentOSProjectInitializer {
  constructor(projectPath, options = {}) {
    this.projectPath = path.resolve(projectPath);
    this.projectName = path.basename(this.projectPath);
    this.options = {
      type: 'fullstack', // 'frontend', 'backend', 'fullstack'
      framework: 'react', // 'react', 'vue', 'angular'
      backend: 'spring-boot', // 'spring-boot', 'express', 'fastapi'
      database: 'postgresql', // 'postgresql', 'mysql', 'h2'
      testing: 'vitest', // 'vitest', 'jest'
      ...options
    };
  }

  async initialize() {
    console.log('🚀 Initializing Agent OS project...');
    console.log(`📁 Project: ${this.projectName}`);
    console.log(`📍 Path: ${this.projectPath}`);
    console.log(`🎯 Type: ${this.options.type}`);
    
    try {
      // Step 1: Verify environment
      await this.verifyEnvironment();
      
      // Step 2: Create project structure
      await this.createProjectStructure();
      
      // Step 3: Copy and customize templates
      await this.setupTemplates();
      
      // Step 4: Initialize package management
      await this.initializePackageManagement();
      
      // Step 5: Configure tools
      await this.configureTools();
      
      // Step 6: Generate initial code
      await this.generateInitialCode();
      
      // Step 7: Setup testing infrastructure
      await this.setupTestingInfrastructure();
      
      // Step 8: Run initial validation
      await this.runInitialValidation();
      
      console.log('✅ Agent OS project initialized successfully!');
      this.displayNextSteps();
      
    } catch (error) {
      console.error('❌ Project initialization failed:', error.message);
      throw error;
    }
  }

  async verifyEnvironment() {
    console.log('🔍 Step 1: Environment Verification');
    
    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    if (majorVersion < 18) {
      throw new Error(`Node.js ≥18.0.0 required, found ${nodeVersion}`);
    }
    console.log(`✅ Node.js ${nodeVersion} - Compatible`);
    
    // Check required tools
    const tools = [
      { name: 'npm', command: 'npm --version' },
      { name: 'git', command: 'git --version' }
    ];
    
    if (this.options.backend === 'spring-boot') {
      tools.push(
        { name: 'java', command: 'java --version' },
        { name: 'maven', command: 'mvn --version' }
      );
    }
    
    for (const tool of tools) {
      try {
        execSync(tool.command, { encoding: 'utf8', stdio: 'pipe' });
        console.log(`✅ ${tool.name} - Available`);
      } catch (error) {
        throw new Error(`Required tool not found: ${tool.name}`);
      }
    }
    
    // Check platform compatibility
    const platform = process.platform;
    console.log(`🖥️  Platform: ${platform} - ${this.getPlatformEmoji(platform)}`);
  }

  async createProjectStructure() {
    console.log('📁 Step 2: Creating Project Structure');
    
    // Create main project directory
    if (!fs.existsSync(this.projectPath)) {
      fs.mkdirSync(this.projectPath, { recursive: true });
    }
    
    // Create Agent OS directory structure
    const agentOsDirs = [
      '.agent-os/standards',
      '.agent-os/templates', 
      '.agent-os/testing',
      '.agent-os/checklists',
      '.agent-os/tools',
      '.agent-os/reports',
      '.agent-os/lessons-learned'
    ];
    
    agentOsDirs.forEach(dir => {
      const fullPath = path.join(this.projectPath, dir);
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`📂 Created: ${dir}`);
    });
    
    // Create project-specific directories
    if (this.options.type === 'fullstack' || this.options.type === 'frontend') {
      this.createFrontendStructure();
    }
    
    if (this.options.type === 'fullstack' || this.options.type === 'backend') {
      this.createBackendStructure();
    }
  }

  createFrontendStructure() {
    const dirs = [
      'frontend/src/components',
      'frontend/src/services',
      'frontend/src/types',
      'frontend/src/utils',
      'frontend/src/hooks',
      'frontend/src/contexts',
      'frontend/src/assets',
      'frontend/src/test-utils',
      'frontend/src/mocks',
      'frontend/public'
    ];
    
    dirs.forEach(dir => {
      const fullPath = path.join(this.projectPath, dir);
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`📂 Created: ${dir}`);
    });
  }

  createBackendStructure() {
    const dirs = [
      'backend/src/main/java/com/' + this.projectName.toLowerCase(),
      'backend/src/main/resources/db/migration',
      'backend/src/test/java/com/' + this.projectName.toLowerCase(),
      'backend/src/test/resources'
    ];
    
    dirs.forEach(dir => {
      const fullPath = path.join(this.projectPath, dir);
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`📂 Created: ${dir}`);
    });
  }

  async setupTemplates() {
    console.log('📋 Step 3: Setting Up Templates');
    
    // Copy Agent OS templates
    const agentOsPath = this.findAgentOsPath();
    
    if (agentOsPath) {
      this.copyTemplatesFromAgentOs(agentOsPath);
    } else {
      this.createDefaultTemplates();
    }
  }

  findAgentOsPath() {
    // Look for .agent-os in current directory or parent directories
    let currentDir = process.cwd();
    
    while (currentDir !== path.dirname(currentDir)) {
      const agentOsPath = path.join(currentDir, '.agent-os');
      if (fs.existsSync(agentOsPath)) {
        return agentOsPath;
      }
      currentDir = path.dirname(currentDir);
    }
    
    return null;
  }

  copyTemplatesFromAgentOs(agentOsPath) {
    const templateSources = [
      'standards',
      'templates',
      'testing',
      'checklists'
    ];
    
    templateSources.forEach(source => {
      const sourcePath = path.join(agentOsPath, source);
      const destPath = path.join(this.projectPath, '.agent-os', source);
      
      if (fs.existsSync(sourcePath)) {
        this.copyRecursive(sourcePath, destPath);
        console.log(`📄 Copied templates: ${source}`);
      }
    });
  }

  createDefaultTemplates() {
    console.log('📝 Creating default templates...');
    
    // Create basic package.json
    const packageJson = this.generatePackageJson();
    fs.writeFileSync(
      path.join(this.projectPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
    
    // Create basic tsconfig.json
    const tsConfig = this.generateTsConfig();
    fs.writeFileSync(
      path.join(this.projectPath, 'tsconfig.json'),
      JSON.stringify(tsConfig, null, 2)
    );
    
    // Create basic vitest.config.ts
    const vitestConfig = this.generateVitestConfig();
    fs.writeFileSync(
      path.join(this.projectPath, 'vitest.config.ts'),
      vitestConfig
    );
  }

  async initializePackageManagement() {
    console.log('📦 Step 4: Initializing Package Management');
    
    // Initialize git repository
    if (!fs.existsSync(path.join(this.projectPath, '.git'))) {
      execSync('git init', { cwd: this.projectPath, stdio: 'pipe' });
      console.log('📋 Git repository initialized');
    }
    
    // Install dependencies based on project type
    if (this.options.type === 'fullstack' || this.options.type === 'frontend') {
      await this.installFrontendDependencies();
    }
    
    if (this.options.type === 'fullstack' || this.options.type === 'backend') {
      await this.installBackendDependencies();
    }
  }

  async installFrontendDependencies() {
    const frontendPath = path.join(this.projectPath, 'frontend');
    
    if (!fs.existsSync(frontendPath)) {
      fs.mkdirSync(frontendPath, { recursive: true });
    }
    
    // Create package.json for frontend
    const packageJson = this.generateFrontendPackageJson();
    fs.writeFileSync(
      path.join(frontendPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
    
    console.log('📥 Installing frontend dependencies...');
    execSync('npm install', { 
      cwd: frontendPath, 
      stdio: 'inherit',
      timeout: 300000 // 5 minutes timeout
    });
    console.log('✅ Frontend dependencies installed');
  }

  async installBackendDependencies() {
    if (this.options.backend === 'spring-boot') {
      await this.setupSpringBootProject();
    }
  }

  async setupSpringBootProject() {
    const backendPath = path.join(this.projectPath, 'backend');
    
    // Generate Spring Boot pom.xml
    const pomXml = this.generatePomXml();
    fs.writeFileSync(path.join(backendPath, 'pom.xml'), pomXml);
    
    // Generate application.yml
    const applicationYml = this.generateApplicationYml();
    fs.writeFileSync(
      path.join(backendPath, 'src/main/resources/application.yml'),
      applicationYml
    );
    
    console.log('📥 Installing backend dependencies...');
    execSync('mvn dependency:resolve', { 
      cwd: backendPath, 
      stdio: 'inherit',
      timeout: 300000
    });
    console.log('✅ Backend dependencies installed');
  }

  async configureTools() {
    console.log('🔧 Step 5: Configuring Tools');
    
    // Configure ESLint
    this.setupESLint();
    
    // Configure Prettier
    this.setupPrettier();
    
    // Configure Git hooks
    this.setupGitHooks();
    
    // Configure VS Code settings
    this.setupVSCodeSettings();
  }

  setupESLint() {
    const eslintConfig = this.generateESLintConfig();
    fs.writeFileSync(
      path.join(this.projectPath, '.eslintrc.json'),
      JSON.stringify(eslintConfig, null, 2)
    );
    console.log('🔍 ESLint configured');
  }

  setupPrettier() {
    const prettierConfig = {
      semi: true,
      trailingComma: 'es5',
      singleQuote: true,
      printWidth: 100,
      tabWidth: 2,
      useTabs: false
    };
    
    fs.writeFileSync(
      path.join(this.projectPath, '.prettierrc'),
      JSON.stringify(prettierConfig, null, 2)
    );
    console.log('💅 Prettier configured');
  }

  setupGitHooks() {
    const gitHooksPath = path.join(this.projectPath, '.git/hooks');
    
    if (fs.existsSync(gitHooksPath)) {
      const preCommitHook = this.generatePreCommitHook();
      fs.writeFileSync(path.join(gitHooksPath, 'pre-commit'), preCommitHook);
      fs.chmodSync(path.join(gitHooksPath, 'pre-commit'), 0o755);
      console.log('🪝 Git hooks configured');
    }
  }

  setupVSCodeSettings() {
    const vscodeDir = path.join(this.projectPath, '.vscode');
    fs.mkdirSync(vscodeDir, { recursive: true });
    
    const settings = {
      "typescript.preferences.includePackageJsonAutoImports": "auto",
      "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
      },
      "editor.formatOnSave": true,
      "editor.defaultFormatter": "esbenp.prettier-vscode"
    };
    
    fs.writeFileSync(
      path.join(vscodeDir, 'settings.json'),
      JSON.stringify(settings, null, 2)
    );
    console.log('⚙️  VS Code settings configured');
  }

  async generateInitialCode() {
    console.log('🏗️  Step 6: Generating Initial Code');
    
    if (this.options.type === 'fullstack' || this.options.type === 'frontend') {
      this.generateFrontendCode();
    }
    
    if (this.options.type === 'fullstack' || this.options.type === 'backend') {
      this.generateBackendCode();
    }
  }

  generateFrontendCode() {
    // Generate main App component
    const appComponent = this.generateAppComponent();
    fs.writeFileSync(
      path.join(this.projectPath, 'frontend/src/App.tsx'),
      appComponent
    );
    
    // Generate main entry point
    const mainEntry = this.generateMainEntry();
    fs.writeFileSync(
      path.join(this.projectPath, 'frontend/src/main.tsx'),
      mainEntry
    );
    
    // Generate index.html
    const indexHtml = this.generateIndexHtml();
    fs.writeFileSync(
      path.join(this.projectPath, 'frontend/index.html'),
      indexHtml
    );
    
    console.log('⚛️  Frontend code generated');
  }

  generateBackendCode() {
    const packageName = `com.${this.projectName.toLowerCase()}`;
    const javaPath = path.join(this.projectPath, 'backend/src/main/java/com', this.projectName.toLowerCase());
    
    // Generate main application class
    const mainClass = this.generateSpringBootMainClass(packageName);
    fs.writeFileSync(
      path.join(javaPath, `${this.capitalize(this.projectName)}Application.java`),
      mainClass
    );
    
    // Generate basic controller
    const controllerPath = path.join(javaPath, 'controller');
    fs.mkdirSync(controllerPath, { recursive: true });
    
    const controller = this.generateBasicController(packageName);
    fs.writeFileSync(
      path.join(controllerPath, 'HelloController.java'),
      controller
    );
    
    console.log('☕ Backend code generated');
  }

  async setupTestingInfrastructure() {
    console.log('🧪 Step 7: Setting Up Testing Infrastructure');
    
    if (this.options.type === 'fullstack' || this.options.type === 'frontend') {
      this.setupFrontendTesting();
    }
    
    if (this.options.type === 'fullstack' || this.options.type === 'backend') {
      this.setupBackendTesting();
    }
  }

  setupFrontendTesting() {
    const testSetup = this.generateTestSetup();
    fs.writeFileSync(
      path.join(this.projectPath, 'frontend/src/test-setup.ts'),
      testSetup
    );
    
    // Generate sample test
    const sampleTest = this.generateSampleTest();
    fs.writeFileSync(
      path.join(this.projectPath, 'frontend/src/App.test.tsx'),
      sampleTest
    );
    
    console.log('🧪 Frontend testing infrastructure setup');
  }

  setupBackendTesting() {
    const packageName = `com.${this.projectName.toLowerCase()}`;
    const testPath = path.join(this.projectPath, 'backend/src/test/java/com', this.projectName.toLowerCase());
    
    // Generate basic test
    const basicTest = this.generateBasicSpringBootTest(packageName);
    fs.writeFileSync(
      path.join(testPath, `${this.capitalize(this.projectName)}ApplicationTests.java`),
      basicTest
    );
    
    // Add test properties
    const testProperties = this.generateTestProperties();
    fs.writeFileSync(
      path.join(this.projectPath, 'backend/src/test/resources/application-test.yml'),
      testProperties
    );
    
    console.log('🧪 Backend testing infrastructure setup');
  }

  async runInitialValidation() {
    console.log('✅ Step 8: Running Initial Validation');
    
    try {
      // Run linting
      if (this.options.type === 'fullstack' || this.options.type === 'frontend') {
        execSync('npm run lint', { 
          cwd: path.join(this.projectPath, 'frontend'),
          stdio: 'pipe'
        });
        console.log('✅ Frontend linting passed');
      }
      
      // Run type checking
      if (this.options.type === 'fullstack' || this.options.type === 'frontend') {
        execSync('npm run type-check', { 
          cwd: path.join(this.projectPath, 'frontend'),
          stdio: 'pipe'
        });
        console.log('✅ Type checking passed');
      }
      
      // Run tests
      if (this.options.type === 'fullstack' || this.options.type === 'frontend') {
        execSync('npm test -- --run', { 
          cwd: path.join(this.projectPath, 'frontend'),
          stdio: 'pipe'
        });
        console.log('✅ Frontend tests passed');
      }
      
      if (this.options.backend === 'spring-boot') {
        execSync('mvn test', { 
          cwd: path.join(this.projectPath, 'backend'),
          stdio: 'pipe'
        });
        console.log('✅ Backend tests passed');
      }
      
    } catch (error) {
      console.warn('⚠️  Some validation checks failed, but project is initialized');
      console.warn('   Run the checks manually to identify issues');
    }
  }

  displayNextSteps() {
    console.log('\n🎉 Project initialization complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. cd ' + this.projectName);
    
    if (this.options.type === 'fullstack') {
      console.log('2. Start frontend: cd frontend && npm run dev');
      console.log('3. Start backend: cd backend && mvn spring-boot:run');
    } else if (this.options.type === 'frontend') {
      console.log('2. Start development: cd frontend && npm run dev');
    } else if (this.options.type === 'backend') {
      console.log('2. Start development: cd backend && mvn spring-boot:run');
    }
    
    console.log('4. Run tests: npm test');
    console.log('5. Review .agent-os/ directory for standards and tools');
    console.log('\n🚀 Happy coding with Agent OS!');
  }

  // Utility methods for code generation
  getPlatformEmoji(platform) {
    const emojis = {
      'win32': '🪟',
      'darwin': '🍎', 
      'linux': '🐧'
    };
    return emojis[platform] || '🖥️';
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  copyRecursive(src, dest) {
    if (fs.statSync(src).isDirectory()) {
      fs.mkdirSync(dest, { recursive: true });
      fs.readdirSync(src).forEach(file => {
        this.copyRecursive(path.join(src, file), path.join(dest, file));
      });
    } else {
      fs.copyFileSync(src, dest);
    }
  }

  // Template generation methods
  generatePackageJson() {
    return {
      name: this.projectName,
      version: '1.0.0',
      description: `Agent OS project: ${this.projectName}`,
      type: 'module',
      engines: {
        node: '>=18.0.0',
        npm: '>=8.0.0'
      },
      scripts: {
        dev: 'echo "Use frontend/backend specific commands"',
        build: 'echo "Use frontend/backend specific commands"',
        test: 'echo "Use frontend/backend specific commands"'
      }
    };
  }

  generateFrontendPackageJson() {
    return {
      name: `${this.projectName}-frontend`,
      version: '1.0.0',
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'tsc && vite build',
        preview: 'vite preview',
        test: 'vitest',
        'test:ui': 'vitest --ui',
        'test:run': 'vitest --run',
        lint: 'eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0',
        'type-check': 'tsc --noEmit'
      },
      dependencies: {
        react: '19.0.0',
        'react-dom': '19.0.0'
      },
      devDependencies: {
        '@types/react': '^18.2.0',
        '@types/react-dom': '^18.2.0',
        '@typescript-eslint/eslint-plugin': '^6.0.0',
        '@typescript-eslint/parser': '^6.0.0',
        '@vitejs/plugin-react': '^4.0.0',
        '@vitest/ui': '^0.34.0',
        eslint: '^8.45.0',
        'eslint-plugin-react-hooks': '^4.6.0',
        'eslint-plugin-react-refresh': '^0.4.0',
        typescript: '^5.0.2',
        vite: '^4.4.5',
        vitest: '^0.34.0',
        '@testing-library/react': '^13.4.0',
        '@testing-library/jest-dom': '^6.0.0',
        '@testing-library/user-event': '^14.4.3',
        jsdom: '^22.1.0'
      }
    };
  }

  // Additional template generation methods would go here...
  // (generateTsConfig, generateVitestConfig, generateESLintConfig, etc.)
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node project-initialization.js <project-name> [options]');
    console.log('Options:');
    console.log('  --type=<fullstack|frontend|backend>');
    console.log('  --framework=<react|vue|angular>');
    console.log('  --backend=<spring-boot|express|fastapi>');
    console.log('  --database=<postgresql|mysql|h2>');
    process.exit(1);
  }
  
  const projectName = args[0];
  const options = {};
  
  // Parse command line options
  args.slice(1).forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      options[key] = value;
    }
  });
  
  const initializer = new AgentOSProjectInitializer(projectName, options);
  initializer.initialize().catch(console.error);
}

module.exports = AgentOSProjectInitializer;