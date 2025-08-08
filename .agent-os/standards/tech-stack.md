# Tech Stack (2025, Enhanced) - Context7 Priority

## MANDATORY: Context7 First Approach

**ALWAYS** validate technology choices against Context7 documentation before implementing.

### Frontend
- React 19.x + TypeScript 5.x (validate via Context7)
- **TailwindCSS 3.x (STABLE)** - AVOID TailwindCSS 4.x in production until fully stable
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

## CRITICAL LESSONS LEARNED

### Tailwind CSS Version Compatibility
**ISSUE**: Tailwind CSS 4.x caused CSS build failures (0-byte CSS files)
**SOLUTION**: Use Tailwind CSS 3.x for production until 4.x is fully stable
**VALIDATION**: Always verify CSS file size after build (should be >10KB, not 0 bytes)

### CSS Build Validation Checklist
1. **File Size Check**: CSS files must be >10KB, not 0 bytes
2. **PostCSS Config**: Ensure proper PostCSS configuration for Tailwind 3.x
3. **Build Process**: Verify CSS is generated during build process
4. **Runtime Check**: Confirm CSS loads in browser (not default browser styles)

### Docker Port Mapping Issues
**ISSUE**: Incorrect port mapping between container and host
**SOLUTION**: Always verify `docker-compose.yml` port mappings match container service ports
**EXAMPLE**: Frontend serves on port 80 (Nginx), map as `"5173:80"` not `"5173:5173"`

### Authentication Development Mode
**ISSUE**: Authentication blocking development testing
**SOLUTION**: Implement development bypass for localhost testing
**PATTERN**: Check `window.location.hostname === 'localhost'` for dev mode

## Technology Lessons Learned
- **Capture:** Document technology choices, performance insights, and migration experiences
- **Apply:** Update tech stack recommendations based on lessons learned and Context7 findings
- **Reference:** See `@~/.agent-os/lessons-learned/categories/development/README.md` for technology lessons

**Cursor Effect:** Guides AI to **choose the right modern stack** and generate compatible code & config using Context7 as the primary source.
