#!/usr/bin/env node

/**
 * Optimize compliance history file for better performance
 * Reduces file size by keeping only the last 100 entries
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const historyPath = path.join(__dirname, '../reports/compliance-history.json');
const backupPath = path.join(__dirname, '../reports/compliance-history-backup.json');

function optimizeHistory() {
  try {
    console.log('🔧 Optimizing compliance history file...');
    
    // Check if history file exists
    if (!fs.existsSync(historyPath)) {
      console.log('⚠️  History file not found, creating empty history');
      fs.writeFileSync(historyPath, JSON.stringify([], null, 2));
      return;
    }
    
    // Read current history
    const history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
    const originalSize = history.length;
    
    console.log(`📊 Original history size: ${originalSize} entries`);
    
    // Create backup
    fs.writeFileSync(backupPath, JSON.stringify(history, null, 2));
    console.log(`💾 Backup created: ${backupPath}`);
    
    // Keep only last 100 entries
    const optimizedHistory = history.slice(-100);
    const optimizedSize = optimizedHistory.length;
    
    console.log(`📈 Optimized history size: ${optimizedSize} entries`);
    console.log(`📉 Reduced by: ${originalSize - optimizedSize} entries`);
    
    // Write optimized history
    fs.writeFileSync(historyPath, JSON.stringify(optimizedHistory, null, 2));
    
    // Calculate file size reduction
    const originalFileSize = fs.statSync(backupPath).size;
    const optimizedFileSize = fs.statSync(historyPath).size;
    const sizeReduction = ((originalFileSize - optimizedFileSize) / originalFileSize * 100).toFixed(1);
    
    console.log(`📦 File size reduction: ${sizeReduction}%`);
    console.log(`📄 Original: ${(originalFileSize / 1024).toFixed(1)} KB`);
    console.log(`📄 Optimized: ${(optimizedFileSize / 1024).toFixed(1)} KB`);
    
    console.log('✅ History optimization completed successfully!');
    console.log('🚀 Dashboard history endpoint should now be much faster');
    
  } catch (error) {
    console.error('❌ Error optimizing history:', error.message);
  }
}

// Run optimization
optimizeHistory();
