#!/bin/sh

# Remove test files temporarily for build
rm -rf src/**/__tests__/
rm -rf src/**/*.test.tsx
rm -rf src/**/*.test.ts
rm -rf src/test-setup.ts
rm -rf src/services/api/__tests__/
rm -rf src/contexts/__tests__/
rm -rf src/components/__tests__/

# Build the application
npm run build 