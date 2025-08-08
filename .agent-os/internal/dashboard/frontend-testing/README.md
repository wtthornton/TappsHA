# Agent OS Dashboard Frontend Testing Suite

Comprehensive visual testing and screenshot capture framework for the Agent OS Unified Dashboard.

## 🎯 Overview

This testing suite provides automated visual testing, screenshot capture, and responsive design validation for the Agent OS Dashboard running on `http://localhost:3002`.

## 📦 Features

### 🧪 Visual Testing
- **Automated Browser Testing**: Uses Puppeteer for reliable browser automation
- **Screenshot Capture**: Automatic screenshot capture with timestamps
- **Responsive Design Testing**: Tests multiple viewport sizes (desktop, tablet, mobile)
- **Interactive Element Testing**: Validates search, navigation, and real-time updates
- **Tab Functionality Testing**: Tests all dashboard tabs (Compliance, Lessons, Metrics, Analytics)

### 📸 Screenshot Capabilities
- **High-Quality Screenshots**: 90% quality PNG format
- **Full-Page Capture**: Captures entire page content
- **Timestamped Files**: Automatic timestamping for version control
- **Organized Storage**: Screenshots saved in dedicated directories
- **Detailed Reports**: JSON reports with metadata and file paths

### 🔍 Test Coverage
- Dashboard loading and initial state
- Navigation tab functionality
- Compliance tab with data visualization
- Lessons learned tab with content
- Performance metrics tab
- Responsive design across devices
- Real-time updates functionality
- Interactive elements (search, filters)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd .agent-os/internal/dashboard/frontend-testing
npm install
```

### 2. Ensure Dashboard is Running

Make sure the Agent OS Dashboard is running on `http://localhost:3002`:

```bash
# From the dashboard directory
node start-dashboard.js 3002
```

### 3. Run Tests

#### Quick Visual Test (Recommended)
```bash
npm run test:quick
```

#### Full Visual Test Suite
```bash
npm run test
```

#### Screenshot Capture Only
```bash
npm run screenshot
```

## 📋 Test Scripts

| Script | Description | Duration |
|--------|-------------|----------|
| `npm run test:quick` | Fast visual testing with basic screenshots | ~30 seconds |
| `npm run test` | Comprehensive visual testing suite | ~2 minutes |
| `npm run screenshot` | Manual screenshot capture | ~1 minute |
| `npm run test:headless` | Headless testing for CI/CD | ~2 minutes |

## 📁 Output Structure

```
frontend-testing/
├── quick-test-screenshots/     # Quick test screenshots
├── test-screenshots/          # Full test suite screenshots
├── manual-screenshots/        # Manual screenshot capture
├── test-report.json          # Test results and metadata
└── screenshot-report.json    # Screenshot inventory
```

## 🧪 Test Categories

### 1. Dashboard Loading Test
- Validates dashboard loads correctly
- Checks for main navigation elements
- Verifies title and header content
- Captures initial state screenshot

### 2. Navigation Tab Testing
- Tests all four main tabs:
  - 📊 Compliance
  - 📚 Lessons Learned
  - 📈 Performance Metrics
  - 🔍 Analytics
- Validates tab switching functionality
- Captures screenshots for each tab

### 3. Compliance Tab Testing
- Validates compliance data display
- Tests search functionality
- Checks for violation cards
- Verifies real-time data updates

### 4. Lessons Learned Tab Testing
- Validates lessons content display
- Tests lesson categorization
- Checks for quality metrics
- Verifies recent lessons list

### 5. Performance Metrics Testing
- Validates metrics visualization
- Tests performance indicators
- Checks for trend data
- Verifies score calculations

### 6. Responsive Design Testing
- Tests three viewport sizes:
  - Desktop (1920x1080)
  - Tablet (768x1024)
  - Mobile (375x667)
- Validates layout adaptation
- Checks navigation accessibility

### 7. Real-time Updates Testing
- Captures initial state
- Waits for updates (5 seconds)
- Captures updated state
- Validates real-time indicators

## 📊 Test Reports

### JSON Report Structure
```json
{
  "timestamp": "2025-08-07T20:30:00.000Z",
  "totalTests": 15,
  "passedTests": 14,
  "failedTests": 1,
  "results": [
    {
      "test": "Dashboard Loading",
      "status": "PASS",
      "details": {
        "title": "🤖 Agent OS Unified Dashboard",
        "navTabs": 4,
        "screenshot": {
          "filename": "dashboard-initial-load-2025-08-07T20-30-00.png",
          "filepath": "/path/to/screenshot.png"
        }
      }
    }
  ]
}
```

### Screenshot Report Structure
```json
{
  "timestamp": "2025-08-07T20:30:00.000Z",
  "totalScreenshots": 12,
  "screenshots": [
    {
      "filename": "dashboard-overview-2025-08-07T20-30-00.png",
      "filepath": "/path/to/screenshot.png",
      "timestamp": "2025-08-07T20:30:00.000Z"
    }
  ],
  "directory": "/path/to/screenshots"
}
```

## 🔧 Configuration

### Browser Settings
- **Headless Mode**: `false` for visual inspection, `true` for CI/CD
- **Viewport**: Default 1920x1080, configurable per test
- **User Agent**: Chrome 91.0.4472.124 for consistent rendering
- **Screenshot Quality**: 90% for optimal file size vs quality

### Test Timeouts
- **Page Load**: 10 seconds
- **Element Wait**: 5 seconds
- **Animation Wait**: 500ms
- **Real-time Wait**: 5 seconds

### Screenshot Settings
- **Format**: PNG
- **Quality**: 90%
- **Full Page**: true
- **Timestamp**: ISO format with sanitized characters

## 🐛 Troubleshooting

### Common Issues

#### Dashboard Not Loading
```bash
# Check if dashboard is running
curl http://localhost:3002/api/status

# Restart dashboard if needed
cd .agent-os/internal/dashboard
node start-dashboard.js 3002
```

#### Puppeteer Installation Issues
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### Screenshot Directory Issues
```bash
# Create directories manually
mkdir -p test-screenshots quick-test-screenshots manual-screenshots
```

### Debug Mode
```bash
# Run with debug output
DEBUG=puppeteer:* npm run test

# Run with visible browser
# Edit visual-test-suite.js: headless: false
```

## 📈 Performance Metrics

### Test Execution Times
- **Quick Test**: ~30 seconds
- **Full Test Suite**: ~2 minutes
- **Screenshot Capture**: ~1 minute
- **Headless Mode**: ~1.5 minutes

### Screenshot File Sizes
- **Dashboard Overview**: ~200-300KB
- **Tab Screenshots**: ~150-250KB
- **Responsive Screenshots**: ~100-200KB
- **Total per Test Run**: ~2-3MB

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Frontend Visual Testing
on: [push, pull_request]
jobs:
  visual-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:headless
      - uses: actions/upload-artifact@v3
        with:
          name: test-screenshots
          path: test-screenshots/
```

### Docker Integration
```dockerfile
FROM node:18-alpine
RUN apk add --no-cache chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "test:headless"]
```

## 📚 API Reference

### DashboardVisualTestSuite Class
```javascript
const testSuite = new DashboardVisualTestSuite();

// Run all tests
await testSuite.runAllTests();

// Run individual tests
await testSuite.testDashboardLoading();
await testSuite.testNavigationTabs();
await testSuite.testResponsiveDesign();
```

### QuickVisualTest Class
```javascript
const quickTest = new QuickVisualTest();

// Run quick test
await quickTest.runQuickTest();

// Run individual components
await quickTest.testDashboardBasics();
await quickTest.testAllTabs();
await quickTest.testResponsive();
```

### ScreenshotCapture Class
```javascript
const capture = new ScreenshotCapture();

// Capture all screenshots
await capture.captureAll();

// Capture specific sections
await capture.captureDashboardOverview();
await capture.captureAllTabs();
await capture.captureResponsiveDesign();
```

## 🤝 Contributing

### Adding New Tests
1. Create test method in appropriate class
2. Add screenshot capture
3. Update test report generation
4. Add to main test suite
5. Update documentation

### Test Naming Convention
- **Test Methods**: `test[FeatureName]()`
- **Screenshot Files**: `[feature]-[timestamp].png`
- **Test Reports**: `test-report.json`

## 📄 License

MIT License - See LICENSE file for details.

## 🆘 Support

For issues and questions:
- Create GitHub issue
- Check troubleshooting section
- Review test logs and reports
- Verify dashboard is running on correct port
