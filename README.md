# Social Network Graph Analyzer

A DSA-based project demonstrating real-world graph algorithms — built with **C++** for the core engine and a **web frontend** using D3.js for interactive visualization.

## Project Structure

```
SocialNetworkAnalyzer/
├── src/              ← C++ source files
├── include/          ← C++ header files
├── algorithms/       ← Algorithm module headers
├── tests/            ← Unit tests
├── data/             ← Sample data files
├── web/              ← Web visualization layer
│   ├── index.html
│   ├── style.css
│   ├── src/          ← JS modules (Graph, BFS, DFS, etc.)
│   └── backend/      ← Node.js Express API
├── CMakeLists.txt
└── README.md
```

## Algorithms Implemented

| Algorithm | Complexity | Use Case |
|---|---|---|
| BFS Shortest Path | O(V+E) | Degrees of separation |
| BFS Traversal | O(V+E) | Network exploration |
| DFS Traversal | O(V+E) | Deep network traversal |
| DFS Community Detection | O(V+E) | Find friend clusters |
| Mutual Friends | O(min(d₁,d₂)) | Common connections |
| Friend Recommendation | O(V·avg_degree) | Suggest new friends |
| Degree Centrality | O(V log V) | Find influencers |
| Clustering Coefficient | O(d²) | Network tightness |
| Network Density | O(V+E) | Graph connectivity |
| Adjacency Matrix | O(V²) | Visual representation |

## Running the Web App

```bash
# Option 1: Simple static server
npx serve web --listen 5050

# Option 2: Express backend (with REST API)
cd web/backend
npm install
npm start        # → http://localhost:3000
```

## Building the C++ Console App

**Requirements:** CMake ≥ 3.16, C++17 compiler (GCC / MSVC / Clang)

```bash
mkdir build && cd build
cmake ..
cmake --build .

# Run the console app
./sna          # Linux/Mac
sna.exe        # Windows

# Run all tests
ctest --output-on-failure
```

### Load sample data in console app
When prompted, enter:
- Users file: `../data/sample_users.txt`
- Edges file: `../data/sample_edges.txt`

## REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/graph` | Full graph (D3 format) |
| GET | `/api/users` | List all users |
| POST | `/api/users` | Add user `{ name }` |
| DELETE | `/api/users/:name` | Remove user |
| POST | `/api/graph/friends` | Add friendship `{ u, v }` |
| DELETE | `/api/graph/friends` | Remove friendship `{ u, v }` |
| GET | `/api/graph/path?from=A&to=B` | BFS shortest path |
| GET | `/api/graph/mutual?u=A&v=B` | Mutual friends |
| GET | `/api/graph/recommend/:user` | Friend suggestions |
| GET | `/api/graph/communities` | DFS communities |
| GET | `/api/graph/stats` | Network statistics |

## Tech Stack

- **C++17** — Core DSA engine
- **CMake** — Build system
- **JavaScript ES Modules** — Web frontend logic
- **D3.js v7** — Force-directed graph visualization
- **Node.js + Express** — REST API backend
- **CSS glassmorphism** — Dark premium UI
