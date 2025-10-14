#!/usr/bin/env python3
"""
Smoke Tests - Can run without server
Tests basic functionality that doesn't require browser/server.
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

def test_import_main_module():
    """Verify main module imports successfully."""
    import era_graph_pipeline
    assert era_graph_pipeline is not None

def test_requirements_exist():
    """Verify requirements.txt exists."""
    req_file = Path(__file__).parent.parent / "requirements.txt"
    assert req_file.exists(), "requirements.txt not found"
    
def test_main_code_exists():
    """Verify main code file exists."""
    main_file = Path(__file__).parent.parent / "era_graph_pipeline.py"
    assert main_file.exists(), "era_graph_pipeline.py not found"
    assert main_file.stat().st_size > 1000, "Main file seems too small"

def test_documentation_exists():
    """Verify key documentation files exist."""
    docs_dir = Path(__file__).parent.parent
    required_docs = [
        "README.md",
        "DEVELOPMENT.md",
        "AI_HANDOFF_GUIDE.md",
        "TESTING.md",
        "MODAL_INCREMENTAL_PLAN.md"
    ]
    for doc in required_docs:
        doc_path = docs_dir / doc
        assert doc_path.exists(), f"Required documentation {doc} not found"

def test_github_infrastructure():
    """Verify GitHub infrastructure exists."""
    github_dir = Path(__file__).parent.parent / ".github"
    assert github_dir.exists(), ".github directory not found"
    
    ci_workflow = github_dir / "workflows" / "ci.yml"
    assert ci_workflow.exists(), "CI workflow not found"
    
    pr_template = github_dir / "pull_request_template.md"
    assert pr_template.exists(), "PR template not found"

def test_test_directory_structure():
    """Verify test directory structure."""
    test_dir = Path(__file__).parent
    assert test_dir.exists()
    
    # Check for key test files
    assert (test_dir / "run_regression_tests.py").exists()
    assert (test_dir / "README.md").exists()
    
    # Check for e2e directory
    e2e_dir = test_dir / "e2e"
    assert e2e_dir.exists(), "e2e test directory not found"

if __name__ == "__main__":
    # Run tests manually
    import pytest
    sys.exit(pytest.main([__file__, "-v"]))
