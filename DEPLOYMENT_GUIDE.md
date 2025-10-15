# Deployment Guide - ERA Landscape Static

**Quick Links:**

- **Live Site**: https://jonschull.github.io/ERA_Landscape_Static/
- **Repository**: https://github.com/jonschull/ERA_Landscape_Static
- **Google Sheet**: https://docs.google.com/spreadsheets/d/1cR5X2xFSGffivfsMjyHDDeDJQv6R0kQpVUJsEJ2_1yY/edit

---

## 🚀 How to Update the Live Site

### Step-by-Step Workflow

```bash
# 1. Make your changes
code index.html  # or graph.js

# 2. Test locally (REQUIRED - must use HTTP server)
python3 -m http.server 8000
open http://localhost:8000

# 3. Check console for success:
#    ✅ "Google Sheets API client initialized"
#    ✅ "Loaded XXX nodes, YYY edges from Sheets"
#    ✅ "Initial data load complete"

# 4. Verify functionality:
#    - Graph displays with ~350+ nodes
#    - Colors match legend (person=blue, org=teal, project=purple)
#    - Refresh button works
#    - No console errors

# 5. Commit changes
git add .
git commit -m "Brief description of changes"

# 6. Push to GitHub
git push

# 7. Wait for GitHub Pages build (~1-2 minutes)
# Check status:
gh api repos/jonschull/ERA_Landscape_Static/pages/builds/latest | jq -r '.status'
# Should return: "built"

# 8. Verify live site
open https://jonschull.github.io/ERA_Landscape_Static/

# 9. Test live site functionality:
#    - Data loads automatically
#    - Console shows success messages
#    - All features work
```

---

## 📋 Pre-Flight Checklist

Before pushing to production, verify:

- [ ] Tested locally with HTTP server (not `file://`)
- [ ] Console shows no red errors
- [ ] Data loads automatically (~350+ nodes)
- [ ] Colors match legend
- [ ] Refresh button works
- [ ] Search/filter works
- [ ] Graph is interactive (drag, zoom, pan)
- [ ] Commit message is descriptive
- [ ] No sensitive data in commit

---

## 🔍 Troubleshooting Deployment

### Build Fails

**Check build status:**

```bash
gh api repos/jonschull/ERA_Landscape_Static/pages/builds/latest
```

**Common issues:**

- Syntax error in HTML/JS → Check console locally first
- File too large → We're at 20KB, shouldn't be an issue
- Branch not found → Ensure you pushed to `main`

### Site Doesn't Update

**Possible causes:**

1. **Browser cache** → Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+F5` (Windows)
2. **Build still running** → Wait 1-2 minutes, check build status
3. **CDN cache** → Can take up to 10 minutes to propagate globally

**Force verify:**

```bash
# Check what's actually deployed
curl -s https://jonschull.github.io/ERA_Landscape_Static/ | grep -o "ERA Graph"
```

### Data Doesn't Load

**Check:**

1. **Console errors** → Open DevTools and check for red errors
2. **API key** → Verify `API_KEY` in `index.html` is correct
3. **Sheet permissions** → Sheet must be publicly readable
4. **Network tab** → Check if API calls are succeeding (200 status) 

---

## 🛠️ Emergency Rollback

If you need to quickly revert to a previous version:

```bash
# 1. Find the last good commit
git log --oneline -10

# 2. Revert to that commit
git reset --hard <commit-hash>

# 3. Force push (use with caution)
git push --force

# 4. Wait for rebuild (~1-2 minutes)
```

**Example:**

```bash
git log --oneline -5
# 4549952 docs: Complete documentation update
# 136a216 docs: Update README with live GitHub Pages URL
# 4df11ff feat: Remove embedded data, auto-load from Sheets

# Roll back to before recent changes:
git reset --hard 4df11ff
git push --force
```

---

## 📊 Monitoring

### Check Site Health

**Automated test:**

```bash
python3.9 tests/test_sheets_integration.py
```

**Manual verification:**

1. Visit https://jonschull.github.io/ERA_Landscape_Static/
2. Open console (Cmd+Option+J)
3. Verify messages:
   - "🔧 Initializing Google Sheets API..."
   - "✅ Google Sheets API client initialized"
   - "✅ Loaded XXX nodes, YYY edges from Sheets"
   - "🎉 Initial data load complete"
4. Check node count matches Google Sheet
5. Test Refresh button
6. Test Search/filter

### Performance Metrics

**Expected:**

- Page load: <1 second (HTML parse)
- API init: ~2-3 seconds
- Data load: ~1-2 seconds
- Total to interactive: ~3-5 seconds

**Monitor:**

- Use Chrome DevTools → Network tab
- Check "Finish" time
- Look for slow API calls

---

## 🔒 Security Notes

### API Keys

Current credentials in `index.html`:

- `API_KEY`: For read-only access to public Sheet
- `CLIENT_ID`: For OAuth (write access)

**These are safe to commit** because:

- API Key is restricted to Sheets API only
- OAuth requires user sign-in
- Sheet is already public

**If compromised:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Regenerate API Key
3. Create new OAuth Client ID
4. Update `index.html`
5. Commit and push

### Sheet Permissions

**Required:**

- Sheet must be "Anyone with link can **view**"
- Write access requires OAuth sign-in

**To verify:**

1. Open Sheet
2. Click "Share"
3. Ensure "Anyone with the link" has "Viewer" access

---

## 📈 Analytics (Optional)

To add Google Analytics:

```html
<!-- Add to <head> in index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=YOUR_GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'YOUR_GA_ID');
</script>
```

---

## 🎯 Quick Reference

| Task               | Command                                                                               |
| ------------------ | ------------------------------------------------------------------------------------- |
| Test locally       | `python3 -m http.server 8000`                                                       |
| Check build status | `gh api repos/jonschull/ERA_Landscape_Static/pages/builds/latest \| jq -r '.status'` |
| View live site     | `open https://jonschull.github.io/ERA_Landscape_Static/`                            |
| Run tests          | `python3.9 tests/test_sheets_integration.py`                                        |
| Check last commits | `git log --oneline -10`                                                             |
| View file size     | `ls -lh index.html`                                                                 |

**Bookmarks:**

- Live Site: https://jonschull.github.io/ERA_Landscape_Static/
- Repository: https://github.com/jonschull/ERA_Landscape_Static
- Google Sheet: https://docs.google.com/spreadsheets/d/1cR5X2xFSGffivfsMjyHDDeDJQv6R0kQpVUJsEJ2_1yY/edit
- GitHub Pages Settings: https://github.com/jonschull/ERA_Landscape_Static/settings/pages

---

## 📚 Related Documentation

- **README.md** - Project overview and quick start
- **DEVELOPMENT.md** - Development guide with detailed workflows
- **NEXT_STEPS.md** - Project status and future enhancements
- **AI_HANDOFF_GUIDE.md** - Guidelines for AI assistants
- **DEPLOYMENT_GUIDE.md** - This file (deployment procedures)

---

## ✅ Success Criteria

Site is working correctly when:

- ✅ Page loads in <5 seconds
- ✅ Console shows API initialization success
- ✅ ~350+ nodes display
- ✅ Colors match legend
- ✅ Graph is interactive
- ✅ Refresh button works
- ✅ No console errors

**Current Status**: ✅ All criteria met, production ready!
