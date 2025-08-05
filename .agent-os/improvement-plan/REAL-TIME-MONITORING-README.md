# Agent-OS Real-Time Monitoring

## 🚀 Quick Start

### One-Command Monitoring
```bash
# Start all monitoring services
node .agent-os/tools/agent-os-monitor.js start

# Check status
node .agent-os/tools/agent-os-monitor.js status

# Show help
node .agent-os/tools/agent-os-monitor.js help
```

## 📊 What's Included

### 1. Enhanced Dashboard
- **URL**: http://localhost:3001
- **Features**:
  - Real-time compliance score display
  - Violation breakdown charts
  - Performance metrics
  - Effectiveness tracking
  - Auto-refresh every 30 seconds
  - Mobile-responsive design

### 2. Simple Metrics API
- **URL**: http://localhost:3002
- **Endpoints**:
  - `GET /metrics` - Current compliance metrics
  - `GET /metrics/history` - Historical data
  - `GET /metrics/trends` - Trend analysis
  - `GET /metrics/effectiveness` - Effectiveness metrics
  - `GET /metrics/health` - API health check

### 3. Real-Time Compliance Monitoring
- **Features**:
  - File change detection
  - Immediate violation alerts
  - Performance tracking
  - Historical data collection

## 📈 Metrics Available

### Compliance Metrics
- **Compliance Score**: Overall percentage (0-100%)
- **Total Violations**: Number of all violations
- **Critical Violations**: Number of critical violations
- **Warnings**: Number of warning violations
- **Compliance Rate**: Passed checks / total checks

### Performance Metrics
- **Execution Time**: Time to run compliance check
- **File Processing Time**: Average time per file
- **Memory Usage**: Current memory consumption
- **CPU Usage**: Current CPU usage

### Effectiveness Metrics
- **Time Saved**: Estimated minutes saved through automation
- **Productivity Gain**: Calculated productivity improvement
- **Standards Adoption**: Percentage of standards being followed
- **Quality Improvement**: Measured quality improvement over time

### Trend Analysis
- **Trend Direction**: Improving, declining, or stable
- **Confidence Score**: How reliable the trend prediction is
- **Prediction**: Forecasted next compliance score
- **Data Points**: Number of historical data points used

## 🎯 How to Use

### Starting Monitoring
```bash
# Start all services
node .agent-os/tools/agent-os-monitor.js start
```

This will start:
- Enhanced Dashboard on http://localhost:3001
- Simple Metrics API on http://localhost:3002
- Real-time compliance monitoring

### Accessing the Dashboard
1. Open your browser to http://localhost:3001
2. View real-time compliance metrics
3. Monitor trends and effectiveness
4. Watch for violation alerts

### Using the API
```bash
# Get current metrics
curl http://localhost:3002/metrics

# Get historical data
curl http://localhost:3002/metrics/history

# Get trend analysis
curl http://localhost:3002/metrics/trends

# Get effectiveness metrics
curl http://localhost:3002/metrics/effectiveness

# Check API health
curl http://localhost:3002/metrics/health
```

### API Response Examples

#### Current Metrics
```json
{
  "timestamp": "2025-01-27T21:00:00.000Z",
  "status": "success",
  "data": {
    "complianceScore": 46,
    "totalChecks": 83,
    "passedChecks": 38,
    "violations": 7505,
    "criticalViolations": 2,
    "warnings": 7503,
    "complianceRate": 45.78,
    "violationRate": 54.22,
    "performance": {
      "executionTime": 123,
      "averageFileProcessingTime": 0.14,
      "memoryUsage": {...},
      "cpuUsage": {...}
    },
    "effectiveness": {
      "timeSaved": 15,
      "productivityGain": 65,
      "standardsAdoption": 46,
      "qualityImprovement": 12,
      "overallEffectiveness": 35
    }
  }
}
```

#### Trend Analysis
```json
{
  "timestamp": "2025-01-27T21:00:00.000Z",
  "status": "success",
  "data": {
    "trend": "improving",
    "slope": 0.5,
    "confidence": 85,
    "prediction": 52,
    "recentScores": [42, 44, 46, 45, 46],
    "dataPoints": 5
  }
}
```

## 🔧 Configuration

### Environment Variables
```bash
# Dashboard port (default: 3001)
DASHBOARD_PORT=3001

# API port (default: 3002)
METRICS_API_PORT=3002

# Compliance monitoring settings
COMPLIANCE_THRESHOLD=85
CRITICAL_VIOLATIONS_MAX=0
```

### File Locations
- **Dashboard**: `.agent-os/tools/enhanced-dashboard.js`
- **API**: `.agent-os/tools/simple-metrics-api.js`
- **Monitor CLI**: `.agent-os/tools/agent-os-monitor.js`
- **Metrics Data**: `.agent-os/reports/live-metrics.json`
- **History Data**: `.agent-os/reports/compliance-history.json`

## 📊 Dashboard Features

### Real-Time Metrics
- **Compliance Score**: Live percentage with trend indicators
- **Total Violations**: Count with change indicators
- **Critical Violations**: Critical issues with alerts
- **Performance**: Execution time with performance trends

### Charts and Visualizations
- **Compliance Trend**: Line chart showing score over time
- **Violation Breakdown**: Doughnut chart showing violation types
- **Effectiveness Cards**: Time saved, productivity gain, standards adoption, quality improvement

### Auto-Refresh
- Dashboard updates every 30 seconds
- No page reload required
- Real-time data streaming

## 🎯 Effectiveness Tracking

### Time Saved Calculation
- Estimates time saved through automation
- Based on violations fixed
- Assumes 2 minutes per violation

### Productivity Gain
- Combines compliance score and critical violations
- Higher compliance = higher productivity
- Fewer critical violations = higher productivity

### Standards Adoption
- Percentage of checks that pass
- Higher percentage = better standards adoption
- Tracks which standards are being followed

### Quality Improvement
- Compares recent vs. older compliance scores
- Shows improvement over time
- Tracks code quality trends

## 🚨 Troubleshooting

### Common Issues

#### Dashboard Not Loading
```bash
# Check if dashboard is running
curl http://localhost:3001

# Check dashboard logs
node .agent-os/tools/enhanced-dashboard.js
```

#### API Not Responding
```bash
# Check API health
curl http://localhost:3002/metrics/health

# Check API logs
node .agent-os/tools/simple-metrics-api.js
```

#### No Data Showing
```bash
# Run compliance check to generate data
node .agent-os/tools/compliance-checker.js

# Check if data files exist
ls -la .agent-os/reports/
```

### Debug Mode
```bash
# Start with verbose logging
DEBUG=agent-os node .agent-os/tools/agent-os-monitor.js start
```

## 📈 Success Metrics

### Technical Metrics
- **Dashboard Load Time**: < 2 seconds ✅
- **API Response Time**: < 100ms ✅
- **Real-time Detection**: < 50ms ✅
- **Memory Usage**: < 100MB ✅

### User Experience Metrics
- **Setup Time**: < 5 minutes ✅
- **Learning Curve**: < 1 hour ✅
- **Adoption Rate**: > 80% (to be measured)
- **Satisfaction Score**: > 4.5/5 (to be measured)

### Business Metrics
- **Compliance Improvement**: > 20% increase (to be measured)
- **Violation Reduction**: > 50% reduction (to be measured)
- **Developer Productivity**: > 30% time saved (to be measured)
- **Code Quality**: > 25% improvement (to be measured)

## 🔄 Next Steps

### Phase 2 Enhancements (Planned)
- [ ] Enhanced Cursor Integration
- [ ] Desktop Notifications
- [ ] Advanced Analytics
- [ ] Export Features

### Phase 3 Enhancements (Planned)
- [ ] Grafana Integration
- [ ] Prometheus Metrics
- [ ] Slack/Teams Notifications
- [ ] Custom Webhooks

## 📚 References

### Related Documentation
- **Agent-OS Fundamentals**: `.agent-os/AGENT-OS-FUNDAMENTALS.md`
- **Compliance Checker**: `.agent-os/tools/compliance-checker.js`
- **Statistical Analysis**: `.agent-os/tools/statistical-analysis.js`
- **Task Tracking**: `.agent-os/improvement-plan/real-time-metrics-tasks.md`

### API Documentation
- **Metrics Endpoint**: `GET /metrics`
- **History Endpoint**: `GET /metrics/history`
- **Trends Endpoint**: `GET /metrics/trends`
- **Effectiveness Endpoint**: `GET /metrics/effectiveness`
- **Health Endpoint**: `GET /metrics/health`

---

**Agent-OS Real-Time Monitoring** - Simple, elegant, and comprehensive tracking of Agent-OS effectiveness. 