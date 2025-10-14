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

## Current State (as of Oct 13, 2025)

**What's Done:**
- ✅ Project created (ERA_Landscape_Static)
- ✅ index.html extracted from ERA_ClimateWeek
- ✅ graph.js extracted
- ✅ Documentation complete (AI handoff, testing, vision)
- ✅ Git initialized, 3 commits
- ✅ test_load.py passes (HTML structure intact)

**What's Missing:**
- ❌ graph.js not loading (needs inlining or path fix)
- ❌ Google Sheets API not integrated
- ❌ Sign In button doesn't exist yet
- ❌ GitHub repo not created
- ❌ GitHub Pages not deployed

**Immediate Next Work:**
1. Fix script loading (inline graph.js into index.html)
2. Add Google Sheets API (use code in /helpful folder)
3. Test in Chrome + Edge
4. Create GitHub repo
5. Deploy to GitHub Pages

**Timeline:** 2-4 hours of focused work

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

## Reference Code Available

**Location:** `/helpful` folder

**Files:**
- `sheets_api_functions.js` - Read/write functions (TESTED & WORKING)
- `oauth_init.js` - API initialization & OAuth (TESTED & WORKING)
- `html_script_tags.html` - Script tags to add to HTML
- `README_HELPFUL.md` - Integration guide

**Source:** Extracted from ERA_ClimateWeek `feat/serverless-read` branch  
**Status:** This code was working before we pivoted  
**Action:** COPY it, don't rewrite it!

---

## Quick Integration Plan

### Step 1: Inline graph.js
- Copy graph.js contents into index.html `<script>` tag
- Test: open index.html, check console

### Step 2: Add Google API
- Copy script tags from `/helpful/html_script_tags.html` to index.html `<head>`
- Copy `/helpful/oauth_init.js` into inline `<script>`
- Copy `/helpful/sheets_api_functions.js` into inline `<script>`

### Step 3: Add Sign In Button
```html
<button id="signInBtn" onclick="handleSignIn()">🔐 Sign In</button>
```

### Step 4: Wire Up Buttons
- Refresh button → `loadDataFromSheets()`
- Save button → `saveDataToSheets()`

### Step 5: Test
- Browser: Does it load? Any console errors?
- Test in Chrome
- Test in Edge
- Run test_load.py

### Step 6: Create GitHub Repo
```bash
gh repo create jonschull/ERA_Landscape_Static --public --source=. --remote=origin
git push -u origin main
```

### Step 7: Enable GitHub Pages
```bash
gh repo edit --enable-pages --pages-branch main --pages-path /
```

**URL:** https://jonschull.github.io/ERA_Landscape_Static/

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

## Git Workflow

**Every change:**
1. Make small change
2. Test in browser
3. Commit if working
```bash
git add [files]
git commit -m "Clear description"
```

**Every feature:**
1. Create branch: `git checkout -b feat/feature-name`
2. Make changes, test, commit
3. Push: `git push origin feat/feature-name`
4. Create PR: `gh pr create --title "Feature name"`
5. After merge: `git checkout main && git pull`

**Protected main:** Never commit directly to main (except docs)

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

- `index.html` (123KB) - Main HTML file (with embedded data currently)
- `graph.js` (44KB) - JavaScript logic (not loading yet - needs fix)
- `tests/test_load.py` - Playwright test
- `/helpful/` - Working reference code from parent project

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
