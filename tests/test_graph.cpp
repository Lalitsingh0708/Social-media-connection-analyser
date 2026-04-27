// test_graph.cpp — Unit tests for Graph data structure
#include <cassert>
#include <iostream>
#include "../include/Graph.h"

void test_addVertex() {
    Graph g;
    g.addVertex("Alice");
    assert(g.hasVertex("Alice"));
    assert(!g.hasVertex("Bob"));
    std::cout << "[PASS] test_addVertex\n";
}

void test_addEdge() {
    Graph g;
    g.addVertex("Alice");
    g.addVertex("Bob");
    assert(g.addEdge("Alice", "Bob"));
    assert(g.hasEdge("Alice", "Bob"));
    assert(g.hasEdge("Bob", "Alice")); // undirected
    assert(!g.addEdge("Alice", "Alice")); // self-loop rejected
    std::cout << "[PASS] test_addEdge\n";
}

void test_removeVertex() {
    Graph g;
    g.addVertex("Alice"); g.addVertex("Bob");
    g.addEdge("Alice", "Bob");
    g.removeVertex("Alice");
    assert(!g.hasVertex("Alice"));
    assert(!g.hasEdge("Bob", "Alice")); // edge cleaned up
    std::cout << "[PASS] test_removeVertex\n";
}

void test_removeEdge() {
    Graph g;
    g.addVertex("A"); g.addVertex("B");
    g.addEdge("A", "B");
    g.removeEdge("A", "B");
    assert(!g.hasEdge("A", "B"));
    assert(!g.hasEdge("B", "A"));
    std::cout << "[PASS] test_removeEdge\n";
}

void test_degree() {
    Graph g;
    g.addVertex("A"); g.addVertex("B"); g.addVertex("C");
    g.addEdge("A", "B"); g.addEdge("A", "C");
    assert(g.getDegree("A") == 2);
    assert(g.getDegree("B") == 1);
    std::cout << "[PASS] test_degree\n";
}

void test_edgeCount() {
    Graph g;
    g.addVertex("A"); g.addVertex("B"); g.addVertex("C");
    g.addEdge("A","B"); g.addEdge("B","C");
    assert(g.edgeCount() == 2);
    std::cout << "[PASS] test_edgeCount\n";
}

int main() {
    std::cout << "=== Graph Tests ===\n";
    test_addVertex();
    test_addEdge();
    test_removeVertex();
    test_removeEdge();
    test_degree();
    test_edgeCount();
    std::cout << "\nAll Graph tests passed ✓\n";
    return 0;
}
