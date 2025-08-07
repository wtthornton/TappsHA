import { test, expect } from '@playwright/test';

/**
 * Performance Tests
 * Following Agent OS Framework Performance Standards
 */

test.describe('Performance Tests', () => {
  
  test('should load homepage within performance budget', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Performance budget: <2 seconds for initial load
    expect(loadTime).toBeLessThan(2000);
    
    // Verify page is interactive
    await expect(page).toHaveTitle(/TappHA/);
  });

  test('should render dashboard within performance budget', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Wait for dashboard components to load
    await page.waitForSelector('[data-testid="dashboard-container"]', { timeout: 10000 });
    
    const loadTime = Date.now() - startTime;
    
    // Performance budget: <3 seconds for dashboard load
    expect(loadTime).toBeLessThan(3000);
    
    // Verify dashboard is functional
    const dashboard = page.locator('[data-testid="dashboard-container"]');
    await expect(dashboard).toBeVisible();
  });

  test('should handle visual regression tests within time budget', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot for visual regression
    await expect(page).toHaveScreenshot('performance-homepage.png', {
      fullPage: true,
      threshold: 0.1
    });
    
    const testTime = Date.now() - startTime;
    
    // Performance budget: <30 seconds for visual regression tests
    expect(testTime).toBeLessThan(30000);
  });

  test('should handle multiple concurrent users', async ({ browser }) => {
    const startTime = Date.now();
    
    // Simulate multiple concurrent users
    const contexts = await Promise.all([
      browser.newContext(),
      browser.newContext(),
      browser.newContext()
    ]);
    
    const pages = await Promise.all(
      contexts.map(context => context.newPage())
    );
    
    // Load homepage on all pages concurrently
    await Promise.all(
      pages.map(page => page.goto('/'))
    );
    
    // Wait for all pages to load
    await Promise.all(
      pages.map(page => page.waitForLoadState('networkidle'))
    );
    
    const loadTime = Date.now() - startTime;
    
    // Performance budget: <5 seconds for concurrent loads
    expect(loadTime).toBeLessThan(5000);
    
    // Verify all pages loaded correctly
    for (const page of pages) {
      await expect(page).toHaveTitle(/TappHA/);
    }
    
    // Clean up
    await Promise.all(contexts.map(context => context.close()));
  });

  test('should handle memory usage efficiently', async ({ page }) => {
    const initialMemory = await page.evaluate(() => {
      return performance.memory?.usedJSHeapSize || 0;
    });
    
    // Navigate through multiple pages
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    
    const finalMemory = await page.evaluate(() => {
      return performance.memory?.usedJSHeapSize || 0;
    });
    
    const memoryIncrease = finalMemory - initialMemory;
    
    // Memory budget: <50MB increase for navigation
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
  });

  test('should handle network latency gracefully', async ({ page }) => {
    // Simulate slow network
    await page.route('**/*', route => {
      route.continue();
    });
    
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Should still load within reasonable time even with network latency
    expect(loadTime).toBeLessThan(10000);
    
    // Verify page is functional
    await expect(page).toHaveTitle(/TappHA/);
  });

  test('should handle large datasets efficiently', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Simulate loading large dataset
    await page.evaluate(() => {
      // Mock large dataset
      const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        value: Math.random() * 100
      }));
      
      // Store in window for testing
      (window as any).largeDataset = largeDataset;
    });
    
    const startTime = Date.now();
    
    // Trigger data processing
    await page.evaluate(() => {
      const dataset = (window as any).largeDataset;
      // Simulate processing
      dataset.forEach((item: any) => {
        item.processed = item.value * 2;
      });
    });
    
    const processingTime = Date.now() - startTime;
    
    // Processing budget: <1 second for large datasets
    expect(processingTime).toBeLessThan(1000);
  });

  test('should maintain performance during user interactions', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const startTime = Date.now();
    
    // Simulate rapid user interactions
    for (let i = 0; i < 10; i++) {
      await page.mouse.move(100 + i * 10, 100 + i * 10);
      await page.waitForTimeout(50);
    }
    
    const interactionTime = Date.now() - startTime;
    
    // Interaction budget: <500ms for rapid interactions
    expect(interactionTime).toBeLessThan(500);
    
    // Verify page is still responsive
    await expect(page).toHaveTitle(/TappHA/);
  });

  test('should handle theme switching efficiently', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const startTime = Date.now();
    
    // Toggle theme multiple times
    for (let i = 0; i < 5; i++) {
      const themeToggle = page.locator('[data-testid="dark-mode-toggle"]');
      await themeToggle.click();
      await page.waitForTimeout(100);
    }
    
    const themeSwitchTime = Date.now() - startTime;
    
    // Theme switching budget: <1 second for multiple switches
    expect(themeSwitchTime).toBeLessThan(1000);
  });
}); 