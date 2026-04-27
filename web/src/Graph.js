/**
 * Graph.js - Core Adjacency List Graph Data Structure
 * Time Complexity:
 *   addUser:      O(1)
 *   addFriend:    O(1)
 *   removeFriend: O(N) where N = degree of vertex
 *   removeUser:   O(V + E)
 */

export class Graph {
  constructor() {
    // adjacency list: Map<string, Set<string>>
    this.adjList = new Map();
    // Node metadata: Map<string, { color, avatar, joined }>
    this.nodeData = new Map();
  }

  // ─── User Management ────────────────────────────────────────────────────────

  addUser(name, metadata = {}) {
    if (this.adjList.has(name)) return false;
    this.adjList.set(name, new Set());
    this.nodeData.set(name, {
      color: metadata.color || this._randomColor(),
      avatar: metadata.avatar || name.charAt(0).toUpperCase(),
      joined: metadata.joined || new Date().toISOString(),
      ...metadata,
    });
    return true;
  }

  removeUser(name) {
    if (!this.adjList.has(name)) return false;
    // Remove all edges involving this user
    for (const neighbor of this.adjList.get(name)) {
      this.adjList.get(neighbor)?.delete(name);
    }
    this.adjList.delete(name);
    this.nodeData.delete(name);
    return true;
  }

  hasUser(name) {
    return this.adjList.has(name);
  }

  getUsers() {
    return [...this.adjList.keys()];
  }

  getUserCount() {
    return this.adjList.size;
  }

  // ─── Friendship Management ───────────────────────────────────────────────────

  addFriend(u, v) {
    if (!this.adjList.has(u) || !this.adjList.has(v)) return false;
    if (u === v) return false;
    this.adjList.get(u).add(v);
    this.adjList.get(v).add(u);
    return true;
  }

  removeFriend(u, v) {
    if (!this.adjList.has(u) || !this.adjList.has(v)) return false;
    this.adjList.get(u).delete(v);
    this.adjList.get(v).delete(u);
    return true;
  }

  areFriends(u, v) {
    return this.adjList.has(u) && this.adjList.get(u).has(v);
  }

  getFriends(name) {
    if (!this.adjList.has(name)) return [];
    return [...this.adjList.get(name)];
  }

  getDegree(name) {
    if (!this.adjList.has(name)) return 0;
    return this.adjList.get(name).size;
  }

  getEdgeCount() {
    let total = 0;
    for (const neighbors of this.adjList.values()) {
      total += neighbors.size;
    }
    return total / 2; // undirected
  }

  // ─── Graph Export for D3 ────────────────────────────────────────────────────

  toD3Format() {
    const nodes = [];
    const links = [];
    const seen = new Set();

    for (const [user, meta] of this.nodeData.entries()) {
      nodes.push({
        id: user,
        color: meta.color,
        avatar: meta.avatar,
        degree: this.getDegree(user),
      });
    }

    for (const [user, neighbors] of this.adjList.entries()) {
      for (const neighbor of neighbors) {
        const key = [user, neighbor].sort().join('--');
        if (!seen.has(key)) {
          seen.add(key);
          links.push({ source: user, target: neighbor });
        }
      }
    }

    return { nodes, links };
  }

  // ─── Utility ─────────────────────────────────────────────────────────────────

  _randomColor() {
    const palette = [
      '#6C63FF', '#FF6584', '#43E97B', '#38F9D7',
      '#FA709A', '#FEE140', '#30CFD0', '#A18CD1',
      '#FF9A9E', '#96FBC4', '#F093FB', '#4facfe',
    ];
    return palette[Math.floor(Math.random() * palette.length)];
  }
}
