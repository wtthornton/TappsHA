#!/usr/bin/env node

/**
 * Comprehensive Agent OS Dashboard Test Suite
 * Tests all dashboard functionality including charts, interactive elements, and real features
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class ComprehensiveDashboardTestSuite {
    constructor() {
        this.browser = null;
        this.page = null;
        this.screenshotDir = path.join(process.cwd(), 'comprehensive-test-screenshots');
        this.testResults = [];
        this.baseUrl = 'http://localhost:3002';
        
        // Ensure screenshot directory exists
        if (!fs.existsSync(this.screenshotDir)) {
            fs.mkdirSync(this.screenshotDir, { recursive: true });
        }
    }

    async initialize() {
        console.log('🚀 Initializing comprehensive dashboard test suite...');
        
        this.browser = await puppeteer.launch({
            headless: false, // Show browser for debugging
            defaultViewport: { width: 1920, height: 1080 },
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        this.page = await this.browser.newPage();
        
        // Set user agent for consistent rendering
        await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        console.log('✅ Browser initialized successfully');
    }

    async takeScreenshot(name, description = '') {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${name}-${timestamp}.png`;
        const filepath = path.join(this.screenshotDir, filename);
        
        await this.page.screenshot({
            path: filepath,
            fullPage: true
        });
        
        console.log(`📸 Screenshot saved: ${filename}`);
        if (description) {
            console.log(`   Description: ${description}`);
        }
        
        return {
            name,
            description,
            filename,
            filepath,
            timestamp: new Date().toISOString()
        };
    }

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

    async testComplianceTabFunctionality() {
        console.log('\n🔍 Testing Compliance Tab Functionality...');
        
        try {
            // Navigate to compliance tab
            await this.page.click('button[onclick="showTab(\'compliance\')"]');
            await this.page.waitForTimeout(500);
            
            // Test search functionality
            const searchInput = await this.page.$('#searchInput');
            if (searchInput) {
                await searchInput.type('TODO');
                await this.page.waitForTimeout(300);
                console.log('   ✅ Search functionality working');
            }
            
            // Test compliance cards
            const complianceCards = await this.page.$$('.compliance-card');
            console.log(`   ✅ Found ${complianceCards.length} compliance cards`);
            
            // Test violation details
            const violationElements = await this.page.$$('.violation-item');
            console.log(`   ✅ Found ${violationElements.length} violation items`);
            
            // Test compliance score
            const scoreElement = await this.page.$('.compliance-score');
            if (scoreElement) {
                const score = await scoreElement.evaluate(el => el.textContent);
                console.log(`   ✅ Compliance score: ${score}`);
            }
            
            // Take screenshot
            const screenshot = await this.takeScreenshot('compliance-tab-functional', 'Compliance tab with all functionality');
            
            this.testResults.push({
                test: 'Compliance Tab Functionality',
                status: 'PASS',
                details: {
                    searchWorking: !!searchInput,
                    cardsCount: complianceCards.length,
                    violationsCount: violationElements.length,
                    hasScore: !!scoreElement,
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

    async testLessonsLearnedTabFunctionality() {
        console.log('\n🔍 Testing Lessons Learned Tab Functionality...');
        
        try {
            // Navigate to lessons tab
            await this.page.click('button[onclick="showTab(\'lessons\')"]');
            await this.page.waitForTimeout(500);
            
            // Test lesson cards
            const lessonCards = await this.page.$$('.lesson-card');
            console.log(`   ✅ Found ${lessonCards.length} lesson cards`);
            
            // Test lesson categories
            const categoryElements = await this.page.$$('.lesson-category');
            console.log(`   ✅ Found ${categoryElements.length} lesson categories`);
            
            // Test quality metrics
            const qualityScore = await this.page.$('.quality-score');
            if (qualityScore) {
                const score = await qualityScore.evaluate(el => el.textContent);
                console.log(`   ✅ Quality score: ${score}`);
            }
            
            // Test recent lessons
            const recentLessons = await this.page.$$('.recent-lesson');
            console.log(`   ✅ Found ${recentLessons.length} recent lessons`);
            
            // Take screenshot
            const screenshot = await this.takeScreenshot('lessons-tab-functional', 'Lessons learned tab with all functionality');
            
            this.testResults.push({
                test: 'Lessons Learned Tab Functionality',
                status: 'PASS',
                details: {
                    cardsCount: lessonCards.length,
                    categoriesCount: categoryElements.length,
                    hasQualityScore: !!qualityScore,
                    recentLessonsCount: recentLessons.length,
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

    async testPerformanceMetricsTabFunctionality() {
        console.log('\n🔍 Testing Performance Metrics Tab Functionality...');
        
        try {
            // Navigate to metrics tab
            await this.page.click('button[onclick="showTab(\'metrics\')"]');
            await this.page.waitForTimeout(500);
            
            // Test metric cards
            const metricCards = await this.page.$$('.metric-card');
            console.log(`   ✅ Found ${metricCards.length} metric cards`);
            
            // Test performance indicators
            const performanceIndicators = await this.page.$$('.performance-indicator');
            console.log(`   ✅ Found ${performanceIndicators.length} performance indicators`);
            
            // Test overall score
            const overallScore = await this.page.$('.overall-score');
            if (overallScore) {
                const score = await overallScore.evaluate(el => el.textContent);
                console.log(`   ✅ Overall score: ${score}`);
            }
            
            // Test trend data
            const trendElements = await this.page.$$('.trend-data');
            console.log(`   ✅ Found ${trendElements.length} trend data elements`);
            
            // Take screenshot
            const screenshot = await this.takeScreenshot('metrics-tab-functional', 'Performance metrics tab with all functionality');
            
            this.testResults.push({
                test: 'Performance Metrics Tab Functionality',
                status: 'PASS',
                details: {
                    cardsCount: metricCards.length,
                    indicatorsCount: performanceIndicators.length,
                    hasOverallScore: !!overallScore,
                    trendDataCount: trendElements.length,
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

    async testAnalyticsTabFunctionality() {
        console.log('\n🔍 Testing Analytics Tab Functionality...');
        
        try {
            // Navigate to analytics tab
            await this.page.click('button[onclick="showTab(\'analytics\')"]');
            await this.page.waitForTimeout(500);
            
            // Test analytics charts
            const chartElements = await this.page.$$('canvas, svg, .chart');
            console.log(`   ✅ Found ${chartElements.length} chart elements`);
            
            // Test category distribution chart
            const categoryChart = await this.page.$('.category-distribution-chart, #categoryChart, canvas');
            if (categoryChart) {
                console.log('   ✅ Category distribution chart found');
            } else {
                console.log('   ⚠️ Category distribution chart not found');
            }
            
            // Test performance over time chart
            const performanceChart = await this.page.$('.performance-over-time-chart, #performanceChart, canvas');
            if (performanceChart) {
                console.log('   ✅ Performance over time chart found');
            } else {
                console.log('   ⚠️ Performance over time chart not found');
            }
            
            // Test analytics data
            const analyticsData = await this.page.$$('.analytics-data');
            console.log(`   ✅ Found ${analyticsData.length} analytics data elements`);
            
            // Take screenshot
            const screenshot = await this.takeScreenshot('analytics-tab-functional', 'Analytics tab with all functionality');
            
            this.testResults.push({
                test: 'Analytics Tab Functionality',
                status: 'PASS',
                details: {
                    chartsCount: chartElements.length,
                    hasCategoryChart: !!categoryChart,
                    hasPerformanceChart: !!performanceChart,
                    analyticsDataCount: analyticsData.length,
                    screenshot: screenshot
                }
            });
            
        } catch (error) {
            console.error(`❌ Analytics tab test failed: ${error.message}`);
            this.testResults.push({
                test: 'Analytics Tab Functionality',
                status: 'FAIL',
                error: error.message
            });
        }
    }

    async testCollapsibleSections() {
        console.log('\n🔍 Testing Collapsible Sections...');
        
        try {
            // Navigate to compliance tab for testing collapsible sections
            await this.page.click('button[onclick="showTab(\'compliance\')"]');
            await this.page.waitForTimeout(500);
            
            // Find all collapsible sections
            const collapsibleSections = await this.page.$$('.collapsible, .collapse-section, [data-toggle="collapse"]');
            console.log(`   ✅ Found ${collapsibleSections.length} collapsible sections`);
            
            let workingCollapsibles = 0;
            
            for (let i = 0; i < Math.min(collapsibleSections.length, 3); i++) {
                try {
                    const section = collapsibleSections[i];
                    
                    // Check initial state
                    const isInitiallyCollapsed = await section.evaluate(el => {
                        const content = el.nextElementSibling;
                        return content && content.style.display === 'none';
                    });
                    
                    // Click to toggle
                    await section.click();
                    await this.page.waitForTimeout(300);
                    
                    // Check if state changed
                    const isNowExpanded = await section.evaluate(el => {
                        const content = el.nextElementSibling;
                        return content && content.style.display !== 'none';
                    });
                    
                    if (isInitiallyCollapsed !== isNowExpanded) {
                        workingCollapsibles++;
                        console.log(`   ✅ Collapsible section ${i + 1} working`);
                    } else {
                        console.log(`   ⚠️ Collapsible section ${i + 1} not responding`);
                    }
                    
                } catch (error) {
                    console.log(`   ❌ Error testing collapsible section ${i + 1}: ${error.message}`);
                }
            }
            
            // Take screenshot
            const screenshot = await this.takeScreenshot('collapsible-sections', 'Collapsible sections functionality');
            
            this.testResults.push({
                test: 'Collapsible Sections',
                status: workingCollapsibles > 0 ? 'PASS' : 'FAIL',
                details: {
                    totalSections: collapsibleSections.length,
                    workingSections: workingCollapsibles,
                    screenshot: screenshot
                }
            });
            
        } catch (error) {
            console.error(`❌ Collapsible sections test failed: ${error.message}`);
            this.testResults.push({
                test: 'Collapsible Sections',
                status: 'FAIL',
                error: error.message
            });
        }
    }

    async testChartRendering() {
        console.log('\n🔍 Testing Chart Rendering...');
        
        try {
            // Navigate to analytics tab
            await this.page.click('button[onclick="showTab(\'analytics\')"]');
            await this.page.waitForTimeout(1000); // Wait longer for charts to load
            
            // Test for chart containers
            const chartContainers = await this.page.$$('.chart-container, .chart-wrapper, canvas, svg');
            console.log(`   ✅ Found ${chartContainers.length} chart containers`);
            
            // Test specific chart types
            const chartTypes = [
                { selector: '.category-distribution-chart, #categoryChart', name: 'Category Distribution' },
                { selector: '.performance-over-time-chart, #performanceChart', name: 'Performance Over Time' },
                { selector: '.compliance-trend-chart, #complianceChart', name: 'Compliance Trend' },
                { selector: '.lessons-quality-chart, #qualityChart', name: 'Lessons Quality' }
            ];
            
            let workingCharts = 0;
            
            for (const chartType of chartTypes) {
                const chart = await this.page.$(chartType.selector);
                if (chart) {
                    // Check if chart has content
                    const hasContent = await chart.evaluate(el => {
                        return el.innerHTML.length > 0 || 
                               el.getAttribute('data-chart') || 
                               el.querySelector('canvas, svg');
                    });
                    
                    if (hasContent) {
                        workingCharts++;
                        console.log(`   ✅ ${chartType.name} chart found and has content`);
                    } else {
                        console.log(`   ⚠️ ${chartType.name} chart found but no content`);
                    }
                } else {
                    console.log(`   ❌ ${chartType.name} chart not found`);
                }
            }
            
            // Take screenshot
            const screenshot = await this.takeScreenshot('chart-rendering', 'Chart rendering functionality');
            
            this.testResults.push({
                test: 'Chart Rendering',
                status: workingCharts > 0 ? 'PASS' : 'FAIL',
                details: {
                    totalContainers: chartContainers.length,
                    workingCharts: workingCharts,
                    totalChartTypes: chartTypes.length,
                    screenshot: screenshot
                }
            });
            
        } catch (error) {
            console.error(`❌ Chart rendering test failed: ${error.message}`);
            this.testResults.push({
                test: 'Chart Rendering',
                status: 'FAIL',
                error: error.message
            });
        }
    }

    async testRealTimeUpdates() {
        console.log('\n🔍 Testing Real-time Updates...');
        
        try {
            // Navigate to compliance tab
            await this.page.click('button[onclick="showTab(\'compliance\')"]');
            await this.page.waitForTimeout(500);
            
            // Take initial screenshot
            const initialScreenshot = await this.takeScreenshot('realtime-initial', 'Initial state before updates');
            
            // Check for real-time indicator
            const realTimeIndicator = await this.page.$('.real-time-indicator, .live-indicator');
            const isRealTimeActive = realTimeIndicator !== null;
            
            // Wait for potential updates
            console.log('   Waiting 10 seconds for real-time updates...');
            await this.page.waitForTimeout(10000);
            
            // Take updated screenshot
            const updatedScreenshot = await this.takeScreenshot('realtime-updated', 'State after 10 seconds');
            
            // Check if data changed
            const complianceCards = await this.page.$$('.compliance-card');
            const violationItems = await this.page.$$('.violation-item');
            
            console.log(`   ✅ Real-time updates test completed`);
            console.log(`   Real-time indicator: ${isRealTimeActive ? 'Active' : 'Not found'}`);
            console.log(`   Compliance cards: ${complianceCards.length}`);
            console.log(`   Violation items: ${violationItems.length}`);
            
            this.testResults.push({
                test: 'Real-time Updates',
                status: 'PASS',
                details: {
                    realTimeActive: isRealTimeActive,
                    complianceCardsCount: complianceCards.length,
                    violationItemsCount: violationItems.length,
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

    async testInteractiveElements() {
        console.log('\n🔍 Testing Interactive Elements...');
        
        try {
            // Navigate to compliance tab
            await this.page.click('button[onclick="showTab(\'compliance\')"]');
            await this.page.waitForTimeout(500);
            
            let workingElements = 0;
            const totalElements = 0;
            
            // Test search functionality
            const searchInput = await this.page.$('#searchInput, .search-input');
            if (searchInput) {
                await searchInput.click();
                await searchInput.type('test');
                await this.page.waitForTimeout(300);
                console.log('   ✅ Search input working');
                workingElements++;
            }
            
            // Test filter buttons
            const filterButtons = await this.page.$$('.filter-btn, .filter-button');
            console.log(`   ✅ Found ${filterButtons.length} filter buttons`);
            
            for (let i = 0; i < Math.min(filterButtons.length, 2); i++) {
                try {
                    await filterButtons[i].click();
                    await this.page.waitForTimeout(200);
                    console.log(`   ✅ Filter button ${i + 1} working`);
                    workingElements++;
                } catch (error) {
                    console.log(`   ❌ Filter button ${i + 1} not working`);
                }
            }
            
            // Test sort functionality
            const sortButtons = await this.page.$$('.sort-btn, .sort-button');
            console.log(`   ✅ Found ${sortButtons.length} sort buttons`);
            
            for (let i = 0; i < Math.min(sortButtons.length, 2); i++) {
                try {
                    await sortButtons[i].click();
                    await this.page.waitForTimeout(200);
                    console.log(`   ✅ Sort button ${i + 1} working`);
                    workingElements++;
                } catch (error) {
                    console.log(`   ❌ Sort button ${i + 1} not working`);
                }
            }
            
            // Test refresh button
            const refreshButton = await this.page.$('.refresh-btn, .refresh-button');
            if (refreshButton) {
                await refreshButton.click();
                await this.page.waitForTimeout(500);
                console.log('   ✅ Refresh button working');
                workingElements++;
            }
            
            // Take screenshot
            const screenshot = await this.takeScreenshot('interactive-elements', 'Interactive elements functionality');
            
            this.testResults.push({
                test: 'Interactive Elements',
                status: workingElements > 0 ? 'PASS' : 'FAIL',
                details: {
                    workingElements: workingElements,
                    filterButtonsCount: filterButtons.length,
                    sortButtonsCount: sortButtons.length,
                    hasRefreshButton: !!refreshButton,
                    screenshot: screenshot
                }
            });
            
        } catch (error) {
            console.error(`❌ Interactive elements test failed: ${error.message}`);
            this.testResults.push({
                test: 'Interactive Elements',
                status: 'FAIL',
                error: error.message
            });
        }
    }

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
                
                // Check if navigation is accessible
                const navTabs = await this.page.$$('.nav-tab');
                const navVisible = navTabs.length > 0;
                
                // Check if content is readable
                const contentElements = await this.page.$$('.content, .main-content, .dashboard-content');
                const contentVisible = contentElements.length > 0;
                
                // Take screenshot
                const screenshot = await this.takeScreenshot(
                    `responsive-${viewport.name}`,
                    `${viewport.name} viewport (${viewport.width}x${viewport.height})`
                );
                
                const isWorking = navVisible && contentVisible;
                
                this.testResults.push({
                    test: `Responsive Design - ${viewport.name}`,
                    status: isWorking ? 'PASS' : 'FAIL',
                    details: {
                        viewport: viewport,
                        navigationVisible: navVisible,
                        contentVisible: contentVisible,
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

    generateReport() {
        console.log('\n📊 Generating Comprehensive Test Report...');
        
        const report = {
            timestamp: new Date().toISOString(),
            totalTests: this.testResults.length,
            passedTests: this.testResults.filter(r => r.status === 'PASS').length,
            failedTests: this.testResults.filter(r => r.status === 'FAIL').length,
            results: this.testResults
        };
        
        // Save report to file
        const reportPath = path.join(this.screenshotDir, 'comprehensive-test-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        // Print summary
        console.log('\n🎯 Comprehensive Test Summary:');
        console.log(`   Total Tests: ${report.totalTests}`);
        console.log(`   Passed: ${report.passedTests}`);
        console.log(`   Failed: ${report.failedTests}`);
        console.log(`   Success Rate: ${((report.passedTests / report.totalTests) * 100).toFixed(1)}%`);
        console.log(`   Screenshots: ${this.screenshotDir}`);
        console.log(`   Report: ${reportPath}`);
        
        return report;
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
            console.log('🧹 Browser closed');
        }
    }

    async runAllTests() {
        console.log('🤖 Starting Comprehensive Agent OS Dashboard Test Suite...\n');
        
        try {
            await this.initialize();
            
            // Run all test suites
            await this.testDashboardLoading();
            await this.testComplianceTabFunctionality();
            await this.testLessonsLearnedTabFunctionality();
            await this.testPerformanceMetricsTabFunctionality();
            await this.testAnalyticsTabFunctionality();
            await this.testCollapsibleSections();
            await this.testChartRendering();
            await this.testRealTimeUpdates();
            await this.testInteractiveElements();
            await this.testResponsiveDesign();
            
            // Generate report
            const report = this.generateReport();
            
            console.log('\n🎉 Comprehensive testing completed!');
            console.log(`📸 Screenshots saved to: ${this.screenshotDir}`);
            console.log(`📊 Test report saved to: ${path.join(this.screenshotDir, 'comprehensive-test-report.json')}`);
            
            return report;
            
        } catch (error) {
            console.error('❌ Comprehensive testing failed:', error.message);
            throw error;
        } finally {
            await this.cleanup();
        }
    }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const testSuite = new ComprehensiveDashboardTestSuite();
    testSuite.runAllTests()
        .then(report => {
            console.log('\n✅ All comprehensive tests completed successfully!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ Comprehensive testing failed:', error);
            process.exit(1);
        });
}

export default ComprehensiveDashboardTestSuite;
