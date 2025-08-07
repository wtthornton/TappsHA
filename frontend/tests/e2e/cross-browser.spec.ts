import { test, expect } from '@playwright/test';

/**
 * Cross-Browser Compatibility Tests
 * Following Agent OS Framework Testing Standards
 */

test.describe('Cross-Browser Compatibility', () => {
  
  test('should load homepage correctly across browsers', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify page title
    await expect(page).toHaveTitle(/TappHA/);
    
    // Verify main content is visible
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
    
    // Verify navigation is present
    const navigation = page.locator('nav');
    await expect(navigation).toBeVisible();
  });

  test('should handle responsive design across viewports', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 1024, height: 768, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Verify content is visible at all viewport sizes
      const mainContent = page.locator('main');
      await expect(mainContent).toBeVisible();
      
      // Take screenshot for each viewport
      await expect(page).toHaveScreenshot(`responsive-${viewport.name}.png`, {
        fullPage: true,
        threshold: 0.1
      });
    }
  });

  test('should handle JavaScript interactions consistently', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test navigation interactions
    const navLinks = page.locator('nav a');
    const linkCount = await navLinks.count();
    
    for (let i = 0; i < Math.min(linkCount, 3); i++) {
      const link = navLinks.nth(i);
      await link.hover();
      
      // Verify hover states work
      await expect(link).toHaveCSS('cursor', 'pointer');
    }
  });

  test('should handle form interactions across browsers', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    
    // Test form inputs
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    
    if (inputCount > 0) {
      const firstInput = inputs.first();
      await firstInput.focus();
      await firstInput.fill('test input');
      
      // Verify input value is set
      await expect(firstInput).toHaveValue('test input');
    }
  });

  test('should handle CSS animations and transitions', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test for any animated elements
    const animatedElements = page.locator('[class*="animate"], [class*="transition"]');
    const animatedCount = await animatedElements.count();
    
    // Verify animations are present (if any)
    if (animatedCount > 0) {
      await expect(animatedElements.first()).toBeVisible();
    }
  });

  test('should handle localStorage consistently', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test localStorage functionality
    await page.evaluate(() => {
      localStorage.setItem('test-key', 'test-value');
    });
    
    const storedValue = await page.evaluate(() => {
      return localStorage.getItem('test-key');
    });
    
    expect(storedValue).toBe('test-value');
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate offline state
    await page.route('**/*', route => route.abort());
    
    await page.goto('/');
    
    // Verify error handling
    const errorElement = page.locator('[data-testid="error-message"], .error');
    await expect(errorElement).toBeVisible();
  });

  test('should handle different screen densities', async ({ page }) => {
    const deviceScaleFactors = [1, 2, 3];
    
    for (const scale of deviceScaleFactors) {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.evaluate((scale) => {
        // Simulate different device pixel ratios
        Object.defineProperty(window, 'devicePixelRatio', {
          value: scale,
          writable: true
        });
      }, scale);
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Take screenshot for different pixel densities
      await expect(page).toHaveScreenshot(`pixel-density-${scale}x.png`, {
        fullPage: true,
        threshold: 0.1
      });
    }
  });

  test('should handle different color schemes', async ({ page }) => {
    const colorSchemes = ['light', 'dark'];
    
    for (const scheme of colorSchemes) {
      await page.emulateMedia({ colorScheme: scheme as 'light' | 'dark' });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Take screenshot for different color schemes
      await expect(page).toHaveScreenshot(`color-scheme-${scheme}.png`, {
        fullPage: true,
        threshold: 0.1
      });
    }
  });
}); 