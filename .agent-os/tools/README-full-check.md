# Full Agent-OS Compliance Check

A comprehensive tool that runs all Agent-OS compliance features in sequence.

## Usage

### Basic Usage (Analyzes Main Project Only)
```bash
# From project root
node .agent-os/tools/full-compliance-check.js

# Or using the convenience scripts
.agent-os/tools/full-check.bat
.agent-os/tools/full-check.ps1
.agent-os/tools/agent-os-check
```

### Include Agent-OS Framework Analysis
```bash
# Include .agent-os files in analysis
node .agent-os/tools/full-compliance-check.js --include-agent-os
node .agent-os/tools/full-compliance-check.js -a

# Or using convenience scripts
.agent-os/tools/full-check.bat --include-agent-os
.agent-os/tools/full-check.ps1 --include-agent-os
.agent-os/tools/agent-os-check --include-agent-os
```

## What It Does

1. **Compliance Check**: Analyzes project files against Agent-OS standards
2. **Cursor Rules**: Generates Cursor AI rules from project documentation
3. **Analytics**: Creates detailed analytics reports
4. **Dashboard**: Generates interactive compliance dashboard
5. **Summary Report**: Creates comprehensive summary with scores

## Command Line Options

- `--include-agent-os` or `-a`: Include `.agent-os` framework files in analysis
- Default behavior: Excludes `.agent-os` files, analyzes only the main project

## Output

- **Reports**: Saved to `.agent-os/reports/`
- **Dashboard**: Generated at `.agent-os/dashboard/compliance-dashboard.html`
- **Console**: Detailed scoring and metrics display

## Sample Output

```
🚀 Starting Full Agent-OS Compliance Check...

📋 Step 1: Running Compliance Checker...
  - Running compliance-checker.js...
⚙️ Step 2: Generating Cursor Rules...
  - Running cursor-init.js...
📊 Step 3: Running Analytics...
  - Running analytics...
🎨 Step 4: Generating Dashboard...
  - Generating compliance dashboard...
📝 Step 5: Generating Summary Report...

📊 Summary:
  - Compliance Check: ⚠️ 54% (72 files, 287 violations)
  - Cursor Rules: ✅ 489 rules generated
    └─ Types: general: 275, standard: 115, rule: 39, lesson: 55, template: 5
  - Analytics: ⚠️ 0 files analyzed, 0 violations found
    └─ Top Standards: effectiveness: NaN%, ranking: NaN%, referenceTracking: NaN%
  - Dashboard: ✅ Generated (34KB)

🎯 Overall Score: ⚠️ 64%

📁 Reports saved to: C:\cursor\TappHA\.agent-os\reports
🎨 Dashboard: C:\cursor\TappHA\.agent-os\dashboard\compliance-dashboard.html

✅ Full Agent-OS Compliance Check Completed Successfully!
⏱️ Total Execution Time: 954ms
```

## Understanding the Score

The overall score is calculated as an average of all component scores:
- **Compliance Check**: Based on code quality and standards adherence
- **Cursor Rules**: Successfully generated rules (100% if any rules created)
- **Analytics**: Files analyzed and violations found
- **Dashboard**: Successfully generated dashboard (100% if created)

## Troubleshooting

- **No files found**: Ensure you're running from the project root directory
- **Permission errors**: Run as administrator if needed
- **Node.js errors**: Ensure Node.js 18+ is installed
- **Missing reports**: Check that all required directories exist in `.agent-os/` 