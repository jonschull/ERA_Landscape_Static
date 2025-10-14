#!/bin/bash
# verify_state.sh - Quick project state verification
# Run this before claiming work is "done"

echo "========================================================================"
echo "ERA_Landscape_Static - State Verification"
echo "========================================================================"
echo ""

# 1. Git Status
echo "1. GIT STATUS"
echo "------------------------------------------------------------------------"
git status
echo ""

# 2. Untracked Files
echo "2. UNTRACKED FILES"
echo "------------------------------------------------------------------------"
UNTRACKED=$(git ls-files --others --exclude-standard)
if [ -z "$UNTRACKED" ]; then
    echo "✅ No untracked files"
else
    echo "⚠️  Untracked files found:"
    echo "$UNTRACKED"
fi
echo ""

# 3. Modified Files
echo "3. MODIFIED FILES (Not Staged)"
echo "------------------------------------------------------------------------"
MODIFIED=$(git diff --name-only)
if [ -z "$MODIFIED" ]; then
    echo "✅ No modified files"
else
    echo "⚠️  Modified files:"
    echo "$MODIFIED"
fi
echo ""

# 4. Staged Files
echo "4. STAGED FILES (Not Committed)"
echo "------------------------------------------------------------------------"
STAGED=$(git diff --cached --name-only)
if [ -z "$STAGED" ]; then
    echo "✅ No staged files"
else
    echo "⚠️  Staged files:"
    echo "$STAGED"
fi
echo ""

# 5. Last 5 Commits
echo "5. RECENT COMMITS"
echo "------------------------------------------------------------------------"
git log --oneline -5
echo ""

# 6. Current Branch
echo "6. CURRENT BRANCH"
echo "------------------------------------------------------------------------"
BRANCH=$(git branch --show-current)
echo "On branch: $BRANCH"
echo ""

# 7. Documentation Files
echo "7. DOCUMENTATION FILES"
echo "------------------------------------------------------------------------"
ls -1 *.md 2>/dev/null | sort
echo ""

# 8. Test Files
echo "8. TEST FILES"
echo "------------------------------------------------------------------------"
if [ -d "tests" ]; then
    ls -1 tests/*.py 2>/dev/null | wc -l | xargs echo "Python test files:"
    ls -1 tests/*.py 2>/dev/null | head -5
    if [ $(ls -1 tests/*.py 2>/dev/null | wc -l) -gt 5 ]; then
        echo "... (more)"
    fi
else
    echo "⚠️  No tests directory"
fi
echo ""

# 9. Helper Code
echo "9. HELPER CODE FOLDER"
echo "------------------------------------------------------------------------"
if [ -d "helpful" ]; then
    echo "✅ /helpful folder exists:"
    ls -1 helpful/
else
    echo "⚠️  No /helpful directory"
fi
echo ""

# Summary
echo "========================================================================"
echo "SUMMARY"
echo "========================================================================"

# Check if working tree is clean
if git diff-index --quiet HEAD -- 2>/dev/null; then
    echo "✅ Working tree clean (all changes committed)"
else
    echo "⚠️  Working tree has uncommitted changes"
fi

# Check for untracked files
if [ -z "$UNTRACKED" ]; then
    echo "✅ No untracked files"
else
    echo "⚠️  Untracked files present - commit or .gitignore them"
fi

# Check branch
if [ "$BRANCH" = "main" ]; then
    echo "✅ On main branch"
else
    echo "ℹ️  On feature branch: $BRANCH"
fi

echo ""
echo "========================================================================"
echo "NEXT STEPS"
echo "========================================================================"
echo ""
echo "If any ⚠️  warnings above:"
echo "  1. Commit untracked/modified files, OR"
echo "  2. Explain why they're not committed"
echo ""
echo "Before claiming 'done':"
echo "  3. Run: open index.html (test in browser)"
echo "  4. Run: cd tests && python test_load.py"
echo "  5. Check console for errors"
echo ""
echo "Only THEN claim work is complete."
echo ""
