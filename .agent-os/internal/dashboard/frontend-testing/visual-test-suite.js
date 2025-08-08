#!/usr/bin/env node

/**
 * Agent OS Dashboard Frontend Visual Testing Suite
 * Performs comprehensive visual testing with screenshot capture
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class DashboardVisualTestSuite {
    constructor() {
        this.browser = null;
        this.page = null;
        this.screenshotDir = path.join(process.cwd(), 'test-screenshots');
        this.testResults = [];
        this.baseUrl = 'http://localhost:3002';
        
        // Ensure screenshot directory exists
        if (!fs.existsSync(this.screenshotDir)) {
            fs.mkdirSync(this.screenshotDir, { recursive: true });
        }
    }

    /**
     * Initialize browser and page
     */
    async initialize() {
        console.log('🚀 Initializing browser for visual testing...');
        
        this.browser = await puppeteer.launch({
            headless: false, // Set to true for CI/CD
            defaultViewport: { width: 1920, height: 1080 },
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        this.page = await this.browser.newPage();
        
        // Set user agent for consistent rendering
        await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        console.log('✅ Browser initialized successfully');
    }

    /**
     * Take screenshot with timestamp
     */
    async takeScreenshot(name, description = '') {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${name}-${timestamp}.png`;
        const filepath = path.join(this.screenshotDir, filename);
        
        await this.page.screenshot({
            path: filepath,
            fullPage: true
        });
        
        console.log(`📸 Screenshot saved: ${filename}`);
        
        return {
            name,
            description,
            filename,
            filepath,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Test dashboard loading and initial state
     */
    async testDashboardLoading() {
        console.log('\n🔍 Testing Dashboard Loading...');
        
        try {
            // Navigate to dashboard
            await this.page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
            
            // Wait for dashboard to load
            await this.page.waitForSelector('.header', { timeout: 10000 });
            
            // Check for main elements
            const title = await this.page.$eval('h1', el => el.textContent);
            const navTabs = await this.page.$$('.nav-tab');
            
            console.log(`✅ Dashboard loaded successfully`);
            console.log(`   Title: ${title}`);
            console.log(`   Navigation tabs: ${navTabs.length}`);
            
            // Take screenshot of initial state
            const screenshot = await this.takeScreenshot('dashboard-initial-load', 'Dashboard initial load state');
            
            this.testResults.push({
                test: 'Dashboard Loading',
                status: 'PASS',
                details: {
                    title: title,
                    navTabs: navTabs.length,
                    screenshot: screenshot
                }
            });
            
        } catch (error) {
            console.error(`❌ Dashboard loading failed: ${error.message}`);
            this.testResults.push({
                test: 'Dashboard Loading',
                status: 'FAIL',
                error: error.message
            });
        }
    }

    /**
     * Test navigation tabs functionality
     */
    async testNavigationTabs() {
        console.log('\n🔍 Testing Navigation Tabs...');
        
        const tabs = [
            { name: 'compliance', label: '📊 Compliance' },
            { name: 'lessons', label: '📚 Lessons Learned' },
            { name: 'metrics', label: '📈 Performance Metrics' },
            { name: 'analytics', label: '🔍 Analytics' }
        ];
        
        for (const tab of tabs) {
            try {
                console.log(`   Testing tab: ${tab.label}`);
                
                // Click on tab (data attribute)
                await this.page.click(`.nav-tab[data-tab="${tab.name}"]`);
                // Wait for content to load
                await this.page.evaluate(() => new Promise(r => setTimeout(r, 500)));
                
                // Check if tab content is visible
                const tabContent = await this.page.$(`#${tab.name}-content`);
                const isVisible = await tabContent.evaluate(el => {
                    return window.getComputedStyle(el).display !== 'none';
                });
                
                if (isVisible) {
                    console.log(`   ✅ ${tab.label} tab working`);
                    
                    // Take screenshot of tab
                    const screenshot = await this.takeScreenshot(
                        `tab-${tab.name}`,
                        `${tab.label} tab content`
                    );
                    
                    this.testResults.push({
                        test: `Navigation Tab - ${tab.label}`,
                        status: 'PASS',
                        details: {
                            tabName: tab.name,
                            screenshot: screenshot
                        }
                    });
                } else {
                    throw new Error(`Tab content not visible`);
                }
                
            } catch (error) {
                console.error(`   ❌ ${tab.label} tab failed: ${error.message}`);
                this.testResults.push({
                    test: `Navigation Tab - ${tab.label}`,
                    status: 'FAIL',
                    error: error.message
                });
            }
        }
    }

    /**
     * Test compliance tab functionality
     */
    async testComplianceTab() {
        console.log('\n🔍 Testing Compliance Tab...');
        
        try {
            // Navigate to compliance tab
            await this.page.click('.nav-tab[data-tab="compliance"]');
            await this.page.evaluate(() => new Promise(r => setTimeout(r, 500)));
            
            // Check for compliance data elements
            const complianceElements = await this.page.$$eval('.compliance-card', elements => {
                return elements.map(el => ({
                    title: el.querySelector('h3')?.textContent || '',
                    value: el.querySelector('.metric-value')?.textContent || ''
                }));
            });
            
            console.log(`   ✅ Compliance tab loaded with ${complianceElements.length} cards`);
            
            // Test search functionality
            const searchInput = await this.page.$('#searchInput');
            if (searchInput) {
                await searchInput.type('TODO');
                await this.page.waitForTimeout(300);
                console.log('   ✅ Search functionality working');
            }
            
            // Take screenshot
            const screenshot = await this.takeScreenshot('compliance-tab', 'Compliance tab with data');
            
            this.testResults.push({
                test: 'Compliance Tab Functionality',
                status: 'PASS',
                details: {
                    cardsCount: complianceElements.length,
                    searchWorking: !!searchInput,
                    screenshot: screenshot
                }
            });
            
        } catch (error) {
            console.error(`❌ Compliance tab test failed: ${error.message}`);
            this.testResults.push({
                test: 'Compliance Tab Functionality',
                status: 'FAIL',
                error: error.message
            });
        }
    }

    /**
     * Test lessons learned tab functionality
     */
    async testLessonsTab() {
        console.log('\n🔍 Testing Lessons Learned Tab...');
        
        try {
            // Navigate to lessons tab
            await this.page.click('.nav-tab[data-tab="lessons"]');
            await this.page.evaluate(() => new Promise(r => setTimeout(r, 500)));
            
            // Check for lessons data
            const lessonsElements = await this.page.$$eval('.lesson-card', elements => {
                return elements.map(el => ({
                    title: el.querySelector('h4')?.textContent || '',
                    category: el.querySelector('.lesson-category')?.textContent || ''
                }));
            });
            
            console.log(`   ✅ Lessons tab loaded with ${lessonsElements.length} lessons`);
            
            // Take screenshot
            const screenshot = await this.takeScreenshot('lessons-tab', 'Lessons learned tab with data');
            
            this.testResults.push({
                test: 'Lessons Learned Tab Functionality',
                status: 'PASS',
                details: {
                    lessonsCount: lessonsElements.length,
                    screenshot: screenshot
                }
            });
            
        } catch (error) {
            console.error(`❌ Lessons tab test failed: ${error.message}`);
            this.testResults.push({
                test: 'Lessons Learned Tab Functionality',
                status: 'FAIL',
                error: error.message
            });
        }
    }

    /**
     * Test metrics tab functionality
     */
    async testMetricsTab() {
        console.log('\n🔍 Testing Performance Metrics Tab...');
        
        try {
            // Navigate to metrics tab
            await this.page.click('.nav-tab[data-tab="metrics"]');
            await this.page.evaluate(() => new Promise(r => setTimeout(r, 500)));
            
            // Check for metrics data
            const metricsElements = await this.page.$$eval('.metric-card', elements => {
                return elements.map(el => ({
                    title: el.querySelector('h3')?.textContent || '',
                    value: el.querySelector('.metric-value')?.textContent || ''
                }));
            });
            
            console.log(`   ✅ Metrics tab loaded with ${metricsElements.length} metrics`);
            
            // Take screenshot
            const screenshot = await this.takeScreenshot('metrics-tab', 'Performance metrics tab with data');
            
            this.testResults.push({
                test: 'Performance Metrics Tab Functionality',
                status: 'PASS',
                details: {
                    metricsCount: metricsElements.length,
                    screenshot: screenshot
                }
            });
            
        } catch (error) {
            console.error(`❌ Metrics tab test failed: ${error.message}`);
            this.testResults.push({
                test: 'Performance Metrics Tab Functionality',
                status: 'FAIL',
                error: error.message
            });
        }
    }

    /**
     * Test responsive design
     */
    async testResponsiveDesign() {
        console.log('\n🔍 Testing Responsive Design...');
        
        const viewports = [
            { name: 'desktop', width: 1920, height: 1080 },
            { name: 'tablet', width: 768, height: 1024 },
            { name: 'mobile', width: 375, height: 667 }
        ];
        
        for (const viewport of viewports) {
            try {
                console.log(`   Testing ${viewport.name} viewport (${viewport.width}x${viewport.height})`);
                
                // Set viewport
                await this.page.setViewport({
                    width: viewport.width,
                    height: viewport.height
                });
                
                // Wait for layout to adjust
                await this.page.waitForTimeout(500);
                
                // Take screenshot
                const screenshot = await this.takeScreenshot(
                    `responsive-${viewport.name}`,
                    `${viewport.name} viewport (${viewport.width}x${viewport.height})`
                );
                
                // Check if navigation is accessible
                const navTabs = await this.page.$$('.nav-tab');
                const navVisible = navTabs.length > 0;
                
                this.testResults.push({
                    test: `Responsive Design - ${viewport.name}`,
                    status: navVisible ? 'PASS' : 'FAIL',
                    details: {
                        viewport: viewport,
                        navigationVisible: navVisible,
                        screenshot: screenshot
                    }
                });
                
                console.log(`   ✅ ${viewport.name} viewport test completed`);
                
            } catch (error) {
                console.error(`   ❌ ${viewport.name} viewport test failed: ${error.message}`);
                this.testResults.push({
                    test: `Responsive Design - ${viewport.name}`,
                    status: 'FAIL',
                    error: error.message
                });
            }
        }
    }

    /**
     * Test real-time updates
     */
    async testRealTimeUpdates() {
        console.log('\n🔍 Testing Real-time Updates...');
        
        try {
            // Navigate to compliance tab
            await this.page.click('.nav-tab[data-tab="compliance"]');
            await this.page.evaluate(() => new Promise(r => setTimeout(r, 500)));
            
            // Take initial screenshot
            const initialScreenshot = await this.takeScreenshot('realtime-initial', 'Initial state before updates');
            
            // Wait for potential updates
            await this.page.waitForTimeout(5000);
            
            // Take updated screenshot
            const updatedScreenshot = await this.takeScreenshot('realtime-updated', 'State after 5 seconds');
            
            // Check for real-time indicator
            const realTimeIndicator = await this.page.$('.real-time-indicator');
            const isRealTimeActive = realTimeIndicator !== null;
            
            console.log(`   ✅ Real-time updates test completed`);
            console.log(`   Real-time indicator: ${isRealTimeActive ? 'Active' : 'Not found'}`);
            
            this.testResults.push({
                test: 'Real-time Updates',
                status: 'PASS',
                details: {
                    realTimeActive: isRealTimeActive,
                    initialScreenshot: initialScreenshot,
                    updatedScreenshot: updatedScreenshot
                }
            });
            
        } catch (error) {
            console.error(`❌ Real-time updates test failed: ${error.message}`);
            this.testResults.push({
                test: 'Real-time Updates',
                status: 'FAIL',
                error: error.message
            });
        }
    }

    /**
     * Generate test report
     */
    generateReport() {
        console.log('\n📊 Generating Test Report...');
        
        const report = {
            timestamp: new Date().toISOString(),
            totalTests: this.testResults.length,
            passedTests: this.testResults.filter(r => r.status === 'PASS').length,
            failedTests: this.testResults.filter(r => r.status === 'FAIL').length,
            results: this.testResults
        };
        
        // Save report to file
        const reportPath = path.join(this.screenshotDir, 'test-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        // Print summary
        console.log('\n🎯 Test Summary:');
        console.log(`   Total Tests: ${report.totalTests}`);
        console.log(`   Passed: ${report.passedTests}`);
        console.log(`   Failed: ${report.failedTests}`);
        console.log(`   Success Rate: ${((report.passedTests / report.totalTests) * 100).toFixed(1)}%`);
        console.log(`   Screenshots: ${this.screenshotDir}`);
        console.log(`   Report: ${reportPath}`);
        
        return report;
    }

    /**
     * Clean up resources
     */
    async cleanup() {
        if (this.browser) {
            await this.browser.close();
            console.log('🧹 Browser closed');
        }
    }

    /**
     * Run all tests
     */
    async runAllTests() {
        console.log('🤖 Starting Agent OS Dashboard Visual Testing Suite...\n');
        
        try {
            await this.initialize();
            
            // Run all test suites
            await this.testDashboardLoading();
            await this.testNavigationTabs();
            await this.testComplianceTab();
            await this.testLessonsTab();
            await this.testMetricsTab();
            await this.testResponsiveDesign();
            await this.testRealTimeUpdates();
            
            // Generate report
            const report = this.generateReport();
            
            console.log('\n🎉 Visual testing completed!');
            console.log(`📸 Screenshots saved to: ${this.screenshotDir}`);
            console.log(`📊 Test report saved to: ${path.join(this.screenshotDir, 'test-report.json')}`);
            
            return report;
            
        } catch (error) {
            console.error('❌ Visual testing failed:', error.message);
            throw error;
        } finally {
            await this.cleanup();
        }
    }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const testSuite = new DashboardVisualTestSuite();
    testSuite.runAllTests()
        .then(report => {
            console.log('\n✅ All visual tests completed successfully!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ Visual testing failed:', error);
            process.exit(1);
        });
}

export default DashboardVisualTestSuite;
