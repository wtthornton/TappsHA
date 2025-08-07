import { test, expect } from '@playwright/test';

/**
 * Visual Regression Tests for Critical UI Components
 * Following Agent OS Framework Testing Standards
 */

test.describe('Visual Regression Tests', () => {
  
  test('@visual Homepage - Desktop View', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of homepage
    await expect(page).toHaveScreenshot('homepage-desktop.png', {
      fullPage: true,
      threshold: 0.1
    });
  });

  test('@visual Homepage - Mobile View', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of homepage on mobile
    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      fullPage: true,
      threshold: 0.1
    });
  });

  test('@visual Dashboard - Desktop View', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Wait for dashboard components to load
    await page.waitForSelector('[data-testid="dashboard-container"]', { timeout: 10000 });
    
    // Take screenshot of dashboard
    await expect(page).toHaveScreenshot('dashboard-desktop.png', {
      fullPage: true,
      threshold: 0.1
    });
  });

  test('@visual Dashboard - Mobile View', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Wait for dashboard components to load
    await page.waitForSelector('[data-testid="dashboard-container"]', { timeout: 10000 });
    
    // Take screenshot of dashboard on mobile
    await expect(page).toHaveScreenshot('dashboard-mobile.png', {
      fullPage: true,
      threshold: 0.1
    });
  });

  test('@visual Navigation - Desktop View', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of navigation
    const nav = page.locator('nav');
    await expect(nav).toHaveScreenshot('navigation-desktop.png', {
      threshold: 0.1
    });
  });

  test('@visual Navigation - Mobile View', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of mobile navigation
    const nav = page.locator('nav');
    await expect(nav).toHaveScreenshot('navigation-mobile.png', {
      threshold: 0.1
    });
  });

  test('@visual Charts and Graphs', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Wait for charts to load
    await page.waitForSelector('canvas', { timeout: 10000 });
    
    // Take screenshot of charts
    const charts = page.locator('canvas');
    await expect(charts.first()).toHaveScreenshot('charts-desktop.png', {
      threshold: 0.1
    });
  });

  test('@visual Forms and Inputs', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of forms
    const form = page.locator('form');
    await expect(form).toHaveScreenshot('forms-desktop.png', {
      threshold: 0.1
    });
  });

  test('@visual Error States', async ({ page }) => {
    // Navigate to a non-existent page to trigger error state
    await page.goto('/non-existent-page');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of error page
    await expect(page).toHaveScreenshot('error-page.png', {
      fullPage: true,
      threshold: 0.1
    });
  });

  test('@visual Loading States', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Take screenshot during loading state
    await expect(page).toHaveScreenshot('loading-state.png', {
      fullPage: true,
      threshold: 0.1
    });
  });

  test('@visual Dark Mode Toggle', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Toggle dark mode
    const darkModeToggle = page.locator('[data-testid="dark-mode-toggle"]');
    await darkModeToggle.click();
    
    // Wait for theme change
    await page.waitForTimeout(500);
    
    // Take screenshot in dark mode
    await expect(page).toHaveScreenshot('dark-mode.png', {
      fullPage: true,
      threshold: 0.1
    });
  });
}); 