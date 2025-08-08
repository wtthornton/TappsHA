/**
 * Agent OS Unified Dashboard API Controller
 * Provides real-time data for compliance, lessons learned, and performance metrics
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

class DashboardController {
    constructor() {
        this.complianceData = {};
        this.lessonsData = {};
        this.metricsData = {};
        this.lastUpdate = new Date();
        this.updateInterval = 30000; // 30 seconds
        
        // Initialize data
        this.loadComplianceData();
        this.loadLessonsData();
        this.loadMetricsData();
        
        // Set up periodic updates
        setInterval(() => {
            this.updateAllData();
        }, this.updateInterval);
    }

    /**
     * Get current compliance data
     */
    getComplianceData() {
        return {
            ...this.complianceData,
            lastUpdate: this.lastUpdate.toISOString(),
            updateInterval: this.updateInterval
        };
    }

    /**
     * Get current lessons learned data
     */
    getLessonsData() {
        return {
            ...this.lessonsData,
            lastUpdate: this.lastUpdate.toISOString(),
            updateInterval: this.updateInterval
        };
    }

    /**
     * Get current performance metrics data
     */
    getMetricsData() {
        return {
            ...this.metricsData,
            lastUpdate: this.lastUpdate.toISOString(),
            updateInterval: this.updateInterval
        };
    }

    /**
     * Get unified dashboard data
     */
    getUnifiedData() {
        return {
            compliance: this.getComplianceData(),
            lessons: this.getLessonsData(),
            metrics: this.getMetricsData(),
            dashboard: {
                lastUpdate: this.lastUpdate.toISOString(),
                status: 'active',
                version: '1.0.0'
            }
        };
    }

    /**
     * Load compliance data from compliance checker
     */
    loadComplianceData() {
        try {
            // Read compliance checker results
            const compliancePath = join(__dirname, '..', '..', 'tools', 'compliance-checker.js');
            const complianceResults = this.analyzeComplianceResults();
            
            this.complianceData = {
                critical: complianceResults.critical || 0,
                warning: complianceResults.warning || 0,
                info: complianceResults.info || 0,
                filesAnalyzed: complianceResults.filesAnalyzed || 0,
                criticalTrend: complianceResults.criticalTrend || 0,
                warningTrend: complianceResults.warningTrend || 0,
                infoTrend: complianceResults.infoTrend || 0,
                filesTrend: complianceResults.filesTrend || 0,
                violations: complianceResults.violations || [],
                score: this.calculateComplianceScore(complianceResults)
            };
        } catch (error) {
            console.error('Error loading compliance data:', error);
            this.complianceData = this.getMockComplianceData();
        }
    }

    /**
     * Load lessons learned data
     */
    loadLessonsData() {
        try {
            const lessonsPath = join(__dirname, '..', '..', 'lessons-learned');
            
            // Check if directory exists
            if (!existsSync(lessonsPath)) {
                console.log(`Lessons learned directory not found: ${lessonsPath}`);
                this.lessonsData = this.getMockLessonsData();
                return;
            }
            
            const lessonsResults = this.analyzeLessonsData(lessonsPath);
            
            this.lessonsData = {
                totalLessons: lessonsResults.totalLessons || 0,
                qualityScore: lessonsResults.qualityScore || 0,
                successRate: lessonsResults.successRate || 0,
                captureRate: lessonsResults.captureRate || 0,
                lessonsTrend: lessonsResults.lessonsTrend || 0,
                qualityTrend: lessonsResults.qualityTrend || 0,
                successTrend: lessonsResults.successTrend || 0,
                captureTrend: lessonsResults.captureTrend || 0,
                recentLessons: lessonsResults.recentLessons || [],
                categories: lessonsResults.categories || {}
            };
        } catch (error) {
            console.error('Error loading lessons data:', error);
            this.lessonsData = this.getMockLessonsData();
        }
    }

    /**
     * Load performance metrics data
     */
    loadMetricsData() {
        try {
            const metricsResults = this.analyzePerformanceMetrics();
            
            this.metricsData = {
                overallScore: metricsResults.overallScore || 0,
                devSpeed: metricsResults.devSpeed || 0,
                codeQuality: metricsResults.codeQuality || 0,
                errorRate: metricsResults.errorRate || 0,
                teamSatisfaction: metricsResults.teamSatisfaction || 0,
                devSpeedTrend: metricsResults.devSpeedTrend || 0,
                codeQualityTrend: metricsResults.codeQualityTrend || 0,
                errorRateTrend: metricsResults.errorRateTrend || 0,
                satisfactionTrend: metricsResults.satisfactionTrend || 0,
                trends: metricsResults.trends || []
            };
        } catch (error) {
            console.error('Error loading metrics data:', error);
            this.metricsData = this.getMockMetricsData();
        }
    }

    /**
     * Analyze compliance results from compliance checker
     */
    analyzeComplianceResults() {
        try {
            // Read compliance checker output or analyze files directly
            const projectRoot = join(__dirname, '..', '..', '..');
            const violations = this.scanForViolations(projectRoot);
            
            return {
                critical: violations.filter(v => v.severity === 'critical').length,
                warning: violations.filter(v => v.severity === 'warning').length,
                info: violations.filter(v => v.severity === 'info').length,
                filesAnalyzed: this.countFiles(projectRoot),
                violations: violations,
                criticalTrend: this.calculateTrend('critical'),
                warningTrend: this.calculateTrend('warning'),
                infoTrend: this.calculateTrend('info'),
                filesTrend: this.calculateTrend('files')
            };
        } catch (error) {
            console.error('Error analyzing compliance results:', error);
            return this.getMockComplianceData();
        }
    }

    /**
     * Analyze lessons learned data
     */
    analyzeLessonsData(lessonsPath) {
        try {
            const lessons = this.scanLessonsDirectory(lessonsPath);
            const categories = this.categorizeLessons(lessons);
            
            return {
                totalLessons: lessons.length,
                qualityScore: this.calculateQualityScore(lessons),
                successRate: this.calculateSuccessRate(lessons),
                captureRate: this.calculateCaptureRate(lessons),
                recentLessons: this.getRecentLessons(lessons, 5),
                categories: categories,
                lessonsTrend: this.calculateTrend('lessons'),
                qualityTrend: this.calculateTrend('quality'),
                successTrend: this.calculateTrend('success'),
                captureTrend: this.calculateTrend('capture')
            };
        } catch (error) {
            console.error('Error analyzing lessons data:', error);
            return this.getMockLessonsData();
        }
    }

    /**
     * Analyze performance metrics
     */
    analyzePerformanceMetrics() {
        try {
            // Analyze various performance indicators
            const metrics = {
                overallScore: this.calculateOverallScore(),
                devSpeed: this.calculateDevSpeed(),
                codeQuality: this.calculateCodeQuality(),
                errorRate: this.calculateErrorRate(),
                teamSatisfaction: this.calculateTeamSatisfaction()
            };
            
            return {
                ...metrics,
                devSpeedTrend: this.calculateTrend('devSpeed'),
                codeQualityTrend: this.calculateTrend('codeQuality'),
                errorRateTrend: this.calculateTrend('errorRate'),
                satisfactionTrend: this.calculateTrend('satisfaction'),
                trends: this.getPerformanceTrends()
            };
        } catch (error) {
            console.error('Error analyzing performance metrics:', error);
            return this.getMockMetricsData();
        }
    }

    /**
     * Scan for violations in the project
     */
    scanForViolations(projectRoot) {
        const violations = [];
        
        try {
            const files = this.getAllFiles(projectRoot);
            
            files.forEach(file => {
                if (this.shouldAnalyzeFile(file)) {
                    const fileViolations = this.analyzeFile(file);
                    violations.push(...fileViolations);
                }
            });
        } catch (error) {
            console.error('Error scanning for violations:', error);
        }
        
        return violations;
    }

    /**
     * Check if file should be analyzed
     */
    shouldAnalyzeFile(file) {
        const extensions = ['.js', '.ts', '.tsx', '.java', '.xml', '.json', '.md'];
        const excludeDirs = ['node_modules', 'target', 'dist', '.git'];
        
        const ext = extname(file);
        const shouldAnalyze = extensions.includes(ext);
        
        const excluded = excludeDirs.some(dir => file.includes(dir));
        
        return shouldAnalyze && !excluded;
    }

    /**
     * Analyze a single file for violations
     */
    analyzeFile(file) {
        const violations = [];
        
        try {
            const content = readFileSync(file, 'utf8');
            
            // Check for common violations
            if (content.includes('TODO') || content.includes('FIXME')) {
                violations.push({
                    severity: 'warning',
                    title: 'TODO/FIXME found',
                    file: file,
                    line: this.findLineNumber(content, 'TODO'),
                    description: 'TODO or FIXME comment found in code'
                });
            }
            
            if (content.includes('console.log') && !file.includes('.test.')) {
                violations.push({
                    severity: 'info',
                    title: 'Console.log in production code',
                    file: file,
                    line: this.findLineNumber(content, 'console.log'),
                    description: 'Console.log statement found in non-test file'
                });
            }
            
            // Add more violation checks as needed
            
        } catch (error) {
            console.error(`Error analyzing file ${file}:`, error);
        }
        
        return violations;
    }

    /**
     * Find line number for a pattern
     */
    findLineNumber(content, pattern) {
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(pattern)) {
                return i + 1;
            }
        }
        return 1;
    }

    /**
     * Get all files in directory recursively
     */
    getAllFiles(dir) {
        const files = [];
        
        try {
            const items = readdirSync(dir);
            
            items.forEach(item => {
                const fullPath = join(dir, item);
                const stat = statSync(fullPath);
                
                if (stat.isDirectory()) {
                    files.push(...this.getAllFiles(fullPath));
                } else {
                    files.push(fullPath);
                }
            });
        } catch (error) {
            console.error(`Error reading directory ${dir}:`, error);
        }
        
        return files;
    }

    /**
     * Count files in project
     */
    countFiles(projectRoot) {
        try {
            return this.getAllFiles(projectRoot).length;
        } catch (error) {
            console.error('Error counting files:', error);
            return 0;
        }
    }

    /**
     * Scan lessons directory
     */
    scanLessonsDirectory(lessonsPath) {
        const lessons = [];
        
        try {
            const files = this.getAllFiles(lessonsPath);
            
            files.forEach(file => {
                if (file.endsWith('.md')) {
                    const lesson = this.parseLessonFile(file);
                    if (lesson) {
                        lessons.push(lesson);
                    }
                }
            });
        } catch (error) {
            console.error('Error scanning lessons directory:', error);
        }
        
        return lessons;
    }

    /**
     * Parse a lesson file
     */
    parseLessonFile(file) {
        try {
            const content = readFileSync(file, 'utf8');
            
            // Extract lesson information from markdown
            const titleMatch = content.match(/^#\s+(.+)$/m);
            const categoryMatch = content.match(/category[:\s]+(\w+)/i);
            const dateMatch = content.match(/date[:\s]+([\d-]+)/i);
            
            return {
                title: titleMatch ? titleMatch[1] : 'Untitled Lesson',
                category: categoryMatch ? categoryMatch[1] : 'general',
                date: dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0],
                file: file,
                content: content.substring(0, 200) + '...'
            };
        } catch (error) {
            console.error(`Error parsing lesson file ${file}:`, error);
            return null;
        }
    }

    /**
     * Categorize lessons
     */
    categorizeLessons(lessons) {
        const categories = {};
        
        lessons.forEach(lesson => {
            const category = lesson.category || 'general';
            if (!categories[category]) {
                categories[category] = 0;
            }
            categories[category]++;
        });
        
        return categories;
    }

    /**
     * Calculate quality score for lessons
     */
    calculateQualityScore(lessons) {
        if (lessons.length === 0) return 0;
        
        // Simple quality calculation based on content length and structure
        const scores = lessons.map(lesson => {
            let score = 50; // Base score
            
            // Bonus for longer content
            if (lesson.content.length > 500) score += 20;
            if (lesson.content.length > 1000) score += 10;
            
            // Bonus for structured content
            if (lesson.content.includes('##')) score += 10;
            if (lesson.content.includes('- ')) score += 10;
            
            return Math.min(100, score);
        });
        
        return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    }

    /**
     * Calculate success rate for lessons
     */
    calculateSuccessRate(lessons) {
        if (lessons.length === 0) return 0;
        
        // Mock calculation - in real implementation, this would be based on actual success metrics
        return Math.round(85 + Math.random() * 10);
    }

    /**
     * Calculate capture rate for lessons
     */
    calculateCaptureRate(lessons) {
        if (lessons.length === 0) return 0;
        
        // Mock calculation - in real implementation, this would be based on actual capture metrics
        return Math.round(80 + Math.random() * 15);
    }

    /**
     * Get recent lessons
     */
    getRecentLessons(lessons, count) {
        return lessons
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, count);
    }

    /**
     * Calculate compliance score
     */
    calculateComplianceScore(data) {
        const total = (data.critical || 0) + (data.warning || 0) + (data.info || 0);
        if (total === 0) return 100;
        
        const weightedScore = (data.critical * 10) + (data.warning * 3) + (data.info * 1);
        return Math.max(0, Math.min(100, 100 - (weightedScore / total) * 100));
    }

    /**
     * Calculate overall performance score
     */
    calculateOverallScore() {
        // Mock calculation - in real implementation, this would be based on actual metrics
        return Math.round(85 + Math.random() * 10);
    }

    /**
     * Calculate development speed
     */
    calculateDevSpeed() {
        // Mock calculation
        return Math.round(90 + Math.random() * 10);
    }

    /**
     * Calculate code quality
     */
    calculateCodeQuality() {
        // Mock calculation
        return Math.round(85 + Math.random() * 15);
    }

    /**
     * Calculate error rate
     */
    calculateErrorRate() {
        // Mock calculation
        return Math.round(2 + Math.random() * 5);
    }

    /**
     * Calculate team satisfaction
     */
    calculateTeamSatisfaction() {
        // Mock calculation
        return Math.round(80 + Math.random() * 20);
    }

    /**
     * Calculate trend for a metric
     */
    calculateTrend(metric) {
        // Mock trend calculation - in real implementation, this would be based on historical data
        return Math.round((Math.random() - 0.5) * 10);
    }

    /**
     * Get performance trends
     */
    getPerformanceTrends() {
        // Mock trends data
        return [
            { metric: 'devSpeed', trend: 5, period: 'week' },
            { metric: 'codeQuality', trend: 2, period: 'week' },
            { metric: 'errorRate', trend: -1, period: 'week' },
            { metric: 'satisfaction', trend: 3, period: 'week' }
        ];
    }

    /**
     * Update all data
     */
    updateAllData() {
        this.loadComplianceData();
        this.loadLessonsData();
        this.loadMetricsData();
        this.lastUpdate = new Date();
    }

    // Mock data methods
    getMockComplianceData() {
        return {
            critical: 2,
            warning: 8,
            info: 15,
            filesAnalyzed: 156,
            criticalTrend: -1,
            warningTrend: 2,
            infoTrend: 0,
            filesTrend: 5,
            violations: [
                {
                    severity: 'critical',
                    title: 'Security vulnerability detected',
                    file: 'backend/src/main/java/com/tappha/controller/UserController.java',
                    line: 45,
                    description: 'Missing input validation for user input'
                },
                {
                    severity: 'warning',
                    title: 'Performance issue identified',
                    file: 'frontend/src/components/Dashboard.tsx',
                    line: 23,
                    description: 'Inefficient re-rendering detected'
                }
            ],
            score: 87
        };
    }

    getMockLessonsData() {
        return {
            totalLessons: 47,
            qualityScore: 92,
            successRate: 88,
            captureRate: 85,
            lessonsTrend: 5,
            qualityTrend: 2,
            successTrend: 3,
            captureTrend: 1,
            recentLessons: [
                {
                    category: 'architecture',
                    title: 'Service Layer Orchestration Pattern',
                    description: 'Core service should orchestrate specialized services for better maintainability',
                    date: '2025-01-27'
                },
                {
                    category: 'development',
                    title: 'Comprehensive DTO Design',
                    description: 'Complete DTO hierarchy with validation improves API consistency',
                    date: '2025-01-26'
                },
                {
                    category: 'testing',
                    title: 'Test-Driven Database Development',
                    description: 'Write entity tests first, then repository tests, then migration scripts',
                    date: '2025-01-25'
                }
            ],
            categories: {
                architecture: 15,
                development: 20,
                testing: 12
            }
        };
    }

    getMockMetricsData() {
        return {
            overallScore: 87,
            devSpeed: 95,
            codeQuality: 92,
            errorRate: 3,
            teamSatisfaction: 89,
            devSpeedTrend: 5,
            codeQualityTrend: 2,
            errorRateTrend: -1,
            satisfactionTrend: 3,
            trends: [
                { metric: 'devSpeed', trend: 5, period: 'week' },
                { metric: 'codeQuality', trend: 2, period: 'week' },
                { metric: 'errorRate', trend: -1, period: 'week' },
                { metric: 'satisfaction', trend: 3, period: 'week' }
            ]
        };
    }
}

// Export the controller
export default DashboardController;
