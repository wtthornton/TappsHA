#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function extractCriticalViolations() {
  const reportsDir = path.join(__dirname, '../reports');
  const files = fs.readdirSync(reportsDir);
  
  // Find the most recent compliance report
  const complianceReports = files.filter(f => f.startsWith('compliance-report-') && f.endsWith('.json'));
  if (complianceReports.length === 0) {
    console.log('❌ No compliance reports found');
    return;
  }
  
  // Sort by timestamp (newest first)
  complianceReports.sort().reverse();
  const latestReport = complianceReports[0];
  const reportPath = path.join(reportsDir, latestReport);
  
  console.log(`\n📊 Critical Violations Analysis`);
  console.log(`================================`);
  console.log(`📄 Report: ${latestReport}`);
  console.log(`📅 Processing large report file...`);
  
  try {
    // Read the file in chunks to avoid memory issues
    const fileContent = fs.readFileSync(reportPath, 'utf8');
    
    // Parse the JSON
    const report = JSON.parse(fileContent);
    
    console.log(`✅ Report loaded successfully`);
    console.log(`📊 Report size: ${(fileContent.length / 1024 / 1024).toFixed(2)} MB`);
    
    // Extract violations from the report structure
    let criticalViolations = [];
    
    // Check if violations are in the main report structure
    if (report.violations && Array.isArray(report.violations)) {
      console.log(`🔍 Found ${report.violations.length} total violations in main structure`);
      criticalViolations = report.violations.filter(v => v.type === 'CRITICAL');
    }
    
    // Check if violations are in categories
    if (report.categories && Object.keys(report.categories).length > 0) {
      console.log(`🔍 Checking categories for violations...`);
      Object.entries(report.categories).forEach(([categoryName, category]) => {
        if (category.violations && Array.isArray(category.violations)) {
          const categoryCritical = category.violations.filter(v => v.type === 'CRITICAL');
          criticalViolations.push(...categoryCritical);
          console.log(`   ${categoryName}: ${categoryCritical.length} critical violations`);
        }
      });
    }
    
    console.log(`🚨 Total Critical Violations Found: ${criticalViolations.length}`);
    
    if (criticalViolations.length === 0) {
      console.log(`\n✅ No critical violations found!`);
      return;
    }
    
    // Group violations by category and file
    const violationsByCategory = {};
    const violationsByFile = {};
    
    criticalViolations.forEach(violation => {
      // Group by category
      const category = violation.category || 'Unknown';
      if (!violationsByCategory[category]) {
        violationsByCategory[category] = [];
      }
      violationsByCategory[category].push(violation);
      
      // Group by file
      const file = violation.file || 'Unknown';
      if (!violationsByFile[file]) {
        violationsByFile[file] = [];
      }
      violationsByFile[file].push(violation);
    });
    
    console.log(`\n📋 Critical Violations by Category:`);
    console.log(`----------------------------------------`);
    Object.entries(violationsByCategory)
      .sort(([,a], [,b]) => b.length - a.length)
      .forEach(([category, violations]) => {
        console.log(`${category}: ${violations.length} violations`);
      });
    
    console.log(`\n📁 Top 20 Critical Violations by File:`);
    console.log(`----------------------------------------`);
    Object.entries(violationsByFile)
      .sort(([,a], [,b]) => b.length - a.length)
      .slice(0, 20)
      .forEach(([file, violations], index) => {
        console.log(`${index + 1}. ${file}: ${violations.length} violations`);
      });
    
    console.log(`\n🚨 Top 20 Critical Violations (Detailed):`);
    console.log(`=========================================`);
    criticalViolations
      .slice(0, 20)
      .forEach((violation, index) => {
        console.log(`\n${index + 1}. ${violation.category || 'Unknown Category'}`);
        console.log(`   File: ${violation.file || 'Unknown'}`);
        console.log(`   Line: ${violation.line || 'Unknown'}`);
        console.log(`   Message: ${violation.message || 'No message'}`);
        if (violation.suggestion) {
          console.log(`   Suggestion: ${violation.suggestion}`);
        }
      });
    
    // Summary statistics
    console.log(`\n📈 Summary Statistics:`);
    console.log(`----------------------`);
    console.log(`Total Critical Violations: ${criticalViolations.length}`);
    console.log(`Categories Affected: ${Object.keys(violationsByCategory).length}`);
    console.log(`Files Affected: ${Object.keys(violationsByFile).length}`);
    
    const mostCommonCategory = Object.entries(violationsByCategory)
      .sort(([,a], [,b]) => b.length - a.length)[0];
    
    const mostCommonFile = Object.entries(violationsByFile)
      .sort(([,a], [,b]) => b.length - a.length)[0];
    
    if (mostCommonCategory) {
      console.log(`Most Common Category: ${mostCommonCategory[0]} (${mostCommonCategory[1].length} violations)`);
    }
    
    if (mostCommonFile) {
      console.log(`Most Common File: ${mostCommonFile[0]} (${mostCommonFile[1].length} violations)`);
    }
    
    // Check if violations are mostly from node_modules
    const nodeModulesViolations = criticalViolations.filter(v => 
      v.file && v.file.includes('node_modules')
    );
    
    if (nodeModulesViolations.length > 0) {
      console.log(`\n⚠️  Note: ${nodeModulesViolations.length} critical violations are from node_modules`);
      console.log(`   These are external dependencies and not part of your project code.`);
      console.log(`   Consider excluding node_modules from compliance checks.`);
    }
    
  } catch (error) {
    console.error('❌ Error reading compliance report:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the extraction
extractCriticalViolations(); 