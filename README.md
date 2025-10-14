# ERA Landscape - Static Viewer

**Live Demo**: https://jonschull.github.io/ERA_Landscape_Static/ *(coming soon)*

Interactive graph visualization for the climate/restoration landscape. Pure HTML/JavaScript, no server required.

---

## What Is This?

A **standalone HTML file** that:
- Loads data directly from Google Sheets
- Shows 352+ organizations and their relationships
- Allows editing (with Google sign-in)
- Requires NO server, NO Python, NO backend

**Just open `index.html` in a browser.**

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

**Note:** Opening `index.html` directly (file:// protocol) will display the graph with embedded data, but Google Sheets API features (Refresh, Save) won't work. Use HTTP server or GitHub Pages for full functionality.

### Deploy to GitHub Pages

Already configured! Just push to main and GitHub Pages auto-deploys.

**URL**: https://jonschull.github.io/ERA_Landscape_Static/

---

## How It Works

### Data Source
- **Google Sheet**: [ERA Climate Week Data](https://docs.google.com/spreadsheets/d/1cR5X2xFSGffivfsMjyHDDeDJQv6R0kQpVUJsEJ2_1yY/edit)
- Browser fetches data via Google Sheets API (read-only with API key)
- No embedded data in HTML

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

Already configured! Every push to `main` auto-deploys.

**Settings → Pages:**
- Source: Deploy from branch
- Branch: `main`
- Folder: `/` (root)

**URL**: https://jonschull.github.io/ERA_Landscape_Static/

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
- ✅ Interactive graph (drag, zoom, pan)
- ✅ Quick Editor (add/remove connections)
- ✅ Search filtering
- ✅ Hide/show nodes
- ✅ Save changes to Google Sheets (with sign-in)
- ✅ Refresh data from Sheets

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
