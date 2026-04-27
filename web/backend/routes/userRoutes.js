/**
 * userRoutes.js — User management endpoints
 * POST   /api/users        body: { name }
 * DELETE /api/users/:name
 * GET    /api/users        → list all users
 */
const express = require('express');
const router  = express.Router();
const { graph } = require('./graphRoutes'); // shared graph state

// GET all users
router.get('/', (req, res) => {
  const users = [];
  for (const [name, neighbors] of graph.entries()) {
    users.push({ name, degree: neighbors.size });
  }
  res.json({ users });
});

// POST add user
router.post('/', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  if (graph.has(name)) return res.status(409).json({ error: `User "${name}" already exists` });
  graph.set(name, new Set());
  res.status(201).json({ message: `Added user "${name}"` });
});

// DELETE remove user
router.delete('/:name', (req, res) => {
  const { name } = req.params;
  if (!graph.has(name)) return res.status(404).json({ error: 'User not found' });
  // Clean up all edges
  for (const neighbor of graph.get(name)) {
    graph.get(neighbor)?.delete(name);
  }
  graph.delete(name);
  res.json({ message: `Removed user "${name}"` });
});

module.exports = router;
