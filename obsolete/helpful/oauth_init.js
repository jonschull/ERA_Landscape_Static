// ========== Google Sheets API Initialization & OAuth ==========
// REFERENCE IMPLEMENTATION from ERA_ClimateWeek feat/serverless-read
// Copy this into <script> tag in index.html <head> section

// Configuration (replace with your credentials)
const SHEET_ID = '1cR5X2xFSGffivfsMjyHDDeDJQv6R0kQpVUJsEJ2_1yY';
const API_KEY = 'AIzaSyBp23GwrTURmM3Z1ERZocotnu3Tn96TmUo';
const CLIENT_ID = '57881875374-flipnf45tc25cq7emcr9qhvq7unk16n5.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

// State variables
let sheetsApiReady = false;
let tokenClient = null;
let accessToken = null;
let pendingSaveAfterAuth = false;

/**
 * Initialize Google Sheets API
 * - gapi.client with API key (for read access)
 * - Google Identity Services token client (for OAuth write access)
 */
function initSheetsApi() {
  if (!SHEET_ID || !API_KEY || !CLIENT_ID) {
    console.log('Serverless mode disabled (missing credentials)');
    return;
  }
  
  console.log('🔧 Initializing Google Sheets API...');
  
  // Initialize gapi client (for API calls with API key)
  gapi.load('client', async () => {
    try {
      await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4']
      });
      console.log('✅ Google Sheets API client initialized (API key mode)');
      
      // Initialize Google Identity Services token client (for OAuth when saving)
      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (response) => {
          if (response.error) {
            console.error('OAuth error:', response.error);
            showToast('❌ Authentication failed');
            pendingSaveAfterAuth = false;
            return;
          }
          accessToken = response.access_token;
          gapi.client.setToken({access_token: accessToken});
          sheetsApiReady = true;
          
          // Persist token for session restoration
          localStorage.setItem('gapi_token', JSON.stringify({
            access_token: accessToken,
            expires_at: Date.now() + 3600000 // 1 hour
          }));
          
          updateSignInStatus(true);
          console.log('✅ Authenticated with Google Sheets');
          
          // If save was pending, trigger it now
          if (pendingSaveAfterAuth) {
            pendingSaveAfterAuth = false;
            doSave();
          }
        }
      });
      
      // Try to restore token from localStorage
      const savedToken = localStorage.getItem('gapi_token');
      if (savedToken) {
        try {
          const tokenData = JSON.parse(savedToken);
          if (tokenData.expires_at > Date.now()) {
            accessToken = tokenData.access_token;
            gapi.client.setToken({access_token: accessToken});
            sheetsApiReady = true;
            updateSignInStatus(true);
            console.log('✅ Restored authentication from session');
          } else {
            localStorage.removeItem('gapi_token');
            console.log('⚠️ Saved token expired');
          }
        } catch (e) {
          console.error('Error restoring token:', e);
          localStorage.removeItem('gapi_token');
        }
      }
      
    } catch (error) {
      console.error('Error initializing Google Sheets API:', error);
    }
  });
}

/**
 * Update Sign In button UI based on auth status
 * @param {boolean} isSignedIn - Whether user is signed in
 */
function updateSignInStatus(isSignedIn) {
  const signInBtn = document.getElementById('signInBtn');
  if (signInBtn) {
    if (isSignedIn) {
      signInBtn.textContent = '✓ Signed In';
      signInBtn.disabled = true;
      signInBtn.style.opacity = '0.6';
    } else {
      signInBtn.textContent = '🔐 Sign In';
      signInBtn.disabled = false;
      signInBtn.style.opacity = '1';
    }
  }
}

/**
 * Handle Sign In button click
 * Triggers OAuth flow via Google Identity Services
 */
function handleSignIn() {
  if (!tokenClient) {
    showToast('⚠️ Google Sheets API not ready');
    return;
  }
  tokenClient.requestAccessToken();
}

// Initialize on page load
if (SHEET_ID && API_KEY && CLIENT_ID) {
  // Wait for page load to ensure gapi is available
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSheetsApi);
  } else {
    initSheetsApi();
  }
}
