/**
 * DFS.js - Depth-First Search Algorithms
 * Time Complexity: O(V + E)
 *
 * Used for:
 *  - Community/cluster detection
 *  - Connected components
 *  - Cycle detection
 *  - Deep network traversal
 */

export class DFS {
  /**
   * DFS traversal from a start node.
   * Returns nodes in DFS order and DFS tree edges.
   * @param {Map<string, Set<string>>} adjList
   * @param {string} start
   * @returns {{ order: string[], treeEdges: {from: string, to: string}[] }}
   */
  static traverse(adjList, start) {
    if (!adjList.has(start)) return { order: [], treeEdges: [] };

    const visited = new Set();
    const order = [];
    const treeEdges = [];

    const dfs = (node, parent) => {
      visited.add(node);
      order.push(node);

      for (const neighbor of adjList.get(node) || []) {
        if (!visited.has(neighbor)) {
          treeEdges.push({ from: node, to: neighbor });
          dfs(neighbor, node);
        }
      }
    };

    dfs(start, null);
    return { order, treeEdges };
  }

  /**
   * Detect all connected communities (connected components) in the graph.
   * Each community is a group of nodes reachable from each other.
   * @param {Map<string, Set<string>>} adjList
   * @returns {string[][]} Array of communities (each = array of user names)
   */
  static detectCommunities(adjList) {
    const visited = new Set();
    const communities = [];

    const dfs = (node, component) => {
      visited.add(node);
      component.push(node);
      for (const neighbor of adjList.get(node) || []) {
        if (!visited.has(neighbor)) {
          dfs(neighbor, component);
        }
      }
    };

    for (const node of adjList.keys()) {
      if (!visited.has(node)) {
        const component = [];
        dfs(node, component);
        communities.push(component);
      }
    }

    return communities;
  }

  /**
   * Check if the graph has any cycle.
   * @param {Map<string, Set<string>>} adjList
   * @returns {boolean}
   */
  static hasCycle(adjList) {
    const visited = new Set();

    const dfs = (node, parent) => {
      visited.add(node);
      for (const neighbor of adjList.get(node) || []) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor, node)) return true;
        } else if (neighbor !== parent) {
          return true; // back edge = cycle
        }
      }
      return false;
    };

    for (const node of adjList.keys()) {
      if (!visited.has(node)) {
        if (dfs(node, null)) return true;
      }
    }
    return false;
  }

  /**
   * Iterative DFS (avoids stack overflow for large graphs).
   * @param {Map<string, Set<string>>} adjList
   * @param {string} start
   * @returns {string[]}
   */
  static iterativeTraverse(adjList, start) {
    if (!adjList.has(start)) return [];
    const visited = new Set();
    const stack = [start];
    const order = [];

    while (stack.length > 0) {
      const node = stack.pop();
      if (visited.has(node)) continue;
      visited.add(node);
      order.push(node);

      for (const neighbor of adjList.get(node) || []) {
        if (!visited.has(neighbor)) {
          stack.push(neighbor);
        }
      }
    }
    return order;
  }
}
