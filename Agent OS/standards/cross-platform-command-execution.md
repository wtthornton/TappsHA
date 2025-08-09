# Cross-Platform Command Execution Standards

**Document Version:** 1.0  
**Created:** 2025-08-05  
**Last Updated:** 2025-08-05  
**Status:** MANDATORY

## Overview

This document establishes mandatory standards for command execution across different operating systems and shells, ensuring consistent behavior in Agent OS environments.

## Critical PowerShell vs Unix Differences

### ❌ NEVER Use These Patterns

#### Command Chaining with &&
```bash
# FAILS in PowerShell
cd backend && mvn test

# Error: The token '&&' is not a valid statement separator
```

#### Unix-Style Grep Piping
```bash
# FAILS in PowerShell
docker volume ls | grep kafka

# Error: 'grep' is not recognized as a cmdlet
```

### ✅ ALWAYS Use These Patterns

#### Separate Command Calls
```bash
# CORRECT - Use separate run_terminal_cmd calls
cd backend
mvn test
```

#### PowerShell Semicolon Chaining
```bash
# CORRECT - PowerShell compatible
cd backend; mvn test
```

#### PowerShell Native Filtering
```bash
# CORRECT - Use PowerShell filtering instead of grep
docker volume ls | Where-Object { $_ -like "*kafka*" }
```

## Mandatory Implementation Standards

### 1. Command Execution Strategy

```markdown
## Before Executing Commands:
1. Check shell type if available
2. Use separate tool calls for command chains
3. Implement graceful fallbacks for platform-specific commands
4. Test critical commands in both environments
```

### 2. Error Handling Requirements

```javascript
// Example: Command execution with error handling
function executeCommand(command) {
    try {
        // Attempt command execution
        result = runCommand(command);
        if (result.exitCode !== 0) {
            // Implement fallback strategy
            return handleCommandFailure(command, result);
        }
        return result;
    } catch (error) {
        // Handle platform-specific errors
        return handlePlatformError(error, command);
    }
}
```

### 3. Platform Detection Patterns

```markdown
## Shell Detection Strategies:
- Check $SHELL environment variable (Unix)
- Check $PSVersionTable (PowerShell)  
- Use exit code patterns for shell identification
- Implement command-specific fallbacks
```

## Common Command Translations

### File Operations
| Unix/Linux | PowerShell | Agent OS Standard |
|------------|------------|-------------------|
| `ls -la` | `Get-ChildItem` | Use separate `list_dir` tool |
| `grep pattern` | `Select-String` | Use separate `grep_search` tool |
| `find . -name` | `Get-ChildItem -Recurse` | Use `file_search` tool |
| `cat file` | `Get-Content` | Use `read_file` tool |

### Process Management
| Unix/Linux | PowerShell | Agent OS Standard |
|------------|------------|-------------------|
| `ps aux` | `Get-Process` | Use Docker/service-specific commands |
| `kill -9 pid` | `Stop-Process -Force` | Use Docker stop/restart |
| `nohup cmd &` | `Start-Job` | Use `is_background: true` flag |

### Network Operations
| Unix/Linux | PowerShell | Agent OS Standard |
|------------|------------|-------------------|
| `curl url` | `Invoke-WebRequest` | Use HTTP client libraries |
| `wget url` | `Invoke-WebRequest` | Use download tools |
| `netstat -an` | `Get-NetTCPConnection` | Use Docker/service health checks |

## Development Environment Specific Standards

### Docker Operations
```bash
# CORRECT - Works in all environments
docker ps
docker logs container_name --tail 10
docker-compose up -d service_name

# AVOID - Platform-specific piping
docker ps | grep service_name
```

### Build Operations
```bash
# CORRECT - Separate commands
cd backend
mvn compile -q
mvn test -Dtest="SpecificTest"

# AVOID - Chained commands  
cd backend && mvn clean && mvn test
```

### Database Operations
```bash
# CORRECT - Direct database tools
docker exec postgres_container psql -U user -d database -c "SELECT * FROM table"

# AVOID - Complex shell piping
docker exec postgres_container psql -U user -d database | grep -v "column_name"
```

## Quality Assurance Checklist

### Pre-Execution Validation
- [ ] Command uses Agent OS approved tools
- [ ] No Unix-specific operators (&& || |)
- [ ] No platform-specific utilities (grep, awk, sed)
- [ ] Error handling implemented
- [ ] Fallback strategy defined

### Post-Execution Validation  
- [ ] Exit code checked
- [ ] Output properly captured
- [ ] Errors logged appropriately
- [ ] Platform differences documented

## Error Recovery Patterns

### Command Failure Recovery
```markdown
1. **Immediate Retry:** Try command once more with slight delay
2. **Platform Alternative:** Use platform-specific equivalent
3. **Tool Substitution:** Use Agent OS tool instead of shell command
4. **Manual Intervention:** Request user guidance for critical operations
```

### Common Error Signatures
```markdown
## PowerShell Error Patterns:
- "The token '&&' is not a valid statement separator"
- "'grep' is not recognized as a cmdlet"
- "Cannot bind argument to parameter"

## Unix Error Patterns:
- "command not found"
- "Permission denied"  
- "No such file or directory"
```

## Implementation Examples

### Safe Command Execution Pattern
```python
def safe_execute_command(base_command, args=None):
    """
    Execute command safely across platforms
    """
    try:
        # Use Agent OS run_terminal_cmd tool
        result = run_terminal_cmd(
            command=base_command + (" " + args if args else ""),
            explanation="Cross-platform command execution",
            is_background=False
        )
        
        if result.exit_code != 0:
            log_error(f"Command failed: {base_command}")
            return implement_fallback_strategy(base_command)
            
        return result
        
    except Exception as e:
        log_error(f"Platform-specific error: {e}")
        return request_manual_intervention(base_command)
```

### Docker Service Management Pattern
```python
def manage_docker_service(service_name, action):
    """
    Manage Docker services safely
    """
    commands = {
        'start': f'docker-compose up -d {service_name}',
        'stop': f'docker-compose stop {service_name}', 
        'restart': f'docker-compose restart {service_name}',
        'logs': f'docker logs {service_name} --tail 20'
    }
    
    command = commands.get(action)
    if not command:
        raise ValueError(f"Invalid action: {action}")
        
    return safe_execute_command(command)
```

## Compliance Enforcement

### Automated Checks
- Code review must verify command execution patterns
- CI/CD pipeline should test in both environments
- Agent OS tools preferred over direct shell commands
- Platform-specific code must be documented

### Manual Review Points
- All shell command usage reviewed for platform compatibility
- Error handling patterns implemented
- Fallback strategies documented
- Cross-platform testing performed

---

**Compliance Level:** MANDATORY  
**Enforcement:** Automated + Manual Review  
**Testing:** Required in PowerShell and Unix environments  
**Documentation:** Must include platform-specific notes