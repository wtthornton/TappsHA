# Technical Stack

## Application Framework
- **Backend:** Spring Boot 3.3+ (Java 21 LTS) with REST + gRPC + async events (Kafka)
- **Frontend:** React 19 stable with TypeScript 5
- **AI/ML:** OpenAI GPT-4o, pgvector, LangChain 0.2

## Database System
- **Primary Database:** PostgreSQL 17 with pgvector extension for structured data
- **Time Series Data:** InfluxDB 3 Core (Docker) for event streams and metrics
- **Cache:** Redis 7.2+ for session management and real-time data

## JavaScript Framework
- **Frontend Framework:** React 19 with TypeScript 5
- **State Management:** TanStack Query 5, Context API
- **Build Tool:** Vite 5.x

## Import Strategy
- **Package Management:** npm with package.json
- **Module System:** ES6 modules with TypeScript 5

## CSS Framework
- **UI Framework:** TailwindCSS 4.x + shadcn/ui
- **Component Library:** shadcn/ui for accessible components
- **Icons:** Heroicons 2.0+

## UI Component Library
- **Component System:** shadcn/ui components with TailwindCSS
- **Data Visualization:** Chart.js 4.4+ and D3.js 7.8+
- **Real-time Updates:** Socket.IO 4.7+

## Fonts Provider
- **Web Fonts:** Google Fonts (Inter, Roboto Mono)
- **Icon Font:** Heroicons 2.0+

## Icon Library
- **Primary Icons:** Heroicons 2.0+
- **Custom Icons:** SVG-based custom icon system

## Application Hosting
- **Container Platform:** Docker 24 with Docker Compose V2
- **Orchestration:** Kubernetes for production deployments
- **Platform:** Self-hosted or cloud (AWS, GCP, Azure)

## Database Hosting
- **Primary:** Self-hosted PostgreSQL 17 on dedicated server
- **Time Series:** Self-hosted InfluxDB 3 Core on dedicated server
- **Cache:** Self-hosted Redis on dedicated server

## Asset Hosting
- **Static Assets:** Nginx for serving static files
- **CDN:** CloudFlare for global asset distribution
- **Storage:** Local file system with backup to cloud storage

## Deployment Solution
- **Containerization:** Docker Buildx with multi-stage builds
- **CI/CD:** GitHub Actions with automated testing and deployment
- **Monitoring:** Prometheus v2.50 + Grafana 11 for system monitoring
- **Logging:** Loki 3 for log aggregation

## Code Repository URL
- **Repository:** GitHub with private repository
- **Branch Strategy:** GitFlow with main, develop, feature, and hotfix branches
- **Code Quality:** ESLint, Prettier, and SonarQube for code analysis

## Additional Technologies

### AI/ML Stack
- **Machine Learning:** OpenAI GPT-4o for natural language processing
- **Vector Database:** pgvector extension for PostgreSQL
- **LangChain:** 0.2 for AI application development
- **Time Series Analysis:** Prophet 1.1+ for forecasting

### Home Assistant Integration
- **API Client:** Home Assistant REST API client for Spring Boot
- **WebSocket:** Real-time event streaming via WebSocket
- **Authentication:** Long-lived access tokens for secure access

### Security
- **Authentication:** Spring Security with OAuth 2.1
- **Encryption:** AES-256 for sensitive data encryption
- **API Security:** Rate limiting and request validation
- **Network Security:** HTTPS/TLS 1.3 for all communications

### Performance
- **Caching:** Redis for session and data caching
- **Background Jobs:** Spring Boot with @Async and Kafka
- **Message Queue:** Kafka for reliable message processing
- **Load Balancing:** Nginx for load balancing and reverse proxy

### Observability
- **Metrics:** Spring Boot Actuator with Prometheus
- **Traces:** OpenTelemetry 1.28 + OTLP/HTTP exporter
- **Dashboards:** Grafana 11 with exported JSON configurations 