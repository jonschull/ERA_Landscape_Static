#!/usr/bin/env python3
"""Test creating a new project node and connecting to a person"""
from playwright.sync_api import sync_playwright
import time

def test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, slow_mo=500)
        page = browser.new_page()
        
        console_logs = []
        page.on("console", lambda msg: console_logs.append(f"[{msg.type}] {msg.text}"))
        
        print("1. Loading page...")
        page.goto("http://127.0.0.1:8002/")
        page.wait_for_selector("#network")
        page.wait_for_function("() => window.__graph && window.__graph.nodes")
        time.sleep(2)
        
        print("\n2. Finding Moses Ojunju...")
        moses_exists = page.evaluate("""() => {
            const nodes = window.__graph.nodes.get();
            const moses = nodes.find(n => n.label && n.label.includes('Moses'));
            return moses ? {id: moses.id, label: moses.label} : null;
        }""")
        print(f"   Moses: {moses_exists}")
        
        print("\n3. Setting up: From=Moses Ojunju, To=ERA Africa, Type=Project...")
        # Select Project radio button for To
        page.check('input[name="toType"][value="project"]')
        page.fill("#qeFrom", "Moses Ojunju")
        page.fill("#qeTo", "ERA Africa")
        time.sleep(1)
        
        print("\n4. Clicking Add/Update...")
        page.click("#qeAdd")
        time.sleep(2)
        
        print("\n5. Checking if ERA Africa was created...")
        era_africa = page.evaluate("""() => {
            const nodes = window.__graph.nodes.get();
            const era = nodes.find(n => n.label && n.label.includes('ERA Africa'));
            return era ? {id: era.id, label: era.label, shape: era.shape, group: era.group} : null;
        }""")
        print(f"   ERA Africa: {era_africa}")
        
        print("\n6. Checking if edge was created...")
        edge = page.evaluate("""() => {
            const edges = window.__graph.edges.get();
            const moses_id = window.__graph.nodes.get().find(n => n.label && n.label.includes('Moses'))?.id;
            const era_id = window.__graph.nodes.get().find(n => n.label && n.label.includes('ERA Africa'))?.id;
            if(!moses_id || !era_id) return null;
            return edges.find(e => e.from === moses_id && e.to === era_id);
        }""")
        print(f"   Edge: {edge}")
        
        print("\n7. Checking Moses position...")
        moses_pos = page.evaluate("""() => {
            const moses = window.__graph.nodes.get().find(n => n.label && n.label.includes('Moses'));
            if(!moses) return null;
            const positions = window.network.getPositions([moses.id]);
            return positions[moses.id];
        }""")
        print(f"   Moses position: {moses_pos}")
        
        print("\n8. Console errors:")
        for log in console_logs:
            if 'error' in log.lower() or 'undefined' in log.lower():
                print(f"   {log}")
        
        print("\n=== VERDICT ===")
        if era_africa:
            print(f"✅ ERA Africa created: {era_africa}")
        else:
            print("❌ ERA Africa NOT created")
        
        if edge:
            print("✅ Edge created")
        else:
            print("❌ Edge NOT created")
        
        time.sleep(5)
        browser.close()

if __name__ == "__main__":
    test()
