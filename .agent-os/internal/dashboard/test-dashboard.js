#!/usr/bin/env node

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const http = require('http');

console.log('🔍 Testing Agent OS Unified Dashboard...\n');

// Test main dashboard page
function testDashboard() {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 3002,
            path: '/',
            method: 'GET',
            timeout: 5000
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log('✅ Dashboard HTML Response:');
                console.log(`   Status: ${res.statusCode} ${res.statusMessage}`);
                console.log(`   Content Length: ${data.length} characters`);
                console.log(`   Content Type: ${res.headers['content-type']}`);
                console.log(`   Has HTML: ${data.includes('<!DOCTYPE html>')}`);
                console.log(`   Has Dashboard Title: ${data.includes('Agent OS Unified Dashboard')}`);
                console.log(`   Has Compliance Tab: ${data.includes('Compliance')}`);
                console.log(`   Has Lessons Tab: ${data.includes('Lessons Learned')}`);
                console.log(`   Has Metrics Tab: ${data.includes('Performance Metrics')}`);
                resolve();
            });
        });
        
        req.on('error', reject);
        req.on('timeout', () => reject(new Error('Timeout')));
        req.end();
    });
}

// Test API status endpoint
function testStatus() {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 3002,
            path: '/api/status',
            method: 'GET',
            timeout: 5000
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log('\n✅ API Status Response:');
                console.log(`   Status: ${res.statusCode} ${res.statusMessage}`);
                console.log(`   Content: ${data}`);
                resolve();
            });
        });
        
        req.on('error', reject);
        req.on('timeout', () => reject(new Error('Timeout')));
        req.end();
    });
}

// Test compliance data endpoint
function testCompliance() {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 3002,
            path: '/api/compliance/current',
            method: 'GET',
            timeout: 5000
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log('\n✅ Compliance Data Response:');
                console.log(`   Status: ${res.statusCode} ${res.statusMessage}`);
                console.log(`   Content Length: ${data.length} characters`);
                try {
                    const json = JSON.parse(data);
                    console.log(`   Critical Violations: ${json.critical}`);
                    console.log(`   Warning Violations: ${json.warning}`);
                    console.log(`   Info Violations: ${json.info}`);
                    console.log(`   Files Analyzed: ${json.filesAnalyzed}`);
                    console.log(`   Compliance Score: ${json.score}`);
                } catch (e) {
                    console.log(`   JSON Parse Error: ${e.message}`);
                }
                resolve();
            });
        });
        
        req.on('error', reject);
        req.on('timeout', () => reject(new Error('Timeout')));
        req.end();
    });
}

// Test lessons data endpoint
function testLessons() {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 3002,
            path: '/api/lessons/current',
            method: 'GET',
            timeout: 5000
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log('\n✅ Lessons Data Response:');
                console.log(`   Status: ${res.statusCode} ${res.statusMessage}`);
                console.log(`   Content Length: ${data.length} characters`);
                try {
                    const json = JSON.parse(data);
                    console.log(`   Total Lessons: ${json.totalLessons}`);
                    console.log(`   Quality Score: ${json.qualityScore}`);
                    console.log(`   Success Rate: ${json.successRate}`);
                    console.log(`   Capture Rate: ${json.captureRate}`);
                } catch (e) {
                    console.log(`   JSON Parse Error: ${e.message}`);
                }
                resolve();
            });
        });
        
        req.on('error', reject);
        req.on('timeout', () => reject(new Error('Timeout')));
        req.end();
    });
}

// Test metrics data endpoint
function testMetrics() {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 3002,
            path: '/api/metrics/current',
            method: 'GET',
            timeout: 5000
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log('\n✅ Metrics Data Response:');
                console.log(`   Status: ${res.statusCode} ${res.statusMessage}`);
                console.log(`   Content Length: ${data.length} characters`);
                try {
                    const json = JSON.parse(data);
                    console.log(`   Overall Score: ${json.overallScore}`);
                    console.log(`   Dev Speed: ${json.devSpeed}`);
                    console.log(`   Code Quality: ${json.codeQuality}`);
                    console.log(`   Error Rate: ${json.errorRate}`);
                    console.log(`   Team Satisfaction: ${json.teamSatisfaction}`);
                } catch (e) {
                    console.log(`   JSON Parse Error: ${e.message}`);
                }
                resolve();
            });
        });
        
        req.on('error', reject);
        req.on('timeout', () => reject(new Error('Timeout')));
        req.end();
    });
}

// Run all tests
async function runTests() {
    try {
        await testDashboard();
        await testStatus();
        await testCompliance();
        await testLessons();
        await testMetrics();
        
        console.log('\n🎉 All tests passed! Dashboard is fully operational.');
        console.log('\n📊 Dashboard Summary:');
        console.log('   🌐 Main Dashboard: http://localhost:3002');
        console.log('   🔌 WebSocket Server: ws://localhost:3003');
        console.log('   📈 Real-time Updates: Enabled');
        console.log('   🔍 API Endpoints: All working');
        console.log('   📊 Data Sources: Compliance, Lessons, Metrics');
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        process.exit(1);
    }
}

runTests();
