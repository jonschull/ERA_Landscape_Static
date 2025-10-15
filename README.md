# ERA Landscape - Static Viewer

**Live Demo**: https://jonschull.github.io/ERA_Landscape_Static/

Interactive graph visualization for the climate/restoration landscape. Pure HTML/JavaScript, no server required.

---

## What Is This?

A **standalone HTML file** (20KB) that:
- Auto-loads fresh data from Google Sheets on page load
- Shows 350+ organizations and their relationships
- Allows editing (with Google sign-in)
- Requires NO server, NO Python, NO backend
- NO embedded data - always shows latest from Sheet

**Just open via HTTP server or GitHub Pages.**

---

## Quick Start

### View Locally (with Google Sheets API)

**Important:** Google Sheets API requires HTTP/HTTPS protocol. Use a local server:

```bash
# Clone the repo
git clone https://github.com/jonschull/ERA_Landscape_Static.git
cd ERA_Landscape_Static

# Start local server
python3 -m http.server 8000

# Open in browser
open http://localhost:8000
```

**Note:** Opening `index.html` directly (file:// protocol) won't work - Google Sheets API requires HTTP/HTTPS. Use HTTP server locally or GitHub Pages for deployment.

### Deploy to GitHub Pages

Already configured! Just push to main and GitHub Pages auto-deploys.

**URL**: https://jonschull.github.io/ERA_Landscape_Static/

---

## How It Works

### Data Flow
1. **Page loads** → Empty graph initialized
2. **Google Sheets API initializes** → API key authentication
3. **Data auto-loads** → Fetches nodes & edges from [ERA Climate Week Data](https://docs.google.com/spreadsheets/d/1cR5X2xFSGffivfsMjyHDDeDJQv6R0kQpVUJsEJ2_1yY/edit)
4. **Graph renders** → Shows ~350+ nodes with relationships
5. **Loading screen hides** → Interactive graph ready

**Zero embedded data** → Always shows fresh data from Sheet

### Authentication
- **Viewing**: No sign-in required (public read via API key)
- **Editing**: Click "Sign In" button, authenticate via Google OAuth
- **Saving**: Changes written directly back to Google Sheet

### Architecture
```
Browser loads index.html
  ↓
Calls Google Sheets API (API key)
  ↓
Fetches nodes & edges data
  ↓
Renders interactive graph (vis-network.js)
  ↓
User clicks "Sign In" (optional)
  ↓
OAuth popup → authenticated
  ↓
User can save edits back to Sheet
```

**No server. No backend. Pure client-side.**

---

## Files

```
ERA_Landscape_Static/
├── index.html          # Main HTML file (edit this!)
├── graph.js            # JavaScript logic
├── README.md           # This file
├── DEVELOPMENT.md      # Development guide
└── tests/              # Test scripts
    └── test_load.py    # Playwright test
```

---

## Configuration

Google API credentials are embedded in `index.html`:

```javascript
const SHEET_ID = '1cR5X2xFSGffivfsMjyHDDeDJQv6R0kQpVUJsEJ2_1yY';
const API_KEY = 'AIzaSyBp23GwrTURmM3Z1ERZocotnu3Tn96TmUo';
const CLIENT_ID = '57881875374-flipnf45tc25cq7emcr9qhvq7unk16n5.apps.googleusercontent.com';
```

**To use your own Sheet:**
1. Copy the Google Sheet
2. Get API Key & OAuth Client ID from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
3. Update credentials in `index.html`
4. Make sure Sheet is publicly readable

---

## Development

### Edit the HTML/JavaScript

```bash
# Edit files directly
code index.html
code graph.js

# Test locally
open index.html

# Commit changes
git add .
git commit -m "Update feature"
git push
```

**No build step. No compilation. Just edit and open.**

### Run Tests

```bash
# Install Playwright
pip install playwright
playwright install

# Run test
cd tests
python test_load.py
```

---

## Deployment

### GitHub Pages (Automatic)

Already configured! Every push to `main` auto-deploys in ~1-2 minutes.

**To update the live site:**
```bash
# 1. Make your changes
code index.html

# 2. Test locally
python3 -m http.server 8000
open http://localhost:8000

# 3. Commit and push
git add .
git commit -m "Description of changes"
git push

# 4. Wait for deployment (~1-2 minutes)
# Check status:
gh api repos/jonschull/ERA_Landscape_Static/pages/builds/latest | jq -r '.status'

# 5. Verify live site
open https://jonschull.github.io/ERA_Landscape_Static/
```

**Settings → Pages:**
- Source: Deploy from branch
- Branch: `main`
- Folder: `/` (root)
- URL: https://jonschull.github.io/ERA_Landscape_Static/

**Build typically completes in:**
- First deploy: ~1-2 minutes
- Subsequent updates: ~30-60 seconds

### Other Hosting

Works on any static host:
- Netlify
- Vercel
- Amazon S3
- Your own web server
- Email attachment (yes, really!)
- Dropbox public link

**Just serve `index.html`.**

---

## Features

### Current
- ✅ Auto-loads fresh data from Google Sheets on page init
- ✅ Interactive graph (drag, zoom, pan)
- ✅ Quick Editor (add/remove connections)
- ✅ Search filtering
- ✅ Hide/show nodes
- ✅ Save changes to Google Sheets (with sign-in)
- ✅ Refresh data button (re-fetch from Sheets)
- ✅ Color-coded by type (person=blue, org=teal, project=purple)
- ✅ Type parsed from ID prefix (person::, org::, project::)

### Planned
- [ ] Curation modal for organizations
- [ ] Batch operations
- [ ] Export to PNG/CSV
- [ ] Undo/redo

---

## Related Project

This project was extracted from [ERA_ClimateWeek](https://github.com/jonschull/ERA_ClimateWeek), which is a Python-based data processing pipeline with Flask server.

**When to use each:**

**ERA_ClimateWeek** (Python):
- Data processing & transformation
- Importing from CSV
- Batch operations
- Development & testing

**ERA_Landscape_Static** (this project):
- Production viewer
- Public deployment
- No server needed
- Simple editing

---

## Browser Compatibility

Tested on:
- ✅ Chrome 118+
- ✅ Firefox 119+
- ✅ Safari 17+
- ✅ Edge 118+

Requires modern browser with ES6 support.

---

## License

MIT License - See parent project for details.

---

## Contact

**Repository**: https://github.com/jonschull/ERA_Landscape_Static  
**Main Project**: https://github.com/jonschull/ERA_ClimateWeek  
**Developer**: Jon Schull
