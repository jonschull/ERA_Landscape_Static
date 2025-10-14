#!/usr/bin/env python3
"""
Regression Test Suite
Run this after any code changes to ensure nothing broke.
"""
import subprocess
import sys
from pathlib import Path

# Core regression tests (must pass)
CORE_TESTS = [
    "test_exact_scenario.py",           # Bogdonoff scenario (Phase B1)
    "test_reload_persistence.py",       # Hidden state persistence
    "test_search_filtering.py",         # Search filtering (Phase C1)
]

# Additional tests (nice to have)
ADDITIONAL_TESTS = [
    "test_curation_full.py",            # Full curation workflow
    "test_filter_fix.py",               # Union vs intersection
    "test_create_project.py",           # Project node creation
]

def run_test(test_file):
    """Run a single test and return success status."""
    print(f"\n{'='*60}")
    print(f"Running: {test_file}")
    print('='*60)
    
    result = subprocess.run(
        [sys.executable, test_file],
        cwd=Path(__file__).parent,
        capture_output=False
    )
    
    return result.returncode == 0

def main():
    print("ERA Graph Pipeline - Regression Test Suite")
    print("=" * 60)
    
    core_passed = 0
    core_failed = 0
    additional_passed = 0
    additional_failed = 0
    
    # Run core tests
    print("\n🔴 CORE TESTS (must pass)")
    for test in CORE_TESTS:
        if run_test(test):
            core_passed += 1
            print(f"✅ {test} PASSED")
        else:
            core_failed += 1
            print(f"❌ {test} FAILED")
    
    # Run additional tests
    print("\n🟡 ADDITIONAL TESTS (nice to have)")
    for test in ADDITIONAL_TESTS:
        if run_test(test):
            additional_passed += 1
            print(f"✅ {test} PASSED")
        else:
            additional_failed += 1
            print(f"⚠️  {test} FAILED")
    
    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Core Tests:       {core_passed}/{len(CORE_TESTS)} passed")
    print(f"Additional Tests: {additional_passed}/{len(ADDITIONAL_TESTS)} passed")
    
    if core_failed > 0:
        print("\n❌ REGRESSION DETECTED - Core tests failed!")
        print("   Do not proceed with new changes.")
        print("   Restore from backup or fix the issues.")
        return 1
    elif additional_failed > 0:
        print("\n⚠️  Some additional tests failed")
        print("   Core functionality OK, but check failures")
        return 0
    else:
        print("\n✅ ALL TESTS PASSED - Safe to proceed!")
        return 0

if __name__ == "__main__":
    sys.exit(main())
