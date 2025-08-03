# Tech Stack

## Context
Default stack for new Agent OS projects (overridable per product).

| Layer | Technology | Version / Notes |
|-------|------------|-----------------|
| **Frontend** | React | 19 stable, **TypeScript 5** |
|  | Vite | 5.x |
|  | TailwindCSS | 4.x + shadcn/ui |
|  | State | TanStack Query 5, Context API |
| **Mobile** | PWA | Workbox + Vite plugin |
| **Backend** | Spring Boot | 3.3+ (Java 21 LTS) |
|  | Build | Gradle 8.x, Testcontainers |
|  | API | REST + gRPC + async events (Kafka) |
| **Data** | PostgreSQL | 17, pgvector extension |
|  | InfluxDB | 3 Core (Docker) |
| **AI** | OpenAI GPT-4o, pgvector, LangChain 0.2 |
| **CI/CD** | GitHub Actions, Docker Buildx |
| **Runtime** | Docker 24, Compose V2 (Windows + WSL2) |
| **Observability** | Prometheus v2.50, Grafana 11, Loki 3 |
