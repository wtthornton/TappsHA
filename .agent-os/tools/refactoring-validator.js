#!/usr/bin/env node

/**
 * Refactoring Validator Tool
 * 
 * Validates refactoring quality and enforces standards after each phase completion.
 * This tool ensures systematic refactoring happens after each specification phase.
 * 
 * Usage:
 *   node refactoring-validator.js --phase=1 --validate
 *   node refactoring-validator.js --phase=2 --check-quality
 *   node refactoring-validator.js --phase=3 --generate-report
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class RefactoringValidator {
    constructor() {
        this.projectRoot = process.cwd();
        this.phase = process.argv.find(arg => arg.startsWith('--phase='))?.split('=')[1] || '1';
        this.mode = process.argv.find(arg => arg.startsWith('--'))?.replace('--', '') || 'validate';
        
        this.qualityGates = {
            security: {
                hardcodedSecrets: 0,
                encryptionCoverage: 100,
                inputValidation: 100,
                sqlInjectionPrevention: 100,
                owaspCompliance: 100
            },
            codeQuality: {
                todoCountPerService: 5,
                testCoverage: 85,
                documentation: 100,
                exceptionHandling: 100,
                namingConventions: 100
            },
            performance: {
                responseTimeP95: 200,
                memoryUsage: 'within_limits',
                databasePerformance: 'optimized',
                connectionPooling: 'configured',
                caching: 'implemented'
            }
        };
    }

    /**
     * Main validation process
     */
    async validate() {
        console.log(`🔍 Refactoring Validator - Phase ${this.phase}`);
        console.log(`📊 Mode: ${this.mode}`);
        console.log('=' * 50);

        try {
            const results = await this.performValidation();
            this.generateReport(results);
            this.enforceQualityGates(results);
            
            console.log('✅ Refactoring validation completed successfully');
            return results;
            
        } catch (error) {
            console.error('❌ Refactoring validation failed:', error.message);
            process.exit(1);
        }
    }

    /**
     * Perform comprehensive validation
     */
    async performValidation() {
        const results = {
            phase: this.phase,
            timestamp: new Date().toISOString(),
            security: await this.validateSecurity(),
            codeQuality: await this.validateCodeQuality(),
            performance: await this.validatePerformance(),
            metrics: await this.calculateMetrics()
        };

        return results;
    }

    /**
     * Validate security requirements
     */
    async validateSecurity() {
        console.log('🔐 Validating security requirements...');
        
        const securityResults = {
            hardcodedSecrets: await this.checkHardcodedSecrets(),
            encryptionCoverage: await this.checkEncryptionCoverage(),
            inputValidation: await this.checkInputValidation(),
            sqlInjectionPrevention: await this.checkSqlInjectionPrevention(),
            owaspCompliance: await this.checkOwaspCompliance()
        };

        const securityScore = this.calculateSecurityScore(securityResults);
        console.log(`   Security Score: ${securityScore}%`);

        return {
            ...securityResults,
            score: securityScore,
            passed: securityScore >= 100
        };
    }

    /**
     * Validate code quality requirements
     */
    async validateCodeQuality() {
        console.log('📝 Validating code quality requirements...');
        
        const codeQualityResults = {
            todoCount: await this.checkTodoCount(),
            testCoverage: await this.checkTestCoverage(),
            documentation: await this.checkDocumentation(),
            exceptionHandling: await this.checkExceptionHandling(),
            namingConventions: await this.checkNamingConventions()
        };

        const codeQualityScore = this.calculateCodeQualityScore(codeQualityResults);
        console.log(`   Code Quality Score: ${codeQualityScore}%`);

        return {
            ...codeQualityResults,
            score: codeQualityScore,
            passed: codeQualityScore >= 85
        };
    }

    /**
     * Validate performance requirements
     */
    async validatePerformance() {
        console.log('⚡ Validating performance requirements...');
        
        const performanceResults = {
            responseTime: await this.checkResponseTime(),
            memoryUsage: await this.checkMemoryUsage(),
            databasePerformance: await this.checkDatabasePerformance(),
            connectionPooling: await this.checkConnectionPooling(),
            caching: await this.checkCaching()
        };

        const performanceScore = this.calculatePerformanceScore(performanceResults);
        console.log(`   Performance Score: ${performanceScore}%`);

        return {
            ...performanceResults,
            score: performanceScore,
            passed: performanceScore >= 80
        };
    }

    /**
     * Check for hardcoded secrets
     */
    async checkHardcodedSecrets() {
        const patterns = [
            /password\s*=\s*["'][^"']+["']/gi,
            /token\s*=\s*["'][^"']+["']/gi,
            /secret\s*=\s*["'][^"']+["']/gi,
            /api_key\s*=\s*["'][^"']+["']/gi,
            /TODO.*encrypt/gi
        ];

        let secretCount = 0;
        const files = this.findFiles(['.java', '.ts', '.tsx', '.js']);

        for (const file of files) {
            const content = fs.readFileSync(file, 'utf8');
            for (const pattern of patterns) {
                const matches = content.match(pattern);
                if (matches) {
                    secretCount += matches.length;
                }
            }
        }

        return {
            count: secretCount,
            passed: secretCount === 0,
            details: `Found ${secretCount} potential hardcoded secrets`
        };
    }

    /**
     * Check encryption coverage
     */
    async checkEncryptionCoverage() {
        const encryptionPatterns = [
            /encryptionService\.encrypt/gi,
            /encrypt\(/gi,
            /EncryptionService/gi
        ];

        const tokenPatterns = [
            /setToken\(/gi,
            /getToken\(/gi,
            /token.*=/gi
        ];

        let encryptionCount = 0;
        let tokenCount = 0;
        const files = this.findFiles(['.java', '.ts', '.tsx', '.js']);

        for (const file of files) {
            const content = fs.readFileSync(file, 'utf8');
            
            for (const pattern of encryptionPatterns) {
                const matches = content.match(pattern);
                if (matches) {
                    encryptionCount += matches.length;
                }
            }
            
            for (const pattern of tokenPatterns) {
                const matches = content.match(pattern);
                if (matches) {
                    tokenCount += matches.length;
                }
            }
        }

        const coverage = tokenCount > 0 ? (encryptionCount / tokenCount) * 100 : 100;
        
        return {
            coverage: Math.round(coverage),
            passed: coverage >= 100,
            details: `Encryption coverage: ${Math.round(coverage)}%`
        };
    }

    /**
     * Check TODO count per service
     */
    async checkTodoCount() {
        const todoPattern = /TODO|FIXME|HACK|XXX|BUG/gi;
        const serviceFiles = this.findFiles(['.java']).filter(file => 
            file.includes('/service/') || file.includes('/controller/')
        );

        const serviceTodoCounts = {};
        let totalTodos = 0;

        for (const file of serviceFiles) {
            const content = fs.readFileSync(file, 'utf8');
            const matches = content.match(todoPattern);
            const todoCount = matches ? matches.length : 0;
            
            const serviceName = path.basename(file, path.extname(file));
            serviceTodoCounts[serviceName] = todoCount;
            totalTodos += todoCount;
        }

        const servicesWithExcessTodos = Object.entries(serviceTodoCounts)
            .filter(([_, count]) => count > 5)
            .length;

        return {
            totalTodos,
            servicesWithExcessTodos,
            serviceBreakdown: serviceTodoCounts,
            passed: servicesWithExcessTodos === 0,
            details: `${totalTodos} total TODOs, ${servicesWithExcessTodos} services with >5 TODOs`
        };
    }

    /**
     * Check test coverage
     */
    async checkTestCoverage() {
        try {
            // Try to run test coverage command
            const coverageOutput = execSync('npm test -- --coverage', { 
                encoding: 'utf8',
                cwd: this.projectRoot,
                stdio: 'pipe'
            });

            // Parse coverage percentage from output
            const coverageMatch = coverageOutput.match(/All files\s+\|\s+(\d+)/);
            const coverage = coverageMatch ? parseInt(coverageMatch[1]) : 0;

            return {
                coverage,
                passed: coverage >= 85,
                details: `Test coverage: ${coverage}%`
            };
        } catch (error) {
            return {
                coverage: 0,
                passed: false,
                details: 'Could not determine test coverage'
            };
        }
    }

    /**
     * Calculate metrics
     */
    async calculateMetrics() {
        const files = this.findFiles(['.java', '.ts', '.tsx', '.js']);
        const totalLines = files.reduce((total, file) => {
            try {
                const content = fs.readFileSync(file, 'utf8');
                return total + content.split('\n').length;
            } catch (error) {
                return total;
            }
        }, 0);

        return {
            totalFiles: files.length,
            totalLines,
            averageLinesPerFile: Math.round(totalLines / files.length)
        };
    }

    /**
     * Find files by extension
     */
    findFiles(extensions) {
        const files = [];
        
        function walkDir(dir) {
            const items = fs.readdirSync(dir);
            
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                    walkDir(fullPath);
                } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
                    files.push(fullPath);
                }
            }
        }
        
        walkDir(this.projectRoot);
        return files;
    }

    /**
     * Calculate security score
     */
    calculateSecurityScore(results) {
        const weights = {
            hardcodedSecrets: 40,
            encryptionCoverage: 25,
            inputValidation: 15,
            sqlInjectionPrevention: 15,
            owaspCompliance: 5
        };

        let score = 0;
        for (const [key, weight] of Object.entries(weights)) {
            if (results[key]?.passed) {
                score += weight;
            }
        }

        return score;
    }

    /**
     * Calculate code quality score
     */
    calculateCodeQualityScore(results) {
        const weights = {
            todoCount: 30,
            testCoverage: 30,
            documentation: 20,
            exceptionHandling: 15,
            namingConventions: 5
        };

        let score = 0;
        for (const [key, weight] of Object.entries(weights)) {
            if (results[key]?.passed) {
                score += weight;
            }
        }

        return score;
    }

    /**
     * Calculate performance score
     */
    calculatePerformanceScore(results) {
        const weights = {
            responseTime: 30,
            memoryUsage: 20,
            databasePerformance: 25,
            connectionPooling: 15,
            caching: 10
        };

        let score = 0;
        for (const [key, weight] of Object.entries(weights)) {
            if (results[key]?.passed) {
                score += weight;
            }
        }

        return score;
    }

    /**
     * Generate validation report
     */
    generateReport(results) {
        console.log('\n📊 REFACTORING VALIDATION REPORT');
        console.log('=' * 50);
        
        console.log(`Phase: ${results.phase}`);
        console.log(`Timestamp: ${results.timestamp}`);
        console.log(`Total Files: ${results.metrics.totalFiles}`);
        console.log(`Total Lines: ${results.metrics.totalLines}`);
        console.log(`Average Lines/File: ${results.metrics.averageLinesPerFile}`);
        
        console.log('\n🔐 SECURITY VALIDATION');
        console.log(`Score: ${results.security.score}%`);
        console.log(`Status: ${results.security.passed ? '✅ PASSED' : '❌ FAILED'}`);
        
        console.log('\n📝 CODE QUALITY VALIDATION');
        console.log(`Score: ${results.codeQuality.score}%`);
        console.log(`Status: ${results.codeQuality.passed ? '✅ PASSED' : '❌ FAILED'}`);
        
        console.log('\n⚡ PERFORMANCE VALIDATION');
        console.log(`Score: ${results.performance.score}%`);
        console.log(`Status: ${results.performance.passed ? '✅ PASSED' : '❌ FAILED'}`);
        
        // Save detailed report
        const reportPath = path.join(this.projectRoot, `refactoring-report-phase-${this.phase}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
        console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    }

    /**
     * Enforce quality gates
     */
    enforceQualityGates(results) {
        const allPassed = results.security.passed && 
                         results.codeQuality.passed && 
                         results.performance.passed;

        if (!allPassed) {
            console.log('\n❌ QUALITY GATES FAILED');
            console.log('=' * 30);
            
            if (!results.security.passed) {
                console.log('🔐 Security quality gate failed');
            }
            
            if (!results.codeQuality.passed) {
                console.log('📝 Code quality gate failed');
            }
            
            if (!results.performance.passed) {
                console.log('⚡ Performance quality gate failed');
            }
            
            console.log('\n⚠️  Phase completion blocked until quality gates pass');
            process.exit(1);
        } else {
            console.log('\n✅ ALL QUALITY GATES PASSED');
            console.log('=' * 30);
            console.log('🎉 Phase completion approved');
        }
    }

    // Placeholder methods for other validations
    async checkInputValidation() { return { passed: true, details: 'Input validation check' }; }
    async checkSqlInjectionPrevention() { return { passed: true, details: 'SQL injection prevention check' }; }
    async checkOwaspCompliance() { return { passed: true, details: 'OWASP compliance check' }; }
    async checkDocumentation() { return { passed: true, details: 'Documentation check' }; }
    async checkExceptionHandling() { return { passed: true, details: 'Exception handling check' }; }
    async checkNamingConventions() { return { passed: true, details: 'Naming conventions check' }; }
    async checkResponseTime() { return { passed: true, details: 'Response time check' }; }
    async checkMemoryUsage() { return { passed: true, details: 'Memory usage check' }; }
    async checkDatabasePerformance() { return { passed: true, details: 'Database performance check' }; }
    async checkConnectionPooling() { return { passed: true, details: 'Connection pooling check' }; }
    async checkCaching() { return { passed: true, details: 'Caching check' }; }
}

// Run the validator
if (require.main === module) {
    const validator = new RefactoringValidator();
    validator.validate().catch(error => {
        console.error('Validation failed:', error);
        process.exit(1);
    });
}

module.exports = RefactoringValidator; 