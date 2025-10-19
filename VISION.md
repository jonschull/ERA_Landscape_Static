# Long-Term Vision: Collaborative Network Mapping

**Date**: October 13, 2025  
**Project**: ERA_Landscape_Static

---

## The Goal

Create a **movement-wide utility** for collaborative network mapping where:

1. **Anyone can view** the shared network (public, no sign-in)
2. **Contributors can edit** the shared database (sign in with Google)
3. **Individuals customize** their own views (personal hide/show preferences)
4. **Users discover** connections added by others
5. **Personal sheets complement** the global sheet (individual data + collective data)

**The Point:** Help people collectively map the climate/restoration movement **for their own purposes** while developing a database that helps everyone.

---

## Use Cases

### Use Case 1: Discovery

- User A maps their network, adds organizations and people to **global sheet**
- User B opens the viewer, sees the shared network
- User B clicks a node, sees "hidden" connections added by User A
- User B unhides those connections → discovers User A's contributions
- Both users benefit from collective intelligence

### Use Case 2: Personal Data

- User C wants to maintain their own subset of the network
- User C creates a **personal sheet** for their own data curation
- User C's viewer can show: **global only**, **personal only**, or **merged view**
- Personal data is **public by default** (automatically merges into global)
- If User C wants something private, they mark it with **Private = true** attribute
- User C can choose to work with just their personal view (exclude global noise)

### Use Case 3: Collective Intelligence

- 20+ users contribute to global sheet
- Each adds their piece of the network
- Global sheet grows organically (500 → 1000 → 5000 nodes)
- Everyone benefits from the collective mapping
- No single person has to map the entire movement

---

## Architecture Evolution

### Phase 1: Static Viewer ✅ COMPLETED (October 2025)

**Goal:** Get the viewer working without a server

**Features:**
- ✅ Pure HTML/JavaScript (no backend)
- ✅ Loads from single global Google Sheet
- ✅ Interactive graph visualization
- ✅ Deployed to GitHub Pages

**Status:** Complete and deployed

**Completed:** October 15, 2025

**URL:** https://jonschull.github.io/ERA_Landscape_Static/

---

### Phase 2: OAuth Editing ✅ COMPLETED (October 2025)

**Goal:** Enable users to contribute to shared database

**Features:**
- ✅ "Sign In" button (Google OAuth)
- ✅ Add/edit nodes and edges
- ✅ Save changes back to global Sheet
- ✅ OAuth app published to production (anyone can sign in)

**Technical:**
- ✅ Google Identity Services (OAuth 2.0)
- ✅ Sheets API write permission
- ✅ OAuth Client: ERA Graph Browser Client
- ✅ Status: In production (public access enabled)

**Completed:** October 19, 2025

**Note:** Attribution tracking (created_by, updated_by) planned for Phase 3

---

### Phase 3: Personal Sheets (Q1 2026)

**Goal:** Enable personal data alongside global data

**Features:**
- Each user has their own personal Google Sheet
- Personal data is **public by default** (auto-merges into global view)
- Users can mark specific entries as "private" (opt-out from merge)
- View options: Global only, Personal only, or Merged (toggle)

**Technical:**
```javascript
// Load both sheets
const globalData = await loadSheet(GLOBAL_SHEET_ID);
const personalData = await loadSheet(USER_SHEET_ID);

// Filter personal data: exclude entries marked private
const publicPersonalNodes = personalData.nodes.filter(n => !n.private);

// Merge for display (personal public data goes into everyone's view)
const mergedNodes = [...globalData.nodes, ...publicPersonalNodes];
const mergedEdges = [...globalData.edges, ...personalData.edges.filter(e => !e.private)];

// View options (user can toggle)
// - "Global only": renderGraph(globalData.nodes, globalData.edges)
// - "Personal only": renderGraph(personalData.nodes, personalData.edges)
// - "Merged" (default): renderGraph(mergedNodes, mergedEdges)
```

**User Experience:**
1. User opens viewer (default: global data)
2. Signs in → also loads their personal sheet
3. View options:
   - "Show: Global + Personal" (merged - default)
   - "Show: Personal only" (just my data)
   - "Show: Global only" (everyone else's data)
4. Adding data to personal sheet:
   - By default: Public (auto-merges into global view for others)
   - Can mark as "Private" (only I see it, never merges)

**Timeline:** 1-2 months

---

### Phase 4: Discovery & Coordination (Q2 2026)

**Goal:** Help users discover each other's contributions

**Features:**
- "Show all connections" in node modal (including hidden)
- Visual indicator: "3 users added connections to this node"
- Filter: "Show only connections added by User A"
- Notifications: "User B added a connection you might care about"

**Technical:**
- Track data provenance (who added what)
- Filter by contributor
- Suggestion engine (optional)

**Timeline:** 2-3 months

---

### Phase 5: Real-time Collaboration (Future - Optional)

**Goal:** Live updates while multiple users edit

**Features:**
- See other users currently viewing
- Live updates as data changes
- Conflict resolution
- Collaborative editing sessions

**Technical:**
- WebSocket or polling for updates
- Operational transforms for conflict resolution
- Presence indicators

**Timeline:** TBD (only if needed)

---

## Technical Strategy

### Storage: Google Sheets (Not Database)

**Why Sheets?**
- ✅ Built-in multi-user (Google accounts)
- ✅ Familiar UX (everyone knows spreadsheets)
- ✅ No hosting costs
- ✅ Real-time collaboration built-in
- ✅ Edit in Sheet OR graph UI
- ✅ Version history free
- ✅ Export/import trivial

**Sheets Structure:**

**Global Sheet** (public, shared):
```
Tab: nodes
  id | label | type | url | notes | origin | created_by | created_at | updated_at

Tab: edges  
  source | target | relationship | role | url | notes | created_by | created_at | updated_at
```

**Personal Sheet** (per user, public by default):
```
Same schema as global
Plus: private column (boolean: false = public/merged, true = private/excluded)
```

**Rate Limits:**
- Google Sheets API: 100 requests/100 seconds/user
- Generous for our use case
- Batch reads/writes to stay under limit

---

### Authentication: Google OAuth

**Why Google?**
- ✅ Users already have Google accounts (for Sheets access)
- ✅ No password management
- ✅ Secure OAuth 2.0
- ✅ Works in browser (client-side)

**Flow:**
1. User clicks "Sign In"
2. OAuth popup → user authorizes
3. Browser gets access token
4. Can now read/write user's own Sheets
5. Token stored in localStorage (session persistence)

---

### Deployment: GitHub Pages

**Why GitHub Pages?**
- ✅ Free hosting for static sites
- ✅ HTTPS by default
- ✅ Simple deployment (git push)
- ✅ Custom domain support
- ✅ No server maintenance

**URL:** `https://jonschull.github.io/ERA_Landscape_Static/`

---

## Data Privacy & Permissions

### Public Data (Global Sheet)

**Access:**
- View: Anyone (no sign-in needed)
- Edit: Contributors only (sign in required)
- Delete: Administrators only

**What's public:**
- Organization names
- Project names
- Relationships (who partners with whom)
- URLs (public websites)

**What's NOT public:**
- Personal contact info (unless explicitly shared)
- Private notes
- Draft/unconfirmed connections

### Personal Data (Personal Sheets)

**Access:**
- View: Owner can see their own + merged global view
- Edit: Owner only (can edit their personal sheet)
- Merge: By default, personal data merges into global (public)

**What's in personal sheets:**
- User's own data curation
- Public by default (merged into everyone's global view)
- Can mark individual entries as "private" to exclude from merge

**What's private (opt-in):**
- Entries marked with `private = true` attribute
- Owner sees them, but they don't merge into global
- Useful for: draft connections, sensitive relationships, personal notes

### User Control

**Users can:**
- Maintain their own personal sheet (their data, their curation)
- View: Global only, Personal only, or Merged (toggle)
- Mark specific entries as "private" (opt-out from merge)
- Delete their own contributions
- Export their data anytime

---

## Incentive Model

### Why Would Users Contribute?

**1. Personal Utility**
- Users need this tool for their own network mapping
- Contributing makes THEIR data more useful
- Network effects: more data = more valuable tool

**2. Discovery**
- Users discover connections they didn't know
- Serendipity: "Oh, I didn't know X works with Y!"
- Helps users find collaborators

**3. Movement Building**
- Collective intelligence benefits everyone
- Visualizing movement = understanding movement
- Coordination improves with better mapping

**4. Low Friction**
- Easy to add data (familiar spreadsheet OR graph UI)
- OAuth = one-click sign in
- No app to install, just open URL

---

## Compatibility with Current Architecture

### ✅ What Already Fits

**Modal-based discovery:**
- Opening a node shows ALL connections (not just visible)
- Perfect for discovering others' contributions
- Already implemented in parent project (ERA_ClimateWeek)

**Operation queue + batch save:**
- Clean separation of changes from persistence
- Easy to add attribution (who made this change)
- Already designed for transactional updates

**Serverless architecture:**
- No backend = easy to scale
- Pure client-side = low cost
- GitHub Pages = free hosting

### ⚠️ What Needs Work

**1. Personal Sheet Integration**
- Need to load multiple sheets (global + personal)
- Merge data client-side
- Track provenance (which sheet did this come from)

**2. Attribution Tracking**
- Add `created_by` and `updated_by` columns
- Capture user ID from OAuth
- Display in UI ("Added by User A")

**3. Merge & Privacy Controls**
- Personal data merges automatically (public by default)
- UI for marking entries as "private" (opt-out from merge)
- Filter controls: View Global, Personal, or Merged
- Handle duplicate detection across sheets

---

## Success Metrics

### Phase 1 Success (Static Viewer) ✅ ACHIEVED
- ✅ Deploys to GitHub Pages
- ✅ Loads data from Google Sheets
- ✅ No console errors
- ✅ Graph displays and works
- ✅ 5+ users can access and view

### Phase 2 Success (OAuth Editing) ✅ ACHIEVED
- ✅ Users can sign in (OAuth in production)
- ✅ Users can add/edit nodes and edges
- ✅ Changes save to global Sheet
- ⏳ 10+ users contributing data (pending user adoption)

### Phase 3 Success (Personal Sheets)
- ✅ Users have personal sheets
- ✅ Combined view works (global + personal)
- ✅ Promotion workflow tested
- ✅ 20+ users with personal sheets

### Phase 4+ Success (Collaborative)
- ✅ Users discovering each other's contributions
- ✅ Network growing organically (>1000 nodes)
- ✅ Active community of contributors
- ✅ Utility proven valuable

---

## Decision Gates

### After Phase 1 (Static Viewer)

**Questions:**
- Does it work on GitHub Pages?
- Are users interested?
- Should we proceed to Phase 2?

**If NO:** Stop here, keep as static viewer only  
**If YES:** Proceed to Phase 2 (OAuth)

### After Phase 2 (OAuth Editing)

**Questions:**
- Are users actively contributing?
- Do we have 10+ contributors?
- Is data quality good?

**If NO:** Work on incentives, UX improvements  
**If YES:** Proceed to Phase 3 (Personal Sheets)

### After Phase 3 (Personal Sheets)

**Questions:**
- Are personal sheets being used?
- Are users promoting personal → global?
- Is the utility valuable enough?

**If NO:** Reassess approach  
**If YES:** Consider Phase 4 (Discovery)

---

## Technical Considerations

### Scalability

**Google Sheets limits:**
- 10 million cells per sheet (we're at ~10k currently)
- 100 requests/100 seconds/user (batch to optimize)
- 500 requests/100 seconds/project (we're well under)

**When to migrate to database:**
- >10,000 nodes (Sheet gets slow)
- >100 concurrent users (rate limits)
- Need complex queries (Sheets is simple key-value)

**Migration path:**
- Export Sheets → CSV
- Load CSV → PostgreSQL/SQLite
- Keep Sheets for backup/export
- Update viewer to read from DB API instead of Sheets

### Browser Compatibility

**Target:**
- Chrome 118+ (primary)
- Edge 118+ (primary)
- Firefox 119+ (nice to have)
- Safari 17+ (nice to have)

**Requirements:**
- ES6 support (async/await, arrow functions)
- Fetch API
- localStorage
- Google APIs (OAuth, Sheets)

### Performance

**Current:** 352 nodes, 220 edges (renders fine)

**Future:**
- 1,000 nodes: Should work (test physics settings)
- 5,000 nodes: May need optimization (disable physics)
- 10,000+ nodes: Need database, server-side rendering

---

## Open Questions

### User Research Needed

1. **Do users want personal sheets?**
   - Or is global sheet enough?
   - Survey potential users

2. **What data is sensitive?**
   - What should stay private by default?
   - What's safe to share?

3. **Discovery vs privacy?**
   - How much visibility do users want?
   - Opt-in vs opt-out for attribution

### Technical Decisions

1. **One Sheet or many?**
   - Option A: One global sheet, personal sheets separate
   - Option B: One sheet with user_id column (filtering)
   - Leaning toward Option A (simpler, better privacy)

2. **Conflict resolution?**
   - What if User A and User B edit same node?
   - Last write wins? Merge? Flag conflict?
   - Start simple (last write wins), add complexity if needed

3. **Data validation?**
   - Who can edit what?
   - Can users delete others' contributions?
   - Role system (viewer/contributor/admin)?

---

## Next Steps (Immediate)

**Right now (October 2025):**
1. Get Phase 1 working (static viewer)
2. Deploy to GitHub Pages
3. Share with 5-10 users for feedback

**Then (November 2025):**
1. Implement OAuth sign-in
2. Enable editing (Phase 2)
3. Get 10+ contributors

**Then (Q1 2026):**
1. Assess if personal sheets are needed
2. If yes, implement Phase 3
3. If no, focus on other features

---

## Bottom Line

**The vision is achievable:**
- Build incrementally (phase by phase)
- Each phase delivers value
- Can stop at any point (each phase is useful standalone)
- Google Sheets = low cost, low complexity
- Pure client-side = easy to deploy and maintain

**The goal is clear:**
- Help people map the movement collectively
- Individual utility + collective intelligence
- Make it easy to contribute, easy to discover

**Next action:**
- Get Phase 1 working (static viewer on GitHub Pages)
- Prove the concept
- Then decide if Phase 2+ is worth building

---

**Let's start simple and iterate based on real user needs.**
