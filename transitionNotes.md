1. **Development Discipline - What Applies?**

From ERA_ClimateWeek's AI_HANDOFF_GUIDE:

- "Test before claiming success"
- "One change at a time"
- "Never claim 'fixed' without verification"

**For ERA_Landscape_Static (pure HTML/JS):**

- How do I test? (Open in browser, check console, what else?)
  - playwright tests with screenhots
- What's "one change" in HTML context? (Fix one JS function? One feature?)
  - one feature
- Validation = open file:// and ask Jon to confirm it works AFTER testing

### 2. **Long-Term Vision - What's the Goal Here?**

The original vision was collaborative network mapping with:

- Multi-user
- Shared data
- Personal views
- Discovery workflow

**For ERA_Landscape_Static:**

- Is this ALSO heading toward multi-user collaboration?.  YES
- Or is this meant to be simpler (view-only with OAuth for saves)?  NO.  we still anticipate that users will have personal sheets that complement the global sheet.  This was documented previously bring it here.
- Should vision doc focus on deployment/accessibility vs features?  Not just.  We need to understand the point (to create a utility that people can use to collectively map the movement for their own purposes while developing a database that helps everyone)

### 3. **Testing Strategy - What's Practical?**

ERA_ClimateWeek had:

- Playwright regression suite
- Manual smoke tests
- CI/CD on GitHub

**For ERA_Landscape_Static:**

- Keep Playwright tests? (test_load.py exists) FAR MORE THAN THAT EXISTS.
- Add browser compatibility tests?   >>Make it work in Edge and chrome.
- GitHub Actions for static HTML?  WHAT DO YOU MEAN?
- Manual checklist more important here?  WHAT DO YOU MEAN?

### 4. **Git Workflow - Same or Simpler?**

ERA_ClimateWeek: Feature branches, PRs, protected main.  SAME.

**For ERA_Landscape_Static:**

- Same workflow? (seems overkill for HTML edits).  SAME. It worked.
- Or lighter? (edit main, quick commits)
- When to create PR vs direct commit?  Every functional stable state is a PR.

### 5. **Essential vs Vestigial - What to Keep?**

**From AI_HANDOFF_GUIDE, what's ESSENTIAL for static project:**

- Testing discipline? YES
- Git workflow? (unclear) YES
- Code patterns? (different - no Python) NO
- Communication style? YES

**What's VESTIGIAL:**

- Python backend patterns YES
- Flask server details YES
- CSV/DataFrame handling YES

Should I preserve the SPIRIT and adapt the SPECIFICS?

---

**Once you answer these, I'll create:**

1. [AI_HANDOFF_GUIDE.md](cci:7://file:///Users/admin/Library/CloudStorage/Dropbox-EcoRestorationAllianceLLC/Jon%20Schull/CascadeProjects/ClimateWeek/AI_HANDOFF_GUIDE.md:0:0-0:0) (adapted for static HTML)
2. [TESTING.md](cci:7://file:///Users/admin/Library/CloudStorage/Dropbox-EcoRestorationAllianceLLC/Jon%20Schull/CascadeProjects/ClimateWeek/TESTING.md:0:0-0:0) (browser testing focus)
3. [HANDOFF_SUMMARY.txt](cci:7://file:///Users/admin/Library/CloudStorage/Dropbox-EcoRestorationAllianceLLC/Jon%20Schull/CascadeProjects/ClimateWeek/HANDOFF_SUMMARY.txt:0:0-0:0) (orientation for this project)
4. `VISION.md` (where this is going)

**What's your guidance?**
