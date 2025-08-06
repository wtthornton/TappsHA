#!/usr/bin/env node

/**
 * Cross-Platform Shell Execution Utility
 * Extracted from validation-implementation-lessons.md
 * 
 * Handles shell command execution across Windows PowerShell and Unix shells
 * with proper command chaining and error handling.
 */

const { execSync, exec } = require('child_process');
const os = require('os');

class CrossPlatformShell {
  constructor() {
    this.isWindows = process.platform === 'win32';
    this.shell = this.isWindows ? 'powershell.exe' : '/bin/bash';
    this.pathSeparator = this.isWindows ? '\\' : '/';
  }

  /**
   * Execute a single command with proper platform handling
   * @param {string} command - Command to execute
   * @param {Object} options - Execution options
   * @returns {string} command output
   */
  executeCommand(command, options = {}) {
    const {
      cwd = process.cwd(),
      encoding = 'utf8',
      timeout = 30000,
      silent = false
    } = options;

    if (!silent) {
      console.log(`🔧 Executing: ${command}`);
    }

    try {
      // Handle Windows PowerShell command chaining issues
      if (this.isWindows && command.includes('&&')) {
        return this.executeSequential(command.split('&&').map(cmd => cmd.trim()), options);
      }

      const result = execSync(command, {
        cwd,
        encoding,
        timeout,
        stdio: silent ? 'pipe' : 'inherit'
      });

      if (!silent) {
        console.log('✅ Command completed successfully');
      }

      return result;
    } catch (error) {
      console.error(`❌ Command failed: ${command}`);
      console.error(`Error: ${error.message}`);
      
      if (options.throwOnError !== false) {
        throw error;
      }
      
      return null;
    }
  }

  /**
   * Execute multiple commands sequentially
   * @param {string[]} commands - Array of commands to execute
   * @param {Object} options - Execution options
   * @returns {string[]} array of command outputs
   */
  executeSequential(commands, options = {}) {
    const results = [];
    
    for (const cmd of commands) {
      const result = this.executeCommand(cmd.trim(), options);
      results.push(result);
    }
    
    return results;
  }

  /**
   * Execute command asynchronously with promise
   * @param {string} command - Command to execute
   * @param {Object} options - Execution options
   * @returns {Promise<string>} command output
   */
  executeAsync(command, options = {}) {
    const {
      cwd = process.cwd(),
      encoding = 'utf8',
      timeout = 30000
    } = options;

    return new Promise((resolve, reject) => {
      exec(command, { cwd, encoding, timeout }, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Command failed: ${command}\n${error.message}\n${stderr}`));
        } else {
          resolve(stdout);
        }
      });
    });
  }

  /**
   * Check if a command exists on the system
   * @param {string} command - Command to check
   * @returns {boolean} true if command exists
   */
  commandExists(command) {
    try {
      const checkCmd = this.isWindows ? `Get-Command ${command}` : `which ${command}`;
      this.executeCommand(checkCmd, { silent: true, throwOnError: false });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get platform-specific path
   * @param {string[]} pathParts - Path parts to join
   * @returns {string} platform-specific path
   */
  getPath(...pathParts) {
    return pathParts.join(this.pathSeparator);
  }

  /**
   * Change directory with platform handling
   * @param {string} directory - Directory to change to
   * @param {Object} options - Options
   * @returns {string} command to change directory
   */
  changeDirectory(directory, options = {}) {
    const { execute = true } = options;
    const cdCommand = this.isWindows ? `Set-Location "${directory}"` : `cd "${directory}"`;
    
    if (execute) {
      return this.executeCommand(cdCommand, options);
    }
    
    return cdCommand;
  }

  /**
   * Execute npm commands with proper error handling
   * @param {string} npmCommand - npm command (without 'npm' prefix)
   * @param {Object} options - Execution options
   * @returns {string} command output
   */
  executeNpm(npmCommand, options = {}) {
    const { cwd = process.cwd(), force = false } = options;
    
    // Check if npm exists
    if (!this.commandExists('npm')) {
      throw new Error('npm is not installed or not in PATH');
    }
    
    // Add --yes flag for non-interactive commands if force is true
    const forceFlag = force ? ' --yes' : '';
    const fullCommand = `npm ${npmCommand}${forceFlag}`;
    
    return this.executeCommand(fullCommand, { ...options, cwd });
  }

  /**
   * Execute git commands with proper error handling
   * @param {string} gitCommand - git command (without 'git' prefix)
   * @param {Object} options - Execution options
   * @returns {string} command output
   */
  executeGit(gitCommand, options = {}) {
    const { cwd = process.cwd() } = options;
    
    // Check if git exists
    if (!this.commandExists('git')) {
      throw new Error('git is not installed or not in PATH');
    }
    
    const fullCommand = `git ${gitCommand}`;
    return this.executeCommand(fullCommand, { ...options, cwd });
  }

  /**
   * Get system information
   * @returns {Object} system information
   */
  getSystemInfo() {
    return {
      platform: process.platform,
      isWindows: this.isWindows,
      shell: this.shell,
      pathSeparator: this.pathSeparator,
      nodeVersion: process.version,
      architecture: process.arch,
      homedir: os.homedir(),
      hostname: os.hostname(),
      cpus: os.cpus().length,
      totalMemory: Math.round(os.totalmem() / 1024 / 1024 / 1024) + 'GB'
    };
  }

  /**
   * Create a command chain that works cross-platform
   * @param {string[]} commands - Commands to chain
   * @param {Object} options - Options
   * @returns {string} platform-appropriate command chain
   */
  createCommandChain(commands, options = {}) {
    const { stopOnError = true } = options;
    
    if (this.isWindows) {
      // PowerShell uses semicolons for command chaining
      return stopOnError 
        ? commands.map(cmd => `if ($?) { ${cmd} }`).join('; ')
        : commands.join('; ');
    } else {
      // Unix shells use && for conditional chaining
      return stopOnError ? commands.join(' && ') : commands.join('; ');
    }
  }
}

module.exports = CrossPlatformShell;

// CLI usage when run directly
if (require.main === module) {
  const shell = new CrossPlatformShell();
  
  // Print system info
  console.log('🖥️  System Information:');
  console.log(JSON.stringify(shell.getSystemInfo(), null, 2));
  
  // Execute command from command line arguments
  const command = process.argv.slice(2).join(' ');
  if (command) {
    console.log(`\n🚀 Executing: ${command}`);
    shell.executeCommand(command);
  }
}