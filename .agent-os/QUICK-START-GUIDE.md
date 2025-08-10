# ⚡ Agent OS Quick Start Guide
*Get up and running in 5 minutes*

## 🚀 Super Quick Start (2 minutes)

```bash
# 1. Navigate to your project root
cd your-project

# 2. Run one command to set everything up
node .agent-os/scripts/quick-start.js

# 3. You're done! Start coding with standards enforcement
```

---

## 🎯 What You Get

✅ **Real-time code validation** - Immediate feedback on standards violations  
✅ **Cursor.ai integration** - Seamless IDE experience  
✅ **Automated compliance checking** - 95%+ quality scores guaranteed  
✅ **Phase-based development** - Systematic refactoring and improvement  
✅ **Lessons learned integration** - Learn from real-world experience  

---

## 🔧 Essential Commands

| Need | Command |
|------|---------|
| **Check status** | `node .agent-os/scripts/setup.js status` |
| **Run validation** | `node .agent-os/scripts/setup.js validate` |
| **Check compliance** | `node .agent-os/scripts/setup.js compliance` |
| **Cursor integration** | `node .agent-os/tools/cursor/cursor-integrate.js` |

---

## 📋 5-Minute Setup

### Step 1: Environment Check (1 min)
```bash
# Verify Node.js version (16+ required)
node --version

# Check if .agent-os exists
ls -la .agent-os
```

### Step 2: Quick Setup (2 min)
```bash
# Run interactive setup
node .agent-os/scripts/setup.js

# Follow the prompts - it's self-explanatory!
```

### Step 3: Cursor Integration (1 min)
```bash
# One-click Cursor setup
node .agent-os/tools/cursor/cursor-integrate.js
```

### Step 4: Verify Everything (1 min)
```bash
# Check system health
node .agent-os/scripts/setup.js status

# Run quick validation
node .agent-os/scripts/setup.js validate
```

---

## 🎯 Daily Workflow

### 🌅 Morning (30 seconds)
```bash
node .agent-os/scripts/setup.js status
```

### 💻 During Development
- **Real-time monitoring is automatic**
- **Immediate feedback on violations**
- **Standards enforcement in real-time**

### 🌆 End of Day (1 minute)
```bash
# Quick compliance check
node .agent-os/scripts/setup.js compliance

# Update lessons learned
node .agent-os/tools/lessons/lesson-categorizer.js --add
```

---

## 🚨 Quick Troubleshooting

### ❌ "Command not found"
```bash
# Make sure you're in project root
pwd
ls -la .agent-os
```

### ❌ "Permission denied"
```bash
# Fix permissions
chmod +x .agent-os/scripts/*.js
```

### ❌ Low compliance score
```bash
# Get detailed analysis
node .agent-os/tools/compliance-checker.js --detailed
```

---

## 📊 Quality Gates (Automatic)

| Metric | Target | Status |
|--------|--------|--------|
| **Security** | 100% encryption, 0 secrets | ✅ Auto-enforced |
| **Code Quality** | ≤5 TODOs, ≥85% tests | ✅ Auto-enforced |
| **Performance** | P95 ≤200ms | ✅ Auto-enforced |

---

## 🔄 Development Phases

### Phase 1: Foundation
- Security hardening
- Error handling
- Basic architecture

### Phase 2: Integration
- API standardization
- Service decomposition
- Testing coverage

### Phase 3: Advanced Features
- Performance optimization
- Advanced patterns
- Quality refinement

**After each phase, run:**
```bash
node .agent-os/tools/refactoring-validator.js --phase=1 --validate
```

---

## 🎉 Success Indicators

You're successfully using Agent OS when:

- ✅ `node .agent-os/scripts/setup.js status` shows "healthy"
- ✅ Compliance score is ≥85%
- ✅ Real-time validation provides immediate feedback
- ✅ Cursor.ai shows Agent OS guidance
- ✅ Development follows established patterns

---

## 📚 Next Steps

1. **Read the full User Guide**: `.agent-os/USER-GUIDE.md`
2. **Explore tools**: `node .agent-os/tools/agent-os-cli.js --help`
3. **Check standards**: `.agent-os/standards/`
4. **Review lessons**: `.agent-os/lessons-learned/`

---

## 🆘 Need Help?

```bash
# Built-in help on any tool
node .agent-os/scripts/setup.js --help
node .agent-os/tools/compliance-checker.js --help

# Check system status
node .agent-os/scripts/setup.js status
```

---

## 🎯 Quick Reference Card

| Task | Command | Time |
|------|---------|------|
| **Setup** | `node .agent-os/scripts/quick-start.js` | 2 min |
| **Status** | `node .agent-os/scripts/setup.js status` | 5 sec |
| **Validation** | `node .agent-os/scripts/setup.js validate` | 10 sec |
| **Compliance** | `node .agent-os/scripts/setup.js compliance` | 15 sec |
| **Cursor Setup** | `node .agent-os/tools/cursor/cursor-integrate.js` | 1 min |

---

*You're now ready to develop with Agent OS standards enforcement! 🚀*

*For detailed information, see: `.agent-os/USER-GUIDE.md`*
