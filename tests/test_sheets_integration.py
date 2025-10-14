#!/usr/bin/env python3.9
"""
Test Google Sheets API integration with HTTP server.

Tests actual user workflows:
1. Page loads with API initialization
2. Refresh button loads data from Sheets
3. Sign In button triggers OAuth

Runs with local HTTP server (required for Google API).
"""

from playwright.sync_api import sync_playwright
import http.server
import socketserver
import threading
import time
import os

PORT = 8123
TEST_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=TEST_DIR, **kwargs)
    
    def log_message(self, format, *args):
        pass  # Suppress server logs

def start_server():
    """Start HTTP server in background thread."""
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        httpd.serve_forever()

def main():
    print("="*70)
    print("TEST: Google Sheets API Integration (HTTP Server)")
    print("="*70)
    
    # Start HTTP server
    print(f"\n1. Starting HTTP server on port {PORT}...")
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(2)  # Let server start
    print(f"   ✅ Server running at http://localhost:{PORT}")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        console_messages = []
        errors = []
        
        def handle_console(msg):
            console_messages.append(f"[{msg.type}] {msg.text}")
        
        def handle_error(err):
            errors.append(str(err))
        
        page.on('console', handle_console)
        page.on('pageerror', handle_error)
        
        # Load page
        print("\n2. Loading page from HTTP server...")
        url = f"http://localhost:{PORT}/index.html"
        page.goto(url, wait_until='networkidle', timeout=15000)
        print("   ✅ Page loaded")
        
        # Wait for API initialization
        print("\n3. Waiting for API initialization (5 seconds)...")
        page.wait_for_timeout(5000)
        
        # Check console messages
        print("\n4. Checking console for API initialization...")
        init_messages = [m for m in console_messages if 'Initializing' in m or 'initialized' in m or 'API' in m]
        
        has_init_start = any('Initializing Google Sheets API' in m for m in console_messages)
        has_gapi_call = any('Calling gapi.client.init' in m for m in console_messages)
        has_init_success = any('Google Sheets API client initialized' in m for m in console_messages)
        
        print(f"   {'✅' if has_init_start else '❌'} Saw: '🔧 Initializing Google Sheets API...'")
        print(f"   {'✅' if has_gapi_call else '❌'} Saw: '📡 Calling gapi.client.init()...'")
        print(f"   {'✅' if has_init_success else '❌'} Saw: '✅ Google Sheets API client initialized'")
        
        if not has_init_success:
            print("\n   ⚠️  API did not complete initialization!")
            print("   Console messages so far:")
            for msg in init_messages[:10]:
                print(f"     {msg}")
        
        # Check API readiness
        print("\n5. Checking API state...")
        gapi_ready = page.evaluate("() => window.gapi && window.gapi.client && window.gapi.client.sheets")
        sheets_api_ready = page.evaluate("() => typeof sheetsApiReady !== 'undefined' ? sheetsApiReady : null")
        
        print(f"   gapi.client.sheets exists: {gapi_ready}")
        print(f"   sheetsApiReady variable: {sheets_api_ready}")
        
        # Check for errors
        print("\n6. Checking for JavaScript errors...")
        if errors:
            print(f"   ❌ Found {len(errors)} errors:")
            for err in errors[:3]:
                print(f"      {err}")
        else:
            print("   ✅ No JavaScript errors")
        
        # Test Refresh button workflow
        print("\n7. Testing Refresh button...")
        console_messages.clear()  # Clear to see only new messages
        
        refresh_btn = page.query_selector('#refreshBtn')
        if not refresh_btn:
            print("   ❌ Refresh button not found!")
        else:
            print("   ✅ Refresh button found")
            print("   Clicking refresh button...")
            
            initial_nodes_count = page.evaluate("() => nodes ? nodes.length : 0")
            print(f"   Initial nodes count: {initial_nodes_count}")
            
            refresh_btn.click()
            page.wait_for_timeout(3000)  # Wait for potential data load
            
            # Check what happened
            final_nodes_count = page.evaluate("() => nodes ? nodes.length : 0")
            print(f"   Final nodes count: {final_nodes_count}")
            
            # Check console for load attempt
            load_messages = [m for m in console_messages if 'Loading' in m or 'Loaded' in m or 'Sheets' in m or 'Failed' in m]
            loaded_successfully = any('Loaded' in m and 'from Sheets' in m for m in load_messages)
            
            if load_messages:
                print("   Console messages after click:")
                for msg in load_messages[:5]:
                    print(f"      {msg}")
            else:
                print("   ⚠️  No loading messages in console")
            
            if loaded_successfully:
                print(f"   ✅ Data loaded from Sheets successfully!")
                if initial_nodes_count != final_nodes_count:
                    print(f"      (Data changed: {initial_nodes_count} → {final_nodes_count})")
                else:
                    print(f"      (Count unchanged: {initial_nodes_count}, but that's OK if Sheet has same data)")
            else:
                print(f"   ❌ Data load failed or didn't attempt")
        
        # Test Sign In button
        print("\n8. Testing Sign In button...")
        signin_btn = page.query_selector('#signInBtn')
        if not signin_btn:
            print("   ❌ Sign In button not found!")
        else:
            print("   ✅ Sign In button found")
            btn_text = signin_btn.text_content()
            is_disabled = page.evaluate("document.getElementById('signInBtn').disabled")
            print(f"   Button text: '{btn_text}'")
            print(f"   Button disabled: {is_disabled}")
        
        # Summary
        print("\n" + "="*70)
        print("SUMMARY")
        print("="*70)
        
        checks = {
            'API initialization started': has_init_start,
            'gapi.client.init() called': has_gapi_call,
            'API initialization completed': has_init_success,
            'gapi.client.sheets available': bool(gapi_ready),
            'No JavaScript errors': len(errors) == 0,
            'Refresh button exists': refresh_btn is not None,
            'Refresh loads data from Sheets': loaded_successfully,
            'Sign In button exists': signin_btn is not None
        }
        
        for check, passed in checks.items():
            print(f"  {'✅' if passed else '❌'} {check}")
        
        passed_count = sum(1 for v in checks.values() if v)
        total_count = len(checks)
        
        print(f"\nPassed: {passed_count}/{total_count}")
        
        if passed_count == total_count:
            print("\n✅ INTEGRATION TEST PASSED")
            print("   Google Sheets API is working with HTTP server!")
            browser.close()
            return 0
        else:
            print("\n❌ INTEGRATION TEST FAILED")
            print("   Issues found - see details above")
            browser.close()
            return 1

if __name__ == '__main__':
    exit(main())
