import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.{ts,js}'],
    exclude: ['internal/**', 'testing/**', 'node_modules/**'],
    environment: 'node',
    testTimeout: 30000,
    coverage: {
      enabled: false,
      reporter: ['json-summary', 'text'],
      reportsDirectory: './reports/coverage',
    },
  },
});


