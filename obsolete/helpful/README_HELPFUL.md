# /helpful - Reference Code from ERA_ClimateWeek

This folder contains **reference code** extracted from ERA_ClimateWeek's `feat/serverless-read` branch.

**STATUS:** Code was written but NOT independently tested. It was part of a working branch but needs to be integrated into index.html and validated with `test_sheets_api.py` before claiming it works.

---

## What's Here

### 1. `sheets_api_functions.js`
**Google Sheets read/write functions**

Functions:
- `readSheetTab(tabName)` - Read from Sheet (API key, no auth)
- `writeSheetTab(tabName, data)` - Write to Sheet (requires OAuth)
- `loadDataFromSheets()` - Load graph data
- `saveDataToSheets()` - Save graph data

**Usage:** Copy these functions into `index.html` or keep in `graph.js`

---

### 2. `oauth_init.js`
**Google Sheets API initialization & OAuth setup**

Functions:
- `initSheetsApi()` - Initialize gapi + OAuth client
- `updateSignInStatus(isSignedIn)` - Update Sign In button UI
- `handleSignIn()` - Trigger OAuth flow

State variables:
- `sheetsApiReady` - Boolean, true when authenticated
- `tokenClient` - OAuth client instance
- `accessToken` - OAuth token (persisted to localStorage)

**Usage:** Copy into `<script>` tag in `index.html` `<head>` section

---

### 3. `html_script_tags.html`
**Script tags to add to index.html `<head>`**

Loads:
- Google API client library (`gapi`)
- Google Identity Services (`google.accounts.oauth2`)

**Usage:** Copy into `<head>` section before your own `<script>` tags

---

## Quick Integration Guide

### Step 1: Add Script Tags to HTML

In `index.html` `<head>`:
```html
<!-- Before other scripts -->
<script src="https://apis.google.com/js/api.js"></script>
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

### Step 2: Add Configuration & Initialization

After script tags, add:
```html
<script>
  // Copy contents of oauth_init.js here
  const SHEET_ID = 'YOUR_SHEET_ID';
  const API_KEY = 'YOUR_API_KEY';
  const CLIENT_ID = 'YOUR_CLIENT_ID';
  // ... rest of oauth_init.js
</script>
```

### Step 3: Add Sheets Functions

In your main JavaScript (inline or external):
```javascript
// Copy contents of sheets_api_functions.js

async function readSheetTab(tabName) { ... }
async function writeSheetTab(tabName, data) { ... }
async function loadDataFromSheets() { ... }
async function saveDataToSheets() { ... }
```

### Step 4: Add Sign In Button

In toolbar HTML:
```html
<button id="signInBtn" onclick="handleSignIn()" style="margin-left:8px;">🔐 Sign In</button>
```

### Step 5: Wire Up Refresh & Save Buttons

```javascript
// Refresh button
document.getElementById('refreshBtn').addEventListener('click', loadDataFromSheets);

// Save button  
document.getElementById('saveBtn').addEventListener('click', saveDataToSheets);
```

### Step 6: Auto-load on Page Load (Optional)

```javascript
// After graph initialization
window.addEventListener('load', () => {
  setTimeout(() => {
    if (window.gapi && window.gapi.client) {
      loadDataFromSheets();
    }
  }, 1000); // Wait 1s for gapi to load
});
```

---

## Credentials

**Sheet ID:** `1cR5X2xFSGffivfsMjyHDDeDJQv6R0kQpVUJsEJ2_1yY`  
**API Key:** `AIzaSyBp23GwrTURmM3Z1ERZocotnu3Tn96TmUo`  
**Client ID:** `57881875374-flipnf45tc25cq7emcr9qhvq7unk16n5.apps.googleusercontent.com`

**Sheet URL:** https://docs.google.com/spreadsheets/d/1cR5X2xFSGffivfsMjyHDDeDJQv6R0kQpVUJsEJ2_1yY/edit

---

## Testing (MUST DO AFTER INTEGRATION)

**BEFORE you can test, you must integrate this code into index.html!**

### Integration Test (Run This First)
```bash
cd tests
python test_sheets_api.py
```

**Before integration (expected):**
```
❌ INTEGRATION NOT STARTED
   Need to add code from /helpful folder
```

**After integration (goal):**
```
✅ ALL CHECKS PASSED
   Google Sheets API integration is complete!
   Successfully read 352 nodes from Sheet!
```

### Browser Test (Manual)
After `test_sheets_api.py` passes:
1. Open `index.html` in Chrome
2. Open Console (Cmd+Option+J)
3. Check for: `✅ Google Sheets API client initialized (API key mode)`
4. Click "Sign In" → OAuth popup should appear
5. After sign-in: `✅ Authenticated with Google Sheets`
6. Test buttons (Refresh, Save)

---

## Common Issues

### "gapi is not defined"
- Script tags not loaded yet
- Add `async defer` attributes
- Use `window.addEventListener('load', ...)` wrapper

### "Failed to fetch"
- Sheet not public
- Invalid API key
- Check Sheet permissions: "Anyone with link can view"

### "Not authenticated"
- OAuth flow not complete
- Check CLIENT_ID is correct
- Check authorized JavaScript origins in Google Cloud Console

---

## Source & Status

**Extracted from:** ERA_ClimateWeek `feat/serverless-read` branch  
**Source files:**
- `templates/graph.html` (lines 30-118)
- `static/graph.js` (lines 1-166)

**Extracted:** October 13, 2025

**Testing status:** 
- ❌ NOT independently tested
- ⏳ NEEDS integration into index.html
- ⏳ NEEDS validation with test_sheets_api.py
- ✅ THEN can claim "tested & working"

---

## Important

**DO NOT claim this code works until:**
1. You integrate it into index.html (follow steps above)
2. You run `cd tests && python test_sheets_api.py`
3. Test shows: `✅ ALL CHECKS PASSED`
4. You test manually in browser (Sign In, Refresh, Save)

**Only THEN can you say "Google Sheets API integration is working."**

**Copy this code, don't rewrite it. But TEST after copying!**
