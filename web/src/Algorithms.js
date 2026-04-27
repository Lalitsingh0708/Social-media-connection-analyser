/**
 * Algorithms.js - Mutual Friends & Friend Recommendation
 *
 * mutualFriends:    O(min(d1, d2))  where d1, d2 are degrees of u, v
 * recommend:        O(V * avg_degree)
 * influencers:      O(V log V)
 * clusterCoeff:     O(d^2) per node
 */

export class Algorithms {
  /**
   * Find mutual friends between user u and user v.
   * Intersection of their friend sets.
   * @param {Map<string, Set<string>>} adjList
   * @param {string} u
   * @param {string} v
   * @returns {string[]}
   */
  static mutualFriends(adjList, u, v) {
    if (!adjList.has(u) || !adjList.has(v)) return [];
    const friendsU = adjList.get(u);
    const friendsV = adjList.get(v);
    const mutual = [];
    for (const f of friendsU) {
      if (friendsV.has(f)) mutual.push(f);
    }
    return mutual;
  }

  /**
   * Suggest friends for a given user.
   * Returns top-N users sorted by number of mutual friends (descending).
   * Excludes existing friends and the user themselves.
   * @param {Map<string, Set<string>>} adjList
   * @param {string} user
   * @param {number} topN
   * @returns {{ name: string, mutualCount: number, mutuals: string[] }[]}
   */
  static recommendFriends(adjList, user, topN = 5) {
    if (!adjList.has(user)) return [];

    const myFriends = adjList.get(user);
    const scores = new Map(); // candidate -> { count, mutuals }

    // For each friend of my friends
    for (const friend of myFriends) {
      for (const fof of adjList.get(friend) || []) {
        if (fof === user || myFriends.has(fof)) continue;

        if (!scores.has(fof)) {
          scores.set(fof, { count: 0, mutuals: [] });
        }
        const entry = scores.get(fof);
        if (!entry.mutuals.includes(friend)) {
          entry.count++;
          entry.mutuals.push(friend);
        }
      }
    }

    const result = [];
    for (const [name, data] of scores.entries()) {
      result.push({ name, mutualCount: data.count, mutuals: data.mutuals });
    }

    result.sort((a, b) => b.mutualCount - a.mutualCount);
    return result.slice(0, topN);
  }

  /**
   * Find the most influential users (by degree centrality).
   * @param {Map<string, Set<string>>} adjList
   * @param {number} topN
   * @returns {{ name: string, degree: number }[]}
   */
  static topInfluencers(adjList, topN = 5) {
    const result = [];
    for (const [name, neighbors] of adjList.entries()) {
      result.push({ name, degree: neighbors.size });
    }
    result.sort((a, b) => b.degree - a.degree);
    return result.slice(0, topN);
  }

  /**
   * Calculate clustering coefficient for a user.
   * Measures how close their friends are to forming a clique.
   * Range: 0 (no connections among friends) to 1 (all friends are friends).
   * @param {Map<string, Set<string>>} adjList
   * @param {string} user
   * @returns {number}
   */
  static clusteringCoefficient(adjList, user) {
    if (!adjList.has(user)) return 0;
    const friends = [...adjList.get(user)];
    const k = friends.length;
    if (k < 2) return 0;

    let edgesAmongFriends = 0;
    for (let i = 0; i < friends.length; i++) {
      for (let j = i + 1; j < friends.length; j++) {
        if (adjList.get(friends[i])?.has(friends[j])) {
          edgesAmongFriends++;
        }
      }
    }

    const maxEdges = (k * (k - 1)) / 2;
    return edgesAmongFriends / maxEdges;
  }

  /**
   * Network density: ratio of actual edges to maximum possible edges.
   * @param {Map<string, Set<string>>} adjList
   * @returns {number} 0 to 1
   */
  static networkDensity(adjList) {
    const V = adjList.size;
    if (V < 2) return 0;
    let E = 0;
    for (const neighbors of adjList.values()) E += neighbors.size;
    E /= 2; // undirected
    const maxEdges = (V * (V - 1)) / 2;
    return E / maxEdges;
  }

  /**
   * Compute average path length (average degrees of separation) using BFS.
   * NOTE: Expensive — O(V * (V + E))
   * @param {Map<string, Set<string>>} adjList
   * @param {Function} bfsShortestPath
   * @returns {number}
   */
  static averagePathLength(adjList, bfsShortestPath) {
    const users = [...adjList.keys()];
    let totalDist = 0;
    let count = 0;

    for (let i = 0; i < users.length; i++) {
      for (let j = i + 1; j < users.length; j++) {
        const { distance } = bfsShortestPath(adjList, users[i], users[j]);
        if (distance > 0) {
          totalDist += distance;
          count++;
        }
      }
    }
    return count === 0 ? 0 : totalDist / count;
  }
}
