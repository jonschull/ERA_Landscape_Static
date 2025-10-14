# Testing Guide

---

## AI Assistant Orientation

**If you're an AI assistant reading this for the first time:**

This file explains HOW to test. Before using these commands, you should:
1. Have already read `HANDOFF_SUMMARY.txt` and `AI_HANDOFF_GUIDE.md`
2. Know which feature you're working on
3. Understand the testing workflow: Manual browser test → Playwright test → User verification

**Key testing principle:** Test before claiming success. Open in browser, check console, run tests, THEN report results to user.

---

## Testing Workflow

### Step 1: Manual Browser Test (ALWAYS FIRST)

```bash
# Open in browser
open index.html

# Or specify browser
open -a "Google Chrome" index.html
open -a "Microsoft Edge" index.html
```

**What to check:**
1. **Console** (Cmd+Option+J in Chrome/Edge)
   - No red errors
   - API initialization messages present
   - No "failed to load" warnings

2. **Visual**
   - Graph displays
   - Nodes and edges visible
   - Toolbar present
   - No broken layout

3. **Functionality**
   - Click a node → modal opens
   - Click a button → action happens
   - Type in search → filtering works

**NEVER claim success without doing this first.**

---

### Step 2: Playwright Test (SECOND)

```bash
cd tests
python test_load.py
```

**Expected output:**
```
1. Loading file: file:///path/to/index.html
2. Waiting for page to initialize...
   Graph container: ✅ found
   Toolbar: ✅ found

3. JavaScript errors: 0

4. Console messages:
   [log] Google Sheets API initialized
   ...

5. Graph data:
   Nodes: 352
   Edges: 220

=== VERDICT ===
✅ Graph container present
✅ No JavaScript errors
✅ Data loaded (352 nodes)

✅ TEST PASSED
```

---

### Step 3: User Verification (THIRD)

After YOUR tests pass, ask user to verify:

```
✅ Feature tested and working

Changes:
- [List what changed]

Evidence:
- Browser test: No console errors
- test_load.py: PASSED
- [Screenshot if applicable]

Please verify:
1. Open index.html
2. [Specific action to test]
3. Confirm [expected result]
```

---

## Browser Compatibility Testing

### Target Browsers

**Must work in:**
- ✅ Chrome 118+
- ✅ Edge 118+

**Nice to have:**
- ⚠️ Firefox 119+
- ⚠️ Safari 17+

### How to Test Multiple Browsers

```bash
# Chrome
open -a "Google Chrome" index.html
# Check console, test feature

# Edge
open -a "Microsoft Edge" index.html
# Check console, test feature
```

**Test in BOTH Chrome and Edge before claiming success.**

### Browser-Specific Issues

**Chrome/Edge:**
- Full ES6 support
- Fetch API works
- Google Sheets API works

**Firefox:**
- May have different console formatting
- Check for async/await support

**Safari:**
- More strict about CORS
- May need different OAuth flow

---

## Manual Testing Checklist

### Basic Functionality

Run through this checklist after any change:

**Page Load:**
- [ ] index.html opens without errors
- [ ] Console shows no red errors
- [ ] Graph container visible
- [ ] Toolbar present

**Data Loading:**
- [ ] Data loads from Sheets (or embedded fallback)
- [ ] Node count correct (~352)
- [ ] Edge count correct (~220)
- [ ] No "failed to fetch" errors

**Graph Interaction:**
- [ ] Can drag nodes
- [ ] Can zoom (scroll wheel)
- [ ] Can pan (click and drag background)
- [ ] Click node → something happens (modal/selection)

**Toolbar:**
- [ ] All buttons present
- [ ] Refresh button works
- [ ] Search boxes work
- [ ] Save button present

**Quick Editor:**
- [ ] Can select From node
- [ ] Can select To node
- [ ] Can add edge
- [ ] Can remove edge
- [ ] Changes reflect in graph

**Modals:**
- [ ] Click node → modal opens
- [ ] Modal shows node data
- [ ] Can edit fields
- [ ] Can close modal

---

## Automated Testing

### Current Tests

**test_load.py** - Basic loading test
- Opens index.html in headless browser
- Checks for graph container
- Checks for toolbar
- Checks for JavaScript errors
- Verifies basic structure

### Running Tests

```bash
# Run single test
cd tests
python test_load.py

# Run with headed browser (see what happens)
# (modify test to set headless=False)
```

### Test Structure

```python
def test_feature():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # Load page
        page.goto('file:///path/to/index.html')
        
        # Wait for elements
        page.wait_for_selector('#network')
        
        # Test feature
        button = page.query_selector('#myButton')
        assert button is not None
        button.click()
        
        # Verify result
        result = page.query_selector('#result')
        assert result.text_content() == 'Expected'
        
        browser.close()
```

### Screenshots in Tests

```python
# Take screenshot for visual verification
page.screenshot(path='feature_test.png')
```

---

## Testing New Features

### Feature Development Workflow

1. **Plan the test FIRST**
   - What should happen?
   - How to verify it?
   - What could go wrong?

2. **Implement the feature**
   - Make minimal change
   - Test in browser immediately

3. **Verify with checklist**
   - [ ] Feature works as expected
   - [ ] No console errors
   - [ ] Doesn't break existing features
   - [ ] Works in Chrome AND Edge

4. **Write/update automated test**
   - Add test case to test_load.py
   - Or create new test file

5. **Document**
   - Update README if user-facing
   - Update this file if testing workflow changed

---

## Console Debugging

### Opening Console

**Chrome/Edge:**
- Mac: Cmd+Option+J
- Windows: F12

**Firefox:**
- Mac: Cmd+Option+K
- Windows: F12

**Safari:**
- Mac: Cmd+Option+C
- Enable: Safari → Preferences → Advanced → Show Develop menu

### What to Look For

**✅ Good signs:**
```
[log] Google Sheets API initialized
[log] Graph rendered with 352 nodes
[log] Data loaded successfully
```

**❌ Bad signs:**
```
[error] Failed to load resource: net::ERR_FILE_NOT_FOUND
[error] Uncaught ReferenceError: gapi is not defined
[error] Cannot read properties of null (reading 'addEventListener')
```

### Common Errors

**"gapi is not defined"**
- Google API library didn't load
- Check `<script src="https://apis.google.com/js/api.js"></script>`

**"Failed to fetch"**
- Sheet not public
- Invalid API key
- Rate limit exceeded

**"nodes is not defined"**
- Script loading order issue
- vis-network not initialized
- Check script tags order

---

## Network Tab Debugging

### Watch API Calls

**Chrome/Edge DevTools:**
1. Open DevTools (F12)
2. Click "Network" tab
3. Refresh page
4. Look for calls to `sheets.googleapis.com`

**What to check:**
- Status: 200 (success)
- Response: Contains data
- Time: <1s typically

**Common issues:**
- Status 403: Permission denied (Sheet not public)
- Status 429: Rate limit exceeded
- Status 401: Invalid API key

---

## Performance Testing

### Load Time

**Acceptable:**
- Page loads: <2 seconds
- Data fetched: <1 second
- Graph rendered: <3 seconds

**How to measure:**
```javascript
// Add to console
console.time('load');
// ... do action ...
console.timeEnd('load');
```

### Large Datasets

**Current:** 352 nodes, 220 edges (works fine)

**If graph grows:**
- Test with 1000+ nodes
- Check rendering performance
- May need physics optimizations

---

## Regression Testing

### After ANY Change

Run this quick check:

```bash
# 1. Open in browser
open index.html

# 2. Quick smoke test
# - Graph displays? ✅
# - Console clean? ✅
# - Buttons work? ✅

# 3. Run automated test
cd tests && python test_load.py

# 4. If all pass → safe to commit
git add .
git commit -m "Description of change"
```

### Before Creating PR

Full regression:

```bash
# 1. Test in Chrome
open -a "Google Chrome" index.html
# - Full manual checklist
# - Check console
# - Test all features

# 2. Test in Edge
open -a "Microsoft Edge" index.html
# - Same checklist
# - Verify no Edge-specific issues

# 3. Run all Playwright tests
cd tests
python test_load.py
# (Add more as they're created)

# 4. All pass? → Create PR
gh pr create --title "feat: Feature name"
```

---

## Writing New Tests

### Test Template

```python
#!/usr/bin/env python3
"""Test description"""

from playwright.sync_api import sync_playwright
import os

def test_my_feature():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(current_dir)
    index_path = os.path.join(parent_dir, 'index.html')
    file_url = f'file://{index_path}'
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # Collect errors
        errors = []
        page.on('pageerror', lambda err: errors.append(str(err)))
        
        print("1. Loading page...")
        page.goto(file_url, wait_until='networkidle')
        
        print("2. Testing feature...")
        # Your test code here
        
        print("3. Verifying result...")
        # Your assertions here
        
        browser.close()
        
        # Verdict
        if errors:
            print(f"❌ TEST FAILED: {len(errors)} errors")
            return False
        else:
            print("✅ TEST PASSED")
            return True

if __name__ == "__main__":
    success = test_my_feature()
    exit(0 if success else 1)
```

---

## Troubleshooting

### Test Fails with "File Not Found"

```bash
# Check path
ls index.html  # Should exist

# Use absolute path in test
index_path = os.path.abspath('index.html')
```

### Browser Cache Issues

```bash
# Clear Playwright cache
playwright install --force

# Or open with cache disabled
# (modify test to use incognito context)
```

### Timeout Errors

```python
# Increase timeout
page.wait_for_selector('#network', timeout=10000)  # 10 seconds
```

### Headless vs Headed

```python
# See what's happening
browser = p.chromium.launch(headless=False)

# Slow down actions
page.goto(url)
time.sleep(2)  # Watch what happens
```

---

## Key Principles

1. **Test in browser FIRST** - Before running Playwright
2. **Check console** - Red errors = something's wrong
3. **Test in Chrome AND Edge** - Both must work
4. **Small changes, test immediately** - Don't accumulate untested code
5. **Never claim success without proof** - Screenshots, test output, console clean

---

## Questions?

- **How do I test X?** → Open in browser, try it, check console
- **Test fails, what now?** → Look at error message, debug in browser
- **Need to see what's happening?** → Set `headless=False` in test

**When in doubt:** Open index.html in Chrome, open console, and see what's actually happening.
