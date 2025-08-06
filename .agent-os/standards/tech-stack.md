# Tech Stack (2025, Enhanced) - Context7 Priority

## MANDATORY: Context7 First Approach

**ALWAYS** validate technology choices against Context7 documentation before implementing.

### Frontend
- React 19.x + TypeScript 5.x (validate via Context7)
- TailwindCSS 4.x (modern JIT + performance upgrades)
- Vite 5.x for builds (check Context7 for latest patterns)

### Backend
- Spring Boot 3.5.x (Java 21 LTS) - validate via Context7
- Maven or Gradle
- Micrometer + OpenTelemetry for observability

### Databases & Time Series
- PostgreSQL 17.x (with pgvector support) - validate via Context7
- InfluxDB 3.x for high-scale scenarios

### AI/ML
- OpenAI GPT-4o Mini (primary model for cost-effective operations)
- OpenAI GPT-4o (advanced model for complex reasoning)
- OpenAI GPT-3.5 Turbo (fallback model for simple operations)
- pgvector 0.7 for vector embeddings
- LangChain 0.3 for AI application development

### Observability
- Prometheus 3.x + Grafana 12.x
- Alertmanager for notifications

### CI/CD & Containers
- Docker 27.x multi-stage builds
- GitHub Actions for CI/CD pipelines

## Context7 Integration

### Technology Validation Process
1. **Context7 Check**: Always verify current versions and patterns via Context7
2. **Compatibility**: Ensure all components work together
3. **Best Practices**: Follow official recommendations
4. **Project Integration**: Apply project-specific requirements

### Reference Libraries (Context7)
- **React:** `/reactjs/react.dev`
- **Spring Boot:** `/spring-projects/spring-boot`
- **OpenAI:** `/openai/openai-node`
- **LangChain:** `/langchain-ai/langchain`
- **PostgreSQL:** `/postgres/postgres`
- **Docker:** `/docker/docs`

## Technology Lessons Learned
- **Capture:** Document technology choices, performance insights, and migration experiences
- **Apply:** Update tech stack recommendations based on lessons learned and Context7 findings
- **Reference:** See `@~/.agent-os/lessons-learned/categories/development/README.md` for technology lessons

**Cursor Effect:** Guides AI to **choose the right modern stack** and generate compatible code & config using Context7 as the primary source.
