/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

/**
 * Agent OS Standard Vitest Configuration
 * 
 * This template is based on lessons learned from multiple projects
 * and ensures consistent testing infrastructure across all Agent OS projects.
 * 
 * Key Features:
 * - Proper mock setup for singleton services
 * - localStorage and sessionStorage mocking
 * - API client mocking patterns
 * - Cross-platform path resolution
 * - Comprehensive coverage requirements
 */

export default defineConfig({
  plugins: [react()],
  test: {
    // Environment setup
    environment: 'jsdom',
    globals: true,
    
    // Setup files - executed before each test file
    setupFiles: [
      './src/test-setup.ts',
      './src/mocks/browser-mocks.ts',
      './src/mocks/api-mocks.ts'
    ],
    
    // Include patterns
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    
    // Exclude patterns
    exclude: [
      'node_modules',
      'dist',
      '.agent-os',
      'coverage',
      'build'
    ],
    
    // Coverage configuration based on Agent OS standards
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      
      // Agent OS minimum coverage requirements
      thresholds: {
        global: {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85
        }
      },
      
      // Include patterns
      include: [
        'src/**/*.{js,ts,jsx,tsx}'
      ],
      
      // Exclude patterns
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.{js,ts,jsx,tsx}',
        'src/**/*.spec.{js,ts,jsx,tsx}',
        'src/mocks/**',
        'src/test-utils/**',
        'src/**/__tests__/**',
        'src/**/*.stories.{js,ts,jsx,tsx}'
      ]
    },
    
    // Mock configuration
    deps: {
      inline: [
        '@testing-library/jest-dom',
        '@testing-library/user-event'
      ]
    },
    
    // Timeout configuration
    testTimeout: 10000,
    hookTimeout: 10000,
    
    // Reporter configuration
    reporter: ['verbose', 'json'],
    outputFile: {
      json: './test-results.json'
    },
    
    // Watch configuration
    watch: false,
    
    // Pool configuration for better performance
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        isolate: true
      }
    }
  },
  
  // Resolve configuration for path mapping
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/components': resolve(__dirname, './src/components'),
      '@/services': resolve(__dirname, './src/services'),
      '@/types': resolve(__dirname, './src/types'),
      '@/utils': resolve(__dirname, './src/utils'),
      '@/hooks': resolve(__dirname, './src/hooks'),
      '@/contexts': resolve(__dirname, './src/contexts'),
      '@/assets': resolve(__dirname, './src/assets'),
      '@/test-utils': resolve(__dirname, './src/test-utils')
    }
  }
});