# Context7 Integration Guide

## Overview

This guide establishes Context7 as the primary source for documentation, best practices, and technology validation in the TappHA project, with Agent OS standards serving as a fallback for project-specific requirements.

## Context7 Priority Hierarchy

### 1. Primary Source: Context7
**ALWAYS** use Context7 first for:
- Library documentation and API references
- Code examples and best practices
- Version-specific information
- Official documentation from library maintainers
- Current patterns and recommendations

### 2. Fallback Source: Agent OS
**ONLY** use Agent OS standards when:
- Context7 doesn't have documentation for the specific library
- Context7 documentation is outdated or incomplete
- Agent OS has project-specific requirements not covered by Context7
- Project-specific architectural patterns and conventions

## Context7 Integration Process

### Before Writing Code
1. **Context7 Check**: Always consult Context7 for current documentation
2. **Version Validation**: Verify you're using the latest stable versions
3. **Pattern Validation**: Follow official patterns and best practices
4. **Compatibility Check**: Ensure all components work together
5. **Agent OS Integration**: Apply project-specific requirements

### During Development
1. **Real-time Validation**: Use Context7 to verify patterns as you code
2. **Best Practice Application**: Follow official recommendations
3. **Security Compliance**: Apply current security guidelines
4. **Performance Optimization**: Use recommended performance patterns

### After Implementation
1. **Documentation Review**: Verify against Context7 documentation
2. **Testing Validation**: Ensure tests follow current best practices
3. **Security Audit**: Validate against current security standards
4. **Performance Review**: Check against performance recommendations

## Context7 Usage by Technology

### React Development
**Primary Context7 Sources:**
- `/reactjs/react.dev` - Official React documentation
- `/tanstack/react-query` - TanStack Query documentation
- `/tailwindlabs/tailwindcss` - TailwindCSS documentation

**Key Areas:**
- React Hooks patterns and best practices
- Component lifecycle management
- State management with Context API
- Performance optimization techniques
- Accessibility guidelines (WCAG 2.2 AA)

### Spring Boot Development
**Primary Context7 Sources:**
- `/spring-projects/spring-boot` - Official Spring Boot documentation
- `/spring-projects/spring-security` - Spring Security documentation
- `/spring-projects/spring-data-jpa` - Spring Data JPA documentation

**Key Areas:**
- REST API design patterns
- Security implementation with OAuth 2.1
- Database integration with JPA/Hibernate
- Testing strategies with JUnit and Testcontainers
- Observability with Spring Boot Actuator

### AI/ML Development
**Primary Context7 Sources:**
- `/openai/openai-node` - OpenAI API documentation
- `/langchain-ai/langchain` - LangChain documentation
- `/pgvector/pgvector` - pgvector documentation

**Key Areas:**
- OpenAI API integration patterns
- LangChain application development
- Vector database integration
- Model optimization techniques
- Cost-effective AI operations

### Database Development
**Primary Context7 Sources:**
- `/postgres/postgres` - PostgreSQL documentation
- `/influxdata/influxdb` - InfluxDB documentation
- `/pgvector/pgvector` - pgvector documentation

**Key Areas:**
- PostgreSQL optimization and indexing
- Time-series data management
- Vector similarity search
- Database migration strategies
- Connection pooling and performance

## Context7 Validation Checklist

### Before Implementation
- [ ] Context7 documentation consulted for all libraries
- [ ] Current versions verified and compatible
- [ ] Official patterns and examples followed
- [ ] Security best practices applied
- [ ] Performance recommendations implemented
- [ ] Testing strategies aligned with current practices

### During Development
- [ ] Code follows Context7 patterns
- [ ] API usage matches current documentation
- [ ] Error handling follows best practices
- [ ] Security measures implemented correctly
- [ ] Performance optimizations applied

### After Implementation
- [ ] Documentation matches Context7 standards
- [ ] Tests follow current best practices
- [ ] Security audit completed
- [ ] Performance benchmarks met
- [ ] Code review against Context7 patterns

## Context7 Integration Examples

### React Component with Context7 Patterns
```typescript
// ✅ Good: Following Context7 React patterns
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface User {
  id: number;
  name: string;
  email: string;
}

function UserProfile({ userId }: { userId: number }) {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading user</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold">{user.name}</h2>
      <p className="text-gray-600">{user.email}</p>
    </div>
  );
}
```

### Spring Boot Controller with Context7 Patterns
```java
// ✅ Good: Following Context7 Spring Boot patterns
@RestController
@RequestMapping("/api/users")
@Validated
public class UserController {
    
    private final UserService userService;
    
    public UserController(UserService userService) {
        this.userService = userService;
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUser(@PathVariable @Min(1) Long id) {
        User user = userService.findById(id)
            .orElseThrow(() -> new UserNotFoundException(id));
        
        return ResponseEntity.ok(UserResponse.from(user));
    }
    
    @PostMapping
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        User user = userService.create(request.toUser());
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(UserResponse.from(user));
    }
}
```

### AI Integration with Context7 Patterns
```typescript
// ✅ Good: Following Context7 OpenAI patterns
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateAISuggestion(prompt: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant for home automation.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate AI suggestion');
  }
}
```

## Context7 Reference Library

### Frontend Libraries
- **React:** `/reactjs/react.dev`
- **TanStack Query:** `/tanstack/react-query`
- **TailwindCSS:** `/tailwindlabs/tailwindcss`
- **Vite:** `/vitejs/vite`
- **TypeScript:** `/microsoft/TypeScript`

### Backend Libraries
- **Spring Boot:** `/spring-projects/spring-boot`
- **Spring Security:** `/spring-projects/spring-security`
- **Spring Data JPA:** `/spring-projects/spring-data-jpa`
- **JUnit:** `/junit-team/junit5`
- **Testcontainers:** `/testcontainers/testcontainers-java`

### AI/ML Libraries
- **OpenAI:** `/openai/openai-node`
- **LangChain:** `/langchain-ai/langchain`
- **pgvector:** `/pgvector/pgvector`

### Database Libraries
- **PostgreSQL:** `/postgres/postgres`
- **InfluxDB:** `/influxdata/influxdb`
- **Hibernate:** `/hibernate/hibernate-orm`

### DevOps Libraries
- **Docker:** `/docker/docs`
- **Prometheus:** `/prometheus/prometheus`
- **Grafana:** `/grafana/grafana`

## Integration with Agent OS Standards

### When to Use Agent OS
- Project-specific architectural patterns
- Internal coding conventions
- Security policies specific to the project
- CI/CD configurations
- Deployment strategies
- Project-specific testing requirements

### Agent OS Integration Process
1. **Context7 First**: Always check Context7 for current patterns
2. **Agent OS Validation**: Ensure project-specific requirements are met
3. **Integration**: Combine Context7 patterns with Agent OS requirements
4. **Documentation**: Update Agent OS standards based on Context7 findings

## Best Practices

### Documentation Management
- Always reference Context7 documentation in code comments
- Include Context7 library IDs in documentation
- Update project documentation when Context7 patterns change
- Maintain compatibility between Context7 and Agent OS standards

### Version Management
- Regularly check Context7 for version updates
- Validate compatibility between all components
- Update dependencies based on Context7 recommendations
- Test thoroughly after version updates

### Security Integration
- Follow Context7 security best practices
- Apply Agent OS security policies
- Regular security audits using Context7 guidelines
- Keep security dependencies updated

### Performance Optimization
- Use Context7 performance recommendations
- Apply Agent OS performance standards
- Regular performance testing and optimization
- Monitor performance metrics continuously

## Troubleshooting

### Context7 Unavailable
If Context7 is unavailable:
1. Use cached Context7 documentation
2. Fall back to Agent OS standards
3. Document the issue for future reference
4. Update when Context7 becomes available

### Version Conflicts
If version conflicts arise:
1. Check Context7 for compatibility information
2. Validate against Agent OS requirements
3. Choose the most current stable version
4. Test thoroughly before deployment

### Pattern Conflicts
If Context7 and Agent OS patterns conflict:
1. Prioritize Context7 patterns
2. Adapt Agent OS requirements where possible
3. Document the conflict and resolution
4. Update Agent OS standards if needed

## Conclusion

Context7 integration ensures the TappHA project always uses the most current, official documentation and best practices while maintaining project-specific requirements through Agent OS standards. This approach provides the best of both worlds: current technology patterns and project-specific governance. 