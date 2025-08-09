#!/usr/bin/env node

/**
 * Chart Test Suite for Agent OS Dashboard
 * Specifically tests chart rendering and functionality
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class ChartTestSuite {
    constructor() {
        this.browser = null;
        this.page = null;
        this.screenshotDir = path.join(process.cwd(), 'chart-test-screenshots');
        this.testResults = [];
        this.baseUrl = 'http://localhost:3002';
        
        // Ensure screenshot directory exists
        if (!fs.existsSync(this.screenshotDir)) {
            fs.mkdirSync(this.screenshotDir, { recursive: true });
        }
    }

    async initialize() {
        console.log('🚀 Initializing Chart Test Suite...');
        
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

    async testAnalyticsTabCharts() {
        console.log('\n🔍 Testing Analytics Tab Charts...');
        
        try {
            // Navigate to analytics tab
            await this.page.click('button[onclick="showTab(\'analytics\')"]');
            await this.page.waitForTimeout(1000); // Wait for charts to load
            
            // Test for all possible chart selectors
            const chartSelectors = [
                '.category-distribution-chart',
                '#categoryChart',
                '.performance-over-time-chart',
                '#performanceChart',
                '.compliance-trend-chart',
                '#complianceChart',
                '.lessons-quality-chart',
                '#qualityChart',
                'canvas',
                'svg',
                '.chart',
                '.chart-container',
                '.chart-wrapper'
            ];
            
            let foundCharts = [];
            
            for (const selector of chartSelectors) {
                const elements = await this.page.$$(selector);
                if (elements.length > 0) {
                    foundCharts.push({
                        selector: selector,
                        count: elements.length,
                        elements: elements
                    });
                    console.log(`   ✅ Found ${elements.length} elements with selector: ${selector}`);
                }
            }
            
            // Test specific chart functionality
            const categoryChart = await this.page.$('.category-distribution-chart, #categoryChart');
            const performanceChart = await this.page.$('.performance-over-time-chart, #performanceChart');
            
            console.log(`   Category Distribution Chart: ${categoryChart ? 'Found' : 'Not Found'}`);
            console.log(`   Performance Over Time Chart: ${performanceChart ? 'Found' : 'Not Found'}`);
            
            // Check if charts have content
            let chartsWithContent = 0;
            for (const chartInfo of foundCharts) {
                for (const element of chartInfo.elements) {
                    const hasContent = await element.evaluate(el => {
                        return el.innerHTML.length > 0 || 
                               el.getAttribute('data-chart') || 
                               el.querySelector('canvas, svg') ||
                               el.getAttribute('src') ||
                               el.getAttribute('data-src');
                    });
                    
                    if (hasContent) {
                        chartsWithContent++;
                    }
                }
            }
            
            // Take screenshot
            const screenshot = await this.takeScreenshot('analytics-charts', 'Analytics tab charts');
            
            this.testResults.push({
                test: 'Analytics Tab Charts',
                status: foundCharts.length > 0 ? 'PASS' : 'FAIL',
                details: {
                    totalChartSelectors: chartSelectors.length,
                    foundChartTypes: foundCharts.length,
                    chartsWithContent: chartsWithContent,
                    hasCategoryChart: !!categoryChart,
                    hasPerformanceChart: !!performanceChart,
                    screenshot: screenshot
                }
            });
            
        } catch (error) {
            console.error(`❌ Analytics tab charts test failed: ${error.message}`);
            this.testResults.push({
                test: 'Analytics Tab Charts',
                status: 'FAIL',
                error: error.message
            });
        }
    }

    async testChartRenderingWithData() {
        console.log('\n🔍 Testing Chart Rendering with Data...');
        
        try {
            // Navigate to analytics tab
            await this.page.click('button[onclick="showTab(\'analytics\')"]');
            await this.page.waitForTimeout(2000); // Wait longer for charts to load
            
            // Check for chart data
            const chartDataElements = await this.page.$$('[data-chart], [data-chart-data], .chart-data');
            console.log(`   ✅ Found ${chartDataElements.length} chart data elements`);
            
            // Check for canvas elements
            const canvasElements = await this.page.$$('canvas');
            console.log(`   ✅ Found ${canvasElements.length} canvas elements`);
            
            // Check for SVG elements
            const svgElements = await this.page.$$('svg');
            console.log(`   ✅ Found ${svgElements.length} SVG elements`);
            
            // Check for chart libraries
            const chartLibraries = await this.page.evaluate(() => {
                const libraries = [];
                if (window.Chart) libraries.push('Chart.js');
                if (window.D3) libraries.push('D3.js');
                if (window.Highcharts) libraries.push('Highcharts');
                if (window.ECharts) libraries.push('ECharts');
                return libraries;
            });
            
            console.log(`   ✅ Chart libraries detected: ${chartLibraries.join(', ') || 'None'}`);
            
            // Test chart interaction
            let interactiveCharts = 0;
            for (const canvas of canvasElements) {
                try {
                    await canvas.click();
                    await this.page.waitForTimeout(100);
                    interactiveCharts++;
                } catch (error) {
                    // Chart might not be interactive, that's okay
                }
            }
            
            // Take screenshot
            const screenshot = await this.takeScreenshot('chart-rendering-data', 'Chart rendering with data');
            
            this.testResults.push({
                test: 'Chart Rendering with Data',
                status: (canvasElements.length > 0 || svgElements.length > 0) ? 'PASS' : 'FAIL',
                details: {
                    chartDataElements: chartDataElements.length,
                    canvasElements: canvasElements.length,
                    svgElements: svgElements.length,
                    chartLibraries: chartLibraries,
                    interactiveCharts: interactiveCharts,
                    screenshot: screenshot
                }
            });
            
        } catch (error) {
            console.error(`❌ Chart rendering with data test failed: ${error.message}`);
            this.testResults.push({
                test: 'Chart Rendering with Data',
                status: 'FAIL',
                error: error.message
            });
        }
    }

    async testChartDataLoading() {
        console.log('\n🔍 Testing Chart Data Loading...');
        
        try {
            // Navigate to analytics tab
            await this.page.click('button[onclick="showTab(\'analytics\')"]');
            await this.page.waitForTimeout(1000);
            
            // Check for data loading indicators
            const loadingIndicators = await this.page.$$('.loading, .spinner, .chart-loading');
            console.log(`   ✅ Found ${loadingIndicators.length} loading indicators`);
            
            // Wait for potential data loading
            console.log('   Waiting 5 seconds for chart data to load...');
            await this.page.waitForTimeout(5000);
            
            // Check for error messages
            const errorMessages = await this.page.$$('.error, .chart-error, .data-error');
            console.log(`   ✅ Found ${errorMessages.length} error messages`);
            
            // Check for empty state messages
            const emptyStateMessages = await this.page.$$('.empty-state, .no-data, .chart-empty');
            console.log(`   ✅ Found ${emptyStateMessages.length} empty state messages`);
            
            // Check for chart containers with content
            const chartContainers = await this.page.$$('.chart-container, .chart-wrapper');
            let containersWithContent = 0;
            
            for (const container of chartContainers) {
                const hasContent = await container.evaluate(el => {
                    return el.innerHTML.length > 0 && 
                           !el.innerHTML.includes('Loading') && 
                           !el.innerHTML.includes('No data');
                });
                
                if (hasContent) {
                    containersWithContent++;
                }
            }
            
            console.log(`   ✅ Chart containers with content: ${containersWithContent}/${chartContainers.length}`);
            
            // Take screenshot
            const screenshot = await this.takeScreenshot('chart-data-loading', 'Chart data loading test');
            
            this.testResults.push({
                test: 'Chart Data Loading',
                status: containersWithContent > 0 ? 'PASS' : 'FAIL',
                details: {
                    loadingIndicators: loadingIndicators.length,
                    errorMessages: errorMessages.length,
                    emptyStateMessages: emptyStateMessages.length,
                    chartContainers: chartContainers.length,
                    containersWithContent: containersWithContent,
                    screenshot: screenshot
                }
            });
            
        } catch (error) {
            console.error(`❌ Chart data loading test failed: ${error.message}`);
            this.testResults.push({
                test: 'Chart Data Loading',
                status: 'FAIL',
                error: error.message
            });
        }
    }

    async testChartInteractivity() {
        console.log('\n🔍 Testing Chart Interactivity...');
        
        try {
            // Navigate to analytics tab
            await this.page.click('button[onclick="showTab(\'analytics\')"]');
            await this.page.waitForTimeout(1000);
            
            // Test chart hover effects
            const chartElements = await this.page.$$('canvas, svg, .chart');
            let hoverableCharts = 0;
            
            for (const chart of chartElements) {
                try {
                    // Try to trigger hover event
                    await chart.hover();
                    await this.page.waitForTimeout(200);
                    hoverableCharts++;
                } catch (error) {
                    // Chart might not support hover
                }
            }
            
            // Test chart click events
            let clickableCharts = 0;
            for (const chart of chartElements) {
                try {
                    await chart.click();
                    await this.page.waitForTimeout(200);
                    clickableCharts++;
                } catch (error) {
                    // Chart might not support clicks
                }
            }
            
            // Test chart zoom/pan (if available)
            const zoomableCharts = await this.page.$$('.zoomable, .pannable, [data-zoom]');
            console.log(`   ✅ Found ${zoomableCharts.length} potentially zoomable charts`);
            
            // Take screenshot
            const screenshot = await this.takeScreenshot('chart-interactivity', 'Chart interactivity test');
            
            this.testResults.push({
                test: 'Chart Interactivity',
                status: (hoverableCharts > 0 || clickableCharts > 0) ? 'PASS' : 'FAIL',
                details: {
                    totalCharts: chartElements.length,
                    hoverableCharts: hoverableCharts,
                    clickableCharts: clickableCharts,
                    zoomableCharts: zoomableCharts.length,
                    screenshot: screenshot
                }
            });
            
        } catch (error) {
            console.error(`❌ Chart interactivity test failed: ${error.message}`);
            this.testResults.push({
                test: 'Chart Interactivity',
                status: 'FAIL',
                error: error.message
            });
        }
    }

    async testChartResponsiveness() {
        console.log('\n🔍 Testing Chart Responsiveness...');
        
        const viewports = [
            { name: 'desktop', width: 1920, height: 1080 },
            { name: 'tablet', width: 768, height: 1024 },
            { name: 'mobile', width: 375, height: 667 }
        ];
        
        for (const viewport of viewports) {
            try {
                console.log(`   Testing charts on ${viewport.name} viewport...`);
                
                // Set viewport
                await this.page.setViewport({
                    width: viewport.width,
                    height: viewport.height
                });
                
                // Navigate to analytics tab
                await this.page.click('button[onclick="showTab(\'analytics\')"]');
                await this.page.waitForTimeout(1000);
                
                // Check if charts are visible
                const visibleCharts = await this.page.$$('canvas, svg, .chart');
                const chartVisible = visibleCharts.length > 0;
                
                // Check if charts are properly sized
                let properlySizedCharts = 0;
                for (const chart of visibleCharts) {
                    const size = await chart.boundingBox();
                    if (size && size.width > 0 && size.height > 0) {
                        properlySizedCharts++;
                    }
                }
                
                // Take screenshot
                const screenshot = await this.takeScreenshot(
                    `chart-responsive-${viewport.name}`,
                    `Chart responsiveness on ${viewport.name} viewport`
                );
                
                this.testResults.push({
                    test: `Chart Responsiveness - ${viewport.name}`,
                    status: chartVisible ? 'PASS' : 'FAIL',
                    details: {
                        viewport: viewport,
                        visibleCharts: visibleCharts.length,
                        properlySizedCharts: properlySizedCharts,
                        screenshot: screenshot
                    }
                });
                
                console.log(`   ✅ ${viewport.name} viewport test completed`);
                
            } catch (error) {
                console.error(`   ❌ ${viewport.name} viewport test failed: ${error.message}`);
                this.testResults.push({
                    test: `Chart Responsiveness - ${viewport.name}`,
                    status: 'FAIL',
                    error: error.message
                });
            }
        }
    }

    generateReport() {
        console.log('\n📊 Generating Chart Test Report...');
        
        const report = {
            timestamp: new Date().toISOString(),
            totalTests: this.testResults.length,
            passedTests: this.testResults.filter(r => r.status === 'PASS').length,
            failedTests: this.testResults.filter(r => r.status === 'FAIL').length,
            results: this.testResults
        };
        
        // Save report to file
        const reportPath = path.join(this.screenshotDir, 'chart-test-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        // Print summary
        console.log('\n🎯 Chart Test Summary:');
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
        console.log('🤖 Starting Chart Test Suite...\n');
        
        try {
            await this.initialize();
            
            // Navigate to dashboard first
            await this.page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
            await this.page.waitForSelector('.header', { timeout: 10000 });
            
            // Run all chart tests
            await this.testAnalyticsTabCharts();
            await this.testChartRenderingWithData();
            await this.testChartDataLoading();
            await this.testChartInteractivity();
            await this.testChartResponsiveness();
            
            // Generate report
            const report = this.generateReport();
            
            console.log('\n🎉 Chart testing completed!');
            console.log(`📸 Screenshots saved to: ${this.screenshotDir}`);
            console.log(`📊 Test report saved to: ${path.join(this.screenshotDir, 'chart-test-report.json')}`);
            
            return report;
            
        } catch (error) {
            console.error('❌ Chart testing failed:', error.message);
            throw error;
        } finally {
            await this.cleanup();
        }
    }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const testSuite = new ChartTestSuite();
    testSuite.runAllTests()
        .then(report => {
            console.log('\n✅ All chart tests completed successfully!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ Chart testing failed:', error);
            process.exit(1);
        });
}

export default ChartTestSuite;
