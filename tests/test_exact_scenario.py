#!/usr/bin/env python3
"""Test exact scenario: uncheck top-left checkbox, close modal, try to save"""
from playwright.sync_api import sync_playwright
import time

def test_exact_scenario():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, slow_mo=500)
        page = browser.new_page()
        
        # Capture console messages
        console_messages = []
        page.on("console", lambda msg: console_messages.append(f"[{msg.type}] {msg.text}"))
        
        print("Step 1: Opening graph viewer...")
        page.goto("http://127.0.0.1:8002/")
        page.wait_for_selector("#network")
        page.wait_for_function("() => window.__graph && window.__graph.nodes")
        
        print("Step 2: Finding Biodiversity for Livable Climate,Ecorestoration Alliance (connected to Philip Bogdonoff)...")
        node_found = page.evaluate("""() => {
            const all = window.__graph.nodes.get();
            const node = all.find(n => n.id === 'org::Biodiversity for Livable Climate,Ecorestoration Alliance');
            return node ? {id: node.id, label: node.label} : null;
        }""")
        
        if not node_found:
            print("ERROR: Org not found")
            browser.close()
            return
        
        print(f"Found: {node_found['label']} ({node_found['id']})")
        
        print("Step 3: Clicking on node to open curation modal...")
        page.evaluate(f"() => window.openCurationFor('{node_found['id']}')")
        time.sleep(1)
        
        print("Step 4: Checking if modal is visible...")
        modal_visible = page.evaluate("() => document.getElementById('curationModal').style.display === 'flex'")
        print(f"Modal visible: {modal_visible}")
        
        if not modal_visible:
            print("ERROR: Modal didn't open")
            browser.close()
            return
        
        print("Step 5: Finding the SOURCE toggle checkbox (top-left, next to 'Drag here')...")
        source_checkbox = page.evaluate("""() => {
            const cb = document.getElementById('sourceToggle');
            if (!cb) return null;
            return {
                checked: cb.checked,
                id: 'sourceToggle'
            };
        }""")
        
        if not source_checkbox:
            print("ERROR: Source toggle checkbox not found")
            browser.close()
            return
        
        print(f"Source toggle checkbox: checked={source_checkbox['checked']}")
        
        if not source_checkbox['checked']:
            print("ERROR: Source checkbox is already unchecked")
            browser.close()
            return
        
        print("Step 6: Unchecking the source toggle checkbox (org should vanish from graph)...")
        page.evaluate("() => { const cb = document.getElementById('sourceToggle'); cb.checked = false; cb.dispatchEvent(new Event('change', { bubbles: true })); }")
        time.sleep(1)
        
        # Verify the node is hidden in the graph
        node_hidden = page.evaluate(f"""() => {{
            const node = window.__graph.nodes.get('{node_found['id']}');
            return node ? node.hidden === true : false;
        }}""")
        print(f"Node hidden in graph: {node_hidden}")
        
        print("Step 7: Checking pendingOps...")
        pending_ops = page.evaluate("() => window.pendingOps")
        print(f"Pending operations: {pending_ops}")
        
        print("Step 8: Checking unsaved badge...")
        badge_visible = page.evaluate("() => document.getElementById('unsavedBadge').style.display !== 'none'")
        print(f"Unsaved badge visible: {badge_visible}")
        
        print("Step 9: Clicking Close button in modal...")
        page.click("#closeCuration")
        time.sleep(1)
        
        print("Step 10: Checking if modal closed...")
        modal_visible_after = page.evaluate("() => document.getElementById('curationModal').style.display === 'flex'")
        print(f"Modal visible after close: {modal_visible_after}")
        
        print("Step 11: Checking pendingOps after close...")
        pending_ops_after = page.evaluate("() => window.pendingOps")
        print(f"Pending operations after close: {pending_ops_after}")
        
        print("Step 12: Clicking Save Edit button...")
        page.click("#qeSaveTop")
        time.sleep(2)
        
        print("\n=== Console Messages (last 15) ===")
        for msg in console_messages[-15:]:
            print(msg)
        
        print("\n=== Final State ===")
        final_pending = page.evaluate("() => window.pendingOps")
        final_pending_length = page.evaluate("() => window.pendingOps.length")
        badge_after_save = page.evaluate("() => document.getElementById('unsavedBadge').style.display !== 'none'")
        print(f"Final pending operations: {final_pending}")
        print(f"Final pending length: {final_pending_length}")
        print(f"Badge visible after save: {badge_after_save}")
        
        print("\n=== VERDICT ===")
        if final_pending_length == 0 and not badge_after_save:
            print("✅ SUCCESS: Operations cleared, badge hidden")
        else:
            print(f"❌ FAIL: Still has {final_pending_length} pending ops, badge visible={badge_after_save}")
        
        print("\nKeeping browser open for 5 seconds so you can see...")
        time.sleep(5)
        
        browser.close()

if __name__ == "__main__":
    test_exact_scenario()
