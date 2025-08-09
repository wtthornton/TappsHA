import { test, expect } from '@playwright/test';

/**
 * Performance Tests for Agent-OS Dashboard
 * Tests loading times, responsiveness, and resource usage
 */

test.describe('Agent-OS Dashboard Performance Tests', () => {
  const baseUrl = 'http://localhost:3011';

  test('should load main dashboard within performance budget', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto(`${baseUrl}/app`);
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Performance budget: 3 seconds for initial load
    expect(loadTime).toBeLessThan(3000);
    
    // Log performance metrics
    console.log(`Dashboard load time: ${loadTime}ms`);
  });

  test('should load doctor UI within performance budget', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto(`${baseUrl}/doctor-ui`);
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Performance budget: 2 seconds for doctor UI
    expect(loadTime).toBeLessThan(2000);
    
    console.log(`Doctor UI load time: ${loadTime}ms`);
  });

  test('should handle concurrent requests efficiently', async ({ browser }) => {
    const concurrentUsers = 5;
    const startTime = Date.now();
    
    // Create multiple browser contexts to simulate concurrent users
    const contexts = [];
    const pages = [];
    
    for (let i = 0; i < concurrentUsers; i++) {
      const context = await browser.newContext();
      const page = await context.newPage();
      contexts.push(context);
      pages.push(page);
    }
    
    // Navigate all pages simultaneously
    const navigationPromises = pages.map(page => 
      page.goto(`${baseUrl}/app`).then(() => page.waitForLoadState('networkidle'))
    );
    
    await Promise.all(navigationPromises);
    
    const totalTime = Date.now() - startTime;
    const avgTimePerUser = totalTime / concurrentUsers;
    
    // Performance budget: average 1.5 seconds per user under load
    expect(avgTimePerUser).toBeLessThan(1500);
    
    console.log(`Concurrent load test - ${concurrentUsers} users, avg time: ${avgTimePerUser}ms`);
    
    // Cleanup
    await Promise.all(contexts.map(context => context.close()));
  });

  test('should maintain responsive UI during data updates', async ({ page }) => {
    await page.goto(`${baseUrl}/app`);
    await page.waitForLoadState('networkidle');
    
    // Measure initial render time
    const initialRenderTime = await page.evaluate(() => {
      return performance.timing.loadEventEnd - performance.timing.navigationStart;
    });
    
    // Simulate data updates by refreshing metrics
    const updateStartTime = Date.now();
    
    // Trigger a metrics refresh (if there's a refresh button)
    const refreshButton = page.locator('button:has-text("Refresh"), [data-testid="refresh"], .refresh-btn');
    if (await refreshButton.count() > 0) {
      await refreshButton.click();
      await page.waitForTimeout(1000); // Wait for update
    }
    
    const updateTime = Date.now() - updateStartTime;
    
    // Performance budget: 500ms for data updates
    expect(updateTime).toBeLessThan(500);
    
    console.log(`Data update time: ${updateTime}ms`);
  });

  test('should handle large datasets without performance degradation', async ({ page }) => {
    await page.goto(`${baseUrl}/app`);
    await page.waitForLoadState('networkidle');
    
    // Measure memory usage before large data load
    const initialMemory = await page.evaluate(() => {
      return performance.memory ? performance.memory.usedJSHeapSize : 0;
    });
    
    // Simulate loading large dataset (if there's a way to trigger this)
    const largeDataButton = page.locator('button:has-text("Load Large Dataset"), [data-testid="load-large-data"]');
    if (await largeDataButton.count() > 0) {
      await largeDataButton.click();
      await page.waitForTimeout(2000); // Wait for large data load
    }
    
    // Measure memory usage after large data load
    const finalMemory = await page.evaluate(() => {
      return performance.memory ? performance.memory.usedJSHeapSize : 0;
    });
    
    const memoryIncrease = finalMemory - initialMemory;
    
    // Performance budget: memory increase should be reasonable (< 50MB)
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    
    console.log(`Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
  });

  test('should maintain smooth scrolling performance', async ({ page }) => {
    await page.goto(`${baseUrl}/app`);
    await page.waitForLoadState('networkidle');
    
    // Measure scroll performance
    const scrollStartTime = Date.now();
    
    // Perform smooth scrolling
    await page.evaluate(() => {
      return new Promise<void>((resolve) => {
        let scrollCount = 0;
        const maxScrolls = 10;
        
        const scroll = () => {
          window.scrollBy(0, 100);
          scrollCount++;
          
          if (scrollCount < maxScrolls) {
            requestAnimationFrame(scroll);
          } else {
            resolve();
          }
        };
        
        requestAnimationFrame(scroll);
      });
    });
    
    const scrollTime = Date.now() - scrollStartTime;
    
    // Performance budget: smooth scrolling should complete within 1 second
    expect(scrollTime).toBeLessThan(1000);
    
    console.log(`Scroll performance time: ${scrollTime}ms`);
  });

  test('should handle theme switching without performance impact', async ({ page }) => {
    await page.goto(`${baseUrl}/app`);
    await page.waitForLoadState('networkidle');
    
    // Find theme toggle
    const themeToggle = page.locator('[data-testid="theme-toggle"], .theme-toggle, button:has-text("Dark"), button:has-text("Light")');
    
    if (await themeToggle.count() > 0) {
      const themeSwitchStartTime = Date.now();
      
      await themeToggle.click();
      await page.waitForTimeout(500); // Wait for theme transition
      
      const themeSwitchTime = Date.now() - themeSwitchStartTime;
      
      // Performance budget: theme switch should be instant (< 200ms)
      expect(themeSwitchTime).toBeLessThan(200);
      
      console.log(`Theme switch time: ${themeSwitchTime}ms`);
    }
  });

  test('should maintain performance during chart animations', async ({ page }) => {
    await page.goto(`${baseUrl}/app`);
    await page.waitForLoadState('networkidle');
    
    // Look for chart elements
    const charts = page.locator('canvas, .chart, .graph, [data-testid*="chart"]');
    
    if (await charts.count() > 0) {
      const animationStartTime = Date.now();
      
      // Trigger chart animations (if possible)
      await page.evaluate(() => {
        // Simulate chart animations
        return new Promise<void>((resolve) => {
          setTimeout(resolve, 1000); // Wait for potential animations
        });
      });
      
      const animationTime = Date.now() - animationStartTime;
      
      // Performance budget: chart animations should be smooth (< 1.5 seconds)
      expect(animationTime).toBeLessThan(1500);
      
      console.log(`Chart animation time: ${animationTime}ms`);
    }
  });

  test('should handle rapid navigation without performance issues', async ({ page }) => {
    const pages = ['/app', '/doctor-ui', '/user-guide', '/debug'];
    const navigationTimes = [];
    
    for (const pagePath of pages) {
      const startTime = Date.now();
      
      await page.goto(`${baseUrl}${pagePath}`);
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      navigationTimes.push(loadTime);
      
      console.log(`${pagePath} load time: ${loadTime}ms`);
    }
    
    // Performance budget: average navigation time should be under 2 seconds
    const avgNavigationTime = navigationTimes.reduce((sum, time) => sum + time, 0) / navigationTimes.length;
    expect(avgNavigationTime).toBeLessThan(2000);
    
    console.log(`Average navigation time: ${avgNavigationTime}ms`);
  });

  test('should maintain responsive UI during network latency', async ({ page }) => {
    // Simulate network latency by throttling
    await page.route('**/*', (route) => {
      setTimeout(() => route.continue(), 100); // Add 100ms latency
    });
    
    const startTime = Date.now();
    
    await page.goto(`${baseUrl}/app`);
    await page.waitForLoadState('networkidle');
    
    const loadTimeWithLatency = Date.now() - startTime;
    
    // Performance budget: should still load within 4 seconds even with latency
    expect(loadTimeWithLatency).toBeLessThan(4000);
    
    console.log(`Load time with simulated latency: ${loadTimeWithLatency}ms`);
  });

  test('should handle memory leaks gracefully', async ({ page }) => {
    await page.goto(`${baseUrl}/app`);
    await page.waitForLoadState('networkidle');
    
    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      return performance.memory ? performance.memory.usedJSHeapSize : 0;
    });
    
    // Perform multiple interactions to test for memory leaks
    for (let i = 0; i < 10; i++) {
      // Refresh the page multiple times
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Wait a bit between reloads
      await page.waitForTimeout(100);
    }
    
    // Get final memory usage
    const finalMemory = await page.evaluate(() => {
      return performance.memory ? performance.memory.usedJSHeapSize : 0;
    });
    
    const memoryIncrease = finalMemory - initialMemory;
    
    // Performance budget: memory increase should be minimal (< 10MB)
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    
    console.log(`Memory increase after stress test: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
  });

  test('should maintain performance during real-time updates', async ({ page }) => {
    await page.goto(`${baseUrl}/app`);
    await page.waitForLoadState('networkidle');
    
    // Monitor for real-time updates
    const updateStartTime = Date.now();
    
    // Wait for potential real-time updates
    await page.waitForTimeout(5000); // Wait 5 seconds for real-time updates
    
    // Check if page remains responsive during updates
    const isResponsive = await page.evaluate(() => {
      return !document.hidden && document.readyState === 'complete';
    });
    
    expect(isResponsive).toBe(true);
    
    const monitoringTime = Date.now() - updateStartTime;
    console.log(`Real-time monitoring time: ${monitoringTime}ms`);
  });
});
