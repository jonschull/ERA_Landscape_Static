  const container = document.getElementById('network');
  const data = { nodes, edges };
  const options = {
    autoResize: true,
    physics: { stabilization: { enabled: true, iterations: 1000 } },
    nodes: {
      borderWidth: 1,
      // size is controlled by scaling when 'value' is provided per node
      scaling: {
        min: 12,
        max: 60,
        label: { enabled: true, min: 12, max: 26 }
      },
      font: { face: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial', size: 14 }
    },
    edges: {
      smooth: true,
      font: { face: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial', size: 10 }
    }
  };
  const network = new vis.Network(container, data, options);
  // Make network globally accessible for fit after data load
  window.network = network;
  // Testing hooks (for automation)
  window.__graph = { nodes, edges, candidatesByOrgId };
  // Toolbar logic
  document.getElementById('fitBtn').onclick = () => network.fit({ animation: true });
  // Simple org-like tester in JS (mirrors Python loosely)
  function jsLooksLikeOrgName(txt){
    if(!txt) return false; const t=txt.trim(); if(t.length<2 || t.length>120) return false; const low=t.toLowerCase();
    const bad=['read more','click','here','privacy','accessibility','login','subscribe','newsletter','donate','visit site','try the app today!','website'];
    for (const b of bad){ if(low.includes(b)) return false; }
    const words=t.split(/\s+/);
    const endings=['Foundation','Institute','Project','Program','Network','Alliance','Coalition','Forum','Center','Centre','University','Council','Association','Initiative','Organization','Society','Trust','Cooperative','Committee','Ministry','Department','Agency'];
    return words.length>=1 && endings.some(e=>t.endsWith(e));
  }
  function isMediaOrUtility(url, name){
    const exts=['.jpg','.jpeg','.png','.gif','.svg','.pdf','.mp4','.mp3','.zip','.webp'];
    const badDomains=['vimeo.com','youtube.com','youtu.be','soundcloud.com','buzzsprout.com'];
    const low=(url||'').toLowerCase();
    if(exts.some(e=>low.endsWith(e))) return true;
    try{ const d=new URL(url).hostname.toLowerCase(); if(badDomains.some(b=>d.includes(b))) return true; }catch{}
    const lname=(name||'').toLowerCase();
    if(lname.includes('website by')) return true;
    return false;
  }
  
  // Batch save state (shared by Quick Editor and Curation Modal)
  let lastAction = null; // {type:'add'|'remove', edge:{from,to,label}, createdNodes:[id,...]}
  let pendingOps = [];   // batch of ops to persist on Save
  let hasUnsaved = false;
  const unsavedBadge = document.getElementById('unsavedBadge');
  function updateUnsaved(){ unsavedBadge.style.display = hasUnsaved ? '' : 'none'; }
  
  function queueOp(op){ 
    pendingOps.push(op); 
    hasUnsaved = true; 
    updateUnsaved(); 
  }
  
  // Expose for testing (use getter to always return current values)
  Object.defineProperty(window, 'pendingOps', {
    get: () => pendingOps,
    set: (val) => { pendingOps = val; }
  });
  Object.defineProperty(window, 'hasUnsaved', {
    get: () => hasUnsaved,
    set: (val) => { hasUnsaved = val; }
  });
  window.queueOp = queueOp;
  
  // Curation modal behavior
  const curModal=document.getElementById('curationModal');
  const curList=document.getElementById('curationList');
  const curSrc=document.getElementById('curationSource');
  const curSrcLink=document.getElementById('curationSourceLink');
  const curInfo=document.getElementById('curationInfo');
  const sourceToggle=document.getElementById('sourceToggle');
  const curUrl=document.getElementById('curationUrl');
  const curUrlInput=document.getElementById('curationUrlInput');
  const modalTypeRadios=document.querySelectorAll('input[name="modalNodeType"]');
  let currentSourceId=null;
  let originalKeep=true;
  let originalPartners=new Set();
  let originalUrl='';
  let originalType='';
  
  // Helper: refresh the connection list for current node
  function refreshConnectionList(){
    if (!currentSourceId) return;
    const orgId = currentSourceId;
    const n = nodes.get(orgId);
    if (!n) return;
    
    const isOrg = n.group === 'organization';
    
    curList.innerHTML = '';
    
    // Get ALL connections (edges) for this node
    const allEdges = edges.get().filter(e => e.from === orgId || e.to === orgId);
    const connections = allEdges.map(e => {
      const otherId = e.from === orgId ? e.to : e.from;
      const otherNode = nodes.get(otherId);
      return otherNode ? {
        id: otherId,
        label: otherNode.label,
        relationship: e.label || e.relationship || 'connected',
        url: otherNode.url || ''
      } : null;
    }).filter(x => x);
    
    // Get discovered partner candidates (org-only feature)
    const cand = (isOrg && candidatesByOrgId[orgId]) ? candidatesByOrgId[orgId] : [];
    
    // Update info text
    const connCount = connections.length;
    const candCount = cand.length;
    if (isOrg && candCount > 0) {
      curInfo.textContent = `${connCount} connections, ${candCount} candidates`;
    } else if (connCount > 0) {
      curInfo.textContent = `${connCount} connections`;
    } else {
      curInfo.textContent = isOrg ? 'No connections' : `${n.group || 'node'} (read-only)`;
    }
    
    // Show existing connections first
    if (connections.length > 0) {
      const header = document.createElement('div');
      header.innerHTML = '<strong>Connections:</strong>';
      header.style.marginTop = '10px';
      header.style.marginBottom = '5px';
      curList.appendChild(header);
      
      connections.forEach(conn => {
        const row = document.createElement('div');
        const urlLink = conn.url ? ` — <a href="${conn.url}" target="_blank">${conn.url}</a>` : '';
        row.innerHTML = `<label><input type="checkbox" checked data-conn-id="${conn.id}" data-relationship="${conn.relationship}"> ${conn.label} (${conn.relationship})${urlLink}</label>`;
        row.style.color = '#333';
        curList.appendChild(row);
      });
    }
    
    // Show discovered partner candidates (orgs only, exclude existing connections)
    if (isOrg && cand.length > 0) {
      const header = document.createElement('div');
      header.innerHTML = '<strong>Discovered partners:</strong>';
      header.style.marginTop = '15px';
      header.style.marginBottom = '5px';
      curList.appendChild(header);
      
      const connectedLabels = new Set(connections.map(c => c.label));
      cand.forEach(c => {
        if (!connectedLabels.has(String(c.name))) {
          const row = document.createElement('div');
          row.innerHTML = `<label><input type="checkbox" data-url="${c.url}" data-name="${c.name}"> ${c.name} — <a href="${c.url}" target="_blank">${c.url}</a></label>`;
          row.style.color = '#666';
          curList.appendChild(row);
        }
      });
    }
  }
  
  function openCurationFor(orgId){
    const n=nodes.get(orgId); if(!n) return;
    currentSourceId=orgId; curSrc.textContent = n.label;
    
    // Set URL display and input
    originalUrl = n.url || '';
    if (n.url) { 
      curSrcLink.href = n.url; 
      curUrl.href = n.url; 
      curUrl.textContent = n.url;
      curUrlInput.value = n.url;
    } else { 
      curSrcLink.removeAttribute('href'); 
      curUrl.removeAttribute('href'); 
      curUrl.textContent='';
      curUrlInput.value = '';
    }
    
    // Check if this is an organization (full editing) or other type (read-only)
    const isOrg = n.group === 'organization';
    
    // Set type radio buttons based on current node type
    originalType = n.group || 'person';
    modalTypeRadios.forEach(radio => {
      radio.checked = (radio.value === originalType);
    });
    
    // Initialize original state snapshots
    originalKeep = !(n.hidden === true);
    sourceToggle.checked = originalKeep;
    sourceToggle.disabled = false;  // Allow hiding any node type
    
    // Populate connection list
    refreshConnectionList();
    curModal.style.display='flex';
    hasUnsavedCuration = false;
  }
  window.openCurationFor = openCurationFor;
  
  // Edge modal variables
  const edgeModal = document.getElementById('edgeModal');
  const edgeFromLabel = document.getElementById('edgeFromLabel');
  const edgeToLabel = document.getElementById('edgeToLabel');
  const edgeRelSelect = document.getElementById('edgeRelSelect');
  const edgeRelCustom = document.getElementById('edgeRelCustom');
  const deleteEdgeBtn = document.getElementById('deleteEdge');
  const closeEdgeModalBtn = document.getElementById('closeEdgeModal');
  let currentEdgeId = null;
  
  function openEdgeModal(edgeId) {
    const edge = edges.get(edgeId);
    if (!edge) return;
    
    currentEdgeId = edgeId;
    const fromNode = nodes.get(edge.from);
    const toNode = nodes.get(edge.to);
    
    edgeFromLabel.textContent = fromNode.label;
    edgeToLabel.textContent = toNode.label;
    
    // Set relationship - handle custom values
    const rel = edge.label || 'partnership';
    if (['partnership', 'affiliation', 'membership'].includes(rel)) {
      edgeRelSelect.value = rel;
      edgeRelCustom.style.display = 'none';
    } else {
      edgeRelSelect.value = '__custom';
      edgeRelCustom.value = rel;
      edgeRelCustom.style.display = 'inline';
    }
    
    edgeModal.style.display = 'flex';
  }
  
  closeEdgeModalBtn.onclick = () => {
    edgeModal.style.display = 'none';
    currentEdgeId = null;
  };
  
  // Click background to close
  edgeModal.onclick = (e) => {
    if (e.target === edgeModal) {
      edgeModal.style.display = 'none';
      currentEdgeId = null;
    }
  };
  
  // Show/hide custom input based on dropdown selection
  edgeRelSelect.addEventListener('change', () => {
    if (edgeRelSelect.value === '__custom') {
      edgeRelCustom.style.display = 'inline';
      edgeRelCustom.focus();
    } else {
      edgeRelCustom.style.display = 'none';
      // Update edge with standard relationship
      if (currentEdgeId) {
        const edge = edges.get(currentEdgeId);
        const newRel = edgeRelSelect.value;
        edges.update({ id: currentEdgeId, label: newRel });
        queueOp({ type: 'edge_update', from: edge.from, to: edge.to, old_relationship: edge.label, new_relationship: newRel });
        hasUnsaved = true; updateUnsaved();
        showToast('Relationship updated (not yet saved)');
      }
    }
  });
  
  // Handle custom relationship input
  edgeRelCustom.addEventListener('change', () => {
    if (!currentEdgeId || edgeRelSelect.value !== '__custom') return;
    const customRel = edgeRelCustom.value.trim();
    if (!customRel) return;
    
    const edge = edges.get(currentEdgeId);
    edges.update({ id: currentEdgeId, label: customRel });
    queueOp({ type: 'edge_update', from: edge.from, to: edge.to, old_relationship: edge.label, new_relationship: customRel });
    hasUnsaved = true; updateUnsaved();
    showToast('Relationship updated (not yet saved)');
  });
  
  // Delete edge
  deleteEdgeBtn.onclick = () => {
    if (!currentEdgeId) return;
    const edge = edges.get(currentEdgeId);
    
    edges.remove(currentEdgeId);
    queueOp({ type: 'edge_remove', from: edge.from, to: edge.to, relationship: edge.label || 'partnership' });
    hasUnsaved = true; updateUnsaved();
    showToast('Connection deleted (not yet saved)');
    
    edgeModal.style.display = 'none';
    currentEdgeId = null;
  };
  
  // Open modal on click: node or edge
  network.on('click', params => {
    // Only open edge modal if edge clicked WITHOUT node click
    // (prevents edge modal from opening when clicking near node)
    if (params.edges && params.edges.length > 0 && (!params.nodes || params.nodes.length === 0)) {
      const edgeId = params.edges[0];
      openEdgeModal(edgeId);
    } else if (params.nodes && params.nodes.length > 0) {
      const id = params.nodes[0];
      const n = nodes.get(id);
      if (n) {
        openCurationFor(id);
      }
    }
  });
  // Live updates: toggle source visibility
  sourceToggle.addEventListener('change', ()=>{
    if (!currentSourceId) return;
    const shouldHide = !sourceToggle.checked;
    nodes.update({ id: currentSourceId, hidden: shouldHide });
    // Queue operation to persist hidden state
    queueOp({ type: 'update_node', id: currentSourceId, hidden: shouldHide });
    hasUnsaved = true; updateUnsaved();
  });
  
  // URL editing: detect changes
  curUrlInput.addEventListener('change', ()=>{
    if (!currentSourceId) return;
    const newUrl = curUrlInput.value.trim();
    if (newUrl !== originalUrl) {
      // Update node data
      nodes.update({ id: currentSourceId, url: newUrl });
      // Update display link
      if (newUrl) {
        curSrcLink.href = newUrl;
        curUrl.href = newUrl;
        curUrl.textContent = newUrl;
      } else {
        curSrcLink.removeAttribute('href');
        curUrl.removeAttribute('href');
        curUrl.textContent = '';
      }
      // Queue operation to persist URL
      queueOp({ type: 'update_node', id: currentSourceId, url: newUrl });
      hasUnsaved = true; updateUnsaved();
      showToast('URL updated (not yet saved)');
    }
  });
  
  // Type changing: detect radio button changes
  modalTypeRadios.forEach(radio => {
    radio.addEventListener('change', ()=>{
      if (!currentSourceId) return;
      const newType = radio.value;
      const currentNode = nodes.get(currentSourceId);
      
      // Only update if actually different from current state
      if (newType !== currentNode.group) {
        let updates = { id: currentSourceId, group: newType };
        
        // Update shape and color based on type - vis.js needs explicit color object
        if (newType === 'person') {
          updates.shape = 'dot';
          updates.color = {
            background: '#6aa7ff',
            border: '#2f79ff',
            highlight: {background: '#4d8fff', border: '#2f79ff'},
            hover: {background: '#4d8fff', border: '#2f79ff'}
          };
        } else if (newType === 'project') {
          updates.shape = 'triangle';
          updates.color = {
            background: '#ffd97d',
            border: '#f9a826',
            highlight: {background: '#ffc94d', border: '#f9a826'},
            hover: {background: '#ffc94d', border: '#f9a826'}
          };
        } else if (newType === 'organization') {
          updates.shape = 'box';
          updates.color = {
            background: '#a8dadc',
            border: '#457b9d',
            highlight: {background: '#8cc5ca', border: '#457b9d'},
            hover: {background: '#8cc5ca', border: '#457b9d'}
          };
        }
        
        nodes.update(updates);
        
        // Force visual redraw - vis.js needs this for immediate shape/color changes
        network.redraw();
        
        // Queue operation to persist type change
        queueOp({ type: 'update_node', id: currentSourceId, node_type: newType });
        hasUnsaved = true; updateUnsaved();
        showToast(`Type changed to ${newType} (not yet saved)`);
      }
    });
  });
  // Live updates: toggle edges as checkboxes change
  curList.addEventListener('change', (e)=>{
    if (!currentSourceId) return;
    const t = e.target;
    
    // Handle existing connection checkboxes (data-conn-id)
    if (t && t.matches('input[type="checkbox"][data-conn-id]')){
      const connId = t.getAttribute('data-conn-id');
      const relationship = t.getAttribute('data-relationship') || '';
      const src = currentSourceId;
      
      if (!t.checked) {
        // Remove connection - ONLY the edge with this specific relationship
        const allEdges = edges.get().filter(e => e.from === src || e.to === src);
        const toRemove = allEdges.filter(e => {
          const otherId = e.from === src ? e.to : e.from;
          const edgeRel = e.label || e.relationship || '';
          return otherId === connId && edgeRel === relationship;
        });
        
        if (toRemove.length > 0) {
          edges.remove(toRemove.map(e => e.id));
          toRemove.forEach(edge => {
            queueOp({ type:'edge_remove', from: edge.from, to: edge.to, relationship: edge.label || edge.relationship || 'connected' });
          });
          hasUnsaved = true; updateUnsaved();
          refreshConnectionList(); // Refresh modal to show updated state
        }
      } else {
        // Re-checking a removed connection - restore it with the specific relationship
        const targetNode = nodes.get(connId);
        if (targetNode) {
          const exists = edges.get().some(e => 
            ((e.from === src && e.to === connId) || (e.from === connId && e.to === src)) &&
            (e.label || e.relationship || '') === relationship
          );
          if (!exists) {
            edges.add({ from: src, to: connId, label: relationship || 'connected', font:{align:'horizontal'} });
            queueOp({ type:'edge_add', from: src, to: connId, relationship: relationship || 'connected' });
            hasUnsaved = true; updateUnsaved();
            refreshConnectionList(); // Refresh modal to show updated state
          }
        }
      }
    }
    
    // Handle discovered partner checkboxes (data-name) - org-only feature
    if (t && t.matches('input[type="checkbox"][data-name]')){
      const src=currentSourceId; const name=String(t.getAttribute('data-name')); const url=t.getAttribute('data-url')||'';
      const nid='org::'+name;
      if (t.checked){
        if(!nodes.get(nid)) nodes.add({ id:nid, label:name, group:'organization', shape:'box', url:url, color:{background:'#a8dadc', border:'#457b9d'}, value:1});
        const exists=edges.get().some(e=>e.from===src && e.to===nid && (e.label||'')==='partnership');
        if(!exists) {
          edges.add({ from: src, to: nid, label:'partnership', font:{align:'horizontal'} });
          // Queue for batch save
          queueOp({ type:'edge_add', from: src, to: nid, relationship: 'partnership' });
          refreshConnectionList(); // Refresh modal to show updated state
        }
      } else {
        const toRemove = edges.get().filter(e=>e.from===src && e.to===nid && (e.label||'')==='partnership');
        if (toRemove.length) {
          edges.remove(toRemove.map(e=>e.id));
          // Queue for batch save
          queueOp({ type:'edge_remove', from: src, to: nid, relationship: 'partnership' });
          refreshConnectionList(); // Refresh modal to show updated state
        }
      }
      hasUnsaved = true; updateUnsaved();
    }
  });
  // Close: just hide the modal (changes are already queued)
  document.getElementById('closeCuration').onclick = ()=>{
    curModal.style.display='none';
  };
  // Esc closes the modal (no warning needed - changes already queued)
  window.addEventListener('keydown', (e)=>{
    if (e.key === 'Escape' && curModal.style.display==='flex'){
      curModal.style.display='none';
    }
  });
  function showToast(msg){ const t=document.getElementById('toast'); t.textContent=msg; t.style.display='block'; setTimeout(()=>{ t.style.display='none'; }, 2500); }
  // Removed curation Save; global Save Edit will persist staged changes
  const loading = document.getElementById('loading');
  const pctEl = document.getElementById('pct');
  const etaEl = document.getElementById('eta');
  let start = performance.now();
  let lastIter = 0;
  network.on('stabilizationProgress', function(params) {
    const { iterations, total } = params;
    const pct = Math.max(0, Math.min(100, Math.round(iterations/total*100)));
    pctEl.textContent = String(pct);
    // crude ETA based on iteration speed so far
    const now = performance.now();
    const elapsed = (now - start) / 1000;
    const done = Math.max(1, iterations);
    const rate = done / Math.max(0.1, elapsed); // iters/sec
    const remaining = Math.max(0, total - iterations);
    const eta = Math.round(remaining / Math.max(0.1, rate));
    etaEl.textContent = String(eta);
  });
  network.once('stabilizationIterationsDone', function() {
    loading.style.display = 'none';
    // Turn off further stabilization for snappier interaction
    network.setOptions({ physics: { stabilization: false } });
  });
  network.on('doubleClick', function(params) {
    if (params.nodes && params.nodes.length > 0) {
      const id = params.nodes[0];
      const n = nodes.get(id);
      if (n && n.url) {
        window.open(n.url, '_blank');
      }
    }
  });
  // Make the curation modal draggable by the header
  (function(){
    const panel = document.getElementById('curationPanel');
    let drag = false; let sx=0, sy=0, ox=0, oy=0;
    const handle = document.getElementById('curationHandle');
    handle.addEventListener('mousedown', (e)=>{ drag=true; sx=e.clientX; sy=e.clientY; const r=panel.getBoundingClientRect(); ox=r.left; oy=r.top; panel.style.position='fixed'; e.preventDefault(); });
    window.addEventListener('mousemove', (e)=>{ if(!drag) return; const dx=e.clientX-sx; const dy=e.clientY-sy; panel.style.left=(ox+dx)+"px"; panel.style.top=(oy+dy)+"px"; });
    window.addEventListener('mouseup', ()=>{ drag=false; });
  })();

  // Quick Editor (Phase 2)
  (function(){
    const qeFrom = document.getElementById('qeFrom');
    const qeTo = document.getElementById('qeTo');
    const qeRel = document.getElementById('qeRel');
    const qeRelCustom = document.getElementById('qeRelCustom');
    const qeAdd = document.getElementById('qeAdd');
    const qeRemove = document.getElementById('qeRemove');
    const qeSave = document.getElementById('qeSave');
    const qeSaveTop = document.getElementById('qeSaveTop');
    const unsavedBadge = document.getElementById('unsavedBadge');
    const qeUndo = document.getElementById('qeUndo');
    const nodeList = document.getElementById('nodeList');
    const fromTypeRadios = [...document.querySelectorAll('input[name="fromType"]')];
    const toTypeRadios = [...document.querySelectorAll('input[name="toType"]')];
    // populate datalist
    function refreshNodeList(){
      nodeList.innerHTML = '';
      nodes.get().forEach(n=>{
        const opt = document.createElement('option');
        opt.value = n.label;
        nodeList.appendChild(opt);
      });
    }
    refreshNodeList();
    nodes.on('add', refreshNodeList);
    nodes.on('update', refreshNodeList);

    qeRel.addEventListener('change', ()=>{
      if (qeRel.value === '__custom') {
        qeRelCustom.style.display = '';
        qeRelCustom.focus();
      } else {
        qeRelCustom.style.display = 'none';
      }
    });

    function resolveNodeId(label, referenceNodeId){
      // find by label, else create node with type from radios
      const all = nodes.get();
      const found = all.find(n=>String(n.label).trim() === String(label).trim());
      if (found) return found.id;
      // determine type from radios
      const fromSel = fromTypeRadios.find(r=>r.checked)?.value || 'organization';
      const map = { person:'person::', project:'project::', organization:'org::' };
      const pref = map[fromSel] || 'org::';
      const nid = pref + String(label).trim();
      if (!nodes.get(nid)){
        const group = (fromSel==='person') ? 'person' : (fromSel==='project' ? 'project' : 'organization');
        const visuals = getNodeVisuals(group);
        // Position new node near reference node (if provided) to prevent racing offscreen
        let x = Math.random() * 200 - 100;
        let y = Math.random() * 200 - 100;
        if(referenceNodeId){
          const refPos = network.getPositions([referenceNodeId])[referenceNodeId];
          if(refPos){
            x = refPos.x + (Math.random() * 200 - 100);
            y = refPos.y + (Math.random() * 200 - 100);
          }
        }
        nodes.add({ id:nid, label:String(label).trim(), group:group, shape:visuals.shape, origin:origin, color:visuals.color, value:1, x:x, y:y });
      }
      return nid;
    }

    function resolveToNodeId(label, referenceNodeId){
      const all = nodes.get();
      const found = all.find(n=>String(n.label).trim() === String(label).trim());
      if (found) return found.id;
      const toSel = toTypeRadios.find(r=>r.checked)?.value || 'organization';
      const map = { person:'person::', project:'project::', organization:'org::' };
      const pref = map[toSel] || 'org::';
      const nid = pref + String(label).trim();
      if (!nodes.get(nid)){
        const group = (toSel==='person') ? 'person' : (toSel==='project' ? 'project' : 'organization');
        const visuals = getNodeVisuals(group);
        // Position new node near reference node (if provided) to prevent racing offscreen
        let x = Math.random() * 200 - 100;
        let y = Math.random() * 200 - 100;
        if(referenceNodeId){
          const refPos = network.getPositions([referenceNodeId])[referenceNodeId];
          if(refPos){
            x = refPos.x + (Math.random() * 200 - 100);
            y = refPos.y + (Math.random() * 200 - 100);
          }
        }
        nodes.add({ id:nid, label:String(label).trim(), group:group, shape:visuals.shape, origin:origin, color:visuals.color, value:1, x:x, y:y });
      }
      return nid;
    }

    function setTypeRadiosFromId(id, isFrom){
      const val = id.startsWith('person::') ? 'person' : (id.startsWith('project::') ? 'project' : 'organization');
      const radios = isFrom ? fromTypeRadios : toTypeRadios;
      radios.forEach(r=>{ r.checked = (r.value===val); });
    }

    // Quick Editor functions
    function doAdd(){
      const fromLabel = qeFrom.value.trim();
      const toLabel = qeTo.value.trim();
      if(!fromLabel || !toLabel) { alert('Enter From and To labels'); return; }
      let rel = qeRel.value === '__custom' ? qeRelCustom.value.trim() : qeRel.value;
      if (qeRel.value === '__none') { return doRemove(); }
      if (!rel){ alert('Choose a relationship'); return; }
      if (qeRel.value === '__custom'){
        if (!confirm(`Create new relationship "${rel}"?`)) return;
        // add to select for session
        const opt = document.createElement('option'); opt.value = rel; opt.textContent = rel; qeRel.insertBefore(opt, qeRel.lastElementChild);
        qeRel.value = rel; qeRelCustom.style.display='none';
      }
      const createdNodes = [];
      // Check if nodes exist before creating (to pass as reference for positioning)
      const fromExists = nodes.get().find(n=>String(n.label).trim() === fromLabel);
      const toExists = nodes.get().find(n=>String(n.label).trim() === toLabel);
      // Create nodes, passing existing node as reference for positioning
      const fromId = resolveNodeId(fromLabel, toExists?.id); if (!fromExists) createdNodes.push(fromId);
      const toId = resolveToNodeId(toLabel, fromId); if (!toExists) createdNodes.push(toId);
      
      // Unhide both nodes when creating an edge (connecting a hidden node should make it visible)
      const fromNode = nodes.get(fromId);
      const toNode = nodes.get(toId);
      if (fromNode && fromNode.hidden) {
        nodes.update({id: fromId, hidden: false});
        queueOp({ type: 'update_node', id: fromId, hidden: false });
      }
      if (toNode && toNode.hidden) {
        nodes.update({id: toId, hidden: false});
        queueOp({ type: 'update_node', id: toId, hidden: false });
      }
      
      // Add the new edge (check if this SPECIFIC edge exists with this EXACT relationship)
      const exists = edges.get().find(e=>
        ((e.from===fromId && e.to===toId) || (e.from===toId && e.to===fromId)) && 
        (e.label||'')===rel
      );
      if (!exists){ edges.add({ from: fromId, to: toId, label: rel, font:{align:'horizontal'} }); }
      lastAction = { type:'add', edge:{from:fromId, to:toId, label:rel}, createdNodes };
      queueOp({ type:'edge_add', from: fromId, to: toId, relationship: rel });
      
      // Focus on the connection (both nodes)
      setTimeout(() => {
        network.fit({nodes: [fromId, toId], animation: {duration: 500}});
      }, 150);
      
      // Auto-open modal removed per user request
      // User can manually click node to open modal if needed
      
      showToast('Edge added (not yet saved)');
    }

    function doRemove(){
      const fromLabel = qeFrom.value.trim();
      const toLabel = qeTo.value.trim();
      if(!fromLabel || !toLabel) { alert('Enter From and To labels'); return; }
      let rel = qeRel.value === '__custom' ? qeRelCustom.value.trim() : qeRel.value;
      if (qeRel.value === '__none') rel = rel || 'partnership';
      if (!rel){ alert('Choose a relationship'); return; }
      const fromId = resolveNodeId(fromLabel);
      const toId = resolveToNodeId(toLabel);
      const toRemove = edges.get().filter(e=>e.from===fromId && e.to===toId && (e.label||'')===rel);
      if (toRemove.length){ edges.remove(toRemove.map(e=>e.id)); lastAction = { type:'remove', edge:{from:fromId, to:toId, label:rel} }; queueOp({ type:'edge_remove', from: fromId, to: toId, relationship: rel }); showToast('Edge removed (not yet saved)'); }
      else { alert('No such edge found'); }
    }

    async function doSave(){
      // In static mode, save entire graph to Sheets
      try{
        console.log('[doSave] Saving to Google Sheets...');
        if (typeof saveDataToSheets === 'function') {
          await saveDataToSheets();
          lastAction = null;
          pendingOps.length = 0;  // Clear array without breaking reference
          hasUnsaved = false; 
          updateUnsaved();
        } else {
          showToast('⚠️ Sheets API not initialized');
        }
      }catch(e){ 
        console.error('[doSave] ERROR:', e); 
        showToast('Save failed: ' + e.message); 
      }
    }

    function doUndo(){
      if (!lastAction) { showToast('Nothing to undo'); return; }
      const a = lastAction;
      if (a.type==='add'){
        const toRemove = edges.get().filter(e=>e.from===a.edge.from && e.to===a.edge.to && (e.label||'')===a.edge.label);
        if (toRemove.length) edges.remove(toRemove.map(e=>e.id));
        // also remove matching pending op if it is the last one
        const last = pendingOps[pendingOps.length-1];
        if (last && last.type==='edge_add' && last.from===a.edge.from && last.to===a.edge.to && last.relationship===a.edge.label){ pendingOps.pop(); }
      } else if (a.type==='remove'){
        const exists = edges.get().find(e=>e.from===a.edge.from && e.to===a.edge.to && (e.label||'')===a.edge.label);
        if (!exists) edges.add({ from:a.edge.from, to:a.edge.to, label:a.edge.label, font:{align:'horizontal'} });
        const last = pendingOps[pendingOps.length-1];
        if (last && last.type==='edge_remove' && last.from===a.edge.from && last.to===a.edge.to && last.relationship===a.edge.label){ pendingOps.pop(); }
      }
      lastAction = null;
      hasUnsaved = false; updateUnsaved();
      showToast('Undone');
    }

    // When type radios change and the input matches an existing node, update live and stage update_node
    function updateNodeTypeFromInput(inputEl, radios, which){
      const label = (inputEl.value||'').trim(); if(!label) return;
      const all = nodes.get();
      const n = all.find(nn=>String(nn.label).trim()===label);
      if (!n) return; // creation path handled elsewhere
      const val = (radios.find(r=>r.checked)?.value)||'organization';
      const newType = (val==='person')?'person':(val==='project'?'project':'organization');
      // Only stage if type actually changes
      if ((n.group==='person' && newType==='person') || (n.group==='organization' && newType!=='person' && newType!=='project' && newType==='organization')) {
        // no-op check for org default, but allow project explicitly
      }
      // Update visualization immediately
      const shape = newType==='person' ? 'dot' : (newType==='project' ? 'triangle' : 'box');
      nodes.update({ id: n.id, group: (newType==='organization'?'organization':newType), shape: shape });
      // Stage persistence
      queueOp({ type:'update_node', id: n.id, node_type: newType });
      showToast('Node type updated (not yet saved)');
    }

    fromTypeRadios.forEach(r=>{ r.addEventListener('change', ()=> updateNodeTypeFromInput(qeFrom, fromTypeRadios, 'from')); });
    toTypeRadios.forEach(r=>{ r.addEventListener('change', ()=> updateNodeTypeFromInput(qeTo, toTypeRadios, 'to')); });

    // Auto-set type radios when selecting from autocomplete or typing existing node name
    function autoSetFromType(){
      const all=nodes.get(); 
      const f=all.find(n=>String(n.label).trim()===qeFrom.value.trim()); 
      if(f) setTypeRadiosFromId(f.id,true);
    }
    function autoSetToType(){
      const all=nodes.get(); 
      const f=all.find(n=>String(n.label).trim()===qeTo.value.trim()); 
      if(f) setTypeRadiosFromId(f.id,false);
    }
    
    // Trigger on blur (when leaving field) and on input (when selecting from datalist)
    qeFrom.addEventListener('blur', autoSetFromType);
    qeFrom.addEventListener('input', autoSetFromType);
    qeTo.addEventListener('blur', autoSetToType);
    qeTo.addEventListener('input', autoSetToType);

    qeAdd.onclick = doAdd;
    qeRemove.onclick = doRemove;
    qeSaveTop.onclick = doSave;
    qeUndo.onclick = doUndo;
    // Expose for testing
    window.doSave = doSave;

    // Quick Editor Search Filtering: progressively narrow visible nodes as user types
    // Build adjacency list once for performance
    let adjacencyList = null;
    function buildAdjacencyList(){
      adjacencyList = {};
      edges.get().forEach(e => {
        if(!adjacencyList[e.from]) adjacencyList[e.from] = [];
        if(!adjacencyList[e.to]) adjacencyList[e.to] = [];
        adjacencyList[e.from].push(e.to);
        adjacencyList[e.to].push(e.from);
      });
    }
    buildAdjacencyList();
    edges.on('add', buildAdjacencyList);
    edges.on('remove', buildAdjacencyList);

    function getConnectedComponent(startNodeIds){
      // Fast BFS using pre-built adjacency list
      const visited = new Set();
      const queue = [...startNodeIds];
      
      while(queue.length > 0){
        const nodeId = queue.shift();
        if(visited.has(nodeId)) continue;
        visited.add(nodeId);
        
        const neighbors = adjacencyList[nodeId];
        if(neighbors){
          neighbors.forEach(neighbor => {
            if(!visited.has(neighbor)){
              queue.push(neighbor);
            }
          });
        }
      }
      return visited;
    }

    function applyQESearchFilter(){
      const fromQuery = qeFrom.value.trim().toLowerCase();
      const toQuery = qeTo.value.trim().toLowerCase();
      
      // If both empty, clear all filters
      if(!fromQuery && !toQuery){
        const allNodes = nodes.get();
        allNodes.forEach(n => {
          const updates = {id: n.id, physics: true, fixed: false};
          if(n.originalColor){
            updates.color = n.originalColor;
            updates.opacity = 1;
          }
          nodes.update(updates);
        });
        return;
      }
      
      const allNodes = nodes.get();
      let fromComponent = new Set();
      let toComponent = new Set();
      
      // Find nodes matching From query
      if(fromQuery){
        const fromMatches = allNodes.filter(n => 
          String(n.label).toLowerCase().includes(fromQuery)
        ).map(n => n.id);
        if(fromMatches.length > 0){
          fromComponent = getConnectedComponent(fromMatches);
        }
      }
      
      // Find nodes matching To query
      if(toQuery){
        const toMatches = allNodes.filter(n => 
          String(n.label).toLowerCase().includes(toQuery)
        ).map(n => n.id);
        if(toMatches.length > 0){
          toComponent = getConnectedComponent(toMatches);
        }
      }
      
      // Combine the sets: union (show both components)
      let visibleSet = new Set();
      if(fromQuery){
        fromComponent.forEach(id => visibleSet.add(id));
      }
      if(toQuery){
        toComponent.forEach(id => visibleSet.add(id));
      }
      
      // Batch update for performance - collect all updates first
      const updates = [];
      allNodes.forEach(n => {
        // Store original color on first filter
        if(!n.originalColor && n.color){
          n.originalColor = JSON.parse(JSON.stringify(n.color));
        }
        
        if(visibleSet.has(n.id)){
          // Visible: restore original appearance
          const update = {
            id: n.id,
            physics: true,
            fixed: false,
            opacity: 1
          };
          if(n.originalColor){
            update.color = n.originalColor;
          }
          updates.push(update);
        } else {
          // Ghost: grayed out, no physics, non-interactive
          updates.push({
            id: n.id,
            color: {
              background: 'rgba(200,200,200,0.2)',
              border: 'rgba(150,150,150,0.3)'
            },
            opacity: 0.2,
            physics: false,
            fixed: {x: true, y: true}
          });
        }
      });
      
      // Single batch update instead of many individual updates
      nodes.update(updates);
      
      // Auto-zoom to visible nodes
      if(visibleSet.size > 0){
        network.fit({
          nodes: [...visibleSet],
          animation: {duration: 300, easingFunction: 'easeInOutQuad'}
        });
      }
    }

    // Add debounced input listeners for live filtering (prevent browser lockup)
    let filterTimeout = null;
    function debouncedFilter(){
      if(filterTimeout) clearTimeout(filterTimeout);
      filterTimeout = setTimeout(applyQESearchFilter, 500); // 500ms delay for smoother typing
    }
    qeFrom.addEventListener('input', debouncedFilter);
    qeTo.addEventListener('input', debouncedFilter);

    // Filters
    const fltA = document.getElementById('fltA');
    const fltB = document.getElementById('fltB');
    const applyFiltersBtn = document.getElementById('applyFilters');
    const clearFiltersBtn = document.getElementById('clearFilters');
    function applyFilters(){
      const a=(fltA.value||'').trim().toLowerCase();
      const b=(fltB.value||'').trim().toLowerCase();
      const updates=[];
      nodes.get().forEach(n=>{
        const label=(String(n.label||'').toLowerCase());
        const match = (!a && !b) || (a && label.includes(a)) || (b && label.includes(b));
        updates.push({ id:n.id, hidden: !match });
      });
      nodes.update(updates);
      // Hide edges not fully visible
      const eUpd=[];
      edges.get().forEach(e=>{
        const f=nodes.get(e.from), t=nodes.get(e.to);
        const vis = f && t && !f.hidden && !t.hidden;
        eUpd.push({ id:e.id, hidden: !vis });
      });
      edges.update(eUpd);
    }
    function clearFilters(){ fltA.value=''; fltB.value=''; applyFilters(); }
    if (applyFiltersBtn) applyFiltersBtn.onclick = applyFilters;
    if (clearFiltersBtn) clearFiltersBtn.onclick = clearFilters;
  })();

  // Page-unload warning for unsaved changes
  window.addEventListener('beforeunload', function(e) {
    if(window.hasUnsaved && window.pendingOps && window.pendingOps.length > 0){
      // Prevent the page from closing
      e.preventDefault();
      // Chrome requires returnValue to be set
      e.returnValue = 'unsaved';
      // Return value triggers the dialog
      return 'unsaved';
    }
  });

  // Re-Load data from server (reads from Sheet or CSV)
  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) {
    console.log('[Re-Load] Attaching onclick handler to re-load button');
    refreshBtn.onclick = async function() {
      // Guardrail: Check for unsaved changes
      if (hasUnsaved && pendingOps.length > 0) {
        const proceed = confirm(
          `You have ${pendingOps.length} unsaved change(s).\n\n` +
          `Re-Loading will discard these changes.\n\n` +
          `Do you want to save first?\n\n` +
          `• Click "OK" to SAVE and then re-load\n` +
          `• Click "Cancel" to re-load WITHOUT saving (changes will be lost)`
        );
        
        if (proceed) {
          // User wants to save first
          showToast('Please save your changes, then re-load');
          return;
        }
        // User chose to discard changes - continue with re-load
      }
      
      refreshBtn.disabled = true;
      refreshBtn.textContent = '↻ Re-Loading...';
      
      try {
        // Call Sheets API function (defined in index.html)
        if (typeof loadDataFromSheets === 'function') {
          await loadDataFromSheets();
          
          // Clear unsaved state since we reloaded from source
          pendingOps.length = 0;
          hasUnsaved = false;
          updateUnsaved();
          
          // Fit graph to show all nodes after re-load
          if (window.network) {
            setTimeout(() => {
              window.network.fit({ animation: { duration: 1000 } });
              console.log('🎯 Graph fitted after re-load');
            }, 500);
          }
        } else {
          showToast('⚠️ Sheets API not initialized');
        }
      } catch (err) {
        console.error('Re-Load error:', err);
        showToast('Re-Load failed: ' + err.message);
      } finally {
        refreshBtn.disabled = false;
        refreshBtn.textContent = '↻ Re-Load';
      }
    };
  }
