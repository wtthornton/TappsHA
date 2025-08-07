# Task Tracking Checklist

## Overview
This checklist ensures proper task tracking and progress documentation throughout development sessions.

## Pre-Session Checklist

### Before Starting Development
- [ ] Review current tasks.md file for project status
- [ ] Identify next priority tasks to work on
- [ ] Verify task file structure meets standards
- [ ] Check for any incomplete task updates from previous sessions

## During Development Session

### For Each Subtask Completed
- [ ] **IMMEDIATELY** mark the subtask as `[x]` in tasks.md
- [ ] Add progress note with detailed description of what was accomplished
- [ ] Include timestamp of completion
- [ ] **RUN COMPLIANCE CHECK**: Execute `node compliance-checker.js --detailed`
- [ ] Verify compliance score remains ≥85% after changes
- [ ] Address any new violations before proceeding
- [ ] Document compliance status in progress notes
- [ ] Note any issues or challenges encountered
- [ ] Document any dependencies or blockers discovered
- [ ] **CAPTURE LESSONS LEARNED** if significant insights gained (see `@~/.agent-os/lessons-learned/README.md`)

### Progress Documentation Standards
```markdown
- [x] 1.1 Write tests for new database entities
  - **Progress Note**: Unit tests implemented with 95% coverage for HomeAssistantEvent entity
  - **Completed**: 2025-08-03 19:45
  - **Compliance Check**: ✅ Score 95% - No violations detected
  - **Issues**: None encountered
  - **Next**: 1.2 Create database migration script
```

### Quality Standards for Task Updates
- [ ] Use clear, descriptive task names
- [ ] Provide sufficient detail in progress notes
- [ ] Maintain chronological order of updates
- [ ] Cross-reference with related documentation
- [ ] Include technical details relevant to the task

## End-of-Session Checklist

### Session Summary Documentation
- [ ] Add session summary section with timestamp
- [ ] List all completed subtasks with descriptions
- [ ] Identify next priority tasks
- [ ] Update overall progress percentage
- [ ] Document any remaining work or blockers

### Session Summary Template
```markdown
## Session Summary - YYYY-MM-DD HH:MM

### ✅ Completed in This Session
- [x] Task 1.1: Write tests for new database entities
  - Implemented comprehensive unit tests with 95% coverage
  - Added test cases for all entity relationships
  - Verified proper validation and constraint testing

- [x] Task 2.3: Configure Kafka producer and consumer
  - Added Spring Kafka dependencies to pom.xml
  - Implemented basic producer/consumer configuration
  - Set up topic management and partitioning strategy

### 🔄 Next Priority Tasks
- [ ] Task 1.2: Create database migration script
- [ ] Task 2.4: Implement Kafka health check and monitoring

### 📊 Progress Update
- **Overall Progress**: 75% Complete (up from 70%)
- **Sections Complete**: 7/8 major sections
- **Remaining Work**: Integration testing, OAuth2 provider setup, frontend-backend connection
```

### Validation Checklist
Before ending development session, verify:
- [ ] All completed subtasks are marked with `[x]`
- [ ] Compliance checks run after each subtask completion
- [ ] All compliance scores remain ≥85%
- [ ] No new violations introduced
- [ ] Progress notes are added for completed sections
- [ ] Session summary is documented with timestamp
- [ ] Next priority tasks are clearly identified
- [ ] Overall progress percentage is updated
- [ ] Remaining work is documented
- [ ] Task file structure meets standards
- [ ] No incomplete or placeholder updates remain
- [ ] **LESSONS LEARNED CAPTURED** for significant tasks (see `@~/.agent-os/lessons-learned/README.md`)

## Task File Structure Validation

### Required Sections Check
- [ ] **Tasks** section with numbered major sections
- [ ] **Recent Completion Summary** section
- [ ] **Next Priority Tasks** section
- [ ] **Overall Progress** section with percentage
- [ ] **Session Summary** sections (if applicable)

### Content Quality Check
- [ ] Task names are clear and descriptive
- [ ] Progress notes provide sufficient technical detail
- [ ] Completion status is accurate and up-to-date
- [ ] Next steps are clearly defined
- [ ] Progress percentages are calculated correctly

## Integration with Development Workflow

### Commit Message Integration
- [ ] Reference task numbers in commit messages
- [ ] Include brief description of task completion
- [ ] Link to relevant documentation or issues

### Pull Request Integration
- [ ] Include task updates in PR description
- [ ] Reference completed tasks in PR comments
- [ ] Update task status based on PR review feedback

### Documentation Cross-Reference
- [ ] Link tasks.md to related documentation
- [ ] Update README files with task progress
- [ ] Cross-reference with technical specifications
- [ ] Update project roadmap based on task completion

## Error Prevention

### Common Mistakes to Avoid
- [ ] Don't wait until end of session to update tasks
- [ ] Don't use vague or incomplete progress notes
- [ ] Don't forget to update completion percentages
- [ ] Don't skip session summaries
- [ ] Don't leave tasks in inconsistent state

### Quality Assurance
- [ ] Review task updates for accuracy
- [ ] Verify technical details in progress notes
- [ ] Ensure chronological order of updates
- [ ] Check for missing or incomplete information
- [ ] Validate progress calculations

## Continuous Improvement

### Regular Reviews
- [ ] Weekly review of task tracking quality
- [ ] Monthly assessment of task structure effectiveness
- [ ] Quarterly evaluation of task tracking process
- [ ] Annual review of task tracking standards

### Feedback Integration
- [ ] Collect feedback on task tracking effectiveness
- [ ] Incorporate improvements to task structure
- [ ] Update standards based on team feedback
- [ ] Refine task tracking process based on usage patterns

## References

- **Enforcement Standards**: `@~/.agent-os/standards/enforcement.md`
- **Cursor Rules**: `.cursorrules`
- **Task Tracking Standards**: Section in enforcement.md
- **Project Standards**: `@~/.agent-os/standards/` 