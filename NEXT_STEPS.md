# Next Steps for ERA_Landscape_Static

## What We Just Did

✅ **Created new static project**
- Extracted HTML from ERA_ClimateWeek
- Pure HTML/JavaScript (no Python)
- Simple structure (6 files)
- Test passing

✅ **Reverted ERA_ClimateWeek to stable state**
- Checked out `main` branch
- Tests passing (3/3 core tests)
- Server working on port 8002

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

## Immediate Next Steps

### 1. Fix External Script Loading

**Issue**: `graph.js` isn't loading from `file://` protocol

**Fix Options:**

**A. Inline the JavaScript** (simplest)
```html
<!-- Instead of: -->
<script src="/graph.js"></script>

<!-- Do: -->
<script>
  // Paste graph.js contents here
</script>
```

**B. Use relative path**
```html
<script src="./graph.js"></script>
```

**Recommendation**: Option A (inline) for simplicity. One file = easy deployment.

---

### 2. Add Google Sheets API Integration

**Current state**: HTML has embedded data (352 nodes from server generation)

**Need to add**:
```javascript
// In index.html <head>
<script src="https://apis.google.com/js/api.js"></script>
<script src="https://accounts.google.com/gsi/client" async defer></script>

// Configuration
const SHEET_ID = '1cR5X2xFSGffivfsMjyHDDeDJQv6R0kQpVUJsEJ2_1yY';
const API_KEY = 'AIzaSyBp23GwrTURmM3Z1ERZocotnu3Tn96TmUo';
const CLIENT_ID = '57881875374-flipnf45tc25cq7emcr9qhvq7unk16n5.apps.googleusercontent.com';

// Functions (from our previous work)
- initSheetsApi()
- loadDataFromSheets()
- saveDataToSheets()
```

---

### 3. Test Locally

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

✅ **Phase 1**: File loads locally (DONE)  
⏳ **Phase 2**: Graph displays with embedded data  
⏳ **Phase 3**: Google Sheets API integration  
⏳ **Phase 4**: Deployed to GitHub Pages  
⏳ **Phase 5**: Sign-in and save working  

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
