#!/usr/bin/env node

/**
 * Quick Visual Test for Agent OS Dashboard
 * Fast visual testing with basic screenshot capture
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class QuickVisualTest {
    constructor() {
        this.browser = null;
        this.page = null;
        this.screenshotDir = path.join(process.cwd(), 'quick-test-screenshots');
        this.baseUrl = 'http://localhost:3002';
        
        // Ensure screenshot directory exists
        if (!fs.existsSync(this.screenshotDir)) {
            fs.mkdirSync(this.screenshotDir, { recursive: true });
        }
    }

    async initialize() {
        console.log('🚀 Initializing quick visual test...');
        
        this.browser = await puppeteer.launch({
            headless: true, // Run headless for quick tests
            defaultViewport: { width: 1920, height: 1080 }
        });
        
        this.page = await this.browser.newPage();
        console.log('✅ Browser initialized');
    }

    async takeScreenshot(name) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${name}-${timestamp}.png`;
        const filepath = path.join(this.screenshotDir, filename);
        
        await this.page.screenshot({
            path: filepath,
            fullPage: true
        });
        
        console.log(`📸 Screenshot: ${filename}`);
        return filepath;
    }

    async testDashboardBasics() {
        console.log('\n🔍 Testing Dashboard Basics...');
        
        try {
            // Load dashboard
            await this.page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
            
            // Check for main elements
            const title = await this.page.$eval('h1', el => el.textContent);
            const navTabs = await this.page.$$('.nav-tab');
            
            console.log(`✅ Dashboard loaded: "${title}"`);
            console.log(`   Navigation tabs: ${navTabs.length}`);
            
            // Take screenshot
            await this.takeScreenshot('dashboard-main');
            
            return true;
            
        } catch (error) {
            console.error(`❌ Dashboard test failed: ${error.message}`);
            return false;
        }
    }

    async testAllTabs() {
        console.log('\n🔍 Testing All Tabs...');
        
        const tabs = ['compliance', 'lessons', 'metrics', 'analytics'];
        const results = [];
        
        for (const tab of tabs) {
            try {
                console.log(`   Testing ${tab} tab...`);
                
                // Click tab via data attribute
                await this.page.click(`.nav-tab[data-tab="${tab}"]`);
                await this.page.evaluate(() => new Promise(r => setTimeout(r, 300)));
                
                // Take screenshot
                await this.takeScreenshot(`tab-${tab}`);
                
                results.push({ tab, status: 'PASS' });
                console.log(`   ✅ ${tab} tab working`);
                
            } catch (error) {
                console.error(`   ❌ ${tab} tab failed: ${error.message}`);
                results.push({ tab, status: 'FAIL', error: error.message });
            }
        }
        
        return results;
    }

    async testResponsive() {
        console.log('\n🔍 Testing Responsive Design...');
        
        const viewports = [
            { name: 'desktop', width: 1920, height: 1080 },
            { name: 'mobile', width: 375, height: 667 }
        ];
        
        const results = [];
        
        for (const viewport of viewports) {
            try {
                console.log(`   Testing ${viewport.name} viewport...`);
                
                await this.page.setViewport({
                    width: viewport.width,
                    height: viewport.height
                });
                
                await this.page.waitForTimeout(300);
                await this.takeScreenshot(`responsive-${viewport.name}`);
                
                results.push({ viewport: viewport.name, status: 'PASS' });
                console.log(`   ✅ ${viewport.name} viewport working`);
                
            } catch (error) {
                console.error(`   ❌ ${viewport.name} viewport failed: ${error.message}`);
                results.push({ viewport: viewport.name, status: 'FAIL', error: error.message });
            }
        }
        
        return results;
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
            console.log('🧹 Browser closed');
        }
    }

    async runQuickTest() {
        console.log('🤖 Starting Quick Visual Test...\n');
        
        try {
            await this.initialize();
            
            const dashboardResult = await this.testDashboardBasics();
            const tabResults = await this.testAllTabs();
            const responsiveResults = await this.testResponsive();
            
            // Generate summary
            const totalTests = 1 + tabResults.length + responsiveResults.length;
            const passedTests = (dashboardResult ? 1 : 0) + 
                              tabResults.filter(r => r.status === 'PASS').length +
                              responsiveResults.filter(r => r.status === 'PASS').length;
            
            console.log('\n🎯 Quick Test Summary:');
            console.log(`   Total Tests: ${totalTests}`);
            console.log(`   Passed: ${passedTests}`);
            console.log(`   Failed: ${totalTests - passedTests}`);
            console.log(`   Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
            console.log(`   Screenshots: ${this.screenshotDir}`);
            
            return {
                dashboard: dashboardResult,
                tabs: tabResults,
                responsive: responsiveResults,
                summary: {
                    total: totalTests,
                    passed: passedTests,
                    failed: totalTests - passedTests,
                    successRate: ((passedTests / totalTests) * 100).toFixed(1)
                }
            };
            
        } catch (error) {
            console.error('❌ Quick test failed:', error.message);
            throw error;
        } finally {
            await this.cleanup();
        }
    }
}

// Run quick test if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const quickTest = new QuickVisualTest();
    quickTest.runQuickTest()
        .then(result => {
            console.log('\n✅ Quick visual test completed!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ Quick visual test failed:', error);
            process.exit(1);
        });
}

export default QuickVisualTest;
