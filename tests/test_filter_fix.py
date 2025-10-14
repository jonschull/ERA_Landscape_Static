#!/usr/bin/env python3
"""Test the fixed filtering logic"""
from playwright.sync_api import sync_playwright
import time

def test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, slow_mo=500)
        page = browser.new_page()
        
        print("1. Loading page...")
        page.goto("http://127.0.0.1:8002/")
        page.wait_for_selector("#network")
        page.wait_for_function("() => window.__graph && window.__graph.nodes")
        time.sleep(2)
        
        total = page.evaluate("() => window.__graph.nodes.get().length")
        print(f"   Total nodes: {total}")
        
        print("\n2. Type 'Jon Schull' in From box...")
        page.fill("#qeFrom", "Jon Schull")
        time.sleep(1)
        
        visible1 = page.evaluate("() => window.__graph.nodes.get().filter(n => n.opacity === 1 || n.opacity === undefined).length")
        ghost1 = page.evaluate("() => window.__graph.nodes.get().filter(n => n.opacity === 0.2).length")
        print(f"   Visible: {visible1}, Ghost: {ghost1}")
        
        if visible1 == 0:
            print("   ❌ FAIL: All nodes ghosted with one query!")
        else:
            print(f"   ✅ Shows Jon Schull's component")
        
        print("\n3. Add 'Jonathan Cloud' in To box...")
        page.fill("#qeTo", "Jonathan Cloud")
        time.sleep(1)
        
        visible2 = page.evaluate("() => window.__graph.nodes.get().filter(n => n.opacity === 1 || n.opacity === undefined).length")
        ghost2 = page.evaluate("() => window.__graph.nodes.get().filter(n => n.opacity === 0.2).length")
        print(f"   Visible: {visible2}, Ghost: {ghost2}")
        
        if visible2 == 0:
            print("   ❌ FAIL: All nodes ghosted with both queries!")
        elif visible2 <= visible1:
            print(f"   ✅ Shows intersection (narrowed from {visible1} to {visible2})")
        else:
            print(f"   ⚠️  Unexpected: increased from {visible1} to {visible2}")
        
        print("\n4. Clear both boxes...")
        page.fill("#qeFrom", "")
        page.fill("#qeTo", "")
        time.sleep(1)
        
        visible3 = page.evaluate("() => window.__graph.nodes.get().filter(n => n.opacity === 1 || n.opacity === undefined).length")
        print(f"   Visible: {visible3}")
        
        if visible3 == total:
            print("   ✅ All nodes restored")
        else:
            print(f"   ❌ FAIL: Only {visible3}/{total} restored")
        
        time.sleep(3)
        browser.close()

if __name__ == "__main__":
    test()
