# Google Sheet Analysis & User Tracking Design (v2)

**Date**: October 15, 2025  
**Incorporates**: User feedback from Oct 15 conversation

---

## Key Decisions

✅ **Default behavior**: Nodes go to **BOTH** Global and Personal sheets  
✅ **Checkboxes control visibility**: Both checked by default  
✅ **No "signed in as" display**: Focus on audit columns only  
✅ **Track field changes**: New column `fields_changed`  
✅ **Personal sheet auto-creation**: Create + present URL on first save  
❌ **Removed**: `is_personal` flag, `synced_to_global` (unnecessary)

---

## 1. Column Usage Reality Check

### What's Actually Displayed vs Stored

**Nodes Tab Analysis**:

| Column | UI Display? | Actual Use |
|--------|-------------|------------|
| `id`, `label` | Yes (node) | Essential |
| `type` | No | IGNORED (parsed from ID) |
| `url`, `notes`, `member`, `origin` | **NO** | Stored but NOT shown anywhere |
| `hidden`, timestamps | No | Internal use |

**Truth**: `url`, `notes`, `member`, `origin` are **preserved metadata** but **never displayed to users**. They could be shown in a details panel (doesn't exist yet). Direct Sheet editors may use them.

---

## 2. New Required Columns

### Add to BOTH Global and Personal sheets

**Audit Columns**:
```
created_by      | string  | User email who created
created_at      | string  | ISO timestamp
updated_by      | string  | User email who last modified  
updated_at      | string  | ISO timestamp
fields_changed  | JSON    | Array of field names changed
```

**Why `fields_changed`?**
- Precise audit: "Jon changed label and notes"
- Selective revert: "Undo notes change, keep label"
- Example: `["label", "notes"]` or `["*"]` for new rows

**Removed Columns** (from v1 proposal):
- ❌ `is_personal` - Nonsensical (can't track many users in Global)
- ❌ `synced_to_global` - Unnecessary (everything goes to both)
- ❌ `sheet_origin` - Redundant (we know from which sheet we read)

---

## 3. Personal Sheet Creation Flow

### First Save Experience

```
User signs in → User adds node → Check localStorage for personalSheetId

If NO personal sheet yet:
  1. Create new Sheet via API
  2. Name: "ERA Network - Personal (user@example.com)"
  3. Add tabs: 'nodes', 'edges' with headers
  4. Set permissions: Only this user
  5. Add initial row: User's own person node
  6. Store Sheet ID in localStorage
  7. Show dialog:
  
     ┌────────────────────────────────────┐
     │ Your Personal Landscape Created!   │
     ├────────────────────────────────────┤
     │ We created your private sheet      │
     │                                    │
     │ 📊 [Open Personal Sheet]           │
     │                                    │
     │ Your data is saved to BOTH:        │
     │ • Global (shared)                  │
     │ • Personal (private)               │
     │                                    │
     │ Use checkboxes to toggle views     │
     │                                    │
     │ [Got it!]                          │
     └────────────────────────────────────┘

Then save node to both sheets
```

### Initial Personal Sheet Content

**First row in 'nodes' tab**:
```
id: person::user@example.com
label: User Name
type: person
...other fields...
created_by: user@example.com
created_at: 2025-10-15T14:23:45Z
updated_by: user@example.com
updated_at: 2025-10-15T14:23:45Z
fields_changed: ["*"]
```

**Why?** User sees their sheet isn't empty, has a "self" node to connect to.

---

## 4. Data Flow Architecture

### Loading (Both Sheets Merged)

```javascript
async function loadAllData() {
  const useGlobal = $('#useGlobalData').checked;  // default: true
  const usePersonal = $('#usePersonalData').checked;  // default: true
  
  let allNodes = [], allEdges = [];
  
  if (useGlobal) {
    const global = await loadDataFromSheets(GLOBAL_SHEET_ID);
    allNodes.push(...global.nodes.map(n => ({...n, _source: 'global'})));
    allEdges.push(...global.edges.map(e => ({...e, _source: 'global'})));
  }
  
  if (usePersonal && localStorage.personalSheetId) {
    const personal = await loadDataFromSheets(localStorage.personalSheetId);
    allNodes.push(...personal.nodes.map(n => ({...n, _source: 'personal'})));
    allEdges.push(...personal.edges.map(e => ({...e, _source: 'personal'})));
  }
  
  // Merge: Personal wins conflicts
  return {
    nodes: mergeWithPersonalWins(allNodes, 'id'),
    edges: mergeWithPersonalWins(allEdges, ['source', 'target'])
  };
}

function mergeWithPersonalWins(items, keyField) {
  const map = new Map();
  
  // Load Global first
  items.filter(i => i._source === 'global').forEach(item => {
    const key = Array.isArray(keyField) 
      ? keyField.map(f => item[f]).join('::')
      : item[keyField];
    map.set(key, item);
  });
  
  // Personal overwrites
  items.filter(i => i._source === 'personal').forEach(item => {
    const key = Array.isArray(keyField)
      ? keyField.map(f => item[f]).join('::')
      : item[keyField];
    map.set(key, item);
  });
  
  return Array.from(map.values());
}
```

### Saving (To Both Sheets)

```javascript
async function doAdd() {
  const node = {
    id, label, type, url, notes, member, origin: 'quick-editor',
    hidden: false,
    created_by: window.currentUser.email,
    created_at: new Date().toISOString(),
    updated_by: window.currentUser.email,
    updated_at: new Date().toISOString(),
    fields_changed: ["*"]  // All fields (new node)
  };
  
  const useGlobal = $('#useGlobalData').checked;
  const usePersonal = $('#usePersonalData').checked;
  
  // Save to Global
  if (useGlobal) {
    await saveNodeToSheet(GLOBAL_SHEET_ID, node);
  }
  
  // Save to Personal
  if (usePersonal) {
    let personalId = localStorage.personalSheetId;
    if (!personalId) {
      personalId = await createPersonalSheet(window.currentUser.email);
      localStorage.personalSheetId = personalId;
      showPersonalSheetDialog(personalId);
    }
    await saveNodeToSheet(personalId, node);
  }
  
  nodes.add(node);
}
```

### Updating (Track Changes)

```javascript
async function updateNode(nodeId, changes) {
  const existing = nodes.get(nodeId);
  
  // Track which fields changed
  const changedFields = Object.keys(changes).filter(
    key => changes[key] !== existing[key]
  );
  
  const updated = {
    ...existing,
    ...changes,
    updated_by: window.currentUser.email,
    updated_at: new Date().toISOString(),
    fields_changed: changedFields  // e.g., ["label", "notes"]
  };
  
  // Save to appropriate sheets
  // (logic based on _source and checkbox states)
  
  nodes.update(updated);
}
```

---

## 5. Conflict Resolution: Personal Wins

### The Rule
When same node ID exists in both Global and Personal → **Personal overwrites Global**

### Example

**Global**: 
```
id: person::Jane Doe
notes: Works at EcoOrg
```

**User's Personal**:
```
id: person::Jane Doe
notes: My friend, call about funding
```

**User sees**: "My friend, call about funding" (their version)  
**Others see**: "Works at EcoOrg" (Global version)

### Edge Cases

**Q: User deletes from Personal?**  
A: Only deleted in Personal. Global remains. If both checkboxes on, Global version shows.

**Q: User hides a Global node?**  
A: Set `hidden: true` in Personal sheet. Only affects that user's view.

**Q: Both users edit same Global node simultaneously?**  
A: Last write wins (Google Sheets behavior). No conflict detection needed.

---

## 6. UI Components

### Checkboxes

```html
<div id="dataSourceControls">
  <label>
    <input type="checkbox" id="useGlobalData" checked onchange="reloadData()"> 
    Show Global Landscape
  </label>
  
  <label>
    <input type="checkbox" id="usePersonalData" checked onchange="reloadData()"> 
    Show My Personal Landscape
  </label>
  
  <a id="personalSheetLink" href="..." target="_blank" style="display:none;">
    📊 View Personal Sheet
  </a>
</div>
```

### Visual Distinction

**Personal nodes** get:
- Gold border (`#FFD700`, width: 3px)
- Tooltip: "(From your Personal Landscape)"

**Code**:
```javascript
if (node._source === 'personal') {
  node.borderWidth = 3;
  node.color.border = '#FFD700';
  node.title = node.label + '\n(From your Personal Landscape)';
}
```

---

## 7. Implementation Plan

### Phase 1: User Tracking (4-6 hours)

**Tasks**:
1. Capture user email/name on OAuth sign-in
2. Add columns: `created_by`, `updated_by`, `fields_changed`
3. Populate on save/update
4. Test with multiple users

**No UI changes** (just backend columns)

### Phase 2: Personal Sheets (8-12 hours)

**Tasks**:
1. Add checkbox UI
2. Implement `createPersonalSheet()` function
3. Implement merge logic (Personal wins)
4. Add visual distinction (gold borders)
5. Create "Personal Sheet Created" dialog
6. Test toggle behavior

### Phase 3: Admin Features (Later)

**Tasks**:
- Activity log filtered by user
- Selective revert functionality
- Admin panel (if admin email matches list)

---

## 8. Open Questions

### Q1: fields_changed format

**Option A**: Simple array
```json
["label", "notes"]
```

**Option B**: With old/new values
```json
[
  {"field": "label", "old": "Jane", "new": "Jane Doe"},
  {"field": "notes", "old": "", "new": "My friend"}
]
```

**Recommendation**: Start with Option A (simpler). Add Option B if needed.

### Q2: Handle "both checkboxes off"

**Options**:
- A. Show empty graph (warn user)
- B. Force at least one checked
- C. Default to Global

**Recommendation**: Option B - re-check Global with warning toast.

### Q3: Admin permissions

**Store admin list where?**
- A. Hardcoded in JS
- B. In Global Sheet 'admins' tab
- C. Both (hardcoded fallback)

**Recommendation**: Option B (easy to update).

---

## 9. Summary

**Core Changes**:
1. ✅ Both sheets by default
2. ✅ New audit columns (created_by, updated_by, fields_changed)
3. ✅ Personal sheet auto-created on first save
4. ✅ Personal wins conflicts
5. ✅ Visual distinction (gold borders)
6. ❌ Removed confusing concepts

**Estimated Time**: 12-18 hours total (Phases 1+2)

**Next Step**: Your approval to proceed with Phase 1?

