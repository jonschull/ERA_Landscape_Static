#!/usr/bin/env python3
"""
Test Google Sheets API browser integration
Tests the functions in /helpful that will be integrated into index.html
"""

from playwright.sync_api import sync_playwright
import time
import os

def test_sheets_api():
    # Get path to index.html
    current_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(current_dir)
    index_path = os.path.join(parent_dir, 'index.html')
    file_url = f'file://{index_path}'
    
    print(f"\n{'='*70}")
    print("TEST: Google Sheets API Browser Integration")
    print('='*70)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, slow_mo=500)
        page = browser.new_page()
        
        # Collect console messages and errors
        console_messages = []
        errors = []
        page.on('console', lambda msg: console_messages.append(f"[{msg.type}] {msg.text}"))
        page.on('pageerror', lambda err: errors.append(str(err)))
        
        # Test 1: Page loads
        print("\n1. Loading page...")
        try:
            page.goto(file_url, wait_until='networkidle', timeout=10000)
            print("   ✅ Page loaded")
        except Exception as e:
            print(f"   ❌ Failed to load: {e}")
            browser.close()
            return False
        
        time.sleep(2)
        
        # Test 2: Check for Google API libraries
        print("\n2. Checking for Google API libraries...")
        gapi_loaded = page.evaluate("() => typeof window.gapi !== 'undefined'")
        google_accounts_loaded = page.evaluate("() => typeof window.google !== 'undefined' && typeof window.google.accounts !== 'undefined'")
        
        if gapi_loaded:
            print("   ✅ gapi library loaded")
        else:
            print("   ❌ gapi library NOT loaded")
            print("   → Need to add: <script src='https://apis.google.com/js/api.js'></script>")
        
        if google_accounts_loaded:
            print("   ✅ google.accounts library loaded")
        else:
            print("   ❌ google.accounts library NOT loaded")
            print("   → Need to add: <script src='https://accounts.google.com/gsi/client'></script>")
        
        # Test 3: Check for configuration
        print("\n3. Checking API configuration...")
        has_sheet_id = page.evaluate("() => typeof SHEET_ID !== 'undefined' && SHEET_ID !== ''")
        has_api_key = page.evaluate("() => typeof API_KEY !== 'undefined' && API_KEY !== ''")
        has_client_id = page.evaluate("() => typeof CLIENT_ID !== 'undefined' && CLIENT_ID !== ''")
        
        print(f"   {'✅' if has_sheet_id else '❌'} SHEET_ID defined: {has_sheet_id}")
        print(f"   {'✅' if has_api_key else '❌'} API_KEY defined: {has_api_key}")
        print(f"   {'✅' if has_client_id else '❌'} CLIENT_ID defined: {has_client_id}")
        
        if not (has_sheet_id and has_api_key and has_client_id):
            print("   → Need to add configuration from /helpful/oauth_init.js")
        
        # Test 4: Check for API initialization
        print("\n4. Checking API initialization...")
        sheets_api_ready_var = page.evaluate("() => typeof sheetsApiReady !== 'undefined'")
        
        if sheets_api_ready_var:
            print("   ✅ sheetsApiReady variable exists")
            sheets_ready = page.evaluate("() => sheetsApiReady")
            print(f"   Status: sheetsApiReady = {sheets_ready}")
        else:
            print("   ❌ sheetsApiReady variable not found")
            print("   → Need to add initialization code from /helpful/oauth_init.js")
        
        # Test 5: Check for Sheet functions
        print("\n5. Checking for Sheets API functions...")
        functions_to_check = [
            'readSheetTab',
            'writeSheetTab',
            'loadDataFromSheets',
            'saveDataToSheets',
            'initSheetsApi',
            'handleSignIn'
        ]
        
        all_functions_present = True
        for func_name in functions_to_check:
            exists = page.evaluate(f"() => typeof {func_name} === 'function'")
            if exists:
                print(f"   ✅ {func_name}() exists")
            else:
                print(f"   ❌ {func_name}() NOT found")
                all_functions_present = False
        
        if not all_functions_present:
            print("   → Need to add functions from /helpful/sheets_api_functions.js")
        
        # Test 6: Check for Sign In button
        print("\n6. Checking UI elements...")
        sign_in_btn = page.query_selector('#signInBtn')
        if sign_in_btn:
            print("   ✅ Sign In button exists")
            is_visible = page.evaluate("() => document.getElementById('signInBtn').offsetParent !== null")
            print(f"   Button visible: {is_visible}")
        else:
            print("   ❌ Sign In button NOT found")
            print("   → Need to add: <button id='signInBtn' onclick='handleSignIn()'>🔐 Sign In</button>")
        
        # Test 7: Check for JavaScript errors
        print("\n7. Checking for JavaScript errors...")
        if errors:
            print(f"   ❌ {len(errors)} JavaScript errors found:")
            for err in errors[:5]:  # Show first 5
                print(f"      - {err}")
        else:
            print("   ✅ No JavaScript errors")
        
        # Test 8: Look for initialization messages in console
        print("\n8. Checking console for initialization messages...")
        init_messages = [msg for msg in console_messages if 'Google Sheets' in msg or 'API' in msg]
        if init_messages:
            print("   Console messages:")
            for msg in init_messages[-5:]:  # Show last 5
                print(f"      {msg}")
        else:
            print("   ⚠️  No initialization messages found")
        
        # Test 9: Manual test - Try to call readSheetTab (if API ready)
        if gapi_loaded and has_sheet_id and has_api_key:
            print("\n9. Testing readSheetTab() (if API initialized)...")
            try:
                # Wait a bit for gapi to initialize
                time.sleep(3)
                
                # Check if we can call the function
                can_call = page.evaluate("""() => {
                    return window.gapi && 
                           window.gapi.client && 
                           window.gapi.client.sheets &&
                           typeof readSheetTab === 'function';
                }""")
                
                if can_call:
                    print("   ✅ API ready, attempting to read 'nodes' tab...")
                    # This will only work if Sheet is public and API key is valid
                    result = page.evaluate("""async () => {
                        try {
                            const data = await readSheetTab('nodes');
                            return { success: true, count: data.length };
                        } catch (error) {
                            return { success: false, error: error.message };
                        }
                    }""")
                    
                    if result.get('success'):
                        print(f"   ✅ Successfully read {result['count']} nodes from Sheet!")
                    else:
                        print(f"   ❌ Failed to read: {result.get('error')}")
                else:
                    print("   ⚠️  API not ready or function not available")
            except Exception as e:
                print(f"   ❌ Error testing readSheetTab: {e}")
        
        # Summary
        print("\n" + "="*70)
        print("SUMMARY")
        print("="*70)
        
        integration_checklist = {
            'Google API libraries loaded': gapi_loaded and google_accounts_loaded,
            'Configuration present': has_sheet_id and has_api_key and has_client_id,
            'Functions implemented': all_functions_present,
            'Sign In button exists': sign_in_btn is not None,
            'No JavaScript errors': len(errors) == 0
        }
        
        passed = sum(integration_checklist.values())
        total = len(integration_checklist)
        
        for item, status in integration_checklist.items():
            print(f"  {'✅' if status else '❌'} {item}")
        
        print(f"\nPassed: {passed}/{total}")
        
        if passed == total:
            print("\n✅ ALL CHECKS PASSED")
            print("   Google Sheets API integration is complete!")
            success = True
        elif passed >= 3:
            print("\n⚠️  PARTIAL INTEGRATION")
            print("   Some components missing - see checklist above")
            success = False
        else:
            print("\n❌ INTEGRATION NOT STARTED")
            print("   Need to add code from /helpful folder")
            success = False
        
        print("\n" + "="*70)
        print("Press Enter to close browser...")
        input()
        
        browser.close()
        return success

if __name__ == "__main__":
    success = test_sheets_api()
    exit(0 if success else 1)
