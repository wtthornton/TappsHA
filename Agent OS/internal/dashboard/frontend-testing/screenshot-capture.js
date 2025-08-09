#!/usr/bin/env node

/**
 * Screenshot Capture Utility for Agent OS Dashboard
 * Manual screenshot capture for testing and documentation
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class ScreenshotCapture {
    constructor() {
        this.browser = null;
        this.page = null;
        this.screenshotDir = path.join(process.cwd(), 'manual-screenshots');
        this.baseUrl = 'http://localhost:3002';
        
        // Ensure screenshot directory exists
        if (!fs.existsSync(this.screenshotDir)) {
            fs.mkdirSync(this.screenshotDir, { recursive: true });
        }
    }

    async initialize() {
        console.log('🚀 Initializing screenshot capture...');
        
        this.browser = await puppeteer.launch({
            headless: false, // Show browser for manual inspection
            defaultViewport: { width: 1920, height: 1080 }
        });
        
        this.page = await this.browser.newPage();
        console.log('✅ Browser initialized');
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

    async captureDashboardOverview() {
        console.log('\n📸 Capturing Dashboard Overview...');
        
        try {
            await this.page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
            await this.page.waitForSelector('.header', { timeout: 10000 });
            
            const screenshot = await this.takeScreenshot(
                'dashboard-overview',
                'Main dashboard overview with all tabs visible'
            );
            
            console.log('✅ Dashboard overview captured');
            return screenshot;
            
        } catch (error) {
            console.error(`❌ Dashboard overview capture failed: ${error.message}`);
            throw error;
        }
    }

    async captureAllTabs() {
        console.log('\n📸 Capturing All Tabs...');
        
        const tabs = [
            { name: 'compliance', label: 'Compliance' },
            { name: 'lessons', label: 'Lessons Learned' },
            { name: 'metrics', label: 'Performance Metrics' },
            { name: 'analytics', label: 'Analytics' }
        ];
        
        const screenshots = [];
        
        for (const tab of tabs) {
            try {
                console.log(`   Capturing ${tab.label} tab...`);
                
                // Click on tab
                await this.page.click(`button[onclick="showTab('${tab.name}')"]`);
                await this.page.waitForTimeout(500);
                
                // Take screenshot
                const screenshot = await this.takeScreenshot(
                    `tab-${tab.name}`,
                    `${tab.label} tab content and functionality`
                );
                
                screenshots.push(screenshot);
                console.log(`   ✅ ${tab.label} tab captured`);
                
            } catch (error) {
                console.error(`   ❌ ${tab.label} tab capture failed: ${error.message}`);
            }
        }
        
        return screenshots;
    }

    async captureResponsiveDesign() {
        console.log('\n📸 Capturing Responsive Design...');
        
        const viewports = [
            { name: 'desktop', width: 1920, height: 1080, description: 'Desktop view' },
            { name: 'tablet', width: 768, height: 1024, description: 'Tablet view' },
            { name: 'mobile', width: 375, height: 667, description: 'Mobile view' }
        ];
        
        const screenshots = [];
        
        for (const viewport of viewports) {
            try {
                console.log(`   Capturing ${viewport.name} viewport...`);
                
                await this.page.setViewport({
                    width: viewport.width,
                    height: viewport.height
                });
                
                await this.page.waitForTimeout(500);
                
                const screenshot = await this.takeScreenshot(
                    `responsive-${viewport.name}`,
                    `${viewport.description} (${viewport.width}x${viewport.height})`
                );
                
                screenshots.push(screenshot);
                console.log(`   ✅ ${viewport.name} viewport captured`);
                
            } catch (error) {
                console.error(`   ❌ ${viewport.name} viewport capture failed: ${error.message}`);
            }
        }
        
        return screenshots;
    }

    async captureInteractiveElements() {
        console.log('\n📸 Capturing Interactive Elements...');
        
        try {
            // Navigate to compliance tab for interactive elements
            await this.page.click('button[onclick="showTab(\'compliance\')"]');
            await this.page.waitForTimeout(500);
            
            // Test search functionality
            const searchInput = await this.page.$('#searchInput');
            if (searchInput) {
                await searchInput.click();
                await this.page.waitForTimeout(200);
                
                const screenshot = await this.takeScreenshot(
                    'interactive-search',
                    'Search input field focused and ready for input'
                );
                
                console.log('✅ Interactive elements captured');
                return [screenshot];
            }
            
        } catch (error) {
            console.error(`❌ Interactive elements capture failed: ${error.message}`);
        }
        
        return [];
    }

    async captureRealTimeUpdates() {
        console.log('\n📸 Capturing Real-time Updates...');
        
        try {
            // Navigate to compliance tab
            await this.page.click('button[onclick="showTab(\'compliance\')"]');
            await this.page.waitForTimeout(500);
            
            // Take initial screenshot
            const initialScreenshot = await this.takeScreenshot(
                'realtime-initial',
                'Initial state before real-time updates'
            );
            
            // Wait for potential updates
            console.log('   Waiting 5 seconds for real-time updates...');
            await this.page.waitForTimeout(5000);
            
            // Take updated screenshot
            const updatedScreenshot = await this.takeScreenshot(
                'realtime-updated',
                'State after 5 seconds of real-time updates'
            );
            
            console.log('✅ Real-time updates captured');
            return [initialScreenshot, updatedScreenshot];
            
        } catch (error) {
            console.error(`❌ Real-time updates capture failed: ${error.message}`);
            return [];
        }
    }

    async generateScreenshotReport() {
        console.log('\n📊 Generating Screenshot Report...');
        
        const screenshots = fs.readdirSync(this.screenshotDir)
            .filter(file => file.endsWith('.png'))
            .map(file => ({
                filename: file,
                filepath: path.join(this.screenshotDir, file),
                timestamp: fs.statSync(path.join(this.screenshotDir, file)).mtime.toISOString()
            }));
        
        const report = {
            timestamp: new Date().toISOString(),
            totalScreenshots: screenshots.length,
            screenshots: screenshots,
            directory: this.screenshotDir
        };
        
        // Save report
        const reportPath = path.join(this.screenshotDir, 'screenshot-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        console.log(`📊 Screenshot Report:`);
        console.log(`   Total Screenshots: ${screenshots.length}`);
        console.log(`   Directory: ${this.screenshotDir}`);
        console.log(`   Report: ${reportPath}`);
        
        return report;
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
            console.log('🧹 Browser closed');
        }
    }

    async captureAll() {
        console.log('🤖 Starting Screenshot Capture...\n');
        
        try {
            await this.initialize();
            
            const overview = await this.captureDashboardOverview();
            const tabScreenshots = await this.captureAllTabs();
            const responsiveScreenshots = await this.captureResponsiveDesign();
            const interactiveScreenshots = await this.captureInteractiveElements();
            const realtimeScreenshots = await this.captureRealTimeUpdates();
            
            const allScreenshots = [
                overview,
                ...tabScreenshots,
                ...responsiveScreenshots,
                ...interactiveScreenshots,
                ...realtimeScreenshots
            ].filter(Boolean);
            
            const report = await this.generateScreenshotReport();
            
            console.log('\n🎉 Screenshot capture completed!');
            console.log(`📸 Total screenshots: ${allScreenshots.length}`);
            console.log(`📁 Screenshots saved to: ${this.screenshotDir}`);
            
            return {
                screenshots: allScreenshots,
                report: report
            };
            
        } catch (error) {
            console.error('❌ Screenshot capture failed:', error.message);
            throw error;
        } finally {
            await this.cleanup();
        }
    }
}

// Run screenshot capture if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const capture = new ScreenshotCapture();
    capture.captureAll()
        .then(result => {
            console.log('\n✅ Screenshot capture completed successfully!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ Screenshot capture failed:', error);
            process.exit(1);
        });
}

export default ScreenshotCapture;
