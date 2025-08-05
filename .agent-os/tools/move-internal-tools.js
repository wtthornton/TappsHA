#!/usr/bin/env node

/**
 * Move Internal Tools Script
 * 
 * Moves internal framework tools from .agent-os/tools/ to .agent-os/internal/tools/
 */

const fs = require('fs');
const path = require('path');

const internalTools = [
  'cursor-init-backup.js',
  'lesson-impact-tracker.js',
  'lesson-quality-validator.js',
  'lesson-template-generator.js',
  'lesson-categorizer.js',
  'cursor-rule-optimizer.js',
  'cursor-analytics.js',
  'hybrid-md-processor.js',
  'md-executor.js',
  'documentation-analyzer.js',
  'statistical-analysis.js',
  'update-cursor-init.js',
  'production-deployment.js'
];

const sourceDir = path.join(__dirname);
const targetDir = path.join(__dirname, '../internal/tools');

console.log('🔧 Moving Internal Tools...\n');

// Ensure target directory exists
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log('✅ Created internal tools directory');
}

let movedCount = 0;
let skippedCount = 0;

for (const tool of internalTools) {
  const sourcePath = path.join(sourceDir, tool);
  const targetPath = path.join(targetDir, tool);
  
  if (fs.existsSync(sourcePath)) {
    try {
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`✅ Moved: ${tool}`);
      movedCount++;
    } catch (error) {
      console.log(`❌ Failed to move: ${tool} - ${error.message}`);
    }
  } else {
    console.log(`⚠️  Skipped: ${tool} (not found)`);
    skippedCount++;
  }
}

console.log(`\n📊 Summary:`);
console.log(`  ✅ Moved: ${movedCount} files`);
console.log(`  ⚠️  Skipped: ${skippedCount} files`);
console.log(`  📁 Target: ${targetDir}`);

console.log('\n🎯 Internal tools moved successfully!'); 