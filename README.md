NexusSync

NexusSync is a production-grade SaaS application built to explore local-first architecture, offline correctness, and deterministic synchronization at scale.




The browser is a first-class peer in a distributed system:

UI updates instantly
data survives refresh and offline usage
synchronization happens in the background
conflicts are resolved deterministically





Core Principles - 

Local-first by default
Offline-safe data model
Shared contracts across frontend and backend
Deterministic sync (no magic)
Incremental complexity, production discipline




Architecture Overview -

Browser (Local Replica)
│
├─ In-memory state (UI)
├─ IndexedDB (persistent local store)
├─ Operation Log (sync queue)
│
└─ Background Sync Engine
        ↓
Server (Global Authority)
│
├─ Auth & Workspaces
├─ MongoDB (source of truth)
├─ Change Streams
├─ WebSockets (real-time updates)
└─ Background Workers (AI / async jobs)




Monorepo Structure -

NexusSync/
├── apps/
│   ├── client/        # React + TypeScript (Vite)
│   └── server/        # Node.js + Express (TypeScript)
├── packages/
│   └── common/        # Shared domain contracts (types)
├── pnpm-workspace.yaml
├── package.json
└── README.md



Why a Monorepo?

Frontend, backend, and sync engine must agree on data shapes.

The packages/common module acts as a single source of truth for:
Tasks
Users
Workspaces
Sync operations
This prevents schema drift and runtime inconsistencies.




Tech Stack-


Frontend: 

React + TypeScript
Vite
Tailwind CSS
IndexedDB (via Dexie.js)
Web Workers


Backend:

Node.js + Express
MongoDB (Atlas)
Redis (presence, rate limiting)
WebSockets (Socket.io)
BullMQ (background jobs)




Tooling:

pnpm (monorepo & workspace management)
Shared TypeScript contracts
Environment-based configuration




Current Status -






The next phase focuses on:

backend spine (auth + workspaces)
persistent local data
sync correctness





Every layer is designed to be:
understandable
debuggable
extensible



No feature is added without understanding its impact on:

state
time
synchronization


UI will evolve.
Architecture will not be compromised.
