import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const { baseURL, storageState } = config.projects[0].use;
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Navigate to the application
  await page.goto(baseURL!);
  
  // Wait for the application to load
  await page.waitForLoadState('networkidle');
  
  // Take initial screenshot for baseline
  await page.screenshot({ 
    path: 'tests/e2e/screenshots/baseline-homepage.png',
    fullPage: true 
  });
  
  // Save signed-in state
  await page.context().storageState({ path: storageState as string });
  await browser.close();
}

export default globalSetup; 