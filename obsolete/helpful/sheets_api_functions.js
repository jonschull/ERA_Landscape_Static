// ========== Google Sheets Direct Access (Serverless Mode) ==========
// REFERENCE IMPLEMENTATION from ERA_ClimateWeek feat/serverless-read
// Copy these functions into index.html or graph.js

/**
 * Read a tab from Google Sheet
 * @param {string} tabName - Name of the tab (e.g. 'nodes', 'edges')
 * @returns {Promise<Array>} Array of objects with column headers as keys
 */
async function readSheetTab(tabName) {
  if (!window.gapi || !window.gapi.client || !window.gapi.client.sheets) {
    throw new Error('Google Sheets API not initialized');
  }
  
  const response = await gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${tabName}!A:Z`
  });
  
  const rows = response.result.values || [];
  if (rows.length === 0) return [];
  
  // First row is headers
  const headers = rows[0];
  return rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i] || '');
    return obj;
  });
}

/**
 * Write data to a Sheet tab
 * @param {string} tabName - Name of the tab
 * @param {Array} data - Array of objects to write
 * @requires sheetsApiReady - Must be authenticated (OAuth)
 */
async function writeSheetTab(tabName, data) {
  if (!window.gapi || !window.gapi.client || !window.gapi.client.sheets) {
    throw new Error('Google Sheets API not initialized');
  }
  
  if (!sheetsApiReady) {
    throw new Error('Not authenticated - please sign in first');
  }
  
  if (data.length === 0) {
    console.warn(`No data to write to ${tabName}`);
    return;
  }
  
  const headers = Object.keys(data[0]);
  const rows = [headers, ...data.map(obj => headers.map(h => obj[h] || ''))];
  
  // Clear existing data
  await gapi.client.sheets.spreadsheets.values.clear({
    spreadsheetId: SHEET_ID,
    range: `${tabName}!A:Z`
  });
  
  // Write new data
  await gapi.client.sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${tabName}!A1`,
    valueInputOption: 'RAW',
    resource: { values: rows }
  });
}

/**
 * Load graph data from Google Sheets
 * Uses API key (no auth required for reading)
 * @returns {Promise<Object>} {nodes: [], edges: []} or null on error
 */
async function loadDataFromSheets() {
  // API key allows reading without OAuth
  if (!window.gapi || !window.gapi.client || !window.gapi.client.sheets) {
    console.log('⚠️ Google Sheets API not initialized. Skipping auto-load.');
    return null;
  }
  
  try {
    showToast('Loading from Sheets...');
    const [nodesData, edgesData] = await Promise.all([
      readSheetTab('nodes'),
      readSheetTab('edges')
    ]);
    
    console.log(`✅ Loaded ${nodesData.length} nodes, ${edgesData.length} edges from Sheets`);
    
    // Convert Sheet data to graph format
    const nodesPayload = nodesData.map(n => ({
      id: n.id,
      label: n.label,
      type: n.type || 'organization',
      url: n.url || '',
      notes: n.notes || '',
      member: n.member || '',
      origin: n.origin || '',
      hidden: n.hidden === 'true' || n.hidden === true,
      created_at: n.created_at || '',
      updated_at: n.updated_at || ''
    }));
    
    const edgesPayload = edgesData.map(e => ({
      from: e.source,
      to: e.target,
      label: e.relationship || '',
      relationship: e.relationship || '',
      role: e.role || '',
      url: e.url || '',
      notes: e.notes || '',
      created_at: e.created_at || '',
      updated_at: e.updated_at || ''
    }));
    
    // Update the graph
    nodes.clear();
    edges.clear();
    nodes.add(nodesPayload);
    edges.add(edgesPayload);
    
    showToast('✅ Loaded from Sheets');
    hideLoading();
    return { nodes: nodesPayload, edges: edgesPayload };
    
  } catch (error) {
    console.error('Error loading from Sheets:', error);
    showToast('❌ Failed to load from Sheets');
    hideLoading();
    return null;
  }
}

/**
 * Save graph data to Google Sheets
 * Requires OAuth authentication (sheetsApiReady must be true)
 * Triggers sign-in flow if not authenticated
 */
async function saveDataToSheets() {
  if (!sheetsApiReady) {
    // Trigger OAuth flow
    console.log('⚠️ Not authenticated - requesting sign in...');
    showToast('⚠️ Sign in required to save');
    pendingSaveAfterAuth = true;
    handleSignIn();
    return;
  }
  
  try {
    showToast('Saving to Sheets...');
    
    // Convert graph data to Sheet format
    const nodesData = nodes.get().map(n => ({
      id: n.id,
      label: n.label,
      type: n.type || 'organization',
      url: n.url || '',
      notes: n.notes || '',
      member: n.member || '',
      origin: n.origin || '',
      hidden: n.hidden ? 'true' : '',
      created_at: n.created_at || '',
      updated_at: new Date().toISOString()
    }));
    
    const edgesData = edges.get().map(e => ({
      source: e.from,
      target: e.to,
      relationship: e.relationship || e.label,
      role: e.role || '',
      url: e.url || '',
      notes: e.notes || '',
      created_at: e.created_at || '',
      updated_at: new Date().toISOString()
    }));
    
    // Write both tabs in parallel
    await Promise.all([
      writeSheetTab('nodes', nodesData),
      writeSheetTab('edges', edgesData)
    ]);
    
    console.log('✅ Saved to Sheets');
    showToast('✅ Saved to Sheets');
    
  } catch (error) {
    console.error('Error saving to Sheets:', error);
    showToast('❌ Failed to save: ' + error.message);
  }
}

// Helper function (assumes you have a loading indicator)
function hideLoading() {
  const loadingEl = document.getElementById('loading');
  if (loadingEl) loadingEl.style.display = 'none';
}
