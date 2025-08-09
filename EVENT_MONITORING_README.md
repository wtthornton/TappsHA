# TappHA Event Monitoring System

## Overview

The TappHA Event Monitoring System implements real-time monitoring of all Home Assistant events and data streams with Kafka integration and intelligent filtering to achieve 60-80% volume reduction. This system processes high-frequency events (1000+ events/minute) with <100ms processing latency while maintaining comprehensive event tracking for pattern analysis and automation insights.

## Architecture

### Components

1. **Kafka Integration** - High-throughput event streaming with proper partitioning
2. **Event Processing Pipeline** - Real-time event processing with Spring Boot async processing
3. **Intelligent Filtering System** - Multi-layer filtering algorithms for volume reduction
4. **Event Storage & Analytics** - PostgreSQL with pgvector for pattern analysis
5. **Real-Time Dashboard** - React dashboard for event monitoring
6. **Performance Monitoring** - Spring Boot Actuator and custom metrics

### Technology Stack

- **Backend**: Spring Boot 3.5.3 (Java 21) with Kafka integration
- **Frontend**: React 19 with TypeScript 5
- **Database**: PostgreSQL 17 with pgvector extension
- **Message Queue**: Apache Kafka 7.5.0
- **Monitoring**: Prometheus v2.50, Grafana 11
- **Time Series**: InfluxDB 3.0
- **Containerization**: Docker 24, Docker Compose V2

## Features

### Real-Time Event Processing
- WebSocket connection to Home Assistant API
- Kafka-based event streaming for high throughput
- <100ms processing latency
- Async event processing with Spring Boot

### Intelligent Event Filtering
- **Frequency-based filtering**: Filters out high-frequency routine events
- **Event type filtering**: Keeps important events (automation, script, scene, etc.)
- **Entity-based filtering**: Prioritizes important entities (sensors, switches, lights, etc.)
- **State change significance**: Preserves events with significant state changes
- **Time-based filtering**: Keeps events during active hours (6 AM - 10 PM)
- **Random sampling**: 10% keep rate for remaining events

### Event Analytics Dashboard
- Real-time event processing statistics
- Filtering effectiveness metrics
- Performance monitoring (throughput, efficiency, processing times)
- System health status
- Auto-refresh every 30 seconds

### Performance Monitoring
- Spring Boot Actuator integration
- Custom metrics for event processing
- Prometheus metrics collection
- Grafana dashboards for visualization

## Getting Started

### Prerequisites

- Docker 24+ and Docker Compose V2
- Java 21 (for local development)
- Node.js 18+ (for frontend development)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TappHA
   ```

2. **Start the services**
   ```bash
   docker-compose up -d
   ```

3. **Access the applications**
   - Backend API: http://localhost:8080/api
   - Frontend Dashboard: http://localhost:5173
   - Kafka UI: http://localhost:8080 (Kafka UI)
   - Grafana: http://localhost:3000 (admin/admin)
   - Prometheus: http://localhost:9090

### Configuration

#### Environment Variables

```bash
# Database
DB_USERNAME=tappha
DB_PASSWORD=tappha

# Kafka
SPRING_KAFKA_BOOTSTRAP_SERVERS=localhost:9092

# InfluxDB
INFLUXDB_TOKEN=tappha-admin-token

# Home Assistant
TOKEN_ENCRYPTION_KEY=your-secure-key
```

#### Application Properties

Key configuration in `application.yml`:

```yaml
spring:
  kafka:
    bootstrap-servers: localhost:9092
    consumer:
      group-id: tappha-homeassistant
      max-poll-records: 500
    producer:
      batch-size: 16384
      compression-type: snappy

tappha:
  homeassistant:
    event-processing:
      batch-size: 100
      processing-delay: 100
      max-queue-size: 10000
```

## API Endpoints

### Event Monitoring

- `GET /api/events/stats` - Get real-time event processing statistics
- `POST /api/events/stats/reset` - Reset event processing statistics
- `GET /api/events/recent` - Get recent events with pagination
- `GET /api/events/type/{eventType}` - Get events by event type
- `GET /api/events/entity/{entityId}` - Get events by entity ID
- `GET /api/events/metrics` - Get connection metrics
- `GET /api/events/performance` - Get performance metrics
- `GET /api/events/health` - Get system health status

### Connection Management

- `GET /api/connections` - Get all connections
- `POST /api/connections` - Create new connection
- `GET /api/connections/{id}` - Get connection by ID
- `PUT /api/connections/{id}` - Update connection
- `DELETE /api/connections/{id}` - Delete connection
- `POST /api/connections/{id}/connect` - Connect to Home Assistant
- `POST /api/connections/{id}/disconnect` - Disconnect from Home Assistant

## Event Processing Pipeline

### 1. Event Reception
```java
// WebSocket receives event from Home Assistant
handleEvent(JsonNode eventMessage) {
    // Create HomeAssistantEvent entity
    // Send to Kafka for processing
    eventProcessingService.sendEventToKafka(event);
}
```

### 2. Kafka Processing
```java
// Kafka listener processes events
@KafkaListener(topics = "homeassistant-events")
public void processEvent(String eventJson) {
    // Parse event
    // Apply intelligent filtering
    // Store filtered events
    // Update metrics
}
```

### 3. Intelligent Filtering
```java
private boolean shouldProcessEvent(HomeAssistantEvent event) {
    // 1. Frequency-based filtering
    // 2. Event type filtering
    // 3. Entity-based filtering
    // 4. State change significance
    // 5. Time-based filtering
    // 6. Random sampling
}
```

## Performance Metrics

### Key Performance Indicators

- **Throughput**: Events processed per minute
- **Efficiency**: Percentage of events stored vs processed
- **Processing Time**: Average/min/max processing latency
- **Filter Rate**: Percentage of events filtered out
- **System Health**: Overall system status

### Target Performance

- **Throughput**: 1000+ events/minute
- **Latency**: <100ms processing time
- **Filter Rate**: 60-80% volume reduction
- **Uptime**: 99.9% availability

## Monitoring and Observability

### Metrics Collection

- **Spring Boot Actuator**: Health checks and application metrics
- **Prometheus**: Metrics scraping and storage
- **Grafana**: Metrics visualization and dashboards
- **InfluxDB**: Time-series data storage

### Health Checks

- Application health: `/api/actuator/health`
- Event processing health: `/api/events/health`
- Database connectivity
- Kafka connectivity

### Alerts

- High processing latency (>100ms)
- Low filter rate (<60%)
- High error rate
- Service unavailability

## Development

### Local Development

1. **Start dependencies**
   ```bash
   docker-compose up -d postgres kafka influxdb
   ```

2. **Run backend**
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

3. **Run frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Testing

```bash
# Run all tests
./mvnw test

# Run specific test
./mvnw test -Dtest=EventProcessingServiceTest

# Run with coverage
./mvnw test jacoco:report
```

### Code Quality

- **Coverage**: ≥85% branch coverage required
- **Static Analysis**: SonarQube integration
- **Code Style**: Prettier + ESLint
- **Security**: Dependency scanning with Dependabot

## Deployment

### Production Deployment

1. **Environment Setup**
   ```bash
   # Set production environment variables
   export SPRING_PROFILES_ACTIVE=production
   export DB_PASSWORD=<secure-password>
   export KAFKA_BOOTSTRAP_SERVERS=<kafka-cluster>
   ```

2. **Docker Deployment**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Health Verification**
   ```bash
   curl http://localhost:8080/api/actuator/health
   curl http://localhost:8080/api/events/health
   ```

### Scaling

- **Horizontal Scaling**: Multiple Kafka partitions
- **Vertical Scaling**: Increase JVM heap size
- **Database Scaling**: Read replicas for analytics
- **Monitoring Scaling**: Prometheus federation

## Troubleshooting

### Common Issues

1. **Kafka Connection Issues**
   - Check Kafka service status
   - Verify bootstrap servers configuration
   - Check network connectivity

2. **High Processing Latency**
   - Monitor JVM heap usage
   - Check database connection pool
   - Review Kafka consumer configuration

3. **Low Filter Rate**
   - Review filtering algorithm parameters
   - Check event type and entity patterns
   - Monitor frequency thresholds

### Logs

```bash
# Backend logs
docker-compose logs -f backend

# Kafka logs
docker-compose logs -f kafka

# Database logs
docker-compose logs -f postgres
```

## Contributing

### Development Workflow

1. Create feature branch
2. Implement changes with tests
3. Ensure code coverage ≥85%
4. Submit pull request
5. Code review and approval
6. Merge to main branch

### Code Standards

- Follow Spring Boot best practices
- Use proper exception handling
- Implement comprehensive logging
- Write unit and integration tests
- Document public APIs

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the troubleshooting guide 

## 🔍 **Troubleshooting Steps**

### **1. Check if the Backend Application is Running**

First, let's verify if the Spring Boot application is actually running:

```bash
# Check if any Java processes are running on port 8080
netstat -an | grep 8080
# or
lsof -i :8080
```

### **2. Check Application Startup**

The most common issues are:

#### **A. Database Connection Issues**
Looking at your `application.yml`, the database configuration is:
```yaml
datasource:
  url: jdbc:postgresql://localhost:5432/tappha
  username: ${DB_USERNAME:tappha}
  password: ${DB_PASSWORD:tappha}
```

**Check if PostgreSQL is running:**
```bash
# Check if PostgreSQL is running
docker ps | grep postgres
# or if running locally
pg_isready -h localhost -p 5432
```

#### **B. Missing Dependencies**
The application requires several services to start properly. Let's check:

```bash
# Start the required services
docker-compose up -d postgres influxdb kafka
```

### **3. Start the Backend Application**

#### **Option A: Using Docker Compose (Recommended)**
```bash
# Start all services including backend
docker-compose up -d

# Check backend logs
docker-compose logs -f backend
```

#### **Option B: Local Development**
```bash
# Navigate to backend directory
cd backend

# Start the application
./mvnw spring-boot:run
```

### **4. Verify Configuration**

The health endpoint should be available at:
- **URL**: `http://localhost:8080/api/actuator/health`
- **Expected Response**: JSON with application status

### **5. Common Issues and Solutions**

#### **Issue 1: Database Not Running**
```bash
# Start PostgreSQL
docker-compose up -d postgres

# Wait for it to be healthy
docker-compose ps postgres
```

#### **Issue 2: Application Failed to Start**
Check the logs for specific errors:
```bash
# If using Docker
docker-compose logs backend

# If running locally
cd backend && ./mvnw spring-boot:run
```

#### **Issue 3: Port Already in Use**
```bash
# Check what's using port 8080
lsof -i :8080

# Kill the process if needed
kill -9 <PID>
```

#### **Issue 4: Missing Environment Variables**
Set the required environment variables:
```bash
export DB_USERNAME=tappha
export DB_PASSWORD=tappha
export SPRING_PROFILES_ACTIVE=dev
```

### **6. Quick Diagnostic Commands**

```bash
# 1. Check if services are running
docker-compose ps

# 2. Check backend logs
docker-compose logs backend

# 3. Test database connection
docker-compose exec postgres psql -U tappha -d tappha -c "SELECT 1;"

# 4. Test health endpoint
curl -v http://localhost:8080/api/actuator/health
```

### **7. Expected Health Response**

When working correctly, you should see:
```json
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP",
      "details": {
        "database": "PostgreSQL",
        "validationQuery": "isValid()"
      }
    },
    "diskSpace": {
      "status": "UP",
      "details": {
        "total": 499963174912,
        "free": 419430400000,
        "threshold": 10485760
      }
    }
  }
}
```

### **8. Alternative Health Check URLs**

Try these alternative endpoints:
- `http://localhost:8080/api/actuator/info`
- `http://localhost:8080/api/actuator/metrics`
- `http://localhost:8080/api/health` (if custom endpoint exists)

### **9. Development vs Production**

For **development**:
```bash
cd backend
./mvnw spring-boot:run
```

For **production**:
```bash
docker-compose up -d
```

### **10. Debug Mode**

To get more detailed logs, add this to your `application.yml`:
```yaml
logging:
  level:
    com.tappha: DEBUG
    org.springframework.boot: DEBUG
    org.springframework.web: DEBUG
```

**What specific error are you seeing when you try to access the health endpoint?** This will help me provide more targeted troubleshooting steps. 