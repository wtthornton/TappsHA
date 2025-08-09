# Context7 MCP Usage Guide for TappHA Development

## Quick Start Guide

### Context7 MCP Tools Available
The TappHA project has access to two main Context7 MCP tools:

1. **`mcp_Context7_resolve-library-id`** - Find Context7-compatible library IDs
2. **`mcp_Context7_get-library-docs`** - Fetch real-time documentation

### Basic Usage Pattern

#### Step 1: Resolve Library ID
```bash
# Find the Context7 ID for a library
mcp_Context7_resolve-library-id("React")
# Returns: /reactjs/react.dev

mcp_Context7_resolve-library-id("Home Assistant WebSocket API")  
# Returns: /home-assistant/developers.home-assistant
```

#### Step 2: Get Documentation
```bash
# Fetch specific documentation
mcp_Context7_get-library-docs("/reactjs/react.dev", topic="hooks", tokens=5000)

# Get Home Assistant WebSocket docs (successfully tested)
mcp_Context7_get-library-docs("/home-assistant/developers.home-assistant", topic="WebSocket API authentication", tokens=5000)
```

## TappHA-Specific Library Mappings

### Frontend Development
```bash
# React patterns and best practices
mcp_Context7_get-library-docs("/reactjs/react.dev", topic="functional components")

# TypeScript types and patterns  
mcp_Context7_get-library-docs("/microsoft/typescript", topic="interfaces")

# TailwindCSS utilities
mcp_Context7_get-library-docs("/tailwindlabs/tailwindcss.com", topic="responsive design")

# TanStack Query data fetching
mcp_Context7_get-library-docs("/tanstack/query", topic="mutations and caching")

# Vite build configuration
mcp_Context7_get-library-docs("/vitejs/vite", topic="configuration")
```

### Backend Development
```bash
# Spring Boot REST APIs
mcp_Context7_get-library-docs("/spring-projects/spring-boot", topic="REST controllers")

# PostgreSQL with vector extensions
mcp_Context7_get-library-docs("/context7/postgresql-17", topic="pgvector")
```

### Home Assistant Integration
```bash
# WebSocket API (✅ Successfully tested)
mcp_Context7_get-library-docs("/home-assistant/developers.home-assistant", topic="WebSocket API authentication")

# REST API patterns
mcp_Context7_get-library-docs("/home-assistant/developers.home-assistant", topic="REST API")

# Event handling
mcp_Context7_get-library-docs("/home-assistant/developers.home-assistant", topic="event subscription")
```

## Development Workflow Integration

### Before Writing Code
1. **Research Current Patterns**
   ```bash
   # Check current authentication patterns
   mcp_Context7_get-library-docs("/home-assistant/developers.home-assistant", topic="authentication")
   ```

2. **Verify API Signatures**
   ```bash
   # Get latest API documentation
   mcp_Context7_get-library-docs("/reactjs/react.dev", topic="useState hook")
   ```

### During Development
1. **Reference Examples**
   ```bash
   # Get code examples for specific features
   mcp_Context7_get-library-docs("/tanstack/query", topic="optimistic updates")
   ```

2. **Validate Patterns**
   ```bash
   # Check if implementation follows best practices
   mcp_Context7_get-library-docs("/microsoft/typescript", topic="error handling")
   ```

### Code Review Process
1. **Documentation Compliance**
   - Verify patterns match Context7 recommendations
   - Check for deprecated methods or patterns
   - Validate security best practices

2. **Version Compatibility**
   - Ensure using supported API versions
   - Check for breaking changes in dependencies

## Real-World Usage Examples

### ✅ Successful Context7 Integration Test
During TappHA development, we successfully used Context7 to get Home Assistant WebSocket API documentation:

```bash
# Command used
mcp_Context7_get-library-docs("/home-assistant/developers.home-assistant", topic="WebSocket API authentication", tokens=5000)

# Result: Comprehensive WebSocket authentication flow documentation
# Including: auth_required, auth, auth_ok messages
# Plus: Feature enablement, event subscription patterns
```

This real-time documentation access helped validate our WebSocket implementation against the official Home Assistant API patterns.

### Example: React Component Development
```bash
# 1. Get current React patterns
mcp_Context7_get-library-docs("/reactjs/react.dev", topic="useEffect cleanup")

# 2. Check TypeScript best practices  
mcp_Context7_get-library-docs("/microsoft/typescript", topic="component props")

# 3. Verify TailwindCSS utilities
mcp_Context7_get-library-docs("/tailwindlabs/tailwindcss.com", topic="grid layout")
```

### Example: API Integration
```bash
# 1. Check current fetch patterns
mcp_Context7_get-library-docs("/tanstack/query", topic="error handling")

# 2. Verify authentication methods
mcp_Context7_get-library-docs("/home-assistant/developers.home-assistant", topic="bearer token")

# 3. Get WebSocket patterns
mcp_Context7_get-library-docs("/websockets/ws", topic="reconnection")
```

## Context7 vs Agent OS Standards

### Use Context7 For:
- ✅ **Current API documentation** - Always up-to-date
- ✅ **Code examples** - Official patterns and best practices  
- ✅ **Version-specific information** - Latest features and deprecations
- ✅ **Official security guidelines** - Current security best practices

### Use Agent OS Standards For:
- 📋 **Project-specific requirements** - TappHA architectural decisions
- 📋 **Internal coding conventions** - Team-specific style guides
- 📋 **CI/CD configurations** - Project deployment strategies
- 📋 **Testing requirements** - Coverage and quality standards

### Integration Strategy
1. **Context7 First**: Always check Context7 for current patterns
2. **Agent OS Validation**: Ensure project requirements are met
3. **Combined Approach**: Use Context7 patterns within Agent OS framework

## Best Practices

### Effective Context7 Queries
✅ **Good Queries**:
- `"WebSocket API authentication"` - Specific functionality
- `"React hooks patterns"` - Focused on specific feature
- `"TailwindCSS responsive design"` - Clear topic

❌ **Poor Queries**:
- `"JavaScript"` - Too broad
- `"API"` - Not specific enough
- `"Frontend"` - Overly general

### Token Management
- **Small queries**: 1000-2000 tokens for specific topics
- **Comprehensive research**: 5000+ tokens for complex topics
- **API exploration**: 3000-4000 tokens for API documentation

### Caching Strategy
- Context7 responses are current and should be used immediately
- Don't cache Context7 responses for extended periods
- Re-query Context7 when working on new features or upgrades

## Troubleshooting

### Common Issues
1. **Library Not Found**: Try alternative search terms or check official names
2. **Empty Results**: Verify library ID is correct, try broader topic
3. **Outdated Information**: Context7 should always be current - report if not

### Fallback Strategy
1. **Context7 Unavailable**: Use Agent OS standards as documented
2. **Library Not in Context7**: Use official documentation directly
3. **Conflicting Information**: Prioritize Context7, validate with official sources

## Team Training

### Required Knowledge
- Understanding of Context7 MCP tools
- TappHA library mapping knowledge
- Integration with existing workflow

### Training Checklist
- [ ] Understand Context7 vs Agent OS roles
- [ ] Practice with common library queries
- [ ] Know when to use Context7 vs fallback
- [ ] Integrate into daily development workflow

---
**Created**: 2025-01-27  
**Status**: Operational  
**Last Updated**: During real TappHA Home Assistant integration testing  
**Validation**: Successfully tested with Home Assistant WebSocket API documentation