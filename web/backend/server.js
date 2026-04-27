/**
 * server.js — Express API + Static file server
 *
 * Endpoints:
 *   GET  /api/graph          → returns current graph state
 *   POST /api/users          → add user
 *   DELETE /api/users/:name  → remove user
 *   POST /api/friends        → add friendship
 *   DELETE /api/friends      → remove friendship
 *   GET  /api/path           → BFS shortest path
 *   GET  /api/mutual         → mutual friends
 *   GET  /api/recommend/:u   → friend recommendations
 *   GET  /api/communities    → DFS community detection
 *   GET  /api/stats          → network statistics
 */

const express = require('express');
const cors    = require('cors');
const path    = require('path');

const userRoutes  = require('./routes/userRoutes');
const graphRoutes = require('./routes/graphRoutes');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Serve static web frontend ─────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '..'))); // serves web/

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/users',  userRoutes);
app.use('/api/graph',  graphRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 fallback → SPA ────────────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n  🕸️  Social Network Analyzer`);
  console.log(`  ✓  Server running at http://localhost:${PORT}`);
  console.log(`  ✓  API available at  http://localhost:${PORT}/api\n`);
});
