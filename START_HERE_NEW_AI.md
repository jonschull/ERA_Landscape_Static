# START HERE - New AI Session

**Welcome!** You're picking up ERA_Landscape_Static development.

---

## FIRST: Read These Files (in order)

1. **HANDOFF_SUMMARY.txt** (9.7KB) - MUST READ FIRST
   - Orientation checklist
   - Current state
   - What's done, what's missing
   - Critical discipline

2. **AI_HANDOFF_GUIDE.md** (13.5KB) - MUST READ SECOND
   - Development culture
   - Testing discipline
   - Git workflow
   - Code patterns
   - Common gotchas

3. **TESTING.md** (10.6KB) - Testing workflow
   - Browser test FIRST, then Playwright, then user verification
   - Chrome + Edge compatibility required
   - Never claim success without testing

4. **NEXT_STEPS.md** (6KB) - What to do immediately
   - Step-by-step roadmap
   - Timeline: 2-3 hours to GitHub Pages
   - Clear action items

5. **VISION.md** (14.3KB) - Long-term goals
   - Collaborative network mapping
   - Personal + Global sheets
   - Privacy model (public by default, opt-in private)

---

## THEN: Assess Current State

### Check Git Status
```bash
git status
git log --oneline -5
git branch --show-current
```

### Test Current State
```bash
# Open in browser
open index.html

# Check console (Cmd+Option+J)
# - Any errors?
# - Does graph display?

# Run test
cd tests
python test_load.py
```

### Report to User
Present status WITHOUT being asked:
```
## Current Status
- **Branch**: [main / feature branch]
- **Browser test**: [Works / Errors: X]
- **Playwright test**: [Pass / Fail]  
- **Next step**: [What needs to be done]
- **Ready**: [Yes / Need clarification on X]
```

---

## Current State (as of Oct 15, 2025)

**✅ PRODUCTION DEPLOYED & FULLY FUNCTIONAL**

**Live Site:** https://jonschull.github.io/ERA_Landscape_Static/
**Repository:** https://github.com/jonschull/ERA_Landscape_Static

**All Core Features Complete:**
- ✅ Google Sheets API integration (read/write)
- ✅ OAuth sign-in for editing
- ✅ Auto-load data from Sheets on page init
- ✅ Auto-fit graph after data loads
- ✅ Node scaling by connection count
- ✅ Quick Editor with Enter key & yellow border highlights
- ✅ Hover tooltips on all buttons
- ✅ GitHub Pages auto-deployment from main branch
- ✅ Branch-based workflow documented

**Next Work (When Ready):**
See `SHEET_ANALYSIS_V2.md` for:
- 📋 User tracking (created_by, updated_by, fields_changed columns)
- 📋 Personal vs Global sheets architecture
- 📋 Admin activity log & selective reversion

**Estimated:** 12-18 hours for user tracking + personal sheets

---

## CRITICAL: Development Discipline

### RED FLAGS (Stop if you see these)
- ❌ Making 3+ fixes without testing
- ❌ Saying "should work" instead of "tested, works"
- ❌ Asking user to test before YOU test
- ❌ Not checking console for errors

### CORRECT WORKFLOW
1. **Make ONE small change**
2. **Test in browser** (open index.html, check console)
3. **Run Playwright test** (cd tests && python test_load.py)
4. **Show evidence** to user (test output, screenshot)
5. **Get confirmation** before next change

### Testing Order (ALWAYS)
1. Browser test (FIRST) - open index.html, check console
2. Playwright test (SECOND) - run test_load.py
3. User verification (THIRD) - ask user to confirm
4. Chrome + Edge (BEFORE PR) - test in both browsers

---

## Git Workflow (MANDATORY - Branch-Based)

⚠️ **CRITICAL**: See `DEVELOPMENT.md` lines 3-19 for workflow requirement.

**NEVER push directly to main!** Always use feature/fix branches:

```bash
# Create branch
git checkout -b feat/feature-name  # or fix/bug-description

# Make changes, test, commit
git add .
git commit -m "feat: Description"

# Push branch
git push origin feat/feature-name

# Create PR
gh pr create --title "Feature name"

# After merge
git checkout main && git pull
```

---

## Communication Style

**With User:**
- Be concise (not verbose)
- Test BEFORE reporting
- Show evidence (test output, screenshot)
- Never say "should work" - say "tested, works"

**Example GOOD response:**
```
✅ Feature implemented and tested

Changes:
- Inlined graph.js into index.html
- Added Google Sheets API scripts
- Added Sign In button

Evidence:
- Browser test: No console errors
- test_load.py: PASSED
- [screenshot.png attached]

Please verify:
1. Open index.html
2. Check console for "✅ Google Sheets API client initialized"
3. Confirm graph displays
```

**Example BAD response:**
```
I've added the API code. It should work now.
```

---

## Success Criteria

**You're doing well if:**
- ✅ Browser test shows no errors
- ✅ test_load.py passes
- ✅ User confirms feature works
- ✅ Documentation updated

**Red flags:**
- ❌ Multiple attempts without testing
- ❌ User testing before you test
- ❌ Console errors ignored

---

## Key Files to Know

**Core Code:**
- `index.html` (21KB) - Main HTML file with Sheets API integration
- `graph.js` (46KB) - JavaScript logic with all UI features

**Documentation:**
- `HANDOFF_SUMMARY.txt` - Current project state (READ FIRST)
- `DEVELOPMENT.md` - Developer guide with workflow rules
- `NEXT_STEPS.md` - Completed work + future roadmap
- `SHEET_ANALYSIS_V2.md` - Next feature design (user tracking + personal sheets)
- `TESTING.md` - Testing workflow

**Tests:**
- `tests/*.py` - 12 Playwright tests

**Obsolete:**
- `obsolete/` - Old docs and reference code (moved for cleanup)

---

## Parent Project Reference

**ERA_ClimateWeek:** https://github.com/jonschull/ERA_ClimateWeek
- Python data processing pipeline
- Flask server for development
- Generates HTML templates
- Writes to Google Sheets

**This project (ERA_Landscape_Static):**
- Pure HTML/JavaScript (no Python)
- Reads from same Google Sheet
- Deployable to GitHub Pages
- No server needed

**Relationship:** ClimateWeek processes data → writes to Sheet → Static viewer displays

---

## Ready to Start?

1. **Read** HANDOFF_SUMMARY.txt (right now!)
2. **Assess** current state (git, browser test, Playwright)
3. **Report** status to user (proactively, don't wait to be asked)
4. **Ask** what to work on (usually: "Ready to start on NEXT_STEPS.md Step 1?")

**DO NOT:**
- Jump into coding without reading docs
- Make changes without testing
- Claim success without evidence
- Ask user to test before you test

---

**Welcome to the team! Follow the discipline, test thoroughly, and we'll get to GitHub Pages quickly.**
