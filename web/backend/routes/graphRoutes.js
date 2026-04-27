/**
 * graphRoutes.js — Graph algorithm endpoints
 *
 * GET  /api/graph              → adjacency list as D3 nodes+links
 * POST /api/graph/friends      body: { u, v }
 * DELETE /api/graph/friends    body: { u, v }
 * GET  /api/graph/path?from=X&to=Y
 * GET  /api/graph/mutual?u=X&v=Y
 * GET  /api/graph/recommend/:user
 * GET  /api/graph/communities
 * GET  /api/graph/stats
 */
const express = require('express');
const router  = express.Router();

// ── Shared in-memory graph (adjacency list) ───────────────────────────────────
const graph = new Map(); // Map<string, Set<string>>
module.exports = router;
module.exports.graph = graph;

// ── BFS shortest path ─────────────────────────────────────────────────────────
function bfsPath(start, end) {
  if (!graph.has(start) || !graph.has(end)) return [];
  if (start === end) return [start];
  const visited = new Set([start]);
  const parent  = new Map([[start, null]]);
  const queue   = [start];
  while (queue.length) {
    const curr = queue.shift();
    for (const nb of graph.get(curr) || []) {
      if (!visited.has(nb)) {
        visited.add(nb); parent.set(nb, curr); queue.push(nb);
        if (nb === end) {
          const path = []; let node = end;
          while (node) { path.unshift(node); node = parent.get(node); }
          return path;
        }
      }
    }
  }
  return [];
}

// ── DFS communities ───────────────────────────────────────────────────────────
function detectCommunities() {
  const visited = new Set(); const communities = [];
  const dfs = (node, comp) => {
    visited.add(node); comp.push(node);
    for (const nb of graph.get(node) || []) if (!visited.has(nb)) dfs(nb, comp);
  };
  for (const node of graph.keys()) {
    if (!visited.has(node)) { const comp = []; dfs(node, comp); communities.push(comp); }
  }
  return communities;
}

// ── D3 format ─────────────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  const nodes = [], links = [], seen = new Set();
  for (const [name, nb] of graph.entries()) nodes.push({ id: name, degree: nb.size });
  for (const [u, neighbors] of graph.entries()) {
    for (const v of neighbors) {
      const key = [u,v].sort().join('--');
      if (!seen.has(key)) { seen.add(key); links.push({ source: u, target: v }); }
    }
  }
  res.json({ nodes, links });
});

// ── Add friendship ────────────────────────────────────────────────────────────
router.post('/friends', (req, res) => {
  const { u, v } = req.body;
  if (!u || !v) return res.status(400).json({ error: 'u and v required' });
  if (!graph.has(u) || !graph.has(v)) return res.status(404).json({ error: 'User not found' });
  graph.get(u).add(v); graph.get(v).add(u);
  res.json({ message: `Connected ${u} ↔ ${v}` });
});

// ── Remove friendship ─────────────────────────────────────────────────────────
router.delete('/friends', (req, res) => {
  const { u, v } = req.body;
  graph.get(u)?.delete(v); graph.get(v)?.delete(u);
  res.json({ message: `Disconnected ${u} ↔ ${v}` });
});

// ── BFS shortest path ─────────────────────────────────────────────────────────
router.get('/path', (req, res) => {
  const { from, to } = req.query;
  const path = bfsPath(from, to);
  res.json({ path, distance: path.length ? path.length - 1 : -1 });
});

// ── Mutual friends ────────────────────────────────────────────────────────────
router.get('/mutual', (req, res) => {
  const { u, v } = req.query;
  if (!graph.has(u) || !graph.has(v)) return res.status(404).json({ error: 'User not found' });
  const fu = graph.get(u), fv = graph.get(v);
  const mutual = [...fu].filter(f => fv.has(f));
  res.json({ mutual });
});

// ── Friend recommendations ────────────────────────────────────────────────────
router.get('/recommend/:user', (req, res) => {
  const user = req.params.user;
  if (!graph.has(user)) return res.status(404).json({ error: 'User not found' });
  const myFriends = graph.get(user);
  const scores = new Map();
  for (const f of myFriends) {
    for (const fof of graph.get(f) || []) {
      if (fof === user || myFriends.has(fof)) continue;
      if (!scores.has(fof)) scores.set(fof, { name: fof, mutualCount: 0, mutuals: [] });
      const s = scores.get(fof);
      if (!s.mutuals.includes(f)) { s.mutuals.push(f); s.mutualCount++; }
    }
  }
  const result = [...scores.values()].sort((a,b) => b.mutualCount - a.mutualCount).slice(0,5);
  res.json({ recommendations: result });
});

// ── Communities ───────────────────────────────────────────────────────────────
router.get('/communities', (req, res) => {
  res.json({ communities: detectCommunities() });
});

// ── Stats ─────────────────────────────────────────────────────────────────────
router.get('/stats', (req, res) => {
  const V = graph.size;
  let E = 0; for (const nb of graph.values()) E += nb.size; E /= 2;
  const maxEdges = V * (V - 1) / 2;
  const density  = maxEdges > 0 ? E / maxEdges : 0;
  res.json({ vertices: V, edges: E, density: +density.toFixed(4), communities: detectCommunities().length });
});
