# 🚨 Agent OS Troubleshooting Guide
*Complete Guide to Resolving Issues and Errors*

## 📖 Table of Contents

- [🚨 Common Issues](#-common-issues)
- [🔍 Error Diagnosis](#-error-diagnosis)
- [🛠️ Quick Fixes](#️-quick-fixes)
- [🔧 System Recovery](#-system-recovery)
- [📊 Performance Issues](#-performance-issues)
- [🔗 Integration Problems](#-integration-problems)
- [📱 Platform-Specific Issues](#-platform-specific-issues)
- [📞 Getting Help](#-getting-help)

---

## 🚨 Common Issues

### ❌ "Command not found" Errors

**Symptoms:**
- `node: command not found`
- `npm: command not found`
- `git: command not found`

**Causes:**
- Not in project root directory
- Node.js not installed or not in PATH
- Missing dependencies

**Solutions:**
```bash
# 1. Check current directory
pwd
ls -la .agent-os

# 2. Verify Node.js installation
node --version
npm --version

# 3. If Node.js missing, install it
# Windows: Download from nodejs.org
# macOS: brew install node
# Linux: sudo apt install nodejs npm
```

### ❌ Permission Denied Errors

**Symptoms:**
- `EACCES: permission denied`
- `Error: ENOENT: access denied`
- Cannot execute scripts

**Causes:**
- Insufficient file permissions
- Windows UAC restrictions
- File ownership issues

**Solutions:**
```bash
# 1. Fix file permissions (Unix/macOS)
chmod +x .agent-os/scripts/*.js
chmod +x .agent-os/tools/*.js

# 2. Windows: Run as Administrator
# Right-click PowerShell/CMD → Run as Administrator

# 3. Check file ownership
ls -la .agent-os/scripts/
```

### ❌ Node.js Version Incompatibility

**Symptoms:**
- `SyntaxError: Unexpected token`
- `ReferenceError: Cannot access before initialization`
- Unexpected behavior in modern JavaScript

**Causes:**
- Node.js version below 16
- Using ES modules in older Node.js

**Solutions:**
```bash
# 1. Check Node.js version
node --version

# 2. Update Node.js (required: 16+)
# Windows: Download from nodejs.org
# macOS: brew upgrade node
# Linux: sudo apt update && sudo apt upgrade nodejs

# 3. Use Node Version Manager (nvm)
nvm install 18
nvm use 18
```

### ❌ .agent-os Directory Missing

**Symptoms:**
- `ENOENT: no such file or directory '.agent-os'`
- Cannot find .agent-os directory
- Setup script fails

**Causes:**
- Not in project root
- .agent-os directory deleted
- Wrong working directory

**Solutions:**
```bash
# 1. Navigate to project root
cd /path/to/your/project

# 2. Verify .agent-os exists
ls -la .agent-os

# 3. If missing, reinstall Agent OS
git clone <agent-os-repo> .agent-os
# OR restore from backup
```

---

## 🔍 Error Diagnosis

### 🔍 Diagnostic Commands

```bash
# 1. Check system status
node .agent-os/scripts/setup.js status --verbose

# 2. Validate environment
node .agent-os/tools/dependency-validator.js

# 3. Check compliance
node .agent-os/tools/compliance-checker.js --detailed

# 4. View system logs
cat .agent-os/logs/system.log
cat .agent-os/logs/error.log
```

### 🔍 Error Code Reference

| Error Code | Meaning | Severity | Solution |
|------------|---------|----------|----------|
| `E001` | Command not found | Low | Check PATH and installation |
| `E002` | Permission denied | Medium | Fix permissions or run as admin |
| `E003` | Node.js version incompatible | High | Update Node.js to 16+ |
| `E004` | .agent-os directory missing | Critical | Restore or reinstall |
| `E005` | Compliance score too low | Medium | Address violations |
| `E006` | Integration failed | High | Check integration status |
| `E007` | Dependency missing | Medium | Install missing dependencies |
| `E008` | Configuration invalid | Low | Fix configuration files |
| `E009` | Service unavailable | High | Check service status |
| `E010` | Database connection failed | Critical | Check database connectivity |

### 🔍 Log Analysis

```bash
# View recent errors
tail -f .agent-os/logs/error.log

# Search for specific errors
grep "E005" .agent-os/logs/*.log

# View system health
tail -f .agent-os/logs/system.log

# Export logs for analysis
cp .agent-os/logs/*.log ./logs-backup/
```

---

## 🛠️ Quick Fixes

### 🚀 Immediate Recovery

```bash
# 1. Quick system reset
node .agent-os/scripts/setup.js reset

# 2. Reinstall dependencies
node .agent-os/scripts/setup.js reinstall

# 3. Restore from backup
node .agent-os/scripts/setup.js restore

# 4. Validate system
node .agent-os/scripts/setup.js validate
```

### 🔧 Common Fixes

#### Fix Compliance Issues
```bash
# 1. Run detailed analysis
node .agent-os/tools/compliance-checker.js --detailed

# 2. Fix violations automatically
node .agent-os/tools/compliance-checker.js --fix

# 3. Check specific areas
node .agent-os/tools/compliance-checker.js --area="security"
node .agent-os/tools/compliance-checker.js --area="quality"
```

#### Fix Integration Issues
```bash
# 1. Check integration status
node .agent-os/scripts/start-enhanced-integration.js status

# 2. Restart integration
node .agent-os/scripts/start-enhanced-integration.js restart

# 3. Reinitialize Cursor integration
node .agent-os/tools/cursor/cursor-integrate.js
```

#### Fix Performance Issues
```bash
# 1. Check resource usage
node .agent-os/tools/analysis/statistical-analysis.js --resources

# 2. Optimize validation
node .agent-os/tools/compliance-checker.js --quick

# 3. Limit analysis scope
node .agent-os/tools/compliance-checker.js --scope="src/"
```

---

## 🔧 System Recovery

### 🚨 Critical System Failure

**Symptoms:**
- System completely unresponsive
- All commands fail
- Cannot access any tools

**Recovery Steps:**
```bash
# 1. Emergency reset
rm -rf .agent-os/node_modules
rm -rf .agent-os/package-lock.json

# 2. Reinstall dependencies
cd .agent-os
npm install

# 3. Restore configuration
cp .agent-os/config/backup/* .agent-os/config/

# 4. Validate system
node .agent-os/scripts/setup.js validate
```

### 🔄 Partial System Recovery

**Symptoms:**
- Some tools work, others don't
- Intermittent failures
- Performance degradation

**Recovery Steps:**
```bash
# 1. Check system health
node .agent-os/scripts/setup.js status

# 2. Restart specific services
node .agent-os/ide/real-time-cursor-enhancement.js restart

# 3. Clear caches
rm -rf .agent-os/cache/*
rm -rf .agent-os/temp/*

# 4. Validate components
node .agent-os/scripts/setup.js validate --components
```

### 💾 Data Recovery

**Symptoms:**
- Configuration lost
- Lessons learned missing
- Templates corrupted

**Recovery Steps:**
```bash
# 1. Check backup status
ls -la .agent-os/backups/

# 2. Restore from backup
node .agent-os/scripts/setup.js restore --backup=latest

# 3. Rebuild configuration
node .agent-os/scripts/setup.js configure

# 4. Validate data integrity
node .agent-os/tools/analysis/documentation-analyzer.js --validate
```

---

## 📊 Performance Issues

### 🐌 Slow Response Times

**Symptoms:**
- Commands take too long
- System feels sluggish
- High CPU/memory usage

**Diagnosis:**
```bash
# 1. Check resource usage
node .agent-os/tools/analysis/statistical-analysis.js --resources

# 2. Monitor performance
node .agent-os/tools/analysis/statistical-analysis.js --performance

# 3. Check for bottlenecks
node .agent-os/tools/analysis/statistical-analysis.js --bottlenecks
```

**Solutions:**
```bash
# 1. Optimize validation
node .agent-os/tools/compliance-checker.js --quick

# 2. Enable caching
node .agent-os/tools/compliance-checker.js --cache

# 3. Limit analysis scope
node .agent-os/tools/compliance-checker.js --scope="src/"

# 4. Use parallel processing
node .agent-os/tools/compliance-checker.js --parallel
```

### 💾 Memory Issues

**Symptoms:**
- Out of memory errors
- High memory usage
- System crashes

**Solutions:**
```bash
# 1. Set memory limits
NODE_OPTIONS="--max-old-space-size=4096" node .agent-os/tools/compliance-checker.js

# 2. Enable garbage collection monitoring
node --trace-gc .agent-os/tools/compliance-checker.js

# 3. Clear caches
rm -rf .agent-os/cache/*
rm -rf .agent-os/temp/*

# 4. Restart monitoring services
node .agent-os/ide/real-time-cursor-enhancement.js restart
```

---

## 🔗 Integration Problems

### 🎯 Cursor Integration Issues

**Symptoms:**
- Cursor rules not working
- No real-time validation
- Integration status shows failed

**Diagnosis:**
```bash
# 1. Check integration status
node .agent-os/tools/cursor/cursor-integrate.js status

# 2. Verify .cursorrules file
ls -la .cursorrules
cat .cursorrules

# 3. Check Cursor version
# Ensure Cursor is up to date
```

**Solutions:**
```bash
# 1. Reinitialize integration
node .agent-os/tools/cursor/cursor-integrate.js

# 2. Update integration
node .agent-os/tools/cursor/cursor-integrate.js update

# 3. Disconnect and reconnect
node .agent-os/tools/cursor/cursor-integrate.js disconnect
node .agent-os/tools/cursor/cursor-integrate.js
```

### 🔄 Real-time Monitoring Issues

**Symptoms:**
- No file change detection
- Validation not triggered
- Monitoring service down

**Diagnosis:**
```bash
# 1. Check monitoring status
node .agent-os/ide/real-time-cursor-enhancement.js status

# 2. Check file watcher
node .agent-os/ide/real-time-cursor-enhancement.js config

# 3. View monitoring logs
tail -f .agent-os/logs/monitoring.log
```

**Solutions:**
```bash
# 1. Restart monitoring
node .agent-os/ide/real-time-cursor-enhancement.js restart

# 2. Reconfigure watcher
node .agent-os/ide/real-time-cursor-enhancement.js config

# 3. Check file permissions
chmod +r .agent-os/ide/real-time-cursor-enhancement.js
```

---

## 📱 Platform-Specific Issues

### 🪟 Windows Issues

**Common Problems:**
- Path length limitations
- UAC restrictions
- PowerShell execution policy

**Solutions:**
```powershell
# 1. Fix execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 2. Use Windows Terminal or PowerShell 7+
# 3. Run as Administrator when needed
# 4. Use short paths if possible
```

### 🍎 macOS Issues

**Common Problems:**
- Permission issues with system directories
- Gatekeeper restrictions
- Homebrew conflicts

**Solutions:**
```bash
# 1. Fix permissions
sudo chown -R $(whoami) .agent-os/

# 2. Allow execution
chmod +x .agent-os/scripts/*.js

# 3. Check Homebrew
brew doctor
brew update
```

### 🐧 Linux Issues

**Common Problems:**
- Package manager conflicts
- SELinux restrictions
- User permissions

**Solutions:**
```bash
# 1. Fix permissions
sudo chown -R $USER:$USER .agent-os/
chmod +x .agent-os/scripts/*.js

# 2. Check SELinux
sestatus
# If enabled, adjust context if needed

# 3. Update packages
sudo apt update && sudo apt upgrade
# OR
sudo yum update
```

---

## 📞 Getting Help

### 🆘 Self-Help Resources

1. **Check Documentation**
   - `.agent-os/USER-GUIDE.md` - Comprehensive user guide
   - `.agent-os/QUICK-START-GUIDE.md` - Quick start guide
   - `.agent-os/API-REFERENCE.md` - Complete API reference

2. **Built-in Help**
   ```bash
   # Help on any tool
   node .agent-os/scripts/setup.js --help
   node .agent-os/tools/compliance-checker.js --help
   ```

3. **System Information**
   ```bash
   # Get system details
   node .agent-os/scripts/setup.js info
   
   # Check system health
   node .agent-os/scripts/setup.js status --verbose
   ```

### 🆘 When to Seek External Help

**Seek help when:**
- ❌ All recovery steps fail
- ❌ System completely unusable
- ❌ Data loss or corruption
- ❌ Security vulnerabilities detected
- ❌ Performance issues persist after optimization

**Information to provide:**
1. **Error messages** - Exact error text
2. **System information** - OS, Node.js version, Agent OS version
3. **Steps to reproduce** - What you were doing when it failed
4. **Logs** - Relevant log files
5. **Environment** - Development environment details

### 🆘 Support Channels

1. **Documentation** - First line of support
2. **Built-in Help** - Command-line assistance
3. **Logs** - System and error logs
4. **Community** - Developer forums and discussions
5. **Professional Support** - For enterprise users

---

## 🎯 Prevention Best Practices

### 🛡️ Regular Maintenance

```bash
# Daily
node .agent-os/scripts/setup.js status

# Weekly
node .agent-os/scripts/setup.js validate
node .agent-os/tools/compliance-checker.js

# Monthly
node .agent-os/scripts/setup.js backup
node .agent-os/tools/analysis/statistical-analysis.js --report
```

### 🔒 Security Practices

```bash
# 1. Regular security checks
node .agent-os/tools/compliance-checker.js --area="security"

# 2. Update dependencies
npm update

# 3. Monitor for vulnerabilities
npm audit

# 4. Backup important data
node .agent-os/scripts/setup.js backup
```

### 📊 Performance Monitoring

```bash
# 1. Monitor resource usage
node .agent-os/tools/analysis/statistical-analysis.js --resources

# 2. Track performance metrics
node .agent-os/tools/analysis/statistical-analysis.js --performance

# 3. Optimize based on data
node .agent-os/tools/compliance-checker.js --optimize
```

---

## 🎉 Success Indicators

You've successfully resolved the issue when:

- ✅ `node .agent-os/scripts/setup.js status` shows "healthy"
- ✅ All tools respond normally
- ✅ Compliance score is ≥85%
- ✅ Real-time monitoring is active
- ✅ Cursor integration is working
- ✅ Performance is acceptable

---

*Last Updated: ${new Date().toISOString()}*
*Agent OS Version: 4.0*
*For additional help, see: `.agent-os/USER-GUIDE.md` and `.agent-os/API-REFERENCE.md`*
