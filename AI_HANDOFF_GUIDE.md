# AI Assistant Handoff Guide
**For AI assistants picking up ERA_Landscape_Static**

---

## FIRST ACTIONS (Before Any User Interaction)

**Do this IMMEDIATELY when joining a conversation:**

1. **Read orientation docs** (in order):
   - `HANDOFF_SUMMARY.txt` - Overview and orientation checklist
   - This file (`AI_HANDOFF_GUIDE.md`) - Code patterns and testing
   - `TESTING.md` - Testing commands and workflow
   
2. **Assess project state**:
   - Check git branch: `git branch --show-current`
   - Check if `index.html` opens in browser (file://)
   - Review recent commits: `git log --oneline -5`
   - Check if any tests are failing
   
3. **Verify testing baseline**:
   - Run: `cd tests && python test_load.py`
   - Check console for JavaScript errors
   - Open `index.html` in browser manually
   
4. **Present status to user** (without being asked):
   ```
   ## Current Status
   - **Branch**: [main / feat/feature-name]
   - **Feature**: [What's being worked on]
   - **Tests**: [Passing / Failing / Unknown]
   - **Browser**: [Works / Has errors]
   - **Ready**: [Yes / Need clarification on X]
   ```

**DO NOT** wait for the user to ask "where are we?" - be proactive.

---

## Context You Need

### What This Project Is

Interactive graph visualization for climate/restoration network mapping. **Pure static HTML/JavaScript** that loads data directly from Google Sheets.

**Key Difference from ERA_ClimateWeek:**
- NO Python server (that's the parent project)
- NO Flask, NO backend
- Just HTML + JavaScript + Google Sheets API
- Deployable to GitHub Pages (or any static host)

### Architecture

```
User opens: index.html (file:// or https://jonschull.github.io/ERA_Landscape_Static/)
  ↓
Browser loads Google Sheets API libraries
  ↓
Fetches data from Google Sheet (API key for read)
  ↓
Renders interactive graph (vis-network.js)
  ↓
User clicks "Sign In" (optional, for editing)
  ↓
OAuth flow → authenticated
  ↓
User can save edits back to Sheet
```

**No server. No backend. Pure client-side.**

### Relationship to ERA_ClimateWeek

**Parent Project**: [ERA_ClimateWeek](https://github.com/jonschull/ERA_ClimateWeek)
- Python data processing pipeline
- Imports from CSV, transforms data
- Writes to Google Sheets
- Flask development server
- Generates HTML templates

**This Project** (ERA_Landscape_Static):
- Uses the data (reads from same Google Sheet)
- Pure client-side viewer
- No Python required
- Production-ready for GitHub Pages

**Workflow:**
```
ERA_ClimateWeek (Python) → Process data → Write to Google Sheets
                                              ↓
                          ERA_Landscape_Static (HTML/JS) → Read from Sheets → Display
```

---

## CRITICAL DISCIPLINE (Core Principles)

### Your Predecessor's Approach

The AI assistant on ERA_ClimateWeek followed these principles - **YOU MUST TOO:**

1. **Test before claiming success** - Always verify with browser testing
2. **Small, incremental changes** - One feature at a time
3. **Never claim "fixed" without verification** - Test THEN report
4. **Respect user's time** - Be concise, don't hallucinate success
5. **Document everything** - Update docs after changes

### Red Flags You're Losing Context

- ❌ Making 3+ fixes in rapid succession without testing
- ❌ Saying "should work" instead of "tested, works"
- ❌ Not checking git log / current branch
- ❌ Assuming old docs are current
- ❌ Skipping the verification step
- ❌ Asking user to test before YOU test

### Recovery Steps

If you find yourself in a reactive loop:
1. **STOP** making changes
2. Read HANDOFF_SUMMARY.txt and this file
3. Check git log (what actually happened?)
4. Test current state in browser
5. Present status to user, ask for direction

---

## COMMAND OUTPUT DISCIPLINE

**CRITICAL RULE:** After EVERY command, READ and SUMMARIZE the output.

### The Problem

You can issue commands without reading their output. This leads to:
- Untracked files you don't notice
- Modified files you forget about
- Test failures you miss
- Broken state you don't detect

**Example failure:** Running `git status` 3 times, seeing "Untracked files: NEXT_STEPS.md" each time, but not noticing until user asks.

### The Fix

**After EVERY command, explicitly:**
1. Read the output
2. Check for unexpected results
3. Report what you found
4. Act on problems immediately

### Example: Good Workflow

```bash
$ git status
On branch main
Untracked files:
  NEXT_STEPS.md
nothing added to commit but untracked files present
```

**AI Response:**
"⚠️ `git status` shows NEXT_STEPS.md is untracked. Should I commit it?"

### Example: Bad Workflow

```bash
$ git status
[output ignored]
```

**AI Response:**
"✅ Everything committed" (WRONG - didn't read output)

---

## MANDATORY VERIFICATION CHECKLIST

**Before claiming work is "done" or "complete":**

### 1. Git Status Check
```bash
git status
```

**Check for:**
- ✅ "nothing to commit, working tree clean" OR
- ⚠️ Explain any untracked/modified files and why they're not committed

### 2. File Existence Check
```bash
ls -la  # or ls relevant-directory/
```

**Check for:**
- ✅ All expected files present
- ⚠️ Any missing files?

### 3. Git History Check
```bash
git log --oneline -5
```

**Check for:**
- ✅ All expected commits present
- ✅ Latest commit has correct message
- ⚠️ Any uncommitted work?

### 4. Browser Test Check
```bash
open index.html  # or provide file path
```

**Check for:**
- ✅ Page loads without errors
- ✅ Console clean (or explain warnings)
- ✅ Feature works as expected

### 5. Test Suite Check
```bash
cd tests && python test_load.py
```

**Check for:**
- ✅ Tests pass
- ⚠️ Document any failures

### After Every File Creation

**When you create files:**
1. Create file → `write_to_file` tool
2. Verify exists → `ls -la [directory]`
3. Check git sees it → `git status`
4. Stage it → `git add [file]`
5. Verify staged → `git status` (should show "Changes to be committed")
6. Commit → `git commit -m "..."`
7. Verify committed → `git log --oneline -1`

**DO NOT skip steps 2, 3, 5, 7.** Always verify.

---

## Critical Files

### Core Files

**index.html** (~1500 lines)
- Complete standalone HTML file
- Google API configuration (SHEET_ID, API_KEY, CLIENT_ID)
- Google API library loading
- vis-network setup
- Graph initialization code
- Toolbar HTML (buttons, filters)
- Modal HTML structures
- Embedded data (currently - will be removed)

**graph.js** (~600 lines)
- Google Sheets read/write functions
- Graph rendering logic
- Event handlers (buttons, modals)
- Quick Editor functionality
- Search filtering
- Save/load operations

### Documentation

- `README.md` - Project overview, quick start
- `DEVELOPMENT.md` - Developer guide, how to edit
- `VISION.md` - Long-term collaborative mapping vision
- `NEXT_STEPS.md` - Current roadmap
- `.gitignore` - Standard ignore rules

### Testing

- `tests/test_load.py` - Playwright test (static HTML loading)
- More tests to be adapted from ERA_ClimateWeek

---

## Code Patterns to Follow

### 1. Google Sheets API Integration

```javascript
// Configuration (in index.html)
const SHEET_ID = '1cR5X2xFSGffivfsMjyHDDeDJQv6R0kQpVUJsEJ2_1yY';
const API_KEY = 'AIzaSyBp23GwrTURmM3Z1ERZocotnu3Tn96TmUo';
const CLIENT_ID = '57881875374-flipnf45tc25cq7emcr9qhvq7unk16n5.apps.googleusercontent.com';

// Initialize API (in graph.js or inline)
function initSheetsApi() {
  gapi.load('client', async () => {
    await gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4']
    });
    // Ready to read
  });
}

// Read data (API key - no auth needed)
async function readSheetTab(tabName) {
  const response = await gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${tabName}!A:Z`
  });
  return response.result.values;
}

// Write data (requires OAuth)
async function writeSheetTab(tabName, data) {
  if (!sheetsApiReady) {
    // Trigger sign-in
    handleSignIn();
    return;
  }
  await gapi.client.sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${tabName}!A1`,
    valueInputOption: 'RAW',
    resource: { values: data }
  });
}
```

### 2. Node ID Convention

```javascript
// Always use typed IDs (same as parent project)
person::Jonathan Lever
org::Fetzer Institute  
project::ERA Africa

// Extract type from ID
const type = id.startsWith('person::') ? 'person' : 
             id.startsWith('project::') ? 'project' : 'organization';
```

### 3. vis-network DataSet

```javascript
// Initialize graph data
const nodes = new vis.DataSet([...]);
const edges = new vis.DataSet([...]);

// Get all nodes (returns array)
const allNodes = nodes.get();

// Update node
nodes.update({id: 'person::Jon', label: 'Jon Schull'});

// Add edge
edges.add({from: 'person::Jon', to: 'org::ERA', label: 'founded'});
```

### 4. Hidden State

```javascript
// Hide node (also hides connected edges)
nodes.update({id: nodeId, hidden: true});
const connectedEdges = edges.get().filter(e => 
  e.from === nodeId || e.to === nodeId
);
edges.update(connectedEdges.map(e => ({id: e.id, hidden: true})));
```

---

## Common Gotchas

### 1. File Protocol Limitations

```javascript
// ❌ Won't work from file://
fetch('/graph.js')  // Relative paths fail

// ✅ Works from file://
<script src="./graph.js"></script>  // Or inline the script
```

### 2. gapi Loading Timing

```javascript
// ❌ Wrong - gapi might not be loaded yet
initSheetsApi();

// ✅ Right - wait for gapi to load
window.onload = () => {
  if (window.gapi) {
    initSheetsApi();
  }
};
```

### 3. OAuth vs API Key

```javascript
// Reading (API key) - no sign-in
// Sheet must be public ("Anyone with link can view")
const data = await readSheetTab('nodes');

// Writing (OAuth) - requires sign-in
// User must click "Sign In" button first
await writeSheetTab('nodes', data);  // Will fail if not authenticated
```

### 4. Browser Compatibility

```javascript
// ❌ Might not work in older browsers
const data = await fetch(...);

// ✅ Better - check for support
if ('fetch' in window) {
  // Modern browser
} else {
  // Fallback or error message
}
```

---

## Git Workflow (Standard Operating Procedure)

**Same workflow as ERA_ClimateWeek. It worked.**

### Before Making Changes

```bash
# 1. Ensure on main and up-to-date
git checkout main
git pull origin main

# 2. Verify baseline (open in browser, check console)
open index.html
# Check: No errors, graph displays

# 3. Create feature branch
git checkout -b feat/feature-description
```

### During Development

```bash
# Make small changes, test immediately, commit frequently
git add index.html graph.js
git commit -m "feat: Add feature description"

# Push to remote periodically
git push origin feat/feature-description
```

### After Completing Work

```bash
# 1. Final browser test
open index.html
# Verify: Feature works, no console errors

# 2. Run Playwright test
cd tests
python test_load.py

# 3. Push final changes
git push origin feat/feature-description

# 4. Create PR
gh pr create --title "feat: Feature description" \
             --body "Description of changes"

# 5. Wait for review and merge
# 6. Update local main
git checkout main
git pull origin main
git branch -d feat/feature-description
```

### Every Functional Stable State is a PR

Don't accumulate changes. When feature works and tests pass → PR → merge.

---

## Testing Strategy

### Testing Workflow

**For every change:**

1. **Manual browser test** (FIRST)
   ```bash
   open index.html
   # Check console (Cmd+Option+J)
   # Test the feature
   # Verify no errors
   ```

2. **Playwright test** (SECOND)
   ```bash
   cd tests
   python test_load.py  # Or specific test
   ```

3. **Ask user to verify** (THIRD)
   ```
   "Feature tested and working. Please verify:
   - Open index.html
   - Test [specific action]
   - Confirm [expected result]"
   ```

4. **Screenshot if visual** (OPTIONAL but helpful)
   ```python
   page.screenshot(path="feature_working.png")
   ```

### Browser Compatibility

**Target browsers:**
- ✅ Chrome 118+ (primary)
- ✅ Edge 118+ (test this too)
- ⚠️ Firefox 119+ (nice to have)
- ⚠️ Safari 17+ (nice to have)

**Test in both Chrome AND Edge before claiming success.**

### Manual Checklist

**Basic functionality:**
- [ ] index.html opens without errors
- [ ] Graph displays
- [ ] Data loads from Sheets (or embedded fallback)
- [ ] Toolbar buttons work
- [ ] Quick Editor can add/remove edges
- [ ] Search filtering works
- [ ] Save button works (if signed in)

**Console check:**
- [ ] No red errors in console
- [ ] API calls succeed (check Network tab)
- [ ] No "failed to load" messages

---

## Communication Style

### With the User

- **Be concise** - No verbose explanations
- **Test before claiming success** - Show proof (screenshot, test output)
- **Ask when uncertain** - Don't guess
- **Update docs** - Keep this guide current
- **Never say "should work"** - Say "tested, works" with evidence

### Example Good Response

```
✅ Feature implemented and tested

Changes:
- Added Sign In button to toolbar
- Integrated OAuth flow
- Tested in Chrome and Edge

Evidence:
- test_load.py passes
- Console shows no errors
- [screenshot.png] shows button works

Please verify: Open index.html, click "Sign In", confirm OAuth popup appears.
```

### Example Bad Response

```
I've added the Sign In button. It should work now.
```

**Why bad?** No testing, no evidence, no specifics.

---

## File Organization

### Keep Clean

- `index.html` - Main HTML file
- `graph.js` - JavaScript (or inline if needed)
- `*.md` - Documentation
- `tests/` - Test scripts

### Don't Create

- Unnecessary helper files
- Complex directory structures  
- Multiple versions of index.html
- Build scripts (keep it simple!)

---

## When to Ask for Help

### Uncertain About

- UX decisions ("Should this button be here?")
- Breaking changes ("This will change existing behavior")
- API limits ("Will this hit rate limits?")
- Security concerns ("Is hardcoding API key safe?")

### Don't Ask About

- Implementation details (you can figure it out)
- Syntax questions (you know JavaScript)
- Testing approach (follow the workflow above)

---

## Success Criteria

### You're Doing Well If

- ✅ Changes are small and testable
- ✅ Browser tests pass before claiming success
- ✅ Documentation stays current
- ✅ User can verify what you did
- ✅ Can rollback via git if needed

### Red Flags

- ❌ "It should work" without browser testing
- ❌ Multiple features in one change
- ❌ Breaking existing functionality
- ❌ Undocumented changes
- ❌ No commit before risky change

---

## Handoff Checklist

### Before Starting Work

- [ ] Read this guide
- [ ] Read `README.md`
- [ ] Open index.html and explore
- [ ] Check git log for recent changes
- [ ] Review `VISION.md` for project goals
- [ ] Understand what feature is next

### During Work

- [ ] Follow incremental approach
- [ ] Test in browser after each change
- [ ] Update documentation
- [ ] Commit frequently
- [ ] Run Playwright tests

### Before Handing Back

- [ ] All tests passing
- [ ] Feature works in Chrome AND Edge
- [ ] Documentation updated
- [ ] Clear summary of changes
- [ ] Known issues documented

---

## The User Values

- **Working solutions** over perfect code
- **Incremental progress** over big rewrites
- **Clear communication** over technical jargon
- **Tested features** over untested claims
- **Their time** - be efficient and proactive

---

## Remember

- This is a real project with real users
- Changes affect the live graph (via Google Sheets)
- Test in browser BEFORE asking user to test
- When in doubt, ask
- Test, test, test

---

**Ready to start?** Read `VISION.md` to understand the goal, then check `NEXT_STEPS.md` for what to do next.
