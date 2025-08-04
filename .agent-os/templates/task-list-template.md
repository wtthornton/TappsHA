# Task List Template

## Project: [Project Name]

**Document**: Task List Template  
**Created**: [Date]  
**Version**: 1.0  
**Status**: Active  
**Next Review**: [Date]  
**Owner**: Development Team  

## Tasks

### Task Structure Template
Each task should follow this structure:

```markdown
- [ ] [Task Number]. **[Task Title]**
  - [ ] [Task Number].[Sub-task Number] [Sub-task description]
  - [ ] [Task Number].[Sub-task Number] [Sub-task description]
  - [ ] [Task Number].[Sub-task Number] [Sub-task description]
  - [ ] [Task Number].[Sub-task Number] **Update lessons learned** - Capture insights from [task name] implementation
  - **Progress Note**: [Brief description of current progress]
```

### Mandatory Lessons Learned Integration

**ALWAYS** include a lessons learned sub-task as the final sub-task of each main task:

```markdown
- [ ] [Task Number].[Final Sub-task Number] **Update lessons learned** - Capture insights from [task name] implementation
```

### Lessons Learned Requirements

#### Capture Triggers (Per Agent OS Standards)
- **ALWAYS** capture lessons after sub-task completion
- **ALWAYS** capture lessons after milestone completion
- **ALWAYS** capture lessons after incident resolution
- **ALWAYS** capture lessons after performance optimizations
- **ALWAYS** capture lessons after security implementations

#### Lessons Learned Process
1. **Use appropriate category directory** (development, testing, deployment, etc.)
2. **Follow lesson template structure** from `.agent-os/lessons-learned/templates/`
3. **Include all required sections**:
   - Lesson Information (Date, Project, Phase, Priority)
   - Context (What was the situation?)
   - Action Taken (What was done?)
   - Results (What were the outcomes?)
   - Key Insights (What did we learn?)
   - Recommendations (What should we do differently?)
   - Impact Assessment (How significant is this lesson?)
   - Related Lessons (Links to related experiences)
   - Follow-up Actions (What needs to be done?)
   - Tags (Categories for searching)

#### Validation Checklist
Before completing any development session, verify:
- [ ] Lessons are captured for significant tasks
- [ ] Lessons follow template structure
- [ ] Lessons include actionable recommendations
- [ ] Lessons are properly categorized and tagged
- [ ] High-impact lessons are identified for integration

### Task Update Protocol

#### Immediate Updates
- **ALWAYS** mark completed subtasks with `[x]` immediately after completion
- **ALWAYS** add progress notes for completed sections
- **ALWAYS** update completion percentages
- **NEVER** wait until the end of a session to update tasks

#### Progress Documentation
```markdown
- [x] [Sub-task Number] [Sub-task description]
  - **Progress Note**: [Detailed description of what was accomplished]
  - **Completed**: [Timestamp]
  - **Next**: [Next sub-task to work on]
```

### Example Task Structure

```markdown
- [ ] 1. **Example Task**
  - [ ] 1.1 Implement core functionality
  - [ ] 1.2 Add error handling
  - [ ] 1.3 Create unit tests
  - [ ] 1.4 **Update lessons learned** - Capture insights from example task implementation
  - **Progress Note**: Core functionality implementation in progress

- [x] 2. **Completed Task**
  - [x] 2.1 Implement feature A
  - [x] 2.2 Add feature B
  - [x] 2.3 **Update lessons learned** - Capture insights from completed task implementation
  - **Progress Note**: All features implemented and tested successfully
```

### Integration with Agent OS Standards

#### Standards Compliance
- **ALWAYS** follow technology stack standards from `@~/.agent-os/standards/tech-stack.md`
- **ALWAYS** follow code style standards from `@~/.agent-os/standards/code-style.md`
- **ALWAYS** follow best practices from `@~/.agent-os/standards/best-practices.md`
- **ALWAYS** follow security standards from `@~/.agent-os/standards/security-compliance.md`
- **ALWAYS** follow CI/CD strategy from `@~/.agent-os/standards/ci-cd-strategy.md`
- **ALWAYS** follow testing strategy from `@~/.agent-os/standards/testing-strategy.md`

#### Lessons Learned Integration
- **ALWAYS** reference lessons learned framework from `@~/.agent-os/lessons-learned/README.md`
- **ALWAYS** use lesson templates from `@~/.agent-os/lessons-learned/templates/`
- **ALWAYS** follow lesson capture process from `@~/.agent-os/lessons-learned/process/lessons-learned-process.md`

---

**Document Status**: ✅ **Template**  
**Next Review**: [Date]  
**Owner**: Development Team  
**Approved**: Development Team 