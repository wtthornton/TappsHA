#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class ProductionDeployment {
  constructor() {
    this.sourceDir = path.join(__dirname, '..');
    this.reportsDir = path.join(this.sourceDir, 'reports');
    this.deploymentFile = path.join(this.reportsDir, 'production-deployment.json');
  }

  async run() {
    console.log('🚀 Starting Production Deployment for Lessons Learned Framework...');
    
    try {
      // 1. Run all core tools
      const results = await this.runCoreTools();
      
      // 2. Generate production report
      await this.generateProductionReport(results);
      
      // 3. Create deployment summary
      await this.createDeploymentSummary(results);
      
      console.log('🎉 Production Deployment completed!');
      console.log('📊 Framework is ready for production feedback');
      
      return {
        success: true,
        toolsDeployed: results.length,
        totalLessons: results.reduce((sum, r) => sum + (r.totalLessons || 0), 0),
        averageQuality: results.reduce((sum, r) => sum + (r.qualityScore || 0), 0) / results.length
      };
    } catch (error) {
      console.error('❌ Production Deployment failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async runCoreTools() {
    const results = [];
    
    // Import and run each core tool
    const tools = [
      { name: 'Lesson Categorizer', module: './lesson-categorizer.js' },
      { name: 'Lesson Quality Validator', module: './lesson-quality-validator.js' },
      { name: 'Lesson Template Generator', module: './lesson-template-generator.js' },
      { name: 'Lesson Impact Tracker', module: './lesson-impact-tracker.js' }
    ];
    
    for (const tool of tools) {
      try {
        console.log(`🔧 Running ${tool.name}...`);
        const ToolClass = require(tool.module);
        const toolInstance = new ToolClass();
        const result = await toolInstance.run();
        
        results.push({
          tool: tool.name,
          success: result.success,
          ...result
        });
        
        console.log(`✅ ${tool.name} completed successfully`);
      } catch (error) {
        console.error(`❌ ${tool.name} failed:`, error.message);
        results.push({
          tool: tool.name,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }

  async generateProductionReport(results) {
    const report = {
      deploymentTimestamp: new Date().toISOString(),
      summary: {
        totalTools: results.length,
        successfulTools: results.filter(r => r.success).length,
        failedTools: results.filter(r => !r.success).length,
        overallSuccess: results.every(r => r.success)
      },
      toolResults: results.map(result => ({
        tool: result.tool,
        success: result.success,
        totalLessons: result.totalLessons || 0,
        qualityScore: result.qualityScore || 0,
        impactScore: result.impactScore || 0,
        error: result.error || null
      })),
      productionMetrics: this.calculateProductionMetrics(results),
      deploymentStatus: this.assessDeploymentStatus(results)
    };
    
    const reportPath = path.join(this.reportsDir, 'production-report.json');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📊 Generated production report: ${reportPath}`);
  }

  calculateProductionMetrics(results) {
    const successfulResults = results.filter(r => r.success);
    
    return {
      averageQualityScore: successfulResults.length > 0 
        ? Math.round(successfulResults.reduce((sum, r) => sum + (r.qualityScore || 0), 0) / successfulResults.length)
        : 0,
      averageImpactScore: successfulResults.length > 0 
        ? Math.round(successfulResults.reduce((sum, r) => sum + (r.impactScore || 0), 0) / successfulResults.length)
        : 0,
      totalLessonsProcessed: successfulResults.reduce((sum, r) => sum + (r.totalLessons || 0), 0),
      toolSuccessRate: Math.round((successfulResults.length / results.length) * 100)
    };
  }

  assessDeploymentStatus(results) {
    const successfulTools = results.filter(r => r.success).length;
    const totalTools = results.length;
    
    if (successfulTools === totalTools) {
      return {
        status: 'READY_FOR_PRODUCTION',
        message: 'All tools deployed successfully. Framework is production-ready.',
        confidence: 'HIGH'
      };
    } else if (successfulTools >= totalTools * 0.75) {
      return {
        status: 'MOSTLY_READY',
        message: 'Most tools deployed successfully. Minor issues to address.',
        confidence: 'MEDIUM'
      };
    } else {
      return {
        status: 'NEEDS_ATTENTION',
        message: 'Multiple tool failures. Review and fix before production.',
        confidence: 'LOW'
      };
    }
  }

  async createDeploymentSummary(results) {
    const summary = {
      deploymentDate: new Date().toISOString(),
      framework: 'Agent OS Lessons Learned Framework',
      version: '1.0.0',
      status: this.assessDeploymentStatus(results).status,
      tools: results.map(result => ({
        name: result.tool,
        status: result.success ? 'DEPLOYED' : 'FAILED',
        metrics: {
          lessonsProcessed: result.totalLessons || 0,
          qualityScore: result.qualityScore || 0,
          impactScore: result.impactScore || 0
        }
      })),
      productionReadiness: {
        categorization: results.find(r => r.tool === 'Lesson Categorizer')?.success || false,
        qualityValidation: results.find(r => r.tool === 'Lesson Quality Validator')?.success || false,
        templateGeneration: results.find(r => r.tool === 'Lesson Template Generator')?.success || false,
        impactTracking: results.find(r => r.tool === 'Lesson Impact Tracker')?.success || false
      },
      nextSteps: [
        'Deploy to production environment',
        'Monitor tool performance and usage',
        'Collect user feedback on production deployment',
        'Implement additional analytics and search features',
        'Optimize based on production usage patterns'
      ]
    };
    
    const summaryPath = path.join(this.reportsDir, 'deployment-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    console.log(`📋 Created deployment summary: ${summaryPath}`);
  }

  // Additional utility methods
  getProductionStatus() {
    try {
      const reportPath = path.join(this.reportsDir, 'production-report.json');
      if (fs.existsSync(reportPath)) {
        const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
        return report.deploymentStatus;
      }
    } catch (error) {
      console.warn('⚠️ Failed to load production status:', error.message);
    }
    
    return {
      status: 'UNKNOWN',
      message: 'Production status not available',
      confidence: 'UNKNOWN'
    };
  }

  getToolMetrics(toolName) {
    try {
      const reportPath = path.join(this.reportsDir, 'production-report.json');
      if (fs.existsSync(reportPath)) {
        const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
        const toolResult = report.toolResults.find(r => r.tool === toolName);
        return toolResult || null;
      }
    } catch (error) {
      console.warn('⚠️ Failed to load tool metrics:', error.message);
    }
    
    return null;
  }

  generateProductionReadinessReport() {
    const status = this.getProductionStatus();
    const metrics = {
      categorization: this.getToolMetrics('Lesson Categorizer'),
      qualityValidation: this.getToolMetrics('Lesson Quality Validator'),
      templateGeneration: this.getToolMetrics('Lesson Template Generator'),
      impactTracking: this.getToolMetrics('Lesson Impact Tracker')
    };
    
    return {
      timestamp: new Date().toISOString(),
      status: status.status,
      message: status.message,
      confidence: status.confidence,
      toolMetrics: metrics,
      recommendations: this.generateRecommendations(status, metrics)
    };
  }

  generateRecommendations(status, metrics) {
    const recommendations = [];
    
    if (status.status === 'READY_FOR_PRODUCTION') {
      recommendations.push('Deploy to production immediately');
      recommendations.push('Monitor performance and usage metrics');
      recommendations.push('Collect user feedback for improvements');
    } else if (status.status === 'MOSTLY_READY') {
      recommendations.push('Address failed tools before production deployment');
      recommendations.push('Review error logs and fix issues');
      recommendations.push('Re-run deployment after fixes');
    } else {
      recommendations.push('Review all tool failures');
      recommendations.push('Fix critical issues before deployment');
      recommendations.push('Consider partial deployment of working tools');
    }
    
    return recommendations;
  }
}

// Run the deployment
if (require.main === module) {
  const deployment = new ProductionDeployment();
  deployment.run().catch(console.error);
}

module.exports = ProductionDeployment; 