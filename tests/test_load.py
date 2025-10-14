#!/usr/bin/env python3
"""Test that static HTML loads and works without a server"""

from playwright.sync_api import sync_playwright
import time
import os

def test_static_load():
    # Get absolute path to index.html
    current_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(current_dir)
    index_path = os.path.join(parent_dir, 'index.html')
    file_url = f'file://{index_path}'
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        
        # Collect console messages
        console_messages = []
        errors = []
        page.on('console', lambda msg: console_messages.append(f"[{msg.type}] {msg.text}"))
        page.on('pageerror', lambda err: errors.append(str(err)))
        
        print(f"1. Loading file: {file_url}")
        page.goto(file_url, wait_until='networkidle')
        
        print("2. Waiting for page to initialize...")
        time.sleep(3)
        
        # Check if graph container exists
        network = page.query_selector("#network")
        print(f"   Graph container: {'✅ found' if network else '❌ missing'}")
        
        # Check if toolbar exists
        toolbar = page.query_selector("#toolbar")
        print(f"   Toolbar: {'✅ found' if toolbar else '❌ missing'}")
        
        # Check for JavaScript errors
        print(f"\n3. JavaScript errors: {len(errors)}")
        for err in errors:
            print(f"   ❌ {err}")
        
        # Check console for key messages
        print(f"\n4. Console messages ({len(console_messages)} total):")
        for msg in console_messages[-10:]:
            print(f"   {msg}")
        
        # Check if data loaded (look for nodes in window.__graph)
        try:
            node_count = page.evaluate("() => window.__graph ? window.__graph.nodes.length : 0")
            edge_count = page.evaluate("() => window.__graph ? window.__graph.edges.length : 0")
            print(f"\n5. Graph data:")
            print(f"   Nodes: {node_count}")
            print(f"   Edges: {edge_count}")
        except:
            print(f"\n5. Graph data: ❌ Not available")
            node_count = 0
        
        browser.close()
        
        # Verdict
        print("\n=== VERDICT ===")
        success = True
        
        if not network:
            print("❌ Graph container missing")
            success = False
        else:
            print("✅ Graph container present")
        
        if errors:
            print(f"❌ {len(errors)} JavaScript errors")
            success = False
        else:
            print("✅ No JavaScript errors")
        
        if node_count > 0:
            print(f"✅ Data loaded ({node_count} nodes)")
        else:
            print("⚠️ No data (expected - needs Google Sheets API call)")
        
        if success:
            print("\n✅ STATIC HTML TEST PASSED")
            print("   (Page loads without server, structure intact)")
            return True
        else:
            print("\n❌ TEST FAILED")
            return False

if __name__ == "__main__":
    success = test_static_load()
    exit(0 if success else 1)
