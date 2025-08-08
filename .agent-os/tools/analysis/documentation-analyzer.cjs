const fs = require('fs');
const path = require('path');

const IGNORE_DIRS = new Set(['node_modules', 'target', 'dist', 'build', 'coverage', '.git']);

class DocumentationAnalyzer {
  constructor() {
    this.agentOsPath = path.join(__dirname, '..');
    this.markdownFiles = [];
    this.analysisResults = {};
  }

  findMarkdownFiles() {
    const markdownFiles = [];
    const scanDirectory = (dir) => {
      try {
        const items = fs.readdirSync(dir);
        items.forEach((item) => {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            if (!IGNORE_DIRS.has(item)) scanDirectory(fullPath);
          } else if (item.endsWith('.md')) {
            markdownFiles.push({
              path: fullPath,
              relativePath: path.relative(this.agentOsPath, fullPath),
              filename: item,
            });
          }
        });
      } catch {}
    };
    scanDirectory(this.agentOsPath);
    this.markdownFiles = markdownFiles;
    return markdownFiles;
  }

  analyzeMarkdownFile(fileInfo) {
    try {
      const content = fs.readFileSync(fileInfo.path, 'utf8');
      const lines = content.split('\n');
      const analysis = {
        filename: fileInfo.filename,
        relativePath: fileInfo.relativePath,
        totalLines: lines.length,
        metrics: { headings: 0, codeBlocks: 0, links: 0, images: 0, lists: 0, tables: 0, emptyLines: 0, wordCount: 0 },
        quality: { hasTitle: false, hasTableOfContents: false, hasLastModified: false, hasVersion: false, hasAuthor: false, hasFrontMatter: false, frontMatterMissing: [], completeness: 0 },
        issues: [],
      };
      let inCodeBlock = false;
      let wordCount = 0;
      lines.forEach((line) => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('#')) analysis.metrics.headings++;
        if (trimmedLine.startsWith('```')) { inCodeBlock = !inCodeBlock; if (!inCodeBlock) analysis.metrics.codeBlocks++; }
        if (trimmedLine.includes('[') && trimmedLine.includes('](')) analysis.metrics.links++;
        if (trimmedLine.includes('![') && trimmedLine.includes('](')) analysis.metrics.images++;
        if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ') || trimmedLine.startsWith('1. ')) analysis.metrics.lists++;
        if (trimmedLine.includes('|')) analysis.metrics.tables++;
        if (trimmedLine === '') analysis.metrics.emptyLines++;
        if (!inCodeBlock && trimmedLine !== '') wordCount += trimmedLine.split(/\s+/).length;
      });
      analysis.metrics.wordCount = wordCount;
      if (lines[0] && lines[0].trim() === '---') {
        let idx = 1; const fm = {};
        while (idx < lines.length && lines[idx].trim() !== '---') {
          const m = lines[idx].match(/^(\w[\w\- ]*):\s*(.+)$/);
          if (m) fm[m[1].toLowerCase().trim()] = m[2].trim();
          idx++;
        }
        analysis.quality.hasFrontMatter = true;
        const requiredKeys = ['title', 'created', 'version', 'status', 'next review', 'owner'];
        const missing = requiredKeys.filter((k) => !(k in fm));
        analysis.quality.frontMatterMissing = missing;
        if (missing.length > 0) analysis.issues.push(`Missing front-matter keys: ${missing.join(', ')}`);
      }
      const contentLower = content.toLowerCase();
      analysis.quality.hasTitle = content.includes('# ') || contentLower.includes('title:');
      analysis.quality.hasTableOfContents = contentLower.includes('## table of contents') || contentLower.includes('## contents');
      analysis.quality.hasLastModified = contentLower.includes('last modified') || contentLower.includes('updated:');
      analysis.quality.hasVersion = contentLower.includes('version:') || contentLower.includes('v1.') || contentLower.includes('v2.');
      analysis.quality.hasAuthor = contentLower.includes('author:') || contentLower.includes('by:');
      let completenessScore = 0;
      if (analysis.quality.hasTitle) completenessScore += 20;
      if (analysis.quality.hasTableOfContents) completenessScore += 15;
      if (analysis.quality.hasLastModified) completenessScore += 10;
      if (analysis.quality.hasVersion) completenessScore += 10;
      if (analysis.quality.hasAuthor) completenessScore += 5;
      if (analysis.metrics.headings >= 3) completenessScore += 15;
      if (analysis.metrics.links >= 2) completenessScore += 10;
      if (analysis.metrics.codeBlocks >= 1) completenessScore += 10;
      if (analysis.metrics.wordCount >= 100) completenessScore += 5;
      analysis.quality.completeness = Math.min(100, completenessScore);
      if (analysis.metrics.wordCount < 50) analysis.issues.push('Very short content - may need expansion');
      if (analysis.metrics.headings < 2) analysis.issues.push('Limited structure - consider adding more headings');
      if (analysis.metrics.links === 0) analysis.issues.push('No links found - consider adding references');
      return analysis;
    } catch (e) {
      return { filename: fileInfo.filename, relativePath: fileInfo.relativePath, error: e.message };
    }
  }

  analyzeAllDocumentation() {
    const files = this.findMarkdownFiles();
    const analyses = files.map((f) => this.analyzeMarkdownFile(f));
    const summary = { totalFiles: files.length, totalLines: 0, totalWords: 0, averageCompleteness: 0, qualityDistribution: { excellent: 0, good: 0, fair: 0, poor: 0 }, issues: [], recommendations: [] };
    let totalCompleteness = 0; let valid = 0;
    analyses.forEach((a) => {
      if (!a.error) {
        summary.totalLines += a.totalLines; summary.totalWords += a.metrics.wordCount; totalCompleteness += a.quality.completeness; valid++;
        if (a.quality.completeness >= 90) summary.qualityDistribution.excellent++; else if (a.quality.completeness >= 70) summary.qualityDistribution.good++; else if (a.quality.completeness >= 50) summary.qualityDistribution.fair++; else summary.qualityDistribution.poor++;
        a.issues.forEach((i) => summary.issues.push(`${a.relativePath}: ${i}`));
      }
    });
    if (valid > 0) summary.averageCompleteness = Math.round(totalCompleteness / valid);
    this.analysisResults = { files: analyses, summary, timestamp: new Date().toISOString() };
    return this.analysisResults;
  }
}

module.exports = DocumentationAnalyzer;


