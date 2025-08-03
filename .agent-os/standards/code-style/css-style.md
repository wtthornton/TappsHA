# Tech Stack

## Context
Default **Agent‑OS** stack aligned to 2025 best-practices.

| Layer | Technology | Version / Notes |
|-------|------------|-----------------|
| **Frontend** | React | **19.1** (stable July 2025) |
|  | TypeScript | **5.5** |
|  | Vite | 6.x |
|  | TailwindCSS | **4.1** + shadcn/ui |
|  | State | TanStack Query 5, Context API |
| **Mobile** | PWA | Workbox 7 |
| **Backend** | Spring Boot | **3.5.3** (Java 21 LTS) |
|  | Build | Gradle 9, Testcontainers |
|  | API | REST, gRPC, Kafka 4 |
| **Data** | PostgreSQL | **17.5**, pgvector 0.7 |
|  | InfluxDB | **3.3 Core** |
| **AI** | OpenAI GPT‑4o, LangChain 0.3 |
| **CI/CD** | GitHub Actions, Docker Buildx |
| **Runtime** | Docker 27.5, Compose V2 (Windows + WSL2) |
| **Observability** | Prometheus 3.5, Grafana 12.1, Loki 3 |
| **Tracing** | OpenTelemetry 1.52 |
