# Next Steps for ERA_Landscape_Static

## What We Just Completed

✅ **Google Sheets API Integration** (PR #1 merged)
- Added Google API libraries (gapi, OAuth2)
- Implemented read/write functions
- Wired Refresh/Save buttons
- Added Sign In button for OAuth
- Fixed colors to match legend
- Created integration test (8/8 passing)
- Documented HTTP/HTTPS requirement

✅ **Testing & Documentation**
- Rewrote testing guardrails (behavior not structure)
- Separated HANDOFF_SUMMARY (state) vs AI_HANDOFF_GUIDE (methodology)
- Added DRY helper functions (getNodeVisuals, parseTypeFromId)

---

## Current Status: ERA_Landscape_Static

**Location**: `/Users/admin/Library/CloudStorage/Dropbox-EcoRestorationAllianceLLC/Jon Schull/CascadeProjects/ERA_Landscape_Static`

**Files:**
```
ERA_Landscape_Static/
├── index.html          # Main HTML (from ERA_ClimateWeek output)
├── graph.js            # JavaScript logic
├── README.md           # Project overview
├── DEVELOPMENT.md      # Developer guide
├── .gitignore          # Git ignore rules
└── tests/
    └── test_load.py    # Playwright test
```

**Git Status:**
- ✅ Initialized
- ✅ Initial commit done
- ⏳ No remote yet

**Test Results:**
```
✅ Graph container present
✅ No JavaScript errors
⚠️ No data (needs external script loading fix)
```

---

## Immediate Next Step

### Remove Embedded Data & Auto-Load from Sheets

**Problem:**
- Embedded data (~80KB) causes page load delay
- Shows stale data instead of live Sheet
- Color mismatch bug (embedded uses old colors)
- File bloat (index.html thousands of lines)
- Unnecessary duplication (data in Sheet AND HTML)

**Why it's unnecessary:**
- Already require HTTP/HTTPS (for Google API)
- Already require network (for Sheets API)  
- Can't work offline anyway
- No benefit to embedding

**Solution:**

1. **Remove embedded data**:
```javascript
// Currently:
const nodes = new vis.DataSet([...80KB of JSON...]);
const edges = new vis.DataSet([...34KB of JSON...]);

// Change to:
const nodes = new vis.DataSet([]);
const edges = new vis.DataSet([]);
```

2. **Auto-load on page init**:
```javascript
// After API initialization completes
window.addEventListener('DOMContentLoaded', () => {
  initSheetsApi().then(() => {
    loadDataFromSheets(); // Fetch fresh data
  });
});
```

3. **Show loading state**:
```javascript
// Already have #loading div, just keep it visible until data loads
function hideLoading() {
  document.getElementById('loading').style.display = 'none';
}
// Call after loadDataFromSheets() completes
```

**Benefits:**
- ✅ Smaller HTML file (~5KB vs ~85KB)
- ✅ Faster page parse
- ✅ Always fresh data
- ✅ No color mismatch bugs
- ✅ Single source of truth (Sheet)
- ✅ Consistent behavior (same colors on load and refresh)

**Trade-off:**
- Network delay to load data (but we already have this for API init)

---

### Test Locally

```bash
cd /Users/admin/Library/CloudStorage/Dropbox-EcoRestorationAllianceLLC/Jon\ Schull/CascadeProjects/ERA_Landscape_Static

# Open in browser
open index.html

# Check:
# - Page loads
# - Graph displays (with embedded data initially)
# - Console shows no errors
# - Buttons work
```

---

### 4. Create GitHub Repository

```bash
cd /Users/admin/Library/CloudStorage/Dropbox-EcoRestorationAllianceLLC/Jon\ Schull/CascadeProjects/ERA_Landscape_Static

# Create repo on GitHub
gh repo create jonschull/ERA_Landscape_Static --public --source=. --remote=origin

# Push
git push -u origin main

# Enable GitHub Pages
gh repo edit --enable-pages --pages-branch main --pages-path /
```

**Result**: https://jonschull.github.io/ERA_Landscape_Static/

---

### 5. Test on GitHub Pages

Once deployed:
- Visit the URL
- Check graph loads
- Test sign-in flow
- Verify save functionality

---

## Architecture Decision

**We chose the simple path:**

❌ **Complex** (what we were doing):
```
Python templates → Flask server → Browser → Save → Server → Sheets
```

✅ **Simple** (what we have now):
```
Edit HTML directly → Browser → Sheets (direct)
```

**Benefits:**
- No server needed
- No Python needed
- Edit files directly
- Deploy anywhere
- Email it as attachment!

---

## Relationship Between Projects

### ERA_ClimateWeek (Python)
**Purpose**: Data processing and transformation  
**Use when**: 
- Importing data from CSV
- Batch processing
- Complex transformations
- Development/testing

**Location**: `/Users/admin/Library/CloudStorage/Dropbox-EcoRestorationAllianceLLC/Jon Schull/CascadeProjects/ClimateWeek`  
**Status**: Stable, on `main` branch, tests passing

---

### ERA_Landscape_Static (HTML/JS)
**Purpose**: Public viewer and simple editing  
**Use when**:
- Viewing the graph
- Making simple edits
- Public deployment
- No server available

**Location**: `/Users/admin/Library/CloudStorage/Dropbox-EcoRestorationAllianceLLC/Jon Schull/CascadeProjects/ERA_Landscape_Static`  
**Status**: Initial commit, needs API integration

---

## Questions to Consider

1. **Should we inline graph.js into index.html?**
   - Pro: One file, easier deployment
   - Con: Harder to edit, larger file
   
2. **Should we keep embedded data as fallback?**
   - Pro: Works even if Sheets API fails
   - Con: Data gets stale
   
3. **Should we create a "build" script to generate index.html from ERA_ClimateWeek?**
   - Pro: Keeps data fresh
   - Con: Adds complexity

**Recommendation**: Start simple. Inline everything. One file. Test it. Deploy it. Add complexity only if needed.

---

## Success Criteria

✅ **Phase 1**: File loads locally  
✅ **Phase 2**: Graph displays with embedded data  
✅ **Phase 3**: Google Sheets API integration  
✅ **Phase 4**: Deployed to GitHub Pages  
⏳ **Phase 5**: Remove embedded data, auto-load from Sheets  
⏳ **Phase 6**: Test OAuth sign-in and save working live  

---

## Timeline Estimate

- **Phase 2**: 30 minutes (inline script, test)
- **Phase 3**: 1 hour (add API code, test)
- **Phase 4**: 15 minutes (create repo, push, enable Pages)
- **Phase 5**: 30 minutes (test OAuth flow)

**Total**: ~2.5 hours to fully working GitHub Pages deployment

---

## What To Do Next

**Ask yourself:**

1. **Does the HTML open in browser and show a graph?**
   - If YES → Move to Phase 3 (add Sheets API)
   - If NO → Fix Phase 2 (inline script)

2. **Do you want to proceed now or review first?**
   - If NOW → Start with inlining graph.js
   - If REVIEW → Look at the files, understand structure

3. **Should we test more before deploying?**
   - If YES → Add more tests
   - If NO → Deploy and iterate

**Recommendation**: Open index.html in browser, see what you get, then decide next step.
