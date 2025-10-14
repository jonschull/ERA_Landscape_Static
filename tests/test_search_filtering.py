#!/usr/bin/env python3
"""Test Quick Editor search filtering with connected components"""
from playwright.sync_api import sync_playwright
import time

def test_filtering():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, slow_mo=500)
        page = browser.new_page()
        
        print("1. Loading page...")
        page.goto("http://127.0.0.1:8002/")
        page.wait_for_selector("#network")
        page.wait_for_function("() => window.__graph && window.__graph.nodes")
        time.sleep(2)
        
        print("2. Getting initial node count...")
        initial_count = page.evaluate("() => window.__graph.nodes.get().length")
        print(f"   Total nodes: {initial_count}")
        
        print("\n3. Typing 'Philip' in From box...")
        page.fill("#qeFrom", "Philip")
        time.sleep(2)
        
        visible_count = page.evaluate("""() => {
            const nodes = window.__graph.nodes.get();
            return nodes.filter(n => n.opacity === 1 || n.opacity === undefined).length;
        }""")
        ghost_count = page.evaluate("""() => {
            const nodes = window.__graph.nodes.get();
            return nodes.filter(n => n.opacity === 0.2).length;
        }""")
        print(f"   Visible nodes: {visible_count}")
        print(f"   Ghost nodes: {ghost_count}")
        
        print("\n4. Adding 'Ana' in To box...")
        page.fill("#qeTo", "Ana")
        time.sleep(2)
        
        visible_count2 = page.evaluate("""() => {
            const nodes = window.__graph.nodes.get();
            return nodes.filter(n => n.opacity === 1 || n.opacity === undefined).length;
        }""")
        ghost_count2 = page.evaluate("""() => {
            const nodes = window.__graph.nodes.get();
            return nodes.filter(n => n.opacity === 0.2).length;
        }""")
        print(f"   Visible nodes (intersection): {visible_count2}")
        print(f"   Ghost nodes: {ghost_count2}")
        
        print("\n5. Clearing both boxes...")
        page.fill("#qeFrom", "")
        page.fill("#qeTo", "")
        time.sleep(2)
        
        final_visible = page.evaluate("""() => {
            const nodes = window.__graph.nodes.get();
            return nodes.filter(n => n.opacity === 1 || n.opacity === undefined).length;
        }""")
        final_ghost = page.evaluate("""() => {
            const nodes = window.__graph.nodes.get();
            return nodes.filter(n => n.opacity === 0.2).length;
        }""")
        print(f"   Visible nodes (after clear): {final_visible}")
        print(f"   Ghost nodes: {final_ghost}")
        
        print("\n=== VERDICT ===")
        if visible_count < initial_count and ghost_count > 0:
            print("✅ Filtering works: nodes were ghosted")
        else:
            print("❌ Filtering may not be working")
        
        if visible_count2 <= visible_count:
            print("✅ Progressive narrowing works: intersection reduced visible set")
        else:
            print("❌ Progressive narrowing may not be working")
        
        if final_visible == initial_count and final_ghost == 0:
            print("✅ Clear works: all nodes restored")
        else:
            print("❌ Clear may not be working fully")
        
        print("\nKeeping browser open for 5 seconds...")
        time.sleep(5)
        browser.close()

if __name__ == "__main__":
    test_filtering()
