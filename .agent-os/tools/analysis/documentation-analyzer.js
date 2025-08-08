/**
 * Documentation Analysis Module
 * Analyzes all Markdown files in .agent-os directory for completeness and quality
 * Uses vanilla JavaScript with no external dependencies
 */

const fs = require('fs');
const path = require('path');

const IGNORE_DIRS = new Set(['node_modules', 'target', 'dist', 'build', 'coverage', '.git']);

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
            // Skip ignored and hidden directories
            if (!IGNORE_DIRS.has(item)) {
              scanDirectory(fullPath);
            }
          } else if (item.endsWith('.md')) {
            markdownFiles.push({
              path: fullPath,
              relativePath: path.relative(this.agentOsPath, fullPath),
              filename: item,
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
          wordCount: 0,
        },
        quality: {
          hasTitle: false,
          hasTableOfContents: false,
          hasLastModified: false,
          hasVersion: false,
          hasAuthor: false,
          hasFrontMatter: false,
          frontMatterMissing: [],
          completeness: 0,
        },
        issues: [],
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

      // Front-matter check (YAML-like)
      if (lines[0] && lines[0].trim() === '---') {
        let idx = 1;
        const fm = {};
        while (idx < lines.length && lines[idx].trim() !== '---') {
          const line = lines[idx];
          const m = line.match(/^(\w[\w\- ]*):\s*(.+)$/);
          if (m) {
            fm[m[1].toLowerCase().trim()] = m[2].trim();
          }
          idx++;
        }
        analysis.quality.hasFrontMatter = true;
        const requiredKeys = ['title', 'created', 'version', 'status', 'next review', 'owner'];
        const missing = requiredKeys.filter(k => !(k in fm));
        analysis.quality.frontMatterMissing = missing;
        if (missing.length > 0) {
          analysis.issues.push(`Missing front-matter keys: ${missing.join(', ')}`);
        }
      }

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
        error: error.message,
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
        poor: 0,       // <50%
      },
      issues: [],
      recommendations: [],
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
      timestamp: new Date().toISOString(),
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
      !f.error && f.quality.completeness < 60,
    );

    lowQualityFiles.forEach(file => {
      suggestions.push({
        priority: file.quality.completeness < 30 ? 'HIGH' : 'MEDIUM',
        file: file.relativePath,
        completeness: file.quality.completeness,
        issues: file.issues,
        recommendations: this.generateFileRecommendations(file),
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
      generatedAt: new Date().toISOString(),
    };

    const reportPath = path.join(__dirname, '../reports/documentation-analysis.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log('📄 Documentation analysis saved to: .agent-os/reports/documentation-analysis.json');

    return report;
  }

// Allow running directly as a quick check
// Skip direct-run block in ESM context
try {
  if (typeof require !== 'undefined' && require.main === module) {
  try {
    const analyzer = new DocumentationAnalyzer();
    const report = analyzer.generateDocumentationReport();
    analyzer.displaySummary();
    process.exit(0);
  } catch (e) {
    console.error('Documentation analysis failed:', e.message);
    process.exit(1);
  }
  }
} catch (_e) {
  // noop for ESM environments
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

  // Enhanced: Track which standards are referenced most
  trackStandardsReferences() {
    if (!this.analysisResults.files) {
      return {
        message: 'No documentation analysis available',
        standardsTracking: {},
        referenceCounts: {},
        mostReferenced: [],
        leastReferenced: [],
        recommendations: [],
      };
    }

    const standardsTracking = {};
    const referenceCounts = {};
    const recommendations = [];

    // Define common standards patterns
    const standardsPatterns = {
      'Code Style': ['code style', 'coding standards', 'style guide', 'formatting', 'indentation', 'naming conventions'],
      'Security': ['security', 'authentication', 'authorization', 'encryption', 'vulnerability', 'OWASP', 'security compliance'],
      'Architecture': ['architecture', 'design patterns', 'layered architecture', 'microservices', 'API design', 'system design'],
      'Testing': ['testing', 'unit tests', 'integration tests', 'test coverage', 'TDD', 'BDD', 'test strategy'],
      'Performance': ['performance', 'optimization', 'scalability', 'response time', 'throughput', 'efficiency'],
      'Documentation': ['documentation', 'README', 'API docs', 'user guide', 'technical writing'],
      'CI/CD': ['CI/CD', 'continuous integration', 'deployment', 'pipeline', 'automation', 'DevOps'],
      'Monitoring': ['monitoring', 'logging', 'observability', 'metrics', 'alerting', 'health checks'],
      'Compliance': ['compliance', 'standards', 'regulations', 'audit', 'governance', 'policies'],
      'Best Practices': ['best practices', 'guidelines', 'recommendations', 'patterns', 'principles'],
    };

    // Analyze each file for standards references
    this.analysisResults.files.forEach(file => {
      if (file.error) return;

      const content = fs.readFileSync(file.path, 'utf8').toLowerCase();
      const lines = content.split('\n');
      
      Object.entries(standardsPatterns).forEach(([standard, patterns]) => {
        let count = 0;
        
        patterns.forEach(pattern => {
          // Count pattern occurrences
          const regex = new RegExp(pattern, 'gi');
          const matches = content.match(regex);
          if (matches) {
            count += matches.length;
          }
        });

        if (count > 0) {
          if (!standardsTracking[standard]) {
            standardsTracking[standard] = {
              totalReferences: 0,
              filesReferenced: [],
              averageReferencesPerFile: 0,
              usageFrequency: 'LOW',
            };
          }

          standardsTracking[standard].totalReferences += count;
          standardsTracking[standard].filesReferenced.push({
            file: file.relativePath,
            references: count,
          });
        }
      });
    });

    // Calculate averages and categorize usage frequency
    Object.entries(standardsTracking).forEach(([standard, data]) => {
      data.averageReferencesPerFile = data.totalReferences / data.filesReferenced.length;
      
      if (data.totalReferences >= 20) {
        data.usageFrequency = 'HIGH';
      } else if (data.totalReferences >= 10) {
        data.usageFrequency = 'MEDIUM';
      } else {
        data.usageFrequency = 'LOW';
      }
    });

    // Generate reference counts for all standards
    Object.keys(standardsPatterns).forEach(standard => {
      referenceCounts[standard] = standardsTracking[standard]?.totalReferences || 0;
    });

    // Identify most and least referenced standards
    const sortedStandards = Object.entries(referenceCounts)
      .sort(([,a], [,b]) => b - a);

    const mostReferenced = sortedStandards.slice(0, 5).map(([standard, count]) => ({
      standard,
      references: count,
      frequency: standardsTracking[standard]?.usageFrequency || 'LOW',
    }));

    const leastReferenced = sortedStandards.slice(-5).map(([standard, count]) => ({
      standard,
      references: count,
      frequency: standardsTracking[standard]?.usageFrequency || 'LOW',
    }));

    // Generate recommendations
    if (leastReferenced.length > 0) {
      recommendations.push({
        type: 'UNDER_UTILIZED_STANDARDS',
        priority: 'MEDIUM',
        description: 'Some standards are rarely referenced',
        actions: [
          'Review and update documentation for under-utilized standards',
          'Consider if standards are still relevant',
          'Add references to important standards in key documentation',
        ],
        standards: leastReferenced.map(s => s.standard),
      });
    }

    if (mostReferenced.length > 0) {
      recommendations.push({
        type: 'WELL_UTILIZED_STANDARDS',
        priority: 'LOW',
        description: 'Standards are well referenced',
        actions: [
          'Maintain current standards documentation',
          'Ensure standards remain up-to-date',
          'Share best practices for well-utilized standards',
        ],
        standards: mostReferenced.map(s => s.standard),
      });
    }

    return {
      standardsTracking,
      referenceCounts,
      mostReferenced,
      leastReferenced,
      recommendations,
      totalStandards: Object.keys(standardsPatterns).length,
      totalReferences: Object.values(referenceCounts).reduce((sum, count) => sum + count, 0),
    };
  }

  // Enhanced: Identify standards that need clarification
  identifyStandardsNeedingClarification() {
    if (!this.analysisResults.files) {
      return {
        message: 'No documentation analysis available',
        clarificationNeeds: {},
        priorityStandards: [],
        recommendations: [],
      };
    }

    const clarificationNeeds = {};
    const recommendations = [];

    // Define standards that commonly need clarification
    const standardsToCheck = {
      'Code Style': {
        patterns: ['code style', 'coding standards', 'style guide'],
        clarificationIndicators: ['unclear', 'confusing', 'unclear', 'ambiguous', 'vague', 'needs clarification'],
        priority: 'HIGH',
      },
      'Security': {
        patterns: ['security', 'authentication', 'authorization'],
        clarificationIndicators: ['security risk', 'vulnerability', 'security concern', 'needs review'],
        priority: 'CRITICAL',
      },
      'Architecture': {
        patterns: ['architecture', 'design patterns', 'system design'],
        clarificationIndicators: ['architectural decision', 'design choice', 'needs explanation'],
        priority: 'HIGH',
      },
      'Testing': {
        patterns: ['testing', 'test strategy', 'test coverage'],
        clarificationIndicators: ['test requirement', 'testing approach', 'coverage target'],
        priority: 'MEDIUM',
      },
      'Performance': {
        patterns: ['performance', 'optimization', 'scalability'],
        clarificationIndicators: ['performance target', 'optimization goal', 'scalability requirement'],
        priority: 'MEDIUM',
      },
    };

    // Analyze each file for clarification needs
    this.analysisResults.files.forEach(file => {
      if (file.error) return;

      const content = fs.readFileSync(file.path, 'utf8');
      const lines = content.split('\n');
      
      Object.entries(standardsToCheck).forEach(([standard, config]) => {
        let hasStandardReference = false;
        let hasClarificationNeed = false;
        const clarificationIssues = [];

        // Check for standard references
        config.patterns.forEach(pattern => {
          const regex = new RegExp(pattern, 'gi');
          if (regex.test(content)) {
            hasStandardReference = true;
          }
        });

        // Check for clarification indicators
        config.clarificationIndicators.forEach(indicator => {
          const regex = new RegExp(indicator, 'gi');
          const matches = content.match(regex);
          if (matches) {
            hasClarificationNeed = true;
            clarificationIssues.push(`${indicator}: ${matches.length} occurrences`);
          }
        });

        if (hasStandardReference && hasClarificationNeed) {
          if (!clarificationNeeds[standard]) {
            clarificationNeeds[standard] = {
              priority: config.priority,
              filesWithIssues: [],
              totalIssues: 0,
              clarificationScore: 0,
            };
          }

          clarificationNeeds[standard].filesWithIssues.push({
            file: file.relativePath,
            issues: clarificationIssues,
            issueCount: clarificationIssues.length,
          });

          clarificationNeeds[standard].totalIssues += clarificationIssues.length;
        }
      });
    });

    // Calculate clarification scores and prioritize
    Object.entries(clarificationNeeds).forEach(([standard, data]) => {
      data.clarificationScore = Math.min(100, (data.totalIssues * 10) + (data.filesWithIssues.length * 5));
    });

    // Generate priority standards list
    const priorityStandards = Object.entries(clarificationNeeds)
      .sort(([,a], [,b]) => {
        // Sort by priority first, then by clarification score
        const priorityOrder = { 'CRITICAL': 3, 'HIGH': 2, 'MEDIUM': 1, 'LOW': 0 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        return priorityDiff !== 0 ? priorityDiff : b.clarificationScore - a.clarificationScore;
      })
      .map(([standard, data]) => ({
        standard,
        priority: data.priority,
        clarificationScore: data.clarificationScore,
        filesWithIssues: data.filesWithIssues.length,
        totalIssues: data.totalIssues,
      }));

    // Generate recommendations
    priorityStandards.slice(0, 3).forEach(standard => {
      recommendations.push({
        type: 'STANDARD_CLARIFICATION_NEEDED',
        priority: standard.priority,
        standard: standard.standard,
        description: `${standard.standard} needs clarification in ${standard.filesWithIssues} files`,
        actions: [
          `Review and clarify ${standard.standard} documentation`,
          'Add specific examples and guidelines',
          'Create clear implementation instructions',
          `Establish review process for ${standard.standard} compliance`,
        ],
        urgency: standard.priority === 'CRITICAL' ? 'IMMEDIATE' : 
          standard.priority === 'HIGH' ? 'SHORT_TERM' : 'ONGOING',
      });
    });

    if (priorityStandards.length === 0) {
      recommendations.push({
        type: 'STANDARDS_CLARITY_GOOD',
        priority: 'LOW',
        description: 'Standards documentation appears clear and well-defined',
        actions: [
          'Maintain current standards documentation quality',
          'Continue regular standards review process',
          'Monitor for emerging clarification needs',
        ],
      });
    }

    return {
      clarificationNeeds,
      priorityStandards,
      recommendations,
      totalStandardsNeedingClarification: priorityStandards.length,
      averageClarificationScore: priorityStandards.length > 0 ? 
        Math.round(priorityStandards.reduce((sum, s) => sum + s.clarificationScore, 0) / priorityStandards.length) : 0,
    };
  }

  // Enhanced: Generate comprehensive standards analysis report
  generateStandardsAnalysisReport() {
    const referenceTracking = this.trackStandardsReferences();
    const clarificationAnalysis = this.identifyStandardsNeedingClarification();

    const report = {
      referenceTracking,
      clarificationAnalysis,
      summary: {
        totalStandards: referenceTracking.totalStandards,
        totalReferences: referenceTracking.totalReferences,
        standardsNeedingClarification: clarificationAnalysis.totalStandardsNeedingClarification,
        averageClarificationScore: clarificationAnalysis.averageClarificationScore,
      },
      generatedAt: new Date().toISOString(),
    };

    const reportPath = path.join(__dirname, '../reports/standards-analysis.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log('📊 Standards analysis report saved to: .agent-os/reports/standards-analysis.json');

    return report;
  }

  // Enhanced: Display standards analysis summary
  displayStandardsSummary() {
    const referenceTracking = this.trackStandardsReferences();
    const clarificationAnalysis = this.identifyStandardsNeedingClarification();

    console.log('\n📊 Standards Analysis Summary');
    console.log('============================');
    console.log(`Total Standards: ${referenceTracking.totalStandards}`);
    console.log(`Total References: ${referenceTracking.totalReferences}`);
    console.log(`Standards Needing Clarification: ${clarificationAnalysis.totalStandardsNeedingClarification}`);
    console.log(`Average Clarification Score: ${clarificationAnalysis.averageClarificationScore}%`);

    if (referenceTracking.mostReferenced.length > 0) {
      console.log('\n🏆 Most Referenced Standards:');
      referenceTracking.mostReferenced.forEach((standard, index) => {
        console.log(`  ${index + 1}. ${standard.standard}: ${standard.references} references (${standard.frequency})`);
      });
    }

    if (referenceTracking.leastReferenced.length > 0) {
      console.log('\n⚠️  Least Referenced Standards:');
      referenceTracking.leastReferenced.forEach((standard, index) => {
        console.log(`  ${index + 1}. ${standard.standard}: ${standard.references} references (${standard.frequency})`);
      });
    }

    if (clarificationAnalysis.priorityStandards.length > 0) {
      console.log('\n🔍 Standards Needing Clarification:');
      clarificationAnalysis.priorityStandards.slice(0, 5).forEach((standard, index) => {
        console.log(`  ${index + 1}. ${standard.standard}: ${standard.clarificationScore}% clarity score (${standard.priority})`);
      });
    }

    if (clarificationAnalysis.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      clarificationAnalysis.recommendations.forEach(rec => {
        console.log(`  - ${rec.description}`);
      });
    }
  }
}

module.exports = DocumentationAnalyzer; 