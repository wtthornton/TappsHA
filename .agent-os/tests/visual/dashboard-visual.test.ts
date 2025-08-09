import { test, expect } from '@playwright/test';

/**
 * Visual Regression Tests for Agent-OS Dashboard
 * Tests critical UI components and pages for visual consistency
 */

test.describe('Agent-OS Dashboard Visual Regression Tests', () => {
  const baseUrl = 'http://localhost:3011';

  test.beforeEach(async ({ page }) => {
    // Set viewport for consistent testing
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test('@visual Main Dashboard Page - Desktop View', async ({ page }) => {
    await page.goto(`${baseUrl}/app`);
    await page.waitForLoadState('networkidle');
    
    // Wait for dashboard content to load
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Take screenshot of main dashboard
    await expect(page).toHaveScreenshot('dashboard-main-desktop.png', {
      fullPage: true,
      threshold: 0.1
    });
  });

  test('@visual Main Dashboard Page - Mobile View', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${baseUrl}/app`);
    await page.waitForLoadState('networkidle');
    
    // Wait for mobile layout to render
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Take screenshot of mobile dashboard
    await expect(page).toHaveScreenshot('dashboard-main-mobile.png', {
      fullPage: true,
      threshold: 0.1
    });
  });

  test('@visual Doctor UI Page - Desktop View', async ({ page }) => {
    await page.goto(`${baseUrl}/doctor-ui`);
    await page.waitForLoadState('networkidle');
    
    // Wait for doctor UI to load
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Take screenshot of doctor interface
    await expect(page).toHaveScreenshot('doctor-ui-desktop.png', {
      fullPage: true,
      threshold: 0.1
    });
  });

  test('@visual Doctor UI Page - Mobile View', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${baseUrl}/doctor-ui`);
    await page.waitForLoadState('networkidle');
    
    // Wait for mobile doctor UI to load
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Take screenshot of mobile doctor interface
    await expect(page).toHaveScreenshot('doctor-ui-mobile.png', {
      fullPage: true,
      threshold: 0.1
    });
  });

  test('@visual User Guide Page - Desktop View', async ({ page }) => {
    await page.goto(`${baseUrl}/user-guide`);
    await page.waitForLoadState('networkidle');
    
    // Wait for user guide to load
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Take screenshot of user guide
    await expect(page).toHaveScreenshot('user-guide-desktop.png', {
      fullPage: true,
      threshold: 0.1
    });
  });

  test('@visual Debug Page - Desktop View', async ({ page }) => {
    await page.goto(`${baseUrl}/debug`);
    await page.waitForLoadState('networkidle');
    
    // Wait for debug page to load
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Take screenshot of debug interface
    await expect(page).toHaveScreenshot('debug-page-desktop.png', {
      fullPage: true,
      threshold: 0.1
    });
  });

  test('@visual Error Page - 404 Not Found', async ({ page }) => {
    await page.goto(`${baseUrl}/non-existent-page`);
    await page.waitForLoadState('networkidle');
    
    // Wait for error page to load
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Take screenshot of error page
    await expect(page).toHaveScreenshot('error-404-page.png', {
      fullPage: true,
      threshold: 0.1
    });
  });

  test('@visual Dashboard with Dark Theme', async ({ page }) => {
    await page.goto(`${baseUrl}/app`);
    await page.waitForLoadState('networkidle');
    
    // Wait for dashboard to load
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Toggle dark theme if theme toggle exists
    const themeToggle = page.locator('[data-testid="theme-toggle"], .theme-toggle, button:has-text("Dark")');
    if (await themeToggle.count() > 0) {
      await themeToggle.click();
      await page.waitForTimeout(1000); // Wait for theme transition
    }
    
    // Take screenshot with dark theme
    await expect(page).toHaveScreenshot('dashboard-dark-theme.png', {
      fullPage: true,
      threshold: 0.1
    });
  });

  test('@visual Dashboard Loading State', async ({ page }) => {
    // Navigate to dashboard and capture loading state
    await page.goto(`${baseUrl}/app`);
    
    // Take screenshot during loading (before networkidle)
    await expect(page).toHaveScreenshot('dashboard-loading-state.png', {
      fullPage: true,
      threshold: 0.1
    });
  });

  test('@visual Dashboard Responsive Design - Tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(`${baseUrl}/app`);
    await page.waitForLoadState('networkidle');
    
    // Wait for tablet layout to render
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Take screenshot of tablet view
    await expect(page).toHaveScreenshot('dashboard-tablet-view.png', {
      fullPage: true,
      threshold: 0.1
    });
  });

  test('@visual Dashboard Responsive Design - Large Desktop', async ({ page }) => {
    await page.setViewportSize({ width: 2560, height: 1440 });
    await page.goto(`${baseUrl}/app`);
    await page.waitForLoadState('networkidle');
    
    // Wait for large desktop layout to render
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Take screenshot of large desktop view
    await expect(page).toHaveScreenshot('dashboard-large-desktop.png', {
      fullPage: true,
      threshold: 0.1
    });
  });

  test('@visual Dashboard Navigation Elements', async ({ page }) => {
    await page.goto(`${baseUrl}/app`);
    await page.waitForLoadState('networkidle');
    
    // Wait for navigation elements to load
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Look for common navigation elements and take focused screenshots
    const navElements = [
      'nav',
      '.navigation',
      '.sidebar',
      '.menu',
      '.header',
      '.toolbar'
    ];
    
    for (const selector of navElements) {
      const element = page.locator(selector);
      if (await element.count() > 0) {
        await expect(element).toHaveScreenshot(`navigation-${selector.replace(/[^a-zA-Z0-9]/g, '')}.png`, {
          threshold: 0.1
        });
      }
    }
  });

  test('@visual Dashboard Charts and Graphs', async ({ page }) => {
    await page.goto(`${baseUrl}/app`);
    await page.waitForLoadState('networkidle');
    
    // Wait for charts to load
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Look for chart elements and take focused screenshots
    const chartSelectors = [
      'canvas',
      '.chart',
      '.graph',
      '.visualization',
      '[data-testid*="chart"]',
      '[data-testid*="graph"]'
    ];
    
    for (const selector of chartSelectors) {
      const elements = page.locator(selector);
      const count = await elements.count();
      
      for (let i = 0; i < Math.min(count, 3); i++) { // Limit to first 3 charts
        const element = elements.nth(i);
        if (await element.isVisible()) {
          await expect(element).toHaveScreenshot(`chart-${selector.replace(/[^a-zA-Z0-9]/g, '')}-${i}.png`, {
            threshold: 0.1
          });
        }
      }
    }
  });

  test('@visual Dashboard Metrics Cards', async ({ page }) => {
    await page.goto(`${baseUrl}/app`);
    await page.waitForLoadState('networkidle');
    
    // Wait for metrics cards to load
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Look for metrics card elements
    const cardSelectors = [
      '.metric-card',
      '.stats-card',
      '.dashboard-card',
      '[data-testid*="metric"]',
      '[data-testid*="card"]'
    ];
    
    for (const selector of cardSelectors) {
      const elements = page.locator(selector);
      const count = await elements.count();
      
      for (let i = 0; i < Math.min(count, 5); i++) { // Limit to first 5 cards
        const element = elements.nth(i);
        if (await element.isVisible()) {
          await expect(element).toHaveScreenshot(`metric-card-${selector.replace(/[^a-zA-Z0-9]/g, '')}-${i}.png`, {
            threshold: 0.1
          });
        }
      }
    }
  });

  test('@visual Dashboard Interactive Elements', async ({ page }) => {
    await page.goto(`${baseUrl}/app`);
    await page.waitForLoadState('networkidle');
    
    // Wait for interactive elements to load
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Test hover states for buttons and interactive elements
    const interactiveSelectors = [
      'button',
      'a',
      '.btn',
      '.button',
      '[role="button"]'
    ];
    
    for (const selector of interactiveSelectors) {
      const elements = page.locator(selector);
      const count = await elements.count();
      
      for (let i = 0; i < Math.min(count, 3); i++) {
        const element = elements.nth(i);
        if (await element.isVisible()) {
          // Take screenshot before hover
          await expect(element).toHaveScreenshot(`interactive-${selector.replace(/[^a-zA-Z0-9]/g, '')}-${i}-normal.png`, {
            threshold: 0.1
          });
          
          // Hover and take screenshot
          await element.hover();
          await page.waitForTimeout(100);
          await expect(element).toHaveScreenshot(`interactive-${selector.replace(/[^a-zA-Z0-9]/g, '')}-${i}-hover.png`, {
            threshold: 0.1
          });
        }
      }
    }
  });
});
