#!/usr/bin/env python3
"""Test full curation flow: toggle checkbox, save, verify persistence"""
from playwright.sync_api import sync_playwright
import time
import pandas as pd

def test_curation_full():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        print("Opening graph viewer...")
        page.goto("http://127.0.0.1:8002/")
        page.wait_for_selector("#network")
        page.wait_for_function("() => window.__graph && window.__graph.nodes")
        
        print("Finding an organization with partners...")
        org_info = page.evaluate("""() => {
            const all = window.__graph.nodes.get();
            const org = all.find(n => n.group === 'organization');
            return org ? {label: org.label, id: org.id} : null;
        }""")
        
        if not org_info:
            print("ERROR: No organization nodes found")
            browser.close()
            return
        
        org_label = org_info['label']
        org_id = org_info['id']
        print(f"Using organization: {org_label} ({org_id})")
        
        # Open curation modal
        page.evaluate(f"() => window.openCurationFor('{org_id}')")
        time.sleep(0.5)
        
        # Get first checkbox info
        checkbox_info = page.evaluate("""() => {
            const cb = document.querySelector('#curationList input[type=checkbox]');
            if (!cb) return null;
            return {
                checked: cb.checked,
                name: cb.getAttribute('data-name'),
                url: cb.getAttribute('data-url')
            };
        }""")
        
        if not checkbox_info:
            print("No checkboxes found")
            browser.close()
            return
        
        partner_name = checkbox_info['name']
        initial_state = checkbox_info['checked']
        print(f"Partner: {partner_name}")
        print(f"Initial state: {'checked' if initial_state else 'unchecked'}")
        
        # Read current edges
        df_edges_before = pd.read_csv('output/edges.csv')
        partner_id = f"org::{partner_name}"
        edge_exists_before = ((df_edges_before['source'] == org_id) & 
                             (df_edges_before['target'] == partner_id) & 
                             (df_edges_before['relationship'] == 'partnership')).any()
        print(f"Edge exists in CSV before: {edge_exists_before}")
        
        # Toggle checkbox
        print(f"Toggling checkbox to {'unchecked' if initial_state else 'checked'}...")
        page.evaluate("() => { const cb = document.querySelector('#curationList input[type=checkbox]'); cb.checked = !cb.checked; cb.dispatchEvent(new Event('change', { bubbles: true })); }")
        time.sleep(0.5)
        
        # Check pending ops
        pending_count = page.evaluate("() => window.pendingOps.length")
        print(f"Pending operations: {pending_count}")
        
        if pending_count == 0:
            print("ERROR: No operations queued!")
            browser.close()
            return
        
        # Close modal first
        print("Closing modal...")
        page.keyboard.press("Escape")
        time.sleep(0.5)
        
        # Click Save Edit
        print("Clicking Save Edit...")
        page.click("#qeSaveTop")
        time.sleep(2)  # Wait for save to complete
        
        # Check if pending ops cleared
        pending_after = page.evaluate("() => window.pendingOps.length")
        print(f"Pending operations after save: {pending_after}")
        
        # Read edges again
        df_edges_after = pd.read_csv('output/edges.csv')
        edge_exists_after = ((df_edges_after['source'] == org_id) & 
                            (df_edges_after['target'] == partner_id) & 
                            (df_edges_after['relationship'] == 'partnership')).any()
        print(f"Edge exists in CSV after: {edge_exists_after}")
        
        # Verify the change persisted
        if initial_state:
            # Was checked, should now be unchecked (edge removed)
            if not edge_exists_after and edge_exists_before:
                print("✅ SUCCESS: Edge was removed and persisted")
            else:
                print(f"❌ FAIL: Edge removal not persisted (before={edge_exists_before}, after={edge_exists_after})")
        else:
            # Was unchecked, should now be checked (edge added)
            if edge_exists_after and not edge_exists_before:
                print("✅ SUCCESS: Edge was added and persisted")
            else:
                print(f"❌ FAIL: Edge addition not persisted (before={edge_exists_before}, after={edge_exists_after})")
        
        print("\nKeeping browser open for 3 seconds...")
        time.sleep(3)
        browser.close()

if __name__ == "__main__":
    test_curation_full()
