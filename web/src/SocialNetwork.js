/**
 * SocialNetwork.js - Main Controller (Facade)
 * Integrates Graph, BFS, DFS, and Algorithms modules.
 */

import { Graph } from './Graph.js';
import { BFS } from './BFS.js';
import { DFS } from './DFS.js';
import { Algorithms } from './Algorithms.js';

export class SocialNetwork {
  constructor() {
    this.graph = new Graph();
    this._history = []; // operation log
  }

  // ─── User Management ────────────────────────────────────────────────────────

  addUser(name, metadata = {}) {
    const result = this.graph.addUser(name, metadata);
    if (result) this._log(`Added user "${name}"`);
    return result;
  }

  removeUser(name) {
    const result = this.graph.removeUser(name);
    if (result) this._log(`Removed user "${name}"`);
    return result;
  }

  hasUser(name) { return this.graph.hasUser(name); }
  getUsers()    { return this.graph.getUsers(); }

  // ─── Friendship ──────────────────────────────────────────────────────────────

  addFriend(u, v) {
    const result = this.graph.addFriend(u, v);
    if (result) this._log(`Connected "${u}" ↔ "${v}"`);
    return result;
  }

  removeFriend(u, v) {
    const result = this.graph.removeFriend(u, v);
    if (result) this._log(`Removed connection "${u}" ↔ "${v}"`);
    return result;
  }

  areFriends(u, v) { return this.graph.areFriends(u, v); }
  getFriends(name)  { return this.graph.getFriends(name); }

  // ─── BFS Algorithms ──────────────────────────────────────────────────────────

  shortestPath(start, end) {
    this._log(`BFS shortest path: "${start}" → "${end}"`);
    return BFS.shortestPath(this.graph.adjList, start, end);
  }

  bfsTraverse(start) {
    this._log(`BFS traversal from "${start}"`);
    return BFS.traverse(this.graph.adjList, start);
  }

  degreesOfSeparation(u, v) {
    return BFS.degreesOfSeparation(this.graph.adjList, u, v);
  }

  // ─── DFS Algorithms ──────────────────────────────────────────────────────────

  dfsTraverse(start) {
    this._log(`DFS traversal from "${start}"`);
    return DFS.traverse(this.graph.adjList, start);
  }

  detectCommunities() {
    this._log('Community detection (DFS)');
    return DFS.detectCommunities(this.graph.adjList);
  }

  hasCycle() {
    return DFS.hasCycle(this.graph.adjList);
  }

  // ─── Analytics ───────────────────────────────────────────────────────────────

  mutualFriends(u, v) {
    this._log(`Mutual friends: "${u}" & "${v}"`);
    return Algorithms.mutualFriends(this.graph.adjList, u, v);
  }

  recommendFriends(user, topN = 5) {
    this._log(`Friend recommendations for "${user}"`);
    return Algorithms.recommendFriends(this.graph.adjList, user, topN);
  }

  topInfluencers(topN = 5) {
    return Algorithms.topInfluencers(this.graph.adjList, topN);
  }

  clusteringCoefficient(user) {
    return Algorithms.clusteringCoefficient(this.graph.adjList, user);
  }

  networkDensity() {
    return Algorithms.networkDensity(this.graph.adjList);
  }

  networkStats() {
    const V = this.graph.getUserCount();
    const E = this.graph.getEdgeCount();
    const density = this.networkDensity();
    const communities = this.detectCommunities();
    const influencers = this.topInfluencers(3);
    return { V, E, density, communities: communities.length, influencers };
  }

  // ─── D3 Graph Export ─────────────────────────────────────────────────────────

  toD3Format() { return this.graph.toD3Format(); }

  // ─── History ─────────────────────────────────────────────────────────────────

  getHistory() { return [...this._history]; }

  _log(msg) {
    this._history.unshift({ msg, time: new Date().toLocaleTimeString() });
    if (this._history.length > 50) this._history.pop();
  }

  // ─── Preload Demo Data ────────────────────────────────────────────────────────

  loadDemoData() {
    const users = [
      'Lalit', 'Anuj', 'Ankit', 'Adarsh', 'Prashant',
      'Prince', 'Aniket', 'Harpal', 'Raj', 'Priyanka',
      'Aarti', 'Kiran', 'Abhishek',
    ];
    users.forEach(u => this.addUser(u));

    const friendships = [
      ['Lalit', 'Anuj'],      ['Lalit', 'Ankit'],     ['Lalit', 'Adarsh'],
      ['Anuj', 'Prashant'],   ['Anuj', 'Prince'],
      ['Ankit', 'Aniket'],    ['Ankit', 'Harpal'],
      ['Adarsh', 'Raj'],      ['Adarsh', 'Priyanka'],
      ['Prashant', 'Prince'], ['Prince', 'Aniket'],
      ['Aniket', 'Harpal'],   ['Harpal', 'Raj'],
      ['Raj', 'Priyanka'],    ['Priyanka', 'Aarti'],
      ['Aarti', 'Kiran'],     ['Kiran', 'Lalit'],
    ];
    friendships.forEach(([u, v]) => this.addFriend(u, v));
  }
}
