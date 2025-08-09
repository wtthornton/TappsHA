# 🤖 Agent OS Unified Dashboard

## Overview

The Agent OS Unified Dashboard is a comprehensive real-time monitoring system that combines compliance checking, lessons learned tracking, and performance metrics into a single, interactive web interface. It provides live updates via WebSocket connections and offers detailed analytics for continuous improvement.

## 🎯 Features

### 📊 **Compliance Monitoring**
- **Real-time violation detection** across the codebase
- **Severity-based categorization** (Critical, Warning, Info)
- **Trend analysis** with historical data
- **File-level analysis** with specific line references
- **Export capabilities** (JSON, CSV, PDF)

### 📚 **Lessons Learned Tracking**
- **Capture rate monitoring** with quality scoring
- **Category-based organization** (Architecture, Development, Testing, etc.)
- **Success rate tracking** for applied lessons
- **Recent lessons display** with detailed descriptions
- **Trend analysis** for continuous improvement

### 📈 **Performance Metrics**
- **Development speed** tracking and optimization
- **Code quality** measurements and trends
- **Error rate** monitoring and reduction
- **Team satisfaction** metrics and feedback
- **Overall performance** scoring

### 🔍 **Advanced Analytics**
- **Predictive analytics** for trend forecasting
- **Risk assessment** with mitigation strategies
- **Correlation analysis** between different metrics
- **Custom reporting** capabilities
- **Real-time alerts** and notifications

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0.0 or higher
- npm or yarn package manager

### Installation

1. **Navigate to the dashboard directory:**
   ```bash
   cd .agent-os/internal/dashboard
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the dashboard:**
   ```bash
   npm start
   ```

4. **Access the dashboard:**
   - Open your browser and navigate to `http://localhost:3000`
   - The WebSocket server runs on port `3001` for real-time updates

### Development Mode

For development with auto-restart:
```bash
npm run dev
```

## 📋 Dashboard Tabs

### 1. **Compliance Tab**
- **Real-time compliance score** with color-coded indicators
- **Violation metrics** (Critical, Warning, Info counts)
- **Files analyzed** with trend indicators
- **Filterable violation list** with search capabilities
- **Export functionality** for reports

### 2. **Lessons Learned Tab**
- **Quality score** with trend analysis
- **Capture rate** monitoring
- **Success rate** tracking
- **Category distribution** charts
- **Recent lessons** with detailed descriptions

### 3. **Performance Metrics Tab**
- **Development speed** measurements
- **Code quality** indicators
- **Error rate** tracking
- **Team satisfaction** metrics
- **Performance trends** over time

### 4. **Analytics Tab**
- **Predictive analytics** for future trends
- **Risk assessment** with mitigation strategies
- **Correlation analysis** between metrics
- **Advanced visualizations** and charts

## 🔌 API Endpoints

### HTTP API
- `GET /api/compliance/current` - Current compliance data
- `GET /api/lessons/current` - Current lessons learned data
- `GET /api/metrics/current` - Current performance metrics
- `GET /api/unified/current` - All dashboard data
- `GET /api/status` - Server status information

### WebSocket API
The dashboard uses WebSocket connections for real-time updates:

**Connection:**
```javascript
const ws = new WebSocket('ws://localhost:3001');
```

**Message Types:**
- `subscribe` - Subscribe to specific data channels
- `unsubscribe` - Unsubscribe from data channels
- `request_data` - Request specific data types
- `ping` - Health check

**Data Channels:**
- `compliance` - Compliance violations and metrics
- `lessons` - Lessons learned data
- `metrics` - Performance metrics

## 🛠️ Configuration

### Environment Variables
- `DASHBOARD_PORT` - HTTP server port (default: 3000)
- `WS_PORT` - WebSocket server port (default: 3001)
- `UPDATE_INTERVAL` - Data update interval in milliseconds (default: 30000)

### Customization
The dashboard can be customized by modifying:
- `unified-dashboard.html` - Main dashboard interface
- `api/dashboard-controller.js` - Data processing logic
- `websocket/dashboard-websocket.js` - WebSocket server configuration

## 📊 Data Sources

### Compliance Data
- **Compliance Checker Integration** - Real-time violation detection
- **File Analysis** - Automated code scanning
- **Trend Calculation** - Historical data analysis
- **Violation Categorization** - Severity-based organization

### Lessons Learned Data
- **Markdown File Parsing** - Automatic lesson extraction
- **Category Analysis** - Automated categorization
- **Quality Scoring** - Content-based quality assessment
- **Success Tracking** - Application effectiveness monitoring

### Performance Metrics
- **Development Speed** - Time-based measurements
- **Code Quality** - Automated quality assessment
- **Error Rate** - Defect tracking and analysis
- **Team Satisfaction** - Feedback collection and analysis

## 🔧 Architecture

### Components
1. **Dashboard Controller** (`api/dashboard-controller.js`)
   - Data aggregation and processing
   - Real-time analysis and calculations
   - Mock data generation for testing

2. **WebSocket Server** (`websocket/dashboard-websocket.js`)
   - Real-time data broadcasting
   - Client connection management
   - Subscription handling

3. **HTTP Server** (`start-dashboard.js`)
   - Static file serving
   - API endpoint handling
   - CORS configuration

4. **Frontend Interface** (`unified-dashboard.html`)
   - Interactive dashboard UI
   - Real-time data visualization
   - Export and filtering capabilities

### Data Flow
```
Compliance Checker → Dashboard Controller → WebSocket Server → Frontend
Lessons Learned → Dashboard Controller → WebSocket Server → Frontend
Performance Metrics → Dashboard Controller → WebSocket Server → Frontend
```

## 🚨 Troubleshooting

### Common Issues

**1. Port Already in Use**
```bash
# Check what's using the port
lsof -i :3000
# Kill the process or use a different port
npm start 3001
```

**2. WebSocket Connection Failed**
- Ensure the WebSocket server is running on port 3001
- Check firewall settings
- Verify browser WebSocket support

**3. No Data Displayed**
- Check browser console for errors
- Verify API endpoints are accessible
- Ensure data sources are properly configured

**4. Real-time Updates Not Working**
- Check WebSocket connection status
- Verify subscription channels
- Monitor server logs for errors

### Debug Mode
Enable debug logging by setting the environment variable:
```bash
DEBUG=true npm start
```

## 📈 Performance Optimization

### Server-side Optimizations
- **Caching** - Implement Redis for data caching
- **Compression** - Enable gzip compression
- **Connection pooling** - Optimize database connections
- **Load balancing** - Distribute load across multiple instances

### Client-side Optimizations
- **Lazy loading** - Load data on demand
- **Pagination** - Limit data displayed at once
- **Debouncing** - Reduce API call frequency
- **Caching** - Cache static assets

## 🔒 Security Considerations

### Authentication
- Implement user authentication for sensitive data
- Use JWT tokens for API access
- Implement role-based access control

### Data Protection
- Encrypt sensitive data in transit
- Implement proper input validation
- Use HTTPS for production deployments
- Regular security audits

### Network Security
- Configure CORS properly
- Implement rate limiting
- Use secure WebSocket connections (WSS)
- Monitor for suspicious activity

## 🚀 Deployment

### Production Setup
1. **Environment Configuration**
   ```bash
   export NODE_ENV=production
   export DASHBOARD_PORT=3000
   export WS_PORT=3001
   ```

2. **Process Management**
   ```bash
   # Using PM2
   npm install -g pm2
   pm2 start start-dashboard.js --name "agent-os-dashboard"
   ```

3. **Reverse Proxy**
   ```nginx
   # Nginx configuration
   server {
       listen 80;
       server_name dashboard.agent-os.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000 3001
CMD ["npm", "start"]
```

## 📚 API Documentation

### WebSocket Message Format

**Subscribe to channels:**
```json
{
  "type": "subscribe",
  "channels": ["compliance", "lessons", "metrics"]
}
```

**Request specific data:**
```json
{
  "type": "request_data",
  "dataType": "compliance"
}
```

**Health check:**
```json
{
  "type": "ping"
}
```

### HTTP API Responses

**Compliance Data:**
```json
{
  "critical": 2,
  "warning": 8,
  "info": 15,
  "filesAnalyzed": 156,
  "score": 87,
  "violations": [...],
  "lastUpdate": "2025-01-27T10:30:00.000Z"
}
```

**Lessons Data:**
```json
{
  "totalLessons": 47,
  "qualityScore": 92,
  "successRate": 88,
  "captureRate": 85,
  "recentLessons": [...],
  "categories": {...}
}
```

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Style
- Follow existing code patterns
- Use ES6+ features
- Add comprehensive comments
- Include error handling

### Testing
```bash
# Run tests
npm test

# Run linting
npm run lint

# Run type checking
npm run type-check
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the documentation
- Contact the development team

---

**Last Updated:** 2025-01-27  
**Version:** 1.0.0  
**Status:** Active Development
