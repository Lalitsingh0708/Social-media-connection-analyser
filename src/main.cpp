/*
 * ============================================================
 *   Social Network Graph Analyzer
 *   Language : C++
 *   Concepts : Graph (Adjacency List), BFS, DFS,
 *              Mutual Friends, Friend Recommendation
 * ============================================================
 *
 *  Compile:
 *    g++ -std=c++17 -o sna main.cpp
 *
 *  Run:
 *    ./sna        (Linux / Mac)
 *    sna.exe      (Windows)
 * ============================================================
 */

#include <iostream>
#include <unordered_map>
#include <unordered_set>
#include <vector>
#include <queue>
#include <stack>
#include <string>
#include <algorithm>
#include <limits>
#include <iomanip>
#include <fstream>

using namespace std;

// ============================================================
//   GRAPH  (Adjacency List)
//   Each user = node, each friendship = undirected edge
// ============================================================

unordered_map<string, unordered_set<string>> graph;

// Add a new user (node)
bool addUser(const string& name) {
    if (graph.count(name)) {
        cout << "  User \"" << name << "\" already exists.\n";
        return false;
    }
    graph[name];   // creates empty adjacency set
    cout << "  Added user: " << name << "\n";
    return true;
}

// Remove a user and all their friendships
bool removeUser(const string& name) {
    if (!graph.count(name)) {
        cout << "  User not found.\n";
        return false;
    }
    for (const string& nb : graph[name])
        graph[nb].erase(name);
    graph.erase(name);
    cout << "  Removed user: " << name << "\n";
    return true;
}

// Add a friendship (undirected edge)
bool addFriend(const string& u, const string& v) {
    if (!graph.count(u) || !graph.count(v)) {
        cout << "  One or both users not found.\n";
        return false;
    }
    if (u == v) {
        cout << "  Cannot connect a user to themselves.\n";
        return false;
    }
    graph[u].insert(v);
    graph[v].insert(u);
    cout << "  Connected: " << u << " <--> " << v << "\n";
    return true;
}

// Remove a friendship
bool removeFriend(const string& u, const string& v) {
    if (!graph.count(u) || !graph.count(v)) {
        cout << "  User not found.\n";
        return false;
    }
    graph[u].erase(v);
    graph[v].erase(u);
    cout << "  Removed friendship: " << u << " <--> " << v << "\n";
    return true;
}

// Show friends of a user
void showFriends(const string& name) {
    if (!graph.count(name)) { cout << "  User not found.\n"; return; }
    cout << "\n  Friends of " << name << " : ";
    if (graph[name].empty()) { cout << "(none)\n"; return; }
    for (const string& f : graph[name]) cout << f << "  ";
    cout << "\n";
}

// Display the entire adjacency list
void showGraph() {
    cout << "\n  === Adjacency List ===\n";
    for (auto it = graph.begin(); it != graph.end(); ++it) {
        cout << "  " << it->first << "  -->  ";
        for (const string& f : it->second) cout << f << "  ";
        cout << "\n";
    }
}

// ============================================================
//   BFS  —  Breadth First Search
//   Time Complexity: O(V + E)
// ============================================================

// BFS Traversal: visits all reachable nodes level by level
vector<string> bfsTraversal(const string& start) {
    if (!graph.count(start)) return {};

    unordered_set<string> visited;
    queue<string> q;
    vector<string> order;

    visited.insert(start);
    q.push(start);

    while (!q.empty()) {
        string node = q.front(); q.pop();
        order.push_back(node);

        for (const string& nb : graph[node]) {
            if (!visited.count(nb)) {
                visited.insert(nb);
                q.push(nb);
            }
        }
    }
    return order;
}

// BFS Shortest Path: find minimum hops between two users
vector<string> shortestPath(const string& start, const string& end) {
    if (!graph.count(start) || !graph.count(end)) return {};
    if (start == end) return { start };

    unordered_map<string, string> parent;  // child -> parent
    unordered_set<string> visited;
    queue<string> q;

    visited.insert(start);
    parent[start] = "";
    q.push(start);

    while (!q.empty()) {
        string node = q.front(); q.pop();

        for (const string& nb : graph[node]) {
            if (!visited.count(nb)) {
                visited.insert(nb);
                parent[nb] = node;
                q.push(nb);

                if (nb == end) {
                    // Reconstruct path by walking back through parent map
                    vector<string> path;
                    string cur = end;
                    while (!cur.empty()) {
                        path.push_back(cur);
                        cur = parent[cur];
                    }
                    reverse(path.begin(), path.end());
                    return path;
                }
            }
        }
    }
    return {};  // no path found
}

// ============================================================
//   DFS  —  Depth First Search
//   Time Complexity: O(V + E)
// ============================================================

// DFS Traversal: visits nodes going as deep as possible first
vector<string> dfsTraversal(const string& start) {
    if (!graph.count(start)) return {};

    unordered_set<string> visited;
    stack<string> stk;
    vector<string> order;

    stk.push(start);

    while (!stk.empty()) {
        string node = stk.top(); stk.pop();
        if (visited.count(node)) continue;

        visited.insert(node);
        order.push_back(node);

        for (const string& nb : graph[node]) {
            if (!visited.count(nb)) stk.push(nb);
        }
    }
    return order;
}

// DFS Community Detection: find groups of connected users
// Each community = one connected component
void dfsHelper(const string& node, unordered_set<string>& visited, vector<string>& community) {
    visited.insert(node);
    community.push_back(node);
    for (const string& nb : graph[node]) {
        if (!visited.count(nb))
            dfsHelper(nb, visited, community);
    }
}

vector<vector<string>> detectCommunities() {
    unordered_set<string> visited;
    vector<vector<string>> communities;

    for (auto it = graph.begin(); it != graph.end(); ++it) {
        if (!visited.count(it->first)) {
            vector<string> community;
            dfsHelper(it->first, visited, community);
            communities.push_back(community);
        }
    }
    return communities;
}

// ============================================================
//   MUTUAL FRIENDS  —  Set Intersection
//   Time Complexity: O(min(d1, d2))
// ============================================================

vector<string> mutualFriends(const string& u, const string& v) {
    if (!graph.count(u) || !graph.count(v)) return {};

    vector<string> mutual;
    for (const string& f : graph[u]) {
        if (graph[v].count(f))
            mutual.push_back(f);
    }
    return mutual;
}

// ============================================================
//   FRIEND RECOMMENDATION  —  Friends of Friends
//   Time Complexity: O(V * avg_degree)
// ============================================================

// Suggest friends who share the most mutual friends with user
void recommendFriends(const string& user) {
    if (!graph.count(user)) { cout << "  User not found.\n"; return; }

    // score[candidate] = number of mutual friends with user
    unordered_map<string, int> score;
    const auto& myFriends = graph[user];

    for (const string& myFriend : myFriends) {
        for (const string& fof : graph[myFriend]) {  // friend of friend
            if (fof == user) continue;           // skip self
            if (myFriends.count(fof)) continue;  // skip existing friends
            score[fof]++;
        }
    }

    if (score.empty()) {
        cout << "  No recommendations available.\n";
        return;
    }

    // Sort by score descending
    vector<pair<string,int>> ranked(score.begin(), score.end());
    sort(ranked.begin(), ranked.end(),
         [](const pair<string,int>& a, const pair<string,int>& b) {
             return a.second > b.second;
         });

    cout << "\n  Friend Recommendations for " << user << ":\n";
    int shown = 0;
    for (size_t i = 0; i < ranked.size() && shown < 5; i++) {
        cout << "  -> " << ranked[i].first << "  (" << ranked[i].second
             << " mutual friend" << (ranked[i].second > 1 ? "s" : "") << ")\n";
        shown++;
    }
}

// ============================================================
//   NETWORK STATS
// ============================================================

void networkStats() {
    int V = graph.size();
    int E = 0;
    for (auto it = graph.begin(); it != graph.end(); ++it) E += it->second.size();
    E /= 2;  // undirected

    int maxEdges = V * (V - 1) / 2;
    double density = maxEdges > 0 ? (double)E / maxEdges * 100.0 : 0.0;

    auto communities = detectCommunities();

    cout << "\n  +--------------------------+\n";
    cout << "  |   Network Statistics      |\n";
    cout << "  +--------------------------+\n";
    cout << "  | Users       : " << setw(10) << V        << " |\n";
    cout << "  | Friendships : " << setw(10) << E        << " |\n";
    cout << "  | Communities : " << setw(10) << communities.size() << " |\n";
    cout << "  | Density     : " << setw(9)  << fixed << setprecision(1) << density << "% |\n";
    cout << "  +--------------------------+\n";
}

// ============================================================
//   LOAD FROM FILE
// ============================================================

void loadFromFile(const string& userFile, const string& edgeFile) {
    ifstream uf(userFile);
    string line;
    int users = 0;
    while (getline(uf, line)) {
        if (!line.empty() && line[0] != '#') {
            addUser(line);
            users++;
        }
    }

    ifstream ef(edgeFile);
    int edges = 0;
    while (getline(ef, line)) {
        if (line.empty() || line[0] == '#') continue;
        auto pos = line.find(',');
        if (pos != string::npos) {
            addFriend(line.substr(0, pos), line.substr(pos + 1));
            edges++;
        }
    }
    cout << "  Loaded " << users << " users and " << edges << " edges.\n";
}

// ============================================================
//   LOAD DEMO DATA
// ============================================================

void loadDemo() {
    vector<string> users = {
        "Alice","Bob","Charlie","Diana","Eve",
        "Frank","Grace","Henry","Iris","Jack"
    };
    for (const string& u : users) addUser(u);

    vector<pair<string,string>> edges;
    edges.push_back(make_pair("Alice","Bob"));
    edges.push_back(make_pair("Alice","Charlie"));
    edges.push_back(make_pair("Alice","Diana"));
    edges.push_back(make_pair("Bob","Eve"));
    edges.push_back(make_pair("Bob","Frank"));
    edges.push_back(make_pair("Charlie","Grace"));
    edges.push_back(make_pair("Charlie","Henry"));
    edges.push_back(make_pair("Diana","Iris"));
    edges.push_back(make_pair("Diana","Jack"));
    edges.push_back(make_pair("Eve","Frank"));
    edges.push_back(make_pair("Frank","Grace"));
    edges.push_back(make_pair("Grace","Henry"));
    edges.push_back(make_pair("Henry","Iris"));
    edges.push_back(make_pair("Iris","Jack"));
    for (size_t i = 0; i < edges.size(); i++) addFriend(edges[i].first, edges[i].second);

    cout << "\n  Demo network loaded: "
         << users.size() << " users, " << edges.size() << " friendships.\n";
}

// ============================================================
//   HELPER — print a vector
// ============================================================

void printList(const vector<string>& v, const string& sep = " -> ") {
    for (size_t i = 0; i < v.size(); i++) {
        cout << v[i];
        if (i + 1 < v.size()) cout << sep;
    }
    cout << "\n";
}

// ============================================================
//   MENU
// ============================================================

void printMenu() {
    cout << "\n  +---------------------------------------+\n";
    cout << "  |        SOCIAL NETWORK ANALYZER        |\n";
    cout << "  +---------------------------------------+\n";
    cout << "  |  1.  Add User                         |\n";
    cout << "  |  2.  Remove User                      |\n";
    cout << "  |  3.  Add Friendship                   |\n";
    cout << "  |  4.  Remove Friendship                |\n";
    cout << "  |  5.  Show Friends of User             |\n";
    cout << "  |  6.  Show Adjacency List              |\n";
    cout << "  |  7.  BFS Traversal                    |\n";
    cout << "  |  8.  DFS Traversal                    |\n";
    cout << "  |  9.  Shortest Path (BFS)              |\n";
    cout << "  |  10. Mutual Friends                   |\n";
    cout << "  |  11. Friend Recommendations           |\n";
    cout << "  |  12. Detect Communities (DFS)         |\n";
    cout << "  |  13. Network Statistics               |\n";
    cout << "  |  14. Load from File                   |\n";
    cout << "  |  15. Load Demo Data                   |\n";
    cout << "  |  0.  Exit                             |\n";
    cout << "  +---------------------------------------+\n";
    cout << "  Enter choice: ";
}

// ============================================================
//   MAIN
// ============================================================

int main() {
    cout << "\n  *** Social Network Graph Analyzer ***\n";
    cout << "  DSA Project — Graph, BFS, DFS, C++\n";

    int choice = -1;

    while (choice != 0) {
        printMenu();
        cin >> choice;
        cin.ignore(numeric_limits<streamsize>::max(), '\n');

        string u, v;

        switch (choice) {

        case 1:
            cout << "  Enter username: ";
            getline(cin, u);
            addUser(u);
            break;

        case 2:
            cout << "  Enter username: ";
            getline(cin, u);
            removeUser(u);
            break;

        case 3:
            cout << "  User A: "; getline(cin, u);
            cout << "  User B: "; getline(cin, v);
            addFriend(u, v);
            break;

        case 4:
            cout << "  User A: "; getline(cin, u);
            cout << "  User B: "; getline(cin, v);
            removeFriend(u, v);
            break;

        case 5:
            cout << "  Username: "; getline(cin, u);
            showFriends(u);
            break;

        case 6:
            showGraph();
            break;

        case 7:
            cout << "  Start node: "; getline(cin, u);
            {
                auto order = bfsTraversal(u);
                if (order.empty()) cout << "  User not found.\n";
                else { cout << "  BFS order: "; printList(order, " -> "); }
            }
            break;

        case 8:
            cout << "  Start node: "; getline(cin, u);
            {
                auto order = dfsTraversal(u);
                if (order.empty()) cout << "  User not found.\n";
                else { cout << "  DFS order: "; printList(order, " -> "); }
            }
            break;

        case 9:
            cout << "  From: "; getline(cin, u);
            cout << "  To:   "; getline(cin, v);
            {
                auto path = shortestPath(u, v);
                if (path.empty()) cout << "  No connection found between " << u << " and " << v << ".\n";
                else {
                    cout << "  Shortest path (" << path.size()-1 << " hops): ";
                    printList(path, " -> ");
                }
            }
            break;

        case 10:
            cout << "  User A: "; getline(cin, u);
            cout << "  User B: "; getline(cin, v);
            {
                auto mf = mutualFriends(u, v);
                cout << "  Mutual friends of " << u << " and " << v << ": ";
                if (mf.empty()) cout << "(none)\n";
                else printList(mf, ", ");
            }
            break;

        case 11:
            cout << "  Username: "; getline(cin, u);
            recommendFriends(u);
            break;

        case 12:
            {
                auto comms = detectCommunities();
                cout << "\n  Found " << comms.size() << " community/communities:\n";
                for (size_t i = 0; i < comms.size(); i++) {
                    cout << "  [" << i+1 << "] ";
                    printList(comms[i], ", ");
                }
            }
            break;

        case 13:
            networkStats();
            break;

        case 14:
            cout << "  Users file path: "; getline(cin, u);
            cout << "  Edges file path: "; getline(cin, v);
            loadFromFile(u, v);
            break;

        case 15:
            loadDemo();
            break;

        case 0:
            cout << "\n  Goodbye!\n\n";
            break;

        default:
            cout << "  Invalid choice. Try again.\n";
        }
    }

    return 0;
}
