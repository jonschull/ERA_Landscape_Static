# Development Guide

## Overview

This is a **static HTML project**. No build tools, no bundlers, no compilation.

**Edit → Save → Refresh browser → Done**

---

## Project Structure

```
ERA_Landscape_Static/
├── index.html          # Main HTML file
├── graph.js            # JavaScript (external file)
├── README.md           
├── DEVELOPMENT.md      # This file
└── tests/
    └── test_load.py    # Playwright test
```

---

## How to Make Changes

### Edit HTML

```bash
# Open in editor
code index.html

# Make changes to structure, styling, API config

# Test locally
open index.html

# Commit
git add index.html
git commit -m "Update HTML structure"
git push
```

### Edit JavaScript

```bash
# Open in editor
code graph.js

# Make changes to logic, event handlers, API calls

# Test locally (refresh browser)
open index.html

# Commit
git add graph.js
git commit -m "Update graph logic"
git push
```

---

## Testing

### Manual Testing

```bash
# Open in browser
open index.html

# Check console for errors
# (Right-click → Inspect → Console)

# Test features:
# - Graph loads
# - Data fetches from Sheets
# - Buttons work
# - Sign In flow
# - Save functionality
```

### Automated Testing

```bash
# Install Playwright (one time)
pip install playwright
playwright install

# Run test
cd tests
python test_load.py

# Expected output:
# ✅ Page loads
# ✅ Graph displays
# ✅ Data loaded from Sheets
# ✅ No JavaScript errors
```

---

## Google Sheets API Setup

### Current Configuration

**Sheet ID**: `1cR5X2xFSGffivfsMjyHDDeDJQv6R0kQpVUJsEJ2_1yY`  
**API Key**: `AIzaSyBp23GwrTURmM3Z1ERZocotnu3Tn96TmUo`  
**OAuth Client ID**: `57881875374-flipnf45tc25cq7emcr9qhvq7unk16n5.apps.googleusercontent.com`

These are embedded in `index.html`.

### To Use Your Own Sheet

1. **Copy the Sheet**
   - Open [the current Sheet](https://docs.google.com/spreadsheets/d/1cR5X2xFSGffivfsMjyHDDeDJQv6R0kQpVUJsEJ2_1yY/edit)
   - File → Make a copy
   - Note the new Sheet ID (from URL)

2. **Get Google Cloud Credentials**
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create project (if needed)
   - Enable Google Sheets API
   - Create API Key (for read access)
   - Create OAuth Client ID (for write access)
   - Add authorized JavaScript origins: `http://localhost:8000`, your GitHub Pages URL

3. **Update index.html**
   ```javascript
   const SHEET_ID = 'YOUR_SHEET_ID_HERE';
   const API_KEY = 'YOUR_API_KEY_HERE';
   const CLIENT_ID = 'YOUR_CLIENT_ID_HERE';
   ```

4. **Make Sheet Public**
   - Open your Sheet
   - Click "Share"
   - Change to "Anyone with the link can view"
   - API Key can now read it

---

## Common Tasks

### Add a New Feature

```bash
# 1. Create feature branch
git checkout -b feat/my-feature

# 2. Edit files
code index.html
code graph.js

# 3. Test locally
open index.html

# 4. Commit
git add .
git commit -m "feat: Add my feature"

# 5. Push and create PR
git push origin feat/my-feature
# (Create PR on GitHub)
```

### Fix a Bug

```bash
# 1. Create fix branch
git checkout -b fix/bug-description

# 2. Edit files
code graph.js

# 3. Test
open index.html

# 4. Commit & push
git add .
git commit -m "fix: Bug description"
git push origin fix/bug-description
```

### Deploy Changes

```bash
# Just push to main!
git checkout main
git merge feat/my-feature
git push

# GitHub Pages auto-deploys (wait ~1 minute)
# Check: https://jonschull.github.io/ERA_Landscape_Static/
```

---

## Debugging

### Console Errors

**Open browser console:**
- Chrome: Cmd+Option+J (Mac) or F12 (Windows)
- Firefox: Cmd+Option+K (Mac) or F12 (Windows)
- Safari: Cmd+Option+C (Mac)

**Common errors:**

1. **"Failed to fetch"**
   - Sheet might not be public
   - API key might be invalid
   - Check Network tab for details

2. **"nodes is not defined"**
   - JavaScript loading order issue
   - Check if `graph.js` loads before it's used

3. **"gapi is not defined"**
   - Google API library didn't load
   - Check `<script src="https://apis.google.com/js/api.js"></script>`

### Network Tab

Watch API calls:
1. Open DevTools → Network tab
2. Refresh page
3. Look for calls to `sheets.googleapis.com`
4. Check status codes (should be 200)
5. Inspect response data

---

## File Organization

### index.html

**Sections:**
- `<head>` - Metadata, styles, Google API libraries
- `<body>` - UI elements (toolbar, modals, graph container)
- `<script>` (inline) - Configuration, data initialization
- `<script src="graph.js">` - Main logic (external file)

**Key elements:**
- `#network` - Graph container (vis-network renders here)
- `#toolbar` - Buttons and controls
- `#signInBtn` - OAuth sign-in button
- Toast notifications for user feedback

### graph.js

**Sections:**
- Google Sheets functions (`readSheetTab`, `writeSheetTab`, `loadDataFromSheets`, `saveDataToSheets`)
- Graph initialization (vis-network setup)
- Toolbar logic (buttons, filters)
- Quick Editor (add/remove connections)
- Event handlers

---

## Best Practices

### 1. Keep It Simple
- No build tools needed
- No npm, webpack, babel
- Just edit HTML/JS directly

### 2. Test Locally First
- Always open `index.html` locally before pushing
- Check console for errors
- Test all buttons/features

### 3. Small Commits
- One logical change per commit
- Clear commit messages
- Easy to revert if needed

### 4. Document Changes
- Update README if adding features
- Add comments to complex code
- Update this file if workflow changes

---

## GitHub Pages Configuration

Already set up! But if you need to reconfigure:

**Repository Settings → Pages:**
- Source: Deploy from a branch
- Branch: `main`
- Folder: `/` (root)
- Custom domain: (optional)

**Files needed:**
- `index.html` (must be in root)
- `.nojekyll` (tells GitHub not to use Jekyll)

---

## Relationship to ERA_ClimateWeek

**Parent Project**: [ERA_ClimateWeek](https://github.com/jonschull/ERA_ClimateWeek)

**What it does:**
- Python data processing pipeline
- Imports from CSV
- Transforms data
- Writes to Google Sheets
- Flask development server
- Generates HTML templates

**What THIS project does:**
- Uses the data (from Sheets)
- Pure client-side viewer
- No Python required
- Production-ready

**Workflow:**
```
ERA_ClimateWeek (Python)
  ↓ Process data
  ↓ Write to Google Sheets
  ↓
ERA_Landscape_Static (HTML/JS)
  ↓ Read from Google Sheets
  ↓ Display in browser
  ↓ Users can edit
  ↓ Save back to Sheets
```

---

## Future Enhancements

Potential improvements:
- [ ] Add CSS file (separate from HTML)
- [ ] Add TypeScript for type safety
- [ ] Bundle with Vite (if complexity grows)
- [ ] Add service worker (offline support)
- [ ] Add PWA manifest (install as app)

**But keep it simple unless there's a real need!**

---

## Questions?

- **How do I add a feature?** Edit the files, test, commit
- **Where's the build step?** There isn't one!
- **How do I deploy?** Just push to main
- **Can I use a different hosting?** Yes, any static host works

**Philosophy:** Simple is better. Edit HTML/JS directly. No unnecessary tooling.
