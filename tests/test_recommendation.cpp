// test_recommendation.cpp — Unit tests for friend recommendation system
#include <cassert>
#include <iostream>
#include "../include/Graph.h"
#include "../include/Recommendation.h"

Graph buildSocialGraph() {
    // A-B, A-C, B-D, C-D → D is friend-of-friend of A
    Graph g;
    for (const auto& u : {"A","B","C","D","E"}) g.addVertex(u);
    g.addEdge("A","B"); g.addEdge("A","C");
    g.addEdge("B","D"); g.addEdge("C","D");
    return g;
}

void test_mutualFriends() {
    Graph g = buildSocialGraph();
    // A's friends: B, C.  D's friends: B, C.
    auto mf = Recommendation::mutualFriends(g, "A", "D");
    assert(mf.size() == 2); // B and C
    std::cout << "[PASS] test_mutualFriends\n";
}

void test_mutualFriends_none() {
    Graph g = buildSocialGraph();
    auto mf = Recommendation::mutualFriends(g, "A", "E");
    assert(mf.empty());
    std::cout << "[PASS] test_mutualFriends_none\n";
}

void test_recommendFriends() {
    Graph g = buildSocialGraph();
    auto recs = Recommendation::recommendFriends(g, "A", 5);
    // D should be top recommendation (2 mutual friends: B and C)
    assert(!recs.empty());
    assert(recs[0].name == "D");
    assert(recs[0].mutualCount == 2);
    std::cout << "[PASS] test_recommendFriends\n";
}

void test_topInfluencers() {
    Graph g = buildSocialGraph();
    // D is connected to B and C → degree 2; A is connected to B and C → degree 2
    auto inf = Recommendation::topInfluencers(g, 5);
    assert(!inf.empty());
    assert(inf[0].second >= inf[1].second); // sorted descending
    std::cout << "[PASS] test_topInfluencers\n";
}

void test_clusteringCoefficient_zero() {
    Graph g = buildSocialGraph();
    // A's friends are B and C. B and C are NOT connected → clustering = 0
    double cc = Recommendation::clusteringCoefficient(g, "A");
    assert(cc == 0.0);
    std::cout << "[PASS] test_clusteringCoefficient_zero\n";
}

void test_clusteringCoefficient_one() {
    Graph g;
    for (const auto& u : {"X","Y","Z"}) g.addVertex(u);
    g.addEdge("X","Y"); g.addEdge("Y","Z"); g.addEdge("X","Z");
    // Y's friends: X and Z, and X-Z connected → clustering = 1
    double cc = Recommendation::clusteringCoefficient(g, "Y");
    assert(cc == 1.0);
    std::cout << "[PASS] test_clusteringCoefficient_one\n";
}

void test_networkDensity() {
    Graph g;
    for (const auto& u : {"A","B","C"}) g.addVertex(u);
    g.addEdge("A","B"); g.addEdge("B","C"); g.addEdge("A","C");
    // 3 edges, max = 3 → density = 1.0
    double d = Recommendation::networkDensity(g);
    assert(d == 1.0);
    std::cout << "[PASS] test_networkDensity\n";
}

int main() {
    std::cout << "=== Recommendation Tests ===\n";
    test_mutualFriends();
    test_mutualFriends_none();
    test_recommendFriends();
    test_topInfluencers();
    test_clusteringCoefficient_zero();
    test_clusteringCoefficient_one();
    test_networkDensity();
    std::cout << "\nAll Recommendation tests passed ✓\n";
    return 0;
}
