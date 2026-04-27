// test_bfs.cpp — Unit tests for BFS algorithms
#include <cassert>
#include <iostream>
#include "../include/Graph.h"
#include "../include/BFS.h"

Graph buildTestGraph() {
    Graph g;
    for (const auto& u : {"A","B","C","D","E"}) g.addVertex(u);
    g.addEdge("A","B"); g.addEdge("A","C");
    g.addEdge("B","D"); g.addEdge("C","D");
    g.addEdge("D","E");
    return g;
}

void test_shortestPath_direct() {
    Graph g = buildTestGraph();
    auto path = BFS::shortestPath(g, "A", "B");
    assert(path.size() == 2);
    assert(path[0] == "A" && path[1] == "B");
    std::cout << "[PASS] test_shortestPath_direct\n";
}

void test_shortestPath_longer() {
    Graph g = buildTestGraph();
    auto path = BFS::shortestPath(g, "A", "E");
    // A → B → D → E  or  A → C → D → E  (3 hops)
    assert(path.size() == 4);
    assert(path.front() == "A" && path.back() == "E");
    std::cout << "[PASS] test_shortestPath_longer\n";
}

void test_shortestPath_unreachable() {
    Graph g = buildTestGraph();
    g.addVertex("X"); // isolated
    auto path = BFS::shortestPath(g, "A", "X");
    assert(path.empty());
    std::cout << "[PASS] test_shortestPath_unreachable\n";
}

void test_shortestPath_self() {
    Graph g = buildTestGraph();
    auto path = BFS::shortestPath(g, "A", "A");
    assert(path.size() == 1 && path[0] == "A");
    std::cout << "[PASS] test_shortestPath_self\n";
}

void test_bfs_traverse_visits_all_connected() {
    Graph g = buildTestGraph();
    auto order = BFS::traverse(g, "A");
    assert(order.size() == 5); // all 5 connected nodes
    assert(order[0] == "A");
    std::cout << "[PASS] test_bfs_traverse_visits_all_connected\n";
}

void test_degrees_of_separation() {
    Graph g = buildTestGraph();
    assert(BFS::degreesOfSeparation(g, "A", "B") == 1);
    assert(BFS::degreesOfSeparation(g, "A", "E") == 3);
    assert(BFS::degreesOfSeparation(g, "A", "A") == 0);
    std::cout << "[PASS] test_degrees_of_separation\n";
}

int main() {
    std::cout << "=== BFS Tests ===\n";
    test_shortestPath_direct();
    test_shortestPath_longer();
    test_shortestPath_unreachable();
    test_shortestPath_self();
    test_bfs_traverse_visits_all_connected();
    test_degrees_of_separation();
    std::cout << "\nAll BFS tests passed ✓\n";
    return 0;
}
