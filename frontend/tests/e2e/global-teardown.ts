import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  // Clean up any test artifacts
  console.log('Test suite completed. Cleaning up...');
  
  // Additional cleanup can be added here if needed
  // For example, removing temporary files, cleaning up test data, etc.
}

export default globalTeardown; 