/**
 * Documentation Analysis Module
 * Analyzes all Markdown files in .agent-os directory for completeness and quality
 * Uses vanilla JavaScript with no external dependencies
 */

const fs = require('fs');
const path = require('path');

class DocumentationAnalyzer {
  constructor() {
    this.agentOsPath = path.join(__dirname, '..');
    this.markdownFiles = [];
    this.analysisResults = {};
  }

  // Find all Markdown files in .agent-os directory
  findMarkdownFiles() {
    const markdownFiles = [];
    
    const scanDirectory = (dir) => {
      try {
        const items = fs.readdirSync(dir);
        
        items.forEach(item => {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            // Skip node_modules and other non-documentation directories
            if (!item.startsWith('.') && item !== 'node_modules' && item !== 'target' && item !== 'dist') {
              scanDirectory(fullPath);
            }
          } else if (item.endsWith('.md')) {
            markdownFiles.push({
              path: fullPath,
              relativePath: path.relative(this.agentOsPath, fullPath),
              filename: item
            });
          }
        });
      } catch (error) {
        console.warn(`⚠️  Could not scan directory ${dir}:`, error.message);
      }
    };

    scanDirectory(this.agentOsPath);
    this.markdownFiles = markdownFiles;
    return markdownFiles;
  }

  // Analyze individual Markdown file
  analyzeMarkdownFile(fileInfo) {
    try {
      const content = fs.readFileSync(fileInfo.path, 'utf8');
      const lines = content.split('\n');
      
      const analysis = {
        filename: fileInfo.filename,
        relativePath: fileInfo.relativePath,
        totalLines: lines.length,
        totalCharacters: content.length,
        lastModified: fs.statSync(fileInfo.path).mtime,
        metrics: {
          headings: 0,
          codeBlocks: 0,
          links: 0,
          images: 0,
          lists: 0,
          tables: 0,
          emptyLines: 0,
          wordCount: 0
        },
        quality: {
          hasTitle: false,
          hasTableOfContents: false,
          hasLastModified: false,
          hasVersion: false,
          hasAuthor: false,
          completeness: 0
        },
        issues: []
      };

      let inCodeBlock = false;
      let wordCount = 0;

      lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        
        // Count different elements
        if (trimmedLine.startsWith('#')) {
          analysis.metrics.headings++;
        }
        
        if (trimmedLine.startsWith('```')) {
          inCodeBlock = !inCodeBlock;
          if (!inCodeBlock) {
            analysis.metrics.codeBlocks++;
          }
        }
        
        if (trimmedLine.includes('[') && trimmedLine.includes('](')) {
          analysis.metrics.links++;
        }
        
        if (trimmedLine.includes('![') && trimmedLine.includes('](')) {
          analysis.metrics.images++;
        }
        
        if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ') || trimmedLine.startsWith('1. ')) {
          analysis.metrics.lists++;
        }
        
        if (trimmedLine.includes('|') && trimmedLine.includes('|')) {
          analysis.metrics.tables++;
        }
        
        if (trimmedLine === '') {
          analysis.metrics.emptyLines++;
        }
        
        // Count words (simple approach)
        if (!inCodeBlock && trimmedLine !== '') {
          wordCount += trimmedLine.split(/\s+/).length;
        }
      });

      analysis.metrics.wordCount = wordCount;

      // Analyze quality indicators
      const contentLower = content.toLowerCase();
      analysis.quality.hasTitle = content.includes('# ') || content.includes('title:');
      analysis.quality.hasTableOfContents = content.includes('## table of contents') || content.includes('## contents');
      analysis.quality.hasLastModified = content.includes('last modified') || content.includes('updated:');
      analysis.quality.hasVersion = content.includes('version:') || content.includes('v1.') || content.includes('v2.');
      analysis.quality.hasAuthor = content.includes('author:') || content.includes('by:');

      // Calculate completeness score
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

      // Identify potential issues
      if (analysis.metrics.wordCount < 50) {
        analysis.issues.push('Very short content - may need expansion');
      }
      
      if (analysis.metrics.headings < 2) {
        analysis.issues.push('Limited structure - consider adding more headings');
      }
      
      if (analysis.metrics.links === 0) {
        analysis.issues.push('No links found - consider adding references');
      }
      
      if (analysis.metrics.codeBlocks === 0 && fileInfo.filename.includes('code')) {
        analysis.issues.push('Code-related file has no code examples');
      }

      return analysis;
    } catch (error) {
      console.warn(`⚠️  Could not analyze file ${fileInfo.path}:`, error.message);
      return {
        filename: fileInfo.filename,
        relativePath: fileInfo.relativePath,
        error: error.message
      };
    }
  }

  // Analyze all documentation
  analyzeAllDocumentation() {
    const files = this.findMarkdownFiles();
    const analyses = files.map(file => this.analyzeMarkdownFile(file));
    
    const summary = {
      totalFiles: files.length,
      totalLines: 0,
      totalWords: 0,
      averageCompleteness: 0,
      qualityDistribution: {
        excellent: 0, // 90-100%
        good: 0,      // 70-89%
        fair: 0,      // 50-69%
        poor: 0       // <50%
      },
      issues: [],
      recommendations: []
    };

    let totalCompleteness = 0;
    let validAnalyses = 0;

    analyses.forEach(analysis => {
      if (!analysis.error) {
        summary.totalLines += analysis.totalLines;
        summary.totalWords += analysis.metrics.wordCount;
        totalCompleteness += analysis.quality.completeness;
        validAnalyses++;

        // Categorize by quality
        if (analysis.quality.completeness >= 90) summary.qualityDistribution.excellent++;
        else if (analysis.quality.completeness >= 70) summary.qualityDistribution.good++;
        else if (analysis.quality.completeness >= 50) summary.qualityDistribution.fair++;
        else summary.qualityDistribution.poor++;

        // Collect issues
        analysis.issues.forEach(issue => {
          summary.issues.push(`${analysis.relativePath}: ${issue}`);
        });
      }
    });

    if (validAnalyses > 0) {
      summary.averageCompleteness = Math.round(totalCompleteness / validAnalyses);
    }

    // Generate recommendations
    if (summary.qualityDistribution.poor > 0) {
      summary.recommendations.push('Focus on improving poor quality documentation first');
    }
    
    if (summary.averageCompleteness < 70) {
      summary.recommendations.push('Overall documentation completeness needs improvement');
    }
    
    if (summary.issues.length > 10) {
      summary.recommendations.push('Many documentation issues detected - prioritize fixes');
    }

    this.analysisResults = {
      files: analyses,
      summary: summary,
      timestamp: new Date().toISOString()
    };

    return this.analysisResults;
  }

  // Generate documentation improvement suggestions
  generateImprovementSuggestions() {
    if (!this.analysisResults.files) {
      return [];
    }

    const suggestions = [];
    const lowQualityFiles = this.analysisResults.files.filter(f => 
      !f.error && f.quality.completeness < 60
    );

    lowQualityFiles.forEach(file => {
      suggestions.push({
        priority: file.quality.completeness < 30 ? 'HIGH' : 'MEDIUM',
        file: file.relativePath,
        completeness: file.quality.completeness,
        issues: file.issues,
        recommendations: this.generateFileRecommendations(file)
      });
    });

    return suggestions;
  }

  // Generate specific recommendations for a file
  generateFileRecommendations(fileAnalysis) {
    const recommendations = [];

    if (!fileAnalysis.quality.hasTitle) {
      recommendations.push('Add a clear title at the top');
    }

    if (!fileAnalysis.quality.hasTableOfContents && fileAnalysis.metrics.headings > 3) {
      recommendations.push('Add a table of contents for better navigation');
    }

    if (fileAnalysis.metrics.wordCount < 100) {
      recommendations.push('Expand content with more detailed explanations');
    }

    if (fileAnalysis.metrics.links === 0) {
      recommendations.push('Add relevant links to related documentation');
    }

    if (fileAnalysis.metrics.codeBlocks === 0 && fileAnalysis.filename.includes('code')) {
      recommendations.push('Add code examples to illustrate concepts');
    }

    if (!fileAnalysis.quality.hasLastModified) {
      recommendations.push('Add last modified date for maintenance tracking');
    }

    return recommendations;
  }

  // Generate documentation report
  generateDocumentationReport() {
    const analysis = this.analyzeAllDocumentation();
    const suggestions = this.generateImprovementSuggestions();

    const report = {
      ...analysis,
      suggestions: suggestions,
      generatedAt: new Date().toISOString()
    };

    const reportPath = path.join(__dirname, '../reports/documentation-analysis.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log('📄 Documentation analysis saved to: .agent-os/reports/documentation-analysis.json');

    return report;
  }

  // Display documentation analysis summary
  displaySummary() {
    const analysis = this.analysisResults;
    if (!analysis) return;

    console.log('\n📚 Documentation Analysis Summary');
    console.log('================================');
    console.log(`Total Files: ${analysis.summary.totalFiles}`);
    console.log(`Total Lines: ${analysis.summary.totalLines}`);
    console.log(`Total Words: ${analysis.summary.totalWords}`);
    console.log(`Average Completeness: ${analysis.summary.averageCompleteness}%`);
    
    console.log('\nQuality Distribution:');
    console.log(`  Excellent (90-100%): ${analysis.summary.qualityDistribution.excellent}`);
    console.log(`  Good (70-89%): ${analysis.summary.qualityDistribution.good}`);
    console.log(`  Fair (50-69%): ${analysis.summary.qualityDistribution.fair}`);
    console.log(`  Poor (<50%): ${analysis.summary.qualityDistribution.poor}`);

    if (analysis.summary.issues.length > 0) {
      console.log('\n⚠️  Issues Found:');
      analysis.summary.issues.slice(0, 5).forEach(issue => {
        console.log(`  - ${issue}`);
      });
      if (analysis.summary.issues.length > 5) {
        console.log(`  ... and ${analysis.summary.issues.length - 5} more issues`);
      }
    }

    if (analysis.summary.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      analysis.summary.recommendations.forEach(rec => {
        console.log(`  - ${rec}`);
      });
    }
  }
}

module.exports = DocumentationAnalyzer; 