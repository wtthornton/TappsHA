#!/usr/bin/env node

/**
 * Infrastructure Recovery Utilities
 * Extracted from tappha-critical-issues-resolution.md lessons learned
 * 
 * Provides systematic infrastructure health checking and recovery procedures
 * to prevent the cascading failures experienced in TappHA.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const CrossPlatformShell = require('./cross-platform-shell.js');

class InfrastructureRecovery {
  constructor(projectRoot = process.cwd()) {
    this.projectRoot = projectRoot;
    this.shell = new CrossPlatformShell();
    this.dockerComposePath = path.join(projectRoot, 'docker-compose.yml');
    
    this.healthChecks = {
      database: this.checkDatabaseHealth.bind(this),
      containers: this.checkContainerHealth.bind(this),
      ports: this.checkPortAvailability.bind(this),
      network: this.checkNetworkConnectivity.bind(this),
      dependencies: this.checkDependencyVersions.bind(this)
    };
  }

  /**
   * Comprehensive infrastructure health assessment
   * @param {Object} options - Assessment options
   * @returns {Object} health assessment results
   */
  async assessInfrastructureHealth(options = {}) {
    const {
      runRecovery = false,
      includeChecks = Object.keys(this.healthChecks)
    } = options;

    console.log('🏥 Starting infrastructure health assessment...');
    
    const results = {
      timestamp: new Date().toISOString(),
      overall: 'unknown',
      checks: {},
      issues: [],
      recommendations: []
    };

    // Run each health check
    for (const checkName of includeChecks) {
      if (this.healthChecks[checkName]) {
        try {
          console.log(`\n🔍 Running ${checkName} health check...`);
          results.checks[checkName] = await this.healthChecks[checkName]();
          
          if (!results.checks[checkName].healthy) {
            results.issues.push(...results.checks[checkName].issues);
            results.recommendations.push(...results.checks[checkName].recommendations);
          }
        } catch (error) {
          results.checks[checkName] = {
            healthy: false,
            error: error.message,
            issues: [`Failed to run ${checkName} check: ${error.message}`],
            recommendations: [`Investigate ${checkName} check failure`]
          };
          results.issues.push(`Health check failure: ${checkName}`);
        }
      }
    }

    // Determine overall health
    const allHealthy = Object.values(results.checks).every(check => check.healthy);
    results.overall = allHealthy ? 'healthy' : 'unhealthy';

    // Auto-recovery if requested and issues found
    if (runRecovery && !allHealthy) {
      console.log('\n🚑 Starting automatic recovery procedures...');
      results.recovery = await this.attemptAutoRecovery(results);
    }

    this.generateHealthReport(results);
    return results;
  }

  /**
   * Check database connectivity and health
   * @returns {Object} database health status
   */
  async checkDatabaseHealth() {
    const result = {
      healthy: true,
      issues: [],
      recommendations: [],
      details: {}
    };

    try {
      // Check if Docker containers are running
      const containers = this.shell.executeCommand('docker ps --format "table {{.Names}}\\t{{.Status}}"', { silent: true });
      const postgresRunning = containers.includes('postgres') && containers.includes('Up');
      
      result.details.postgresContainer = postgresRunning;
      
      if (!postgresRunning) {
        result.healthy = false;
        result.issues.push('PostgreSQL container not running');
        result.recommendations.push('Start PostgreSQL container: docker-compose up -d postgres');
      }

      // Check for pgvector extension if container is running
      if (postgresRunning) {
        try {
          // This would need actual database connection logic
          result.details.pgvectorAvailable = true; // Placeholder
        } catch (error) {
          result.healthy = false;
          result.issues.push('pgvector extension not available');
          result.recommendations.push('Use pgvector/pgvector:pg17 image instead of postgres:17-alpine');
        }
      }

    } catch (error) {
      result.healthy = false;
      result.issues.push(`Database health check failed: ${error.message}`);
      result.recommendations.push('Verify Docker is running and database configuration');
    }

    return result;
  }

  /**
   * Check Docker container health
   * @returns {Object} container health status
   */
  async checkContainerHealth() {
    const result = {
      healthy: true,
      issues: [],
      recommendations: [],
      details: { containers: [] }
    };

    try {
      // Check if Docker is available
      if (!this.shell.commandExists('docker')) {
        result.healthy = false;
        result.issues.push('Docker command not available');
        result.recommendations.push('Install Docker and ensure it is in PATH');
        return result;
      }

      // Check if Docker daemon is running
      try {
        this.shell.executeCommand('docker version', { silent: true });
      } catch (error) {
        result.healthy = false;
        result.issues.push('Docker daemon not running');
        result.recommendations.push('Start Docker daemon');
        return result;
      }

      // Check container status
      const containers = this.shell.executeCommand('docker ps -a --format "{{.Names}}:{{.Status}}"', { silent: true });
      const containerLines = containers.split('\n').filter(line => line.trim());
      
      for (const line of containerLines) {
        const [name, status] = line.split(':');
        const isHealthy = status.includes('Up') && !status.includes('unhealthy');
        
        result.details.containers.push({ name, status, healthy: isHealthy });
        
        if (!isHealthy) {
          result.healthy = false;
          result.issues.push(`Container ${name} is not healthy: ${status}`);
          result.recommendations.push(`Restart container: docker-compose restart ${name}`);
        }
      }

    } catch (error) {
      result.healthy = false;
      result.issues.push(`Container health check failed: ${error.message}`);
      result.recommendations.push('Check Docker installation and daemon status');
    }

    return result;
  }

  /**
   * Check port availability for services
   * @returns {Object} port availability status
   */
  async checkPortAvailability() {
    const result = {
      healthy: true,
      issues: [],
      recommendations: [],
      details: { ports: [] }
    };

    // Common ports used in Agent OS projects
    const portsToCheck = [
      { port: 8080, service: 'Backend API' },
      { port: 5173, service: 'Frontend Dev Server' },
      { port: 5432, service: 'PostgreSQL' },
      { port: 8086, service: 'InfluxDB' },
      { port: 9092, service: 'Kafka' },
      { port: 8081, service: 'Kafka UI' }
    ];

    for (const { port, service } of portsToCheck) {
      try {
        const isInUse = this.isPortInUse(port);
        result.details.ports.push({ port, service, inUse: isInUse });
        
        // Port conflicts are issues only if unexpected
        if (isInUse && this.isUnexpectedPortUsage(port, service)) {
          result.healthy = false;
          result.issues.push(`Port ${port} (${service}) has unexpected usage`);
          result.recommendations.push(`Check what is using port ${port}: netstat -tulpn | grep ${port}`);
        }
      } catch (error) {
        result.issues.push(`Could not check port ${port}: ${error.message}`);
      }
    }

    return result;
  }

  /**
   * Check network connectivity
   * @returns {Object} network connectivity status
   */
  async checkNetworkConnectivity() {
    const result = {
      healthy: true,
      issues: [],
      recommendations: [],
      details: {}
    };

    // Check Docker network
    try {
      const networks = this.shell.executeCommand('docker network ls', { silent: true });
      result.details.dockerNetworks = networks.includes('bridge');
      
      if (!result.details.dockerNetworks) {
        result.healthy = false;
        result.issues.push('Docker bridge network not available');
        result.recommendations.push('Restart Docker daemon to recreate default networks');
      }
    } catch (error) {
      result.issues.push(`Network check failed: ${error.message}`);
    }

    return result;
  }

  /**
   * Check dependency versions for compatibility
   * @returns {Object} dependency version status
   */
  async checkDependencyVersions() {
    const result = {
      healthy: true,
      issues: [],
      recommendations: [],
      details: {}
    };

    const versionChecks = {
      node: { command: 'node --version', minVersion: '18.0.0' },
      npm: { command: 'npm --version', minVersion: '8.0.0' },
      docker: { command: 'docker --version', minVersion: '20.0.0' }
    };

    for (const [tool, check] of Object.entries(versionChecks)) {
      try {
        const versionOutput = this.shell.executeCommand(check.command, { silent: true });
        const version = this.extractVersion(versionOutput);
        result.details[tool] = version;
        
        if (!this.isVersionCompatible(version, check.minVersion)) {
          result.healthy = false;
          result.issues.push(`${tool} version ${version} is below minimum ${check.minVersion}`);
          result.recommendations.push(`Update ${tool} to version ${check.minVersion} or higher`);
        }
      } catch (error) {
        result.healthy = false;
        result.issues.push(`Could not check ${tool} version: ${error.message}`);
        result.recommendations.push(`Install ${tool} and ensure it is in PATH`);
      }
    }

    return result;
  }

  /**
   * Attempt automatic recovery procedures
   * @param {Object} healthResults - Results from health assessment
   * @returns {Object} recovery attempt results
   */
  async attemptAutoRecovery(healthResults) {
    const recovery = {
      attempted: [],
      successful: [],
      failed: [],
      details: {}
    };

    console.log('🔧 Attempting automatic recovery...');

    // Database recovery
    if (healthResults.checks.database && !healthResults.checks.database.healthy) {
      recovery.attempted.push('database');
      try {
        await this.recoverDatabase();
        recovery.successful.push('database');
      } catch (error) {
        recovery.failed.push('database');
        recovery.details.database = error.message;
      }
    }

    // Container recovery
    if (healthResults.checks.containers && !healthResults.checks.containers.healthy) {
      recovery.attempted.push('containers');
      try {
        await this.recoverContainers();
        recovery.successful.push('containers');
      } catch (error) {
        recovery.failed.push('containers');
        recovery.details.containers = error.message;
      }
    }

    return recovery;
  }

  /**
   * Database recovery procedures
   */
  async recoverDatabase() {
    console.log('🗃️  Attempting database recovery...');
    
    // Stop and restart PostgreSQL container
    try {
      this.shell.executeCommand('docker-compose stop postgres');
      this.shell.executeCommand('docker-compose up -d postgres');
      
      // Wait for database to be ready
      await this.waitForDatabaseReady();
      
      console.log('✅ Database recovery successful');
    } catch (error) {
      console.error('❌ Database recovery failed:', error.message);
      throw error;
    }
  }

  /**
   * Container recovery procedures
   */
  async recoverContainers() {
    console.log('🐳 Attempting container recovery...');
    
    try {
      // Restart all containers
      this.shell.executeCommand('docker-compose down');
      this.shell.executeCommand('docker-compose up -d');
      
      // Wait for services to be ready
      await this.waitForServicesReady();
      
      console.log('✅ Container recovery successful');
    } catch (error) {
      console.error('❌ Container recovery failed:', error.message);
      throw error;
    }
  }

  /**
   * Wait for database to be ready
   */
  async waitForDatabaseReady(maxAttempts = 30) {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        this.shell.executeCommand('docker exec postgres pg_isready', { silent: true });
        return true;
      } catch (error) {
        if (i === maxAttempts - 1) {
          throw new Error('Database did not become ready within timeout');
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  /**
   * Wait for services to be ready
   */
  async waitForServicesReady(maxAttempts = 30) {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const containers = this.shell.executeCommand('docker ps --filter "status=running"', { silent: true });
        if (containers.includes('postgres') && containers.includes('backend')) {
          return true;
        }
      } catch (error) {
        // Continue waiting
      }
      
      if (i === maxAttempts - 1) {
        throw new Error('Services did not become ready within timeout');
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  /**
   * Helper method to check if port is in use
   */
  isPortInUse(port) {
    try {
      const cmd = this.shell.isWindows 
        ? `netstat -an | findstr :${port}`
        : `netstat -tlpn | grep :${port}`;
      
      const result = this.shell.executeCommand(cmd, { silent: true });
      return result.trim().length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Helper method to determine if port usage is unexpected
   */
  isUnexpectedPortUsage(port, service) {
    // This would contain business logic for expected vs unexpected port usage
    // For now, return false (no unexpected usage)
    return false;
  }

  /**
   * Extract version number from command output
   */
  extractVersion(versionOutput) {
    const match = versionOutput.match(/\d+\.\d+\.\d+/);
    return match ? match[0] : '0.0.0';
  }

  /**
   * Check if version meets minimum requirement
   */
  isVersionCompatible(current, minimum) {
    const currentParts = current.split('.').map(Number);
    const minimumParts = minimum.split('.').map(Number);
    
    for (let i = 0; i < 3; i++) {
      if (currentParts[i] > minimumParts[i]) return true;
      if (currentParts[i] < minimumParts[i]) return false;
    }
    
    return true; // Versions are equal
  }

  /**
   * Generate comprehensive health report
   */
  generateHealthReport(results) {
    console.log('\n📊 INFRASTRUCTURE HEALTH REPORT');
    console.log('='.repeat(50));
    console.log(`Timestamp: ${results.timestamp}`);
    console.log(`Overall Status: ${results.overall.toUpperCase()}`);
    
    // Summary
    const totalChecks = Object.keys(results.checks).length;
    const healthyChecks = Object.values(results.checks).filter(check => check.healthy).length;
    console.log(`Health Checks: ${healthyChecks}/${totalChecks} passed`);
    
    // Issues
    if (results.issues.length > 0) {
      console.log('\n❌ ISSUES FOUND:');
      results.issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
    }
    
    // Recommendations
    if (results.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      results.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }
    
    // Recovery results
    if (results.recovery) {
      console.log('\n🚑 RECOVERY ATTEMPT RESULTS:');
      console.log(`Attempted: ${results.recovery.attempted.join(', ')}`);
      console.log(`Successful: ${results.recovery.successful.join(', ')}`);
      console.log(`Failed: ${results.recovery.failed.join(', ')}`);
    }
    
    // Save detailed report
    const reportPath = path.join(this.projectRoot, `infrastructure-health-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`\n📄 Detailed report saved: ${reportPath}`);
  }
}

module.exports = InfrastructureRecovery;

// CLI usage when run directly
if (require.main === module) {
  const recovery = new InfrastructureRecovery();
  
  const options = {
    runRecovery: process.argv.includes('--recover') || process.argv.includes('-r'),
    includeChecks: process.argv.includes('--quick') 
      ? ['containers', 'ports'] 
      : undefined
  };
  
  recovery.assessInfrastructureHealth(options)
    .then(results => {
      process.exit(results.overall === 'healthy' ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Infrastructure assessment failed:', error.message);
      process.exit(1);
    });
}