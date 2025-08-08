#!/usr/bin/env node

/**
 * Simple Screenshot Test for Agent OS Dashboard
 * Demonstrates basic screenshot capture functionality
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function simpleScreenshotTest() {
    console.log('🤖 Starting Simple Screenshot Test...\n');
    
    let browser = null;
    
    try {
        // Initialize browser
        console.log('🚀 Initializing browser...');
        browser = await puppeteer.launch({
            headless: true,
            defaultViewport: { width: 1920, height: 1080 }
        });
        
        const page = await browser.newPage();
        console.log('✅ Browser initialized');
        
        // Navigate to dashboard
        console.log('🌐 Navigating to dashboard...');
        await page.goto('http://localhost:3002', { waitUntil: 'networkidle2' });
        
        // Wait for dashboard to load
        await page.waitForSelector('.header', { timeout: 10000 });
        console.log('✅ Dashboard loaded successfully');
        
        // Take screenshot
        const screenshotDir = path.join(process.cwd(), 'simple-screenshots');
        if (!fs.existsSync(screenshotDir)) {
            fs.mkdirSync(screenshotDir, { recursive: true });
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `dashboard-screenshot-${timestamp}.png`;
        const filepath = path.join(screenshotDir, filename);
        
        await page.screenshot({
            path: filepath,
            fullPage: true
        });
        
        console.log(`📸 Screenshot saved: ${filename}`);
        console.log(`📁 Location: ${filepath}`);
        
        // Get page title
        const title = await page.$eval('h1', el => el.textContent);
        console.log(`📋 Page title: "${title}"`);
        
        // Count navigation tabs
        const navTabs = await page.$$('.nav-tab');
        console.log(`🔗 Navigation tabs: ${navTabs.length}`);
        
        console.log('\n🎉 Simple screenshot test completed successfully!');
        console.log(`📸 Screenshot saved to: ${screenshotDir}`);
        
        return {
            success: true,
            screenshot: filepath,
            title: title,
            navTabs: navTabs.length
        };
        
    } catch (error) {
        console.error('❌ Simple screenshot test failed:', error.message);
        return {
            success: false,
            error: error.message
        };
    } finally {
        if (browser) {
            await browser.close();
            console.log('🧹 Browser closed');
        }
    }
}

// Run the test
simpleScreenshotTest()
    .then(result => {
        if (result.success) {
            console.log('\n✅ Test completed successfully!');
            process.exit(0);
        } else {
            console.log('\n❌ Test failed!');
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('\n❌ Test error:', error);
        process.exit(1);
    });
