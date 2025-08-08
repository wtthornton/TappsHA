#!/usr/bin/env node

/**
 * Database Optimizer for Agent-OS
 * Handles data compression, indexing, archiving, and maintenance routines
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import zlib from 'zlib';
import { promisify } from 'util';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Promisify zlib functions
const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

class DatabaseOptimizer {
  constructor() {
    this.reportsPath = path.join(__dirname, '../reports');
    this.archivePath = path.join(__dirname, '../archive');
    this.indexPath = path.join(__dirname, '../index');
    
    // Ensure directories exist
    this.ensureDirectories();
    
    // Optimization settings
    this.settings = {
      compressionLevel: 6, // 0-9, higher = better compression but slower
      maxArchiveAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
      compressionThreshold: 1024 * 1024, // 1MB - only compress files larger than this
      indexUpdateInterval: 24 * 60 * 60 * 1000, // 24 hours
      cleanupInterval: 7 * 24 * 60 * 60 * 1000, // 7 days
      maxIndexSize: 100 * 1024 * 1024, // 100MB
      backupRetentionDays: 90
    };
    
    // Performance tracking
    this.performanceMetrics = {
      filesCompressed: 0,
      bytesSaved: 0,
      compressionRatio: 0,
      indexUpdates: 0,
      archivesCreated: 0,
      cleanupOperations: 0
    };
    
    // Index data
    this.index = new Map();
    this.lastIndexUpdate = 0;
  }

  /**
   * Ensure required directories exist
   */
  ensureDirectories() {
    const dirs = [this.reportsPath, this.archivePath, this.indexPath];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Start database optimization
   */
  async start() {
    console.log('🚀 Starting Database Optimizer...');
    console.log(`📊 Optimization Features:`);
    console.log(`   - Data compression for large files`);
    console.log(`   - Intelligent indexing for fast queries`);
    console.log(`   - Automated archiving for old data`);
    console.log(`   - Data cleanup and maintenance`);
    console.log(`   - Performance monitoring and metrics`);
    
    // Run initial optimization
    await this.runFullOptimization();
    
    // Schedule periodic optimizations
    this.scheduleOptimizations();
    
    console.log('✅ Database optimizer started successfully');
  }

  /**
   * Run full optimization cycle
   */
  async runFullOptimization() {
    console.log('🔄 Starting full optimization cycle...');
    
    try {
      // Step 1: Compress large files
      await this.compressLargeFiles();
      
      // Step 2: Update indexes
      await this.updateIndexes();
      
      // Step 3: Archive old data
      await this.archiveOldData();
      
      // Step 4: Cleanup operations
      await this.performCleanup();
      
      // Step 5: Generate optimization report
      await this.generateOptimizationReport();
      
      console.log('✅ Full optimization cycle completed');
    } catch (error) {
      console.error('❌ Error during optimization:', error.message);
    }
  }

  /**
   * Compress large files to save storage space
   */
  async compressLargeFiles() {
    console.log('📦 Compressing large files...');
    
    const files = this.getFilesToCompress();
    let totalBytesSaved = 0;
    let filesCompressed = 0;
    
    for (const file of files) {
      try {
        const originalSize = fs.statSync(file).size;
        
        if (originalSize > this.settings.compressionThreshold) {
          const compressed = await this.compressFile(file);
          const compressedSize = compressed.length;
          const bytesSaved = originalSize - compressedSize;
          
          // Save compressed file
          const compressedPath = file + '.gz';
          fs.writeFileSync(compressedPath, compressed);
          
          // Remove original file
          fs.unlinkSync(file);
          
          totalBytesSaved += bytesSaved;
          filesCompressed++;
          
          console.log(`✅ Compressed ${path.basename(file)}: ${this.formatBytes(originalSize)} → ${this.formatBytes(compressedSize)} (${Math.round((bytesSaved / originalSize) * 100)}% saved)`);
        }
      } catch (error) {
        console.error(`❌ Error compressing ${file}:`, error.message);
      }
    }
    
    // Update performance metrics
    this.performanceMetrics.filesCompressed += filesCompressed;
    this.performanceMetrics.bytesSaved += totalBytesSaved;
    
    if (filesCompressed > 0) {
      this.performanceMetrics.compressionRatio = Math.round((totalBytesSaved / (totalBytesSaved + this.performanceMetrics.bytesSaved)) * 100);
    }
    
    console.log(`📦 Compression complete: ${filesCompressed} files, ${this.formatBytes(totalBytesSaved)} saved`);
  }

  /**
   * Get files that need compression
   */
  getFilesToCompress() {
    const files = [];
    
    // Scan reports directory for large files
    if (fs.existsSync(this.reportsPath)) {
      const reportFiles = fs.readdirSync(this.reportsPath);
      for (const file of reportFiles) {
        const filePath = path.join(this.reportsPath, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isFile() && !file.endsWith('.gz') && stats.size > this.settings.compressionThreshold) {
          files.push(filePath);
        }
      }
    }
    
    return files;
  }

  /**
   * Compress a single file
   */
  async compressFile(filePath) {
    const content = fs.readFileSync(filePath);
    return await gzip(content, { level: this.settings.compressionLevel });
  }

  /**
   * Decompress a file
   */
  async decompressFile(filePath) {
    const content = fs.readFileSync(filePath);
    return await gunzip(content);
  }

  /**
   * Update indexes for faster queries
   */
  async updateIndexes() {
    console.log('📇 Updating indexes...');
    
    const now = Date.now();
    if (now - this.lastIndexUpdate < this.settings.indexUpdateInterval) {
      console.log('⏭️  Index update skipped (too recent)');
      return;
    }
    
    try {
      // Clear old index
      this.index.clear();
      
      // Index all files in reports directory
      const files = this.getAllFiles(this.reportsPath);
      
      for (const file of files) {
        await this.indexFile(file);
      }
      
      // Save index to disk
      await this.saveIndex();
      
      this.lastIndexUpdate = now;
      this.performanceMetrics.indexUpdates++;
      
      console.log(`📇 Index updated: ${this.index.size} entries`);
    } catch (error) {
      console.error('❌ Error updating indexes:', error.message);
    }
  }

  /**
   * Index a single file
   */
  async indexFile(filePath) {
    try {
      const stats = fs.statSync(filePath);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Create index entry
      const entry = {
        path: filePath,
        size: stats.size,
        modified: stats.mtime,
        type: path.extname(filePath),
        keywords: this.extractKeywords(content),
        metadata: this.extractMetadata(content)
      };
      
      this.index.set(filePath, entry);
    } catch (error) {
      console.error(`❌ Error indexing ${filePath}:`, error.message);
    }
  }

  /**
   * Extract keywords from content
   */
  extractKeywords(content) {
    const words = content.toLowerCase().match(/\b\w+\b/g) || [];
    const wordCount = {};
    
    words.forEach(word => {
      if (word.length > 3) { // Only meaningful words
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });
    
    // Return top 10 keywords
    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  /**
   * Extract metadata from content
   */
  extractMetadata(content) {
    const metadata = {};
    
    // Try to parse as JSON
    try {
      const json = JSON.parse(content);
      if (json.timestamp) metadata.timestamp = json.timestamp;
      if (json.status) metadata.status = json.status;
      if (json.totalFiles) metadata.totalFiles = json.totalFiles;
      if (json.totalViolations) metadata.totalViolations = json.totalViolations;
    } catch (error) {
      // Not JSON, extract basic info
      metadata.lines = content.split('\n').length;
      metadata.size = content.length;
    }
    
    return metadata;
  }

  /**
   * Save index to disk
   */
  async saveIndex() {
    const indexData = {
      timestamp: Date.now(),
      entries: Object.fromEntries(this.index),
      performance: this.performanceMetrics
    };
    
    const indexFile = path.join(this.indexPath, 'index.json');
    fs.writeFileSync(indexFile, JSON.stringify(indexData, null, 2));
  }

  /**
   * Load index from disk
   */
  async loadIndex() {
    const indexFile = path.join(this.indexPath, 'index.json');
    
    if (fs.existsSync(indexFile)) {
      try {
        const data = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
        this.index = new Map(Object.entries(data.entries || {}));
        this.performanceMetrics = { ...this.performanceMetrics, ...data.performance };
        console.log(`📇 Index loaded: ${this.index.size} entries`);
      } catch (error) {
        console.error('❌ Error loading index:', error.message);
      }
    }
  }

  /**
   * Archive old data
   */
  async archiveOldData() {
    console.log('📦 Archiving old data...');
    
    const cutoffDate = new Date(Date.now() - this.settings.maxArchiveAge);
    const files = this.getAllFiles(this.reportsPath);
    let archivedCount = 0;
    
    for (const file of files) {
      try {
        const stats = fs.statSync(file);
        
        if (stats.mtime < cutoffDate) {
          await this.archiveFile(file);
          archivedCount++;
        }
      } catch (error) {
        console.error(`❌ Error archiving ${file}:`, error.message);
      }
    }
    
    this.performanceMetrics.archivesCreated += archivedCount;
    console.log(`📦 Archived ${archivedCount} old files`);
  }

  /**
   * Archive a single file
   */
  async archiveFile(filePath) {
    const fileName = path.basename(filePath);
    const archiveName = `${fileName}.${Date.now()}.archive`;
    const archivePath = path.join(this.archivePath, archiveName);
    
    // Compress and move to archive
    const compressed = await this.compressFile(filePath);
    fs.writeFileSync(archivePath, compressed);
    
    // Remove original file
    fs.unlinkSync(filePath);
    
    console.log(`📦 Archived: ${fileName} → ${archiveName}`);
  }

  /**
   * Perform cleanup operations
   */
  async performCleanup() {
    console.log('🧹 Performing cleanup operations...');
    
    // Clean up old archives
    await this.cleanupOldArchives();
    
    // Clean up large indexes
    await this.cleanupLargeIndexes();
    
    // Clean up temporary files
    await this.cleanupTempFiles();
    
    this.performanceMetrics.cleanupOperations++;
    console.log('🧹 Cleanup operations completed');
  }

  /**
   * Clean up old archives
   */
  async cleanupOldArchives() {
    const cutoffDate = new Date(Date.now() - (this.settings.backupRetentionDays * 24 * 60 * 60 * 1000));
    const archiveFiles = fs.readdirSync(this.archivePath);
    let removedCount = 0;
    
    for (const file of archiveFiles) {
      const filePath = path.join(this.archivePath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtime < cutoffDate) {
        fs.unlinkSync(filePath);
        removedCount++;
      }
    }
    
    if (removedCount > 0) {
      console.log(`🧹 Removed ${removedCount} old archives`);
    }
  }

  /**
   * Clean up large indexes
   */
  async cleanupLargeIndexes() {
    const indexFile = path.join(this.indexPath, 'index.json');
    
    if (fs.existsSync(indexFile)) {
      const stats = fs.statSync(indexFile);
      
      if (stats.size > this.settings.maxIndexSize) {
        // Rebuild index with only recent entries
        const cutoffDate = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)); // Keep last 7 days
        
        const newIndex = new Map();
        for (const [key, value] of this.index.entries()) {
          if (value.modified > cutoffDate) {
            newIndex.set(key, value);
          }
        }
        
        this.index = newIndex;
        await this.saveIndex();
        
        console.log(`🧹 Rebuilt index: ${this.index.size} entries (removed old entries)`);
      }
    }
  }

  /**
   * Clean up temporary files
   */
  async cleanupTempFiles() {
    const tempPatterns = ['.tmp', '.temp', '.cache'];
    const files = this.getAllFiles(this.reportsPath);
    let removedCount = 0;
    
    for (const file of files) {
      const fileName = path.basename(file);
      
      if (tempPatterns.some(pattern => fileName.includes(pattern))) {
        fs.unlinkSync(file);
        removedCount++;
      }
    }
    
    if (removedCount > 0) {
      console.log(`🧹 Removed ${removedCount} temporary files`);
    }
  }

  /**
   * Get all files in a directory recursively
   */
  getAllFiles(dir) {
    const files = [];
    
    if (fs.existsSync(dir)) {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isFile()) {
          files.push(itemPath);
        } else if (stats.isDirectory()) {
          files.push(...this.getAllFiles(itemPath));
        }
      }
    }
    
    return files;
  }

  /**
   * Generate optimization report
   */
  async generateOptimizationReport() {
    const report = {
      timestamp: new Date().toISOString(),
      performance: this.performanceMetrics,
      settings: this.settings,
      index: {
        totalEntries: this.index.size,
        lastUpdate: this.lastIndexUpdate
      },
      storage: {
        reportsSize: this.calculateDirectorySize(this.reportsPath),
        archiveSize: this.calculateDirectorySize(this.archivePath),
        indexSize: this.calculateDirectorySize(this.indexPath)
      }
    };
    
    const reportFile = path.join(this.reportsPath, 'database-optimization-report.json');
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    console.log('📊 Optimization report generated');
  }

  /**
   * Calculate directory size
   */
  calculateDirectorySize(dir) {
    if (!fs.existsSync(dir)) return 0;
    
    let totalSize = 0;
    const files = this.getAllFiles(dir);
    
    for (const file of files) {
      try {
        const stats = fs.statSync(file);
        totalSize += stats.size;
      } catch (error) {
        // Skip files that can't be accessed
      }
    }
    
    return totalSize;
  }

  /**
   * Format bytes to human readable format
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Schedule periodic optimizations
   */
  scheduleOptimizations() {
    // Daily index updates
    setInterval(() => {
      this.updateIndexes();
    }, this.settings.indexUpdateInterval);
    
    // Weekly cleanup
    setInterval(() => {
      this.performCleanup();
    }, this.settings.cleanupInterval);
    
    // Monthly full optimization
    setInterval(() => {
      this.runFullOptimization();
    }, 30 * 24 * 60 * 60 * 1000); // 30 days
    
    console.log('⏰ Scheduled optimizations:');
    console.log(`   - Index updates: every ${this.settings.indexUpdateInterval / (60 * 60 * 1000)} hours`);
    console.log(`   - Cleanup: every ${this.settings.cleanupInterval / (24 * 60 * 60 * 1000)} days`);
    console.log('   - Full optimization: every 30 days');
  }

  /**
   * Search indexed files
   */
  searchFiles(query) {
    const results = [];
    const queryLower = query.toLowerCase();
    
    for (const [filePath, entry] of this.index.entries()) {
      if (entry.keywords.some(keyword => keyword.includes(queryLower)) ||
          path.basename(filePath).toLowerCase().includes(queryLower)) {
        results.push({
          file: filePath,
          size: entry.size,
          modified: entry.modified,
          keywords: entry.keywords,
          metadata: entry.metadata
        });
      }
    }
    
    return results.sort((a, b) => b.modified - a.modified);
  }

  /**
   * Get optimization statistics
   */
  getStatistics() {
    return {
      performance: this.performanceMetrics,
      storage: {
        reportsSize: this.calculateDirectorySize(this.reportsPath),
        archiveSize: this.calculateDirectorySize(this.archivePath),
        indexSize: this.calculateDirectorySize(this.indexPath)
      },
      index: {
        totalEntries: this.index.size,
        lastUpdate: this.lastIndexUpdate
      }
    };
  }

  /**
   * Stop the optimizer
   */
  stop() {
    console.log('🛑 Database optimizer stopped');
  }
}

// Export for use in other modules
export default DatabaseOptimizer;

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const optimizer = new DatabaseOptimizer();
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping database optimizer...');
    optimizer.stop();
    process.exit(0);
  });
  
  optimizer.start();
}
