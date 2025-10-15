# Google Sheet Analysis & User Tracking Design

**Date**: October 15, 2025
**Status**: Analysis & Design Proposal

---

## Executive Summary

This document analyzes the current Google Sheet structure, identifies unused columns, and proposes a comprehensive user tracking and Personal vs Global sheet architecture.

**Key Findings**:

- Current implementation uses **2 columns extensively** (id, label), **4 minimally** (url, notes, member, origin), **2 for timestamps**
- **NO user tracking** exists currently - we don't know who made what changes
- OAuth gives us user identity (email, name) but we **don't capture it**
- Personal vs Global sheet concept was planned but **never implemented**

---

## 1. Current Google Sheet Structure Analysis

### Nodes Tab - Column Usage

Based on code analysis (`index.html` lines 375-396, 455-466):

| Column         | Read | Written | Purpose                                        | Status                    |
| -------------- | ---- | ------- | ---------------------------------------------- | ------------------------- |
| `id`         | ✅   | ✅      | Unique identifier (e.g., "person::Jon Schull") | **ESSENTIAL**       |
| `label`      | ✅   | ✅      | Display name                                   | **ESSENTIAL**       |
| `type`       | ❌   | ✅      | Node type (person/project/org)                 | **IGNORED ON READ** |
| `url`        | ✅   | ✅      | Website/link                                   | **USED**            |
| `notes`      | ✅   | ✅      | Free-form notes                                | **USED**            |
| `member`     | ✅   | ✅      | Membership info                                | **USED**            |
| `origin`     | ✅   | ✅      | Data source/origin                             | **USED**            |
| `hidden`     | ✅   | ✅      | Hide from graph                                | **USED**            |
| `created_at` | ✅   | ⚠️    | Creation timestamp                             | **READ ONLY**       |
| `updated_at` | ✅   | ✅      | Last modified timestamp                        | **AUTO-SET**        |

**Note**: `type` column is IGNORED on read because we parse type from the `id` prefix (e.g., "person::" → "person"). This is intentional to ensure consistency.

### Edges Tab - Column Usage

Based on code analysis (lines 398-408, 468-477):

| Column           | Read | Written | Purpose                 | Status              |
| ---------------- | ---- | ------- | ----------------------- | ------------------- |
| `source`       | ✅   | ✅      | From node ID            | **ESSENTIAL** |
| `target`       | ✅   | ✅      | To node ID              | **ESSENTIAL** |
| `relationship` | ✅   | ✅      | Edge label              | **ESSENTIAL** |
| `role`         | ✅   | ✅      | Role description        | **USED**      |
| `url`          | ✅   | ✅      | Supporting link         | **USED**      |
| `notes`        | ✅   | ✅      | Free-form notes         | **USED**      |
| `created_at`   | ✅   | ⚠️    | Creation timestamp      | **READ ONLY** |
| `updated_at`   | ✅   | ✅      | Last modified timestamp | **AUTO-SET**  |

### Missing/Needed Columns

**Currently MISSING but needed for user tracking**:

- `created_by` - Email/ID of user who created the row
- `updated_by` - Email/ID of user who last modified the row
- `sheet_origin` - "global" or "personal" (for multi-sheet support)
- `is_personal` - Boolean flag for personal additions
- `synced_to_global` - Timestamp when personal item was synced to global

---

## 2. Current Authentication & User Identity

### What We Know About Authenticated Users

**Current Implementation** (`index.html` lines 231-260):

```javascript
tokenClient = google.accounts.oauth2.initTokenClient({
  client_id: CLIENT_ID,
  scope: SCOPES,
  callback: (response) => {
    accessToken = response.access_token;
    gapi.client.setToken({access_token: accessToken});
    sheetsApiReady = true;
    // ... BUT WE DON'T CAPTURE USER INFO! ...
  }
});
```

**What OAuth Token Gives Us Access To**:

- ✅ User's email address
- ✅ User's Google profile name
- ✅ User's profile picture
- ✅ Unique user ID (Google's internal ID)

**What We Currently Do With It**:

- ❌ **NOTHING** - We only store the access token
- ❌ We don't capture email, name, or ID
- ❌ We don't log who made changes
- ❌ We don't attribute edits to users

### How to Capture User Identity

**Add this to the OAuth callback**:

```javascript
callback: async (response) => {
  accessToken = response.access_token;
  gapi.client.setToken({access_token: accessToken});
  
  // NEW: Get user info
  const userInfo = await gapi.client.request({
    path: 'https://www.googleapis.com/oauth2/v2/userinfo',
    method: 'GET'
  });
  
  window.currentUser = {
    email: userInfo.result.email,
    name: userInfo.result.name,
    id: userInfo.result.id,
    picture: userInfo.result.picture
  };
  
  console.log('Signed in as:', window.currentUser.email);
  sheetsApiReady = true;
}
```

### Who Can Edit the Sheet Directly?

**Yes, you're correct**:

- Anyone with **Sheets edit permission** can edit directly
- Anyone who **Signs In through the app** can save via the app
- These may be **different sets of people**:
  - App users: Need Google OAuth permission (any Google account)
  - Sheet editors: Need explicit Sheet sharing permission

**Recommendation**: Make Sheet edit permission match app OAuth list for consistency.

---

## 3. User Activity Tracking Design

### Goal

Track who created/modified each node and edge to enable:

- Attribution (who added this?)
- Audit trail (what changed and when?)
- Selective reversion (undo changes by specific user)
- User-specific filtering

### Proposed Columns to Add

**Nodes Tab - Add these columns**:

```
created_by      | Email of user who created this node
updated_by      | Email of user who last modified this node
update_history  | JSON array of {timestamp, user, fields_changed}
```

**Edges Tab - Add same columns**:

```
created_by      | Email of user who created this edge
updated_by      | Email of user who last modified this edge
update_history  | JSON array of {timestamp, user, action}
```

### Implementation

**On Save** (`saveDataToSheets()` function):

```javascript
const nodesData = nodes.get().map(n => ({
  id: n.id,
  label: n.label,
  // ... existing fields ...
  created_by: n.created_by || window.currentUser.email,  // NEW
  updated_by: window.currentUser.email,                  // NEW
  created_at: n.created_at || new Date().toISOString(),
  updated_at: new Date().toISOString()
}));
```

**On Add New Node** (Quick Editor):

```javascript
nodes.add({
  id: nodeId,
  label: label,
  // ... other fields ...
  created_by: window.currentUser.email,   // NEW
  updated_by: window.currentUser.email,   // NEW
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
});
```

### Limitations of Sheets Revision History

**Google Sheets Version History**:

- ✅ Shows all changes with timestamps
- ✅ Shows who made each change (if they're signed into Google)
- ✅ Can revert to any previous version
- ❌ **Can't selectively undo one user's changes while keeping others**
- ❌ All-or-nothing reversion (entire sheet goes back)
- ❌ Can't filter/search by user efficiently

**Our Tracking Columns Solve This**:

- ✅ Can filter graph to show "only nodes added by Jon"
- ✅ Can identify all changes by specific user
- ✅ Can selectively revert specific user's additions
- ✅ Can build custom audit UI

---

## 4. Personal vs Global Sheets Architecture

### Concept

**Two-Level Data Model**:

1. **Global Sheet** - Shared canonical dataset (everyone reads/writes)
2. **Personal Sheets** - Per-user private additions/notes (user::email suffix)

### Previous Project Context

**From `ERA_ClimateWeek` project**:

- Single shared Sheet was implemented
- Personal vs Global was **discussed but never built**
- See `GOOGLE_SHEETS_MIGRATION_PLAN.md` (no mention of personal sheets)

### Proposed Architecture

**Sheet Structure**:

```
Global Sheet (existing):
  - ID: 1cR5X2xFSGffivfsMjyHDDeDJQv6R0kQpVUJsEJ2_1yY
  - Tabs: nodes, edges
  - Permissions: Everyone with link can edit
  
Personal Sheets (new):
  - ID: Generated per user (stored in localStorage)
  - Tabs: personal_nodes, personal_edges
  - Permissions: Only that user
  - Created automatically on first "Add to Personal"
```

### User Interface Design

**Toolbar Additions** (Top of page):

```html
<div id="dataSourceControls">
  <label>
    <input type="checkbox" id="useGlobalData" checked> 
    Show Global Data
  </label>
  
  <label>
    <input type="checkbox" id="usePersonalData" checked> 
    Show My Personal Data
  </label>
  
  <span id="personalSheetInfo" style="font-size: 11px; color: #666;">
    Personal sheet: <a href="..." target="_blank">View</a>
  </span>
</div>
```

**Quick Editor Additions** (When adding nodes/edges):

```html
<div id="quickEditor">
  <!-- Existing fields -->
  <input id="qeFrom" ...>
  <input id="qeTo" ...>
  
  <!-- NEW: Personal sheet option -->
  <label>
    <input type="checkbox" id="addToPersonal">
    Add to My Personal Sheet
  </label>
  
  <!-- Existing button -->
  <button onclick="doAdd()">Add/Update</button>
</div>
```

### Data Flow

**Loading Data**:

```javascript
async function loadAllData() {
  let nodesPayload = [];
  let edgesPayload = [];
  
  // Load global data (if checked)
  if (document.getElementById('useGlobalData').checked) {
    const global = await loadDataFromSheets(GLOBAL_SHEET_ID);
    nodesPayload.push(...global.nodes.map(n => ({...n, source: 'global'})));
    edgesPayload.push(...global.edges.map(e => ({...e, source: 'global'})));
  }
  
  // Load personal data (if checked and exists)
  if (document.getElementById('usePersonalData').checked) {
    const personalSheetId = localStorage.getItem('personalSheetId');
    if (personalSheetId) {
      const personal = await loadDataFromSheets(personalSheetId);
      nodesPayload.push(...personal.nodes.map(n => ({...n, source: 'personal'})));
      edgesPayload.push(...personal.edges.map(e => ({...e, source: 'personal'})));
    }
  }
  
  // Merge and de-duplicate
  // ... (handle conflicts: global wins vs personal wins?)
}
```

**Saving Data**:

```javascript
async function doAdd() {
  const node = { /* ... */ };
  const addToPersonal = document.getElementById('addToPersonal').checked;
  
  // Always add to global (current behavior)
  await saveToSheet(GLOBAL_SHEET_ID, 'nodes', [node]);
  
  // Optionally also add to personal
  if (addToPersonal) {
    let personalSheetId = localStorage.getItem('personalSheetId');
    if (!personalSheetId) {
      personalSheetId = await createPersonalSheet(window.currentUser.email);
      localStorage.setItem('personalSheetId', personalSheetId);
    }
    await saveToSheet(personalSheetId, 'personal_nodes', [node]);
  }
}
```

### Visual Distinction

**Color-Code by Source**:

```javascript
// When rendering nodes
if (node.source === 'personal') {
  node.color.border = '#FFD700';  // Gold border for personal items
  node.borderWidth = 3;
} else {
  // Normal global styling
}
```

**Legend Addition**:

```
Blue circle = Person
Purple triangle = Project
Teal box = Organization

Gold border = From my personal sheet. [We're already using gold.  but good idea.]
```

---

## 5. Conflict Resolution

### Scenarios

**Scenario 1: Same node in both Global and Personal**

- User adds "person::Jane Doe" to Global
- Later adds "person::Jane Doe" to Personal with different notes

**Options**:

- A. **Global wins** (ignore personal if ID exists in global)
- B. **Personal wins** (personal overrides global for that user)
- C. **Merge** (combine fields, show both)
  Ansewer C. Merge, assuming we know how to revert.  We are aiming for  wikipedia-style crowd-curation.

**Recommendation**: **Personal wins** (user-specific customization). [nope]

**Scenario 2: User removes global item**

- Node exists in Global sheet
- User wants to hide it from their view

**Options**:

- A. Set `hidden: true` in Global (affects everyone) YES.
- B. Add to "personal_hidden" list (only hides for that user)

**Recommendation**: **Personal hidden list** (don't affect others)

---

## 6. Admin Features

### View All User Activity

**Admin Panel** (new UI):

```html
<div id="adminPanel" style="display:none;">  <!-- Show if admin -->
  <h3>User Activity</h3>
  
  <label>
    Filter by user:
    <select id="userFilter">
      <option value="">All users</option>
      <option value="jon@example.com">Jon Schull</option>
      <option value="jane@example.com">Jane Doe</option>
    </select>
  </label>
  
  <table id="activityLog">
    <thead>
      <tr>
        <th>Timestamp</th>
        <th>User</th>
        <th>Action</th>
        <th>Item</th>
        <th>Revert</th>
      </tr>
    </thead>
    <tbody>
      <!-- Populated from created_by/updated_by columns -->
    </tbody>
  </table>
</div>
```

### Selective Reversion

**Feature**: "Undo all changes by user X"

**Implementation**:

1. Query Sheet for rows where `created_by = X` or `updated_by = X`
2. Present list to admin for review
3. Admin selects which changes to revert
4. Remove selected rows (or restore from backup)

**Code Sketch**:

```javascript
async function revertUserChanges(userEmail) {
  const nodes = await readSheetTab('nodes');
  const edges = await readSheetTab('edges');
  
  // Find items created or modified by user
  const nodesToReview = nodes.filter(n => 
    n.created_by === userEmail || n.updated_by === userEmail
  );
  const edgesToReview = edges.filter(e => 
    e.created_by === userEmail || e.updated_by === userEmail
  );
  
  // Show UI for admin to select which to revert
  showRevertDialog(nodesToReview, edgesToReview);
}
```

### Admin Identification

**How do we know who's admin?** 

**Option A: Hardcoded emails**

```javascript
const ADMIN_EMAILS = [
  'jschull@gmail.com',
  'admin@ecorestoration.org'
];

window.isAdmin = ADMIN_EMAILS.includes(window.currentUser.email);
```

**Option B: Admin Sheet tab**

- Create "admins" tab in Global Sheet
- List admin emails there
- Check if current user is in that list

**Recommendation**: **Option B** (easier to update without code changes)

[only works if we can limit editing rights in the Admins tab]

---

## 7. Recommended Implementation Plan

### Phase 1: User Tracking (Essential)

**Time**: 4-6 hours

1. ✅ Capture user info on sign-in (`email`, `name`, `id`)
2. ✅ Add `created_by`, `updated_by` columns to Sheet
3. ✅ Populate these columns on save/add operations
4. ✅ Show user info in UI ("Signed in as: Jon Schull")
5. ✅ Add basic activity log view (filter by user)

**Testing**:

- Sign in as different users
- Add nodes/edges
- Verify created_by/updated_by are set correctly
- Check Sheet has user emails

---

### Phase 2: Personal Sheets (Advanced)

**Time**: 8-12 hours

1. ✅ Add "Use Global" / "Use Personal" checkboxes
2. ✅ Create personal sheet on first use
3. ✅ Merge data from both sources
4. ✅ Add "Add to Personal" checkbox in Quick Editor
5. ✅ Handle conflicts (personal wins)
6. ✅ Visual distinction (gold borders)

**Testing**:

- Create personal sheet
- Add items to personal only
- Toggle global/personal visibility
- Verify no data loss when switching

---

### Phase 3: Admin Features (Nice-to-Have)

**Time**: 4-6 hours

1. ✅ Admin detection (email whitelist or admin tab)
2. ✅ Activity log UI with filtering
3. ✅ Selective revert functionality
4. ✅ User stats (who added most nodes?)

**Testing**:

- Sign in as admin
- Filter activity by user
- Test revert functionality
- Verify non-admins can't access

---

## 8. Open Questions for Discussion

### 1. Column Cleanup

**Question**: Should we remove unused columns from the Sheet? [Yes after confirming they are not used!]

**Current unused columns** (if any exist beyond the 10 documented):

- Unknown without seeing actual Sheet

**Recommendation**: Keep all current columns. They're cheap (storage-wise) and might be used by direct Sheet editors.

[I anticipate another feature.  The Global and Personal sheets allow user-created attributes (e.g., org type: non-profit, for-profit, or media: 1, 0 ) Those become checkboxes on the right margin of the graph and they show/hide elements that have those attributes.] 

---

### 2. Personal Sheet Naming

**Question**: How to name personal sheets?

**Options**:

- `ERA Network - Personal (jon@example.com)`
- `ERA Network - Jon Schull`
- `ERA Network Personal {user_id}`

**Recommendation**: Use email in name for clarity.  GOOD

---

### 3. Default Behavior

**Question**: When user adds a node, should it go to Global, Personal, or both?

**Options**:

- A. Global only (current behavior)
- B. Personal only (checkbox to "Share to Global")
- C. Both always
- D. Both with checkbox to exclude from Globa [default is NOT checked]


**Recommendation**: **Global by default, checkbox to also add to Personal** (least disruptive)

---

### 4. Conflict Resolution Strategy

**Question**: When same node exists in Global and Personal, which wins?

**Options**:

- A. Global wins (personal is ignored)
- B. Personal wins (overrides global)
- C. Merge (combine fields)

**Recommendation**: **Personal wins** (allows user customization). OK

---

### 5. Visibility of Personal Items

**Question**: Should other users see that a node was added by a specific person?

**Options**:

- A. No indication (all nodes look the same)
- B. Show creator name on hover
- C. Color-code by creator
- D. Show badge/icon

**Recommendation**: **Show creator in curation Modal.** 

---

## 9. Data Privacy Considerations

### User Email Exposure

**Concern**: Storing user emails in a shared Sheet exposes them to all editors.  

**Mitigations**:

- **Option A**: Use Google User ID instead (opaque string)
- **Option B**: Hash emails (irreversible, but admin needs lookup table)
- **Option C**: Accept email visibility (most Google Sheets already show edit history with emails)

**Recommendation**: **Use emails** (Option C) - Google Sheets version history already exposes this info.  OK

---

### Personal Sheet Privacy

**Concern**: Are personal sheets truly private?

**Answer**: Yes, IF permissions are set correctly:

- Created with user's OAuth token
- Only shared with that user
- Admin can't see it (unless explicitly shared)

**Caveat**: User could share their personal sheet with others manually. GOOD

---

## 10. Summary & Next Steps

### What We Learned

1. **Current column usage is lean** - only 8-10 columns actively used
2. **No user tracking exists** - we have the capability but don't use it
3. **Personal vs Global was planned but never built**
4. **OAuth gives us user identity** - we just need to capture it

### Recommended Priorities

**Must Have (Phase 1)**:

1. ✅ Capture user identity on sign-in
2. ✅ Add `created_by` / `updated_by` to Sheet
3. ✅ Show user info in UI
4. ✅ Basic activity filtering

**Should Have (Phase 2)**:
5. ✅ Personal sheets implementation
6. ✅ Toggle global/personal visibility
7. ✅ Visual distinction

**Nice to Have (Phase 3)**:
8. ✅ Admin panel with activity log
9. ✅ Selective reversion
10. ✅ User statistics

### Total Estimated Time

- **Phase 1**: 4-6 hours
- **Phase 2**: 8-12 hours
- **Phase 3**: 4-6 hours
- **Total**: 16-24 hours (2-3 days of focused work)

---

## 11. Questions for You

Before we proceed, I need your input on:

1. **Priorities**: Do you want to implement all 3 phases, or start with Phase 1 only?

   [1 first]
2. **Default behavior**: When someone adds a node, should it:

   - Go to Global only (current)
   - Go to Personal only with "Share to Global" option
   - Go to both with "Keep Personal" option
3. **Conflict strategy**: When same node is in Global + Personal:

   - Global wins (ignore personal)
   - Personal wins (override global for that user). [YES if do not share is checked. Othersie, this also updates the Global (and is tracked by us)
   - Merge somehow
4. **Privacy**: Are you OK with user emails being visible in the shared Sheet?  [user emails can remain in the revision history.  The Sheet should use name and GoogleID.]

   - Or should we use opaque user IDs?
5. **Admin list**: Should admin list be:

   - Hardcoded in JavaScript
   - Stored in a Sheet tab [that's good IF we can restrict editing rights for just that tab]
   - Both
6. **Timeline**: When do you want this implemented?

   - Immediately (start Phase 1 now)
   - After discussion. [AFTER DISCUSSION]
   - Later (just documenting for now)

---

**Please review and let's discuss!**
