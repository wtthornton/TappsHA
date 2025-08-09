#!/usr/bin/env node

import { fileURLToPath } from 'url';

console.log('Test script starting...');
console.log('import.meta.url:', import.meta.url);
console.log('process.argv[1]:', process.argv[1]);

const currentFile = fileURLToPath(import.meta.url);
console.log('currentFile:', currentFile);
console.log('Comparison result:', currentFile === process.argv[1]);

// Test the import.meta.url comparison
const isMainModule = currentFile === process.argv[1];
console.log('Is main module:', isMainModule);

if (isMainModule) {
    console.log('✅ Main module detected - should start server');
} else {
    console.log('❌ Not main module - server will not start');
}
