/**
 * BFS.js - Breadth-First Search Algorithms
 * Time Complexity: O(V + E)
 *
 * Used for:
 *  - Shortest connection path (degrees of separation)
 *  - Level-order exploration
 *  - Finding all reachable nodes
 */

export class BFS {
  /**
   * Find the shortest path between two users.
   * Returns an array of usernames forming the path, or [] if unreachable.
   * @param {Map<string, Set<string>>} adjList
   * @param {string} start
   * @param {string} end
   * @returns {{ path: string[], distance: number, visited: string[] }}
   */
  static shortestPath(adjList, start, end) {
    if (!adjList.has(start) || !adjList.has(end)) {
      return { path: [], distance: -1, visited: [] };
    }
    if (start === end) {
      return { path: [start], distance: 0, visited: [start] };
    }

    const visited = new Set();
    const parent = new Map();
    const queue = [start];
    const visitedOrder = [];

    visited.add(start);
    parent.set(start, null);

    while (queue.length > 0) {
      const current = queue.shift();
      visitedOrder.push(current);

      for (const neighbor of adjList.get(current) || []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          parent.set(neighbor, current);
          queue.push(neighbor);

          if (neighbor === end) {
            // Reconstruct path
            const path = [];
            let node = end;
            while (node !== null) {
              path.unshift(node);
              node = parent.get(node);
            }
            return {
              path,
              distance: path.length - 1,
              visited: visitedOrder,
            };
          }
        }
      }
    }

    return { path: [], distance: -1, visited: visitedOrder };
  }

  /**
   * BFS traversal from a start node.
   * Returns levels array (each level is an array of nodes at that BFS depth).
   * @param {Map<string, Set<string>>} adjList
   * @param {string} start
   * @returns {{ levels: string[][], order: string[] }}
   */
  static traverse(adjList, start) {
    if (!adjList.has(start)) return { levels: [], order: [] };

    const visited = new Set([start]);
    const queue = [{ node: start, depth: 0 }];
    const levels = [];
    const order = [];

    while (queue.length > 0) {
      const { node, depth } = queue.shift();
      order.push(node);

      if (!levels[depth]) levels[depth] = [];
      levels[depth].push(node);

      for (const neighbor of adjList.get(node) || []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push({ node: neighbor, depth: depth + 1 });
        }
      }
    }

    return { levels, order };
  }

  /**
   * Find all nodes reachable from start (connected component).
   * @param {Map<string, Set<string>>} adjList
   * @param {string} start
   * @returns {string[]}
   */
  static reachableNodes(adjList, start) {
    if (!adjList.has(start)) return [];
    const visited = new Set([start]);
    const queue = [start];

    while (queue.length > 0) {
      const current = queue.shift();
      for (const neighbor of adjList.get(current) || []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }

    return [...visited];
  }

  /**
   * Count degrees of separation between two users.
   * Returns -1 if not connected.
   * @param {Map<string, Set<string>>} adjList
   * @param {string} u
   * @param {string} v
   * @returns {number}
   */
  static degreesOfSeparation(adjList, u, v) {
    const { distance } = BFS.shortestPath(adjList, u, v);
    return distance;
  }
}
