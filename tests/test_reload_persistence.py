#!/usr/bin/env python3
"""Test that hidden state persists after browser reload"""
from playwright.sync_api import sync_playwright
import time

def test_reload():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, slow_mo=300)
        page = browser.new_page()
        
        print("1. Loading page...")
        page.goto("http://127.0.0.1:8002/")
        page.wait_for_selector("#network")
        page.wait_for_function("() => window.__graph && window.__graph.nodes")
        
        print("2. Checking if Fetzer Institute is hidden...")
        fetzer_node = page.evaluate("""() => {
            const node = window.__graph.nodes.get('org::Fetzer Institute');
            return node ? {hidden: node.hidden === true, label: node.label} : null;
        }""")
        
        print(f"   Fetzer Institute: {fetzer_node}")
        
        if fetzer_node and fetzer_node['hidden']:
            print("✅ SUCCESS: Hidden state persisted after reload")
        else:
            print("❌ FAIL: Hidden state did NOT persist")
        
        time.sleep(3)
        browser.close()

if __name__ == "__main__":
    test_reload()
