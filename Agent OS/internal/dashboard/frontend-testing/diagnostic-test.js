#!/usr/bin/env node

/**
 * Diagnostic Test for Agent OS Dashboard
 * Checks what elements are actually present in the dashboard
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function diagnosticTest() {
    console.log('🔍 Starting Diagnostic Test...\n');
    
    let browser = null;
    
    try {
        // Initialize browser
        console.log('🚀 Initializing browser...');
        browser = await puppeteer.launch({
            headless: false,
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
        const screenshotDir = path.join(process.cwd(), 'diagnostic-screenshots');
        if (!fs.existsSync(screenshotDir)) {
            fs.mkdirSync(screenshotDir, { recursive: true });
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `diagnostic-${timestamp}.png`;
        const filepath = path.join(screenshotDir, filename);
        
        await page.screenshot({
            path: filepath,
            fullPage: true
        });
        
        console.log(`📸 Screenshot saved: ${filename}`);
        
        // Get page title
        const title = await page.$eval('h1', el => el.textContent);
        console.log(`📋 Page title: "${title}"`);
        
        // Count navigation tabs
        const navTabs = await page.$$('.nav-tab');
        console.log(`🔗 Navigation tabs: ${navTabs.length}`);
        
        // Check for all possible chart selectors
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
        
        console.log('\n🔍 Checking for chart elements:');
        for (const selector of chartSelectors) {
            const elements = await page.$$(selector);
            console.log(`   ${selector}: ${elements.length} elements`);
        }
        
        // Check for collapsible sections
        const collapsibleSelectors = [
            '.collapsible',
            '.collapse-section',
            '[data-toggle="collapse"]',
            '.accordion',
            '.expandable'
        ];
        
        console.log('\n🔍 Checking for collapsible sections:');
        for (const selector of collapsibleSelectors) {
            const elements = await page.$$(selector);
            console.log(`   ${selector}: ${elements.length} elements`);
        }
        
        // Check for interactive elements
        const interactiveSelectors = [
            '#searchInput',
            '.search-input',
            '.filter-btn',
            '.filter-button',
            '.sort-btn',
            '.sort-button',
            '.refresh-btn',
            '.refresh-button'
        ];
        
        console.log('\n🔍 Checking for interactive elements:');
        for (const selector of interactiveSelectors) {
            const elements = await page.$$(selector);
            console.log(`   ${selector}: ${elements.length} elements`);
        }
        
        // Check for data elements
        const dataSelectors = [
            '.compliance-card',
            '.lesson-card',
            '.metric-card',
            '.violation-item',
            '.lesson-category',
            '.quality-score',
            '.overall-score',
            '.performance-indicator'
        ];
        
        console.log('\n🔍 Checking for data elements:');
        for (const selector of dataSelectors) {
            const elements = await page.$$(selector);
            console.log(`   ${selector}: ${elements.length} elements`);
        }
        
        // Get page HTML structure
        const pageStructure = await page.evaluate(() => {
            const structure = {
                title: document.title,
                h1: document.querySelector('h1')?.textContent,
                navTabs: document.querySelectorAll('.nav-tab').length,
                mainContent: document.querySelector('main')?.innerHTML?.substring(0, 200) + '...',
                scripts: Array.from(document.querySelectorAll('script')).map(s => s.src || 'inline'),
                styles: Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(l => l.href)
            };
            return structure;
        });
        
        console.log('\n📄 Page Structure:');
        console.log(`   Title: ${pageStructure.title}`);
        console.log(`   H1: ${pageStructure.h1}`);
        console.log(`   Nav tabs: ${pageStructure.navTabs}`);
        console.log(`   Scripts: ${pageStructure.scripts.length}`);
        console.log(`   Stylesheets: ${pageStructure.styles.length}`);
        
        // Test tab navigation
        console.log('\n🔍 Testing tab navigation:');
        const tabs = ['compliance', 'lessons', 'metrics', 'analytics'];
        
        for (const tab of tabs) {
            try {
                console.log(`   Testing ${tab} tab...`);
                await page.click(`.nav-tab[data-tab="${tab}"]`);
                await page.evaluate(() => new Promise(r => setTimeout(r, 500)));
                
                // Check what content is visible
                const visibleContent = await page.evaluate(() => {
                    const visibleElements = [];
                    document.querySelectorAll('*').forEach(el => {
                        const style = window.getComputedStyle(el);
                        if (style.display !== 'none' && style.visibility !== 'hidden' && el.offsetWidth > 0) {
                            visibleElements.push({
                                tag: el.tagName,
                                class: el.className,
                                id: el.id,
                                text: el.textContent?.substring(0, 50)
                            });
                        }
                    });
                    return visibleElements.slice(0, 10); // First 10 visible elements
                });
                
                console.log(`   ✅ ${tab} tab - ${visibleContent.length} visible elements`);
                
            } catch (error) {
                console.log(`   ❌ ${tab} tab failed: ${error.message}`);
            }
        }
        
        console.log('\n🎉 Diagnostic test completed!');
        console.log(`📸 Screenshot saved to: ${screenshotDir}`);
        
        return {
            success: true,
            screenshot: filepath,
            title: title,
            navTabs: navTabs.length
        };
        
    } catch (error) {
        console.error('❌ Diagnostic test failed:', error.message);
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

// Run the diagnostic test
diagnosticTest()
    .then(result => {
        if (result.success) {
            console.log('\n✅ Diagnostic test completed successfully!');
            process.exit(0);
        } else {
            console.log('\n❌ Diagnostic test failed!');
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('\n❌ Diagnostic test error:', error);
        process.exit(1);
    });
