import { SocialNetwork }   from './SocialNetwork.js';
import { CustomDropdown }  from './CustomDropdown.js';

const sn = new SocialNetwork();
let simulation, svg, linkGroup, nodeGroup, zoom;

// ─── DOM refs ─────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const userList     = $('user-list');
const resultsPanel = $('results-panel');
const historyList  = $('history-list');
const emptyState   = $('empty-state');
const algoBadge    = $('algo-badge');
const matrixView   = $('matrix-view');

// ─── Custom Dropdowns ─────────────────────────────────────────────────────────
const DD = {
  friendU:    new CustomDropdown('sel-friend-u'),
  friendV:    new CustomDropdown('sel-friend-v'),
  showFriend: new CustomDropdown('sel-show-friends'),
  pathSrc:    new CustomDropdown('sel-path-src'),
  pathDst:    new CustomDropdown('sel-path-dst'),
  mutA:       new CustomDropdown('sel-mut-a'),
  mutB:       new CustomDropdown('sel-mut-b'),
  recUser:    new CustomDropdown('sel-rec-user'),
  traversal:  new CustomDropdown('sel-traverse-user'),
};

// ─── Toast ────────────────────────────────────────────────────────────────────
function toast(msg, type = 'info') {
  const el = $('toast');
  el.textContent = msg;
  el.className = `show ${type}`;
  clearTimeout(el._t);
  el._t = setTimeout(() => (el.className = ''), 2600);
}

// ─── Tab switching ────────────────────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    $('tab-' + btn.dataset.tab).classList.add('active');
  });
});

// ─── Build dropdown options from graph ────────────────────────────────────────
function buildOptions() {
  return sn.getUsers().map(name => {
    const meta = sn.graph.nodeData.get(name);
    return {
      value:  name,
      label:  name,
      color:  meta?.color || '#6C63FF',
      degree: sn.graph.getDegree(name),
    };
  });
}

function refreshDropdowns() {
  const opts = buildOptions();
  Object.values(DD).forEach(dd => dd.setOptions(opts));
}

// ─── User list panel ──────────────────────────────────────────────────────────
function refreshUserList() {
  userList.innerHTML = '';
  sn.getUsers().forEach(name => {
    const meta = sn.graph.nodeData.get(name);
    const deg  = sn.graph.getDegree(name);
    const chip = document.createElement('div');
    chip.className = 'user-chip';
    chip.dataset.name = name;
    chip.innerHTML = `
      <div class="user-avatar" style="background:${meta.color}">${meta.avatar}</div>
      <span class="user-name">${name}</span>
      <span class="user-degree">${deg}🔗</span>
      <button class="chip-remove" title="Remove user">✕</button>`;
    chip.querySelector('.chip-remove').addEventListener('click', e => {
      e.stopPropagation();
      sn.removeUser(name);
      refresh();
      toast(`Removed "${name}"`, 'info');
    });
    chip.addEventListener('click', () => highlightNode(name));
    userList.appendChild(chip);
  });
}

// ─── Header & stats ───────────────────────────────────────────────────────────
function refreshStats() {
  const V    = sn.graph.getUserCount();
  const E    = sn.graph.getEdgeCount();
  const dens = (sn.networkDensity() * 100).toFixed(1);
  const comm = sn.detectCommunities().length;
  $('hdr-users').textContent   = V;
  $('hdr-edges').textContent   = E;
  $('hdr-comm').textContent    = comm;
  $('hdr-density').textContent = dens + '%';
  $('stat-v').textContent = V;
  $('stat-e').textContent = E;
  $('stat-c').textContent = comm;
  $('stat-d').textContent = dens + '%';
  emptyState.style.display = V === 0 ? 'flex' : 'none';
}

// ─── History log ──────────────────────────────────────────────────────────────
function refreshHistory() {
  historyList.innerHTML = '';
  sn.getHistory().forEach(({ msg, time }) => {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.innerHTML = `<span class="history-time">${time}</span><span class="history-msg">${msg}</span>`;
    historyList.appendChild(div);
  });
}

// ─── Full refresh ─────────────────────────────────────────────────────────────
function refresh() {
  refreshUserList();
  refreshDropdowns();
  refreshStats();
  refreshHistory();
  renderGraph();
  updateMatrix();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  D3 Graph
// ═══════════════════════════════════════════════════════════════════════════════
function initGraph() {
  const svgEl = $('graph-svg');
  svg = d3.select(svgEl);
  svg.selectAll('*').remove();

  zoom = d3.zoom().scaleExtent([0.2, 4]).on('zoom', e => g.attr('transform', e.transform));
  svg.call(zoom);

  const g = svg.append('g').attr('id', 'graph-root');
  linkGroup = g.append('g').attr('class', 'links');
  nodeGroup = g.append('g').attr('class', 'nodes');

  const W = svgEl.clientWidth  || 700;
  const H = svgEl.clientHeight || 500;

  simulation = d3.forceSimulation()
    .force('link',      d3.forceLink().id(d => d.id).distance(110))
    .force('charge',    d3.forceManyBody().strength(-320))
    .force('center',    d3.forceCenter(W / 2, H / 2))
    .force('collision', d3.forceCollide(36));
}

function renderGraph() {
  if (!simulation) initGraph();
  const { nodes, links } = sn.toD3Format();

  // Links
  const link = linkGroup.selectAll('.link')
    .data(links, d => `${d.source.id || d.source}--${d.target.id || d.target}`);
  link.enter().append('line').attr('class', 'link').merge(link);
  link.exit().remove();

  // Nodes
  const node = nodeGroup.selectAll('.node').data(nodes, d => d.id);
  const nodeEnter = node.enter().append('g').attr('class', 'node')
    .call(d3.drag()
      .on('start', (e, d) => { if (!e.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
      .on('drag',  (e, d) => { d.fx = e.x; d.fy = e.y; })
      .on('end',   (e, d) => { if (!e.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; }));

  nodeEnter.append('circle').attr('r', 16)
    .attr('fill',   d => d.color + '33')
    .attr('stroke', d => d.color);
  nodeEnter.append('text').attr('class', 'label-inner').attr('dy', '0.35em');
  nodeEnter.append('text').attr('class', 'label-outer').attr('dy', 30);

  const nodeMerged = nodeEnter.merge(node);
  nodeMerged.select('.label-inner').text(d => d.avatar || d.id.charAt(0));
  nodeMerged.select('.label-outer').text(d => d.id);
  nodeMerged.select('circle').attr('stroke', d => d.color);
  node.exit().remove();

  // Tooltip
  nodeMerged
    .on('mousemove', (e, d) => {
      const cc = sn.clusteringCoefficient(d.id).toFixed(2);
      $('tt-name').textContent   = d.id;
      $('tt-degree').textContent = d.degree;
      $('tt-cc').textContent     = cc;
      const tip = $('tooltip');
      tip.classList.add('visible');
      tip.style.left = (e.clientX + 12) + 'px';
      tip.style.top  = (e.clientY - 30) + 'px';
    })
    .on('mouseleave', () => $('tooltip').classList.remove('visible'));

  simulation.nodes(nodes).on('tick', () => {
    linkGroup.selectAll('.link')
      .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
    nodeGroup.selectAll('.node')
      .attr('transform', d => `translate(${d.x},${d.y})`);
  });
  simulation.force('link').links(links);
  simulation.alpha(0.5).restart();
}

// ─── Highlight helpers ────────────────────────────────────────────────────────
function clearHighlights() {
  nodeGroup?.selectAll('.node').classed('highlighted path-node', false)
    .select('circle').attr('r', 16);
  linkGroup?.selectAll('.link').classed('highlighted path-edge', false);
  algoBadge.classList.remove('visible');
  $('graph-legend').innerHTML = '';
}

function highlightNode(name) {
  clearHighlights();
  const friends = sn.getFriends(name);
  nodeGroup.selectAll('.node').filter(d => d.id === name).classed('highlighted', true)
    .select('circle').attr('r', 22);
  nodeGroup.selectAll('.node').filter(d => friends.includes(d.id)).classed('highlighted', true);
  linkGroup.selectAll('.link').classed('highlighted', d => {
    const s = d.source.id || d.source, t = d.target.id || d.target;
    return s === name || t === name;
  });
}

function highlightPath(path) {
  clearHighlights();
  if (!path?.length) return;
  const pathSet = new Set(path);
  nodeGroup.selectAll('.node').filter(d => pathSet.has(d.id)).classed('path-node', true)
    .select('circle').attr('r', 20);
  linkGroup.selectAll('.link').classed('path-edge', d => {
    const s = d.source.id || d.source, t = d.target.id || d.target;
    for (let i = 0; i < path.length - 1; i++) {
      if ((s === path[i] && t === path[i+1]) || (t === path[i] && s === path[i+1])) return true;
    }
    return false;
  });
}

function highlightCommunities(communities) {
  clearHighlights();
  const colors = ['#6C63FF','#43E97B','#FA709A','#38F9D7','#FEE140','#4facfe'];
  const legend = $('graph-legend');
  legend.innerHTML = '';
  communities.forEach((comm, i) => {
    const color = colors[i % colors.length];
    const set = new Set(comm);
    nodeGroup.selectAll('.node').filter(d => set.has(d.id))
      .classed(`community-${i % 4}`, true)
      .select('circle').attr('stroke', color);
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `<div class="legend-dot" style="background:${color}"></div> Community ${i+1} (${comm.length})`;
    legend.appendChild(item);
  });
}

// ─── Result card builder ──────────────────────────────────────────────────────
function addResult(html, accent = false) {
  const card = document.createElement('div');
  card.className = 'result-card' + (accent ? ' accent-border' : '');
  card.innerHTML = html;
  resultsPanel.insertBefore(card, resultsPanel.children[1] || null);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  EVENT HANDLERS
// ═══════════════════════════════════════════════════════════════════════════════

// Add user
$('btn-add-user').addEventListener('click', () => {
  const name = $('input-username').value.trim();
  if (!name) return toast('Enter a username', 'error');
  if (sn.addUser(name)) { refresh(); toast(`Added "${name}"`, 'success'); $('input-username').value = ''; }
  else toast(`"${name}" already exists`, 'error');
});
$('input-username').addEventListener('keydown', e => { if (e.key === 'Enter') $('btn-add-user').click(); });

// Add / remove friendship
$('btn-add-friend').addEventListener('click', () => {
  const u = DD.friendU.getValue(), v = DD.friendV.getValue();
  if (!u || !v)  return toast('Select two users', 'error');
  if (u === v)   return toast('Cannot connect a user to themselves', 'error');
  if (sn.addFriend(u, v)) { refresh(); toast(`Connected ${u} ↔ ${v}`, 'success'); }
  else toast('Already connected', 'error');
});
$('btn-rem-friend').addEventListener('click', () => {
  const u = DD.friendU.getValue(), v = DD.friendV.getValue();
  if (!u || !v) return toast('Select two users', 'error');
  if (sn.removeFriend(u, v)) { refresh(); toast(`Disconnected ${u} ↔ ${v}`, 'info'); }
  else toast('No connection found', 'error');
});

// Show friends
$('btn-show-friends').addEventListener('click', () => {
  const user = DD.showFriend.getValue();
  if (!user) return toast('Select a user', 'error');
  const friends = sn.getFriends(user);
  highlightNode(user);
  addResult(`
    <div class="result-title">Friends of ${user}</div>
    <div class="mutual-list">
      ${friends.length
        ? friends.map(f => `<span class="mutual-chip">${f}</span>`).join('')
        : '<span style="color:var(--text-muted);font-size:12px">No friends yet</span>'}
    </div>`, true);
  toast(`${user} has ${friends.length} friend(s)`, 'info');
});

// BFS shortest path
$('btn-bfs-path').addEventListener('click', () => {
  const src = DD.pathSrc.getValue(), dst = DD.pathDst.getValue();
  if (!src || !dst) return toast('Select source & destination', 'error');
  const { path, distance } = sn.shortestPath(src, dst);
  algoBadge.textContent = 'BFS — Shortest Path  O(V+E)';
  algoBadge.classList.add('visible');
  if (!path.length) {
    toast(`No path between ${src} and ${dst}`, 'error');
    addResult(`<div class="result-title">BFS Shortest Path</div><div style="color:var(--danger);font-size:12px">No connection between ${src} and ${dst}</div>`);
    return;
  }
  highlightPath(path);
  const steps = path.map((n, i) => i < path.length - 1
    ? `<div class="path-step"><span class="path-node-chip">${n}</span><span class="path-arrow">→</span></div>`
    : `<div class="path-step"><span class="path-node-chip">${n}</span></div>`).join('');
  addResult(`<div class="result-title">BFS Shortest Path — ${distance} hop(s)</div><div class="path-steps">${steps}</div>`, true);
  toast(`Path found: ${distance} degree(s) of separation`, 'success');
});

// Mutual friends
$('btn-mutual').addEventListener('click', () => {
  const a = DD.mutA.getValue(), b = DD.mutB.getValue();
  if (!a || !b) return toast('Select two users', 'error');
  const mutuals = sn.mutualFriends(a, b);
  addResult(`
    <div class="result-title">Mutual Friends — ${a} & ${b}</div>
    <div class="mutual-list">
      ${mutuals.length
        ? mutuals.map(m => `<span class="mutual-chip">${m}</span>`).join('')
        : '<span style="color:var(--text-muted);font-size:12px">No mutual friends</span>'}
    </div>`, true);
  toast(`${mutuals.length} mutual friend(s) found`, 'success');
});

// Recommendations
$('btn-recommend').addEventListener('click', () => {
  const user = DD.recUser.getValue();
  if (!user) return toast('Select a user', 'error');
  const recs = sn.recommendFriends(user, 6);
  const rows = recs.map(r => {
    const meta = sn.graph.nodeData.get(r.name);
    return `<div class="recommend-item">
      <div class="rec-avatar" style="background:${meta?.color || '#6C63FF'}">${r.name.charAt(0)}</div>
      <div class="rec-info">
        <div class="rec-name">${r.name}</div>
        <div class="rec-mutual">${r.mutuals.join(', ')}</div>
      </div>
      <span class="rec-score">${r.mutualCount} common</span>
    </div>`;
  }).join('');
  addResult(`
    <div class="result-title">Recommendations for ${user}</div>
    ${recs.length ? rows : '<div style="color:var(--text-muted);font-size:12px">No suggestions available</div>'}`, true);
  toast(`${recs.length} recommendation(s) for ${user}`, 'success');
});

// BFS Traversal
$('btn-bfs-traverse').addEventListener('click', () => {
  const user = DD.traversal.getValue();
  if (!user) return toast('Select a start node', 'error');
  const { levels, order } = sn.bfsTraverse(user);
  algoBadge.textContent = 'BFS Traversal  O(V+E)';
  algoBadge.classList.add('visible');
  const levelHtml = levels.map((lvl, i) =>
    `<div style="margin-bottom:4px"><span style="color:var(--text-muted);font-size:10px">L${i}:</span> ${lvl.map(n => `<span class="path-node-chip">${n}</span>`).join(' ')}</div>`
  ).join('');
  addResult(`<div class="result-title">BFS from ${user} — ${order.length} node(s)</div>${levelHtml}`, true);
  const visited = new Set(order);
  nodeGroup.selectAll('.node').classed('highlighted', d => visited.has(d.id));
  toast(`BFS visited ${order.length} node(s)`, 'info');
});

// DFS Traversal
$('btn-dfs-traverse').addEventListener('click', () => {
  const user = DD.traversal.getValue();
  if (!user) return toast('Select a start node', 'error');
  const { order } = sn.dfsTraverse(user);
  algoBadge.textContent = 'DFS Traversal  O(V+E)';
  algoBadge.classList.add('visible');
  addResult(`
    <div class="result-title">DFS from ${user}</div>
    <div class="mutual-list">${order.map(n => `<span class="path-node-chip">${n}</span>`).join('')}</div>`, true);
  const visited = new Set(order);
  nodeGroup.selectAll('.node').classed('highlighted', d => visited.has(d.id));
  toast(`DFS visited ${order.length} node(s)`, 'info');
});

// Community detection
$('btn-communities').addEventListener('click', () => {
  const communities = sn.detectCommunities();
  highlightCommunities(communities);
  algoBadge.textContent = 'DFS — Community Detection';
  algoBadge.classList.add('visible');
  const colors = ['#6C63FF','#43E97B','#FA709A','#38F9D7','#FEE140','#4facfe'];
  const rows = communities.map((comm, i) => `
    <div class="community-item">
      <div class="community-color" style="background:${colors[i % colors.length]}"></div>
      <div><div style="font-size:12px;font-weight:600;margin-bottom:2px">Community ${i+1}</div>
      <div class="community-members">${comm.join(', ')}</div></div>
    </div>`).join('');
  addResult(`<div class="result-title">${communities.length} Communit${communities.length === 1 ? 'y' : 'ies'} Detected</div>${rows}`, true);
  toast(`Found ${communities.length} communit${communities.length === 1 ? 'y' : 'ies'}`, 'success');
});

// Influencers
$('btn-influencers').addEventListener('click', () => {
  const top = sn.topInfluencers(8);
  const max = top[0]?.degree || 1;
  const rows = top.map(({ name, degree }) => {
    const pct = Math.round((degree / max) * 100);
    return `<div class="influencer-item">
      <span class="inf-name">${name}</span>
      <div class="inf-bar-wrap"><div class="inf-bar" style="width:${pct}%"></div></div>
      <span class="inf-count">${degree}</span>
    </div>`;
  }).join('');
  addResult(`<div class="result-title">Top Influencers (Degree Centrality)</div>${rows}`, true);
  toast('Influencer ranking computed', 'info');
});

// Demo / Reset
function loadDemo() { sn.loadDemoData(); refresh(); toast('Demo network loaded!', 'success'); }
$('btn-demo').addEventListener('click', loadDemo);
$('btn-demo-center').addEventListener('click', loadDemo);

$('btn-reset').addEventListener('click', () => {
  sn.graph.adjList.clear();
  sn.graph.nodeData.clear();
  sn._history = [];
  refresh();
  clearHighlights();
  // Reset results panel
  resultsPanel.innerHTML = `
    <div class="result-card">
      <div class="result-title">Network Overview</div>
      <div class="stats-grid">
        <div class="stat-box"><div class="stat-box-val" id="stat-v">0</div><div class="stat-box-label">Vertices</div></div>
        <div class="stat-box"><div class="stat-box-val" id="stat-e">0</div><div class="stat-box-label">Edges</div></div>
        <div class="stat-box"><div class="stat-box-val" id="stat-c">0</div><div class="stat-box-label">Communities</div></div>
        <div class="stat-box"><div class="stat-box-val" id="stat-d">0%</div><div class="stat-box-label">Density</div></div>
      </div>
    </div>`;
  toast('Network reset', 'info');
});

// Clear results
$('btn-clear-results').addEventListener('click', () => {
  while (resultsPanel.children.length > 1) resultsPanel.removeChild(resultsPanel.lastChild);
  clearHighlights();
});

// Zoom
$('btn-zoom-in').addEventListener('click',  () => svg.transition().call(zoom.scaleBy, 1.3));
$('btn-zoom-out').addEventListener('click', () => svg.transition().call(zoom.scaleBy, 0.77));
$('btn-zoom-fit').addEventListener('click', () => svg.transition().call(zoom.transform, d3.zoomIdentity));

// Matrix view toggle
$('btn-matrix').addEventListener('click', () => { matrixView.classList.toggle('visible'); updateMatrix(); });

// ─── Adjacency Matrix ─────────────────────────────────────────────────────────
function updateMatrix() {
  if (!matrixView.classList.contains('visible')) return;
  const users = sn.getUsers();
  if (!users.length) { matrixView.innerHTML = '<span style="color:var(--text-muted)">No users</span>'; return; }
  const limit = users.slice(0, 12);
  let html = '<table><tr><th></th>' + limit.map(u => `<th>${u.charAt(0)}</th>`).join('') + '</tr>';
  limit.forEach(u => {
    html += `<tr><th>${u.charAt(0)}</th>` + limit.map(v => {
      if (u === v) return `<td class="m-one">·</td>`;
      return sn.areFriends(u, v) ? `<td class="m-one">1</td>` : `<td>0</td>`;
    }).join('') + '</tr>';
  });
  html += '</table>';
  matrixView.innerHTML = html;
}

// ─── Init ─────────────────────────────────────────────────────────────────────
initGraph();
refresh();
