# ERA_Landscape_Static - Tests

## Test Structure

### Core Regression Tests (from ERA_ClimateWeek)
These tests verify that graph functionality still works after changes:

- **test_exact_scenario.py** - Bogdonoff scenario (batch save)
- **test_reload_persistence.py** - Hidden state persistence
- **test_search_filtering.py** - Search filtering with connected components

### Feature Tests (from ERA_ClimateWeek)
- **test_curation_full.py** - Full curation workflow
- **test_filter_fix.py** - Union vs intersection filtering  
- **test_create_project.py** - Project node creation
- **test_smoke.py** - Basic smoke test

### Static HTML Tests (ERA_Landscape_Static specific)
- **test_load.py** - Basic HTML loading (file:// protocol)
- **test_sheets_api.py** - **NEW** - Google Sheets API integration test

### Test Runner
- **run_regression_tests.py** - Runs core + feature tests

---

## Running Tests

### Quick Test (Load Only)
```bash
cd tests
python test_load.py
```

### Sheets API Integration Test
```bash
cd tests
python test_sheets_api.py
```

**What it tests:**
1. Page loads without errors
2. Google API libraries loaded (`gapi`, `google.accounts`)
3. Configuration present (SHEET_ID, API_KEY, CLIENT_ID)
4. Functions implemented (readSheetTab, writeSheetTab, etc.)
5. Sign In button exists
6. No JavaScript errors
7. Can actually read from Sheets (if integrated)

**Expected result (before integration):**
```
❌ INTEGRATION NOT STARTED
   Need to add code from /helpful folder
```

**Expected result (after integration):**
```
✅ ALL CHECKS PASSED
   Google Sheets API integration is complete!
```

### Full Regression Suite
```bash
cd tests
python run_regression_tests.py
```

**Note:** Most tests require a running server. For static HTML project, these tests need adaptation or may not apply.

---

## Test Status

### Currently Passing
- ✅ test_load.py (HTML structure intact)

### Needs Integration
- ⏳ test_sheets_api.py (will pass after /helpful code integrated)

### Needs Server (May Not Apply to Static HTML)
- ⚠️ test_exact_scenario.py
- ⚠️ test_reload_persistence.py  
- ⚠️ test_search_filtering.py
- ⚠️ test_curation_full.py
- ⚠️ test_filter_fix.py
- ⚠️ test_create_project.py
- ⚠️ test_smoke.py

**Action needed:** Determine which tests are relevant for static HTML version.

---

## Integration Checklist

Before running `test_sheets_api.py` successfully, you need to integrate code from `/helpful`:

### Step 1: Add Script Tags
In `index.html` `<head>`:
```html
<script src="https://apis.google.com/js/api.js"></script>
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

### Step 2: Add Configuration & Init
Copy `/helpful/oauth_init.js` into inline `<script>` tag:
- Configuration variables (SHEET_ID, API_KEY, CLIENT_ID)
- State variables (sheetsApiReady, tokenClient, accessToken)
- initSheetsApi() function
- updateSignInStatus() function
- handleSignIn() function

### Step 3: Add Sheets Functions
Copy `/helpful/sheets_api_functions.js`:
- readSheetTab(tabName)
- writeSheetTab(tabName, data)
- loadDataFromSheets()
- saveDataToSheets()

### Step 4: Add UI Button
In toolbar HTML:
```html
<button id="signInBtn" onclick="handleSignIn()">🔐 Sign In</button>
```

### Step 5: Run Test
```bash
cd tests
python test_sheets_api.py
```

Should show: ✅ ALL CHECKS PASSED

---

## Test Philosophy

**For ERA_Landscape_Static:**
1. **Test in browser FIRST** (open index.html, check console)
2. **Run Playwright test SECOND** (automated verification)
3. **Ask user to verify THIRD** (final confirmation)

**Never claim integration is complete without test_sheets_api.py passing.**

---

## Source

- Core/feature tests copied from: **ERA_ClimateWeek** `main` branch
- test_sheets_api.py: Created for ERA_Landscape_Static
- Integration code: Available in `/helpful` folder

---

**Ready to integrate? Follow NEXT_STEPS.md and use test_sheets_api.py to verify!**
