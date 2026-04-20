# NexusSync

> Offline-first collaborative task management engineered for unreliable networks.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-nexussync--client.vercel.app-blue?style=flat-square)](https://nexussync-client.vercel.app/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/atlas)

---

## Overview

Most productivity tools are designed for ideal conditions — stable internet, low latency, consistent connectivity. NexusSync is designed for the real world.

It implements a **local-first architecture** where every write hits a local IndexedDB store first, returning instant UI feedback with zero network dependency. A background sync engine then replicates operations to the server asynchronously, resolving conflicts and guaranteeing eventual consistency.

**Designed for:** Field teams, mobile users, low-bandwidth environments, and any workflow where a dropped connection shouldn't mean lost work.

---

## Features

- **True offline capability** — create, update, and delete tasks with no internet connection; all state persists locally via IndexedDB
- **Operation log (opLog) sync** — mutations are recorded as discrete, idempotent operations rather than object snapshots, enabling deterministic conflict resolution
- **Automatic reconnect sync** — the sync engine detects connectivity restoration and flushes the operation queue with exponential backoff and retry logic
- **Real-time multi-user collaboration** — WebSocket-driven live updates scoped per workspace, powered by MongoDB Change Streams
- **Last-Write-Wins conflict resolution** — concurrent edits are resolved deterministically using server-authoritative timestamps
- **Multi-tenant workspace isolation** — workspaces are fully isolated at the data and socket layers with role-based access control (OWNER / MEMBER)
- **JWT authentication with refresh token rotation** — HttpOnly cookie-based sessions with automatic token renewal
- **Structured error handling** — machine-readable error codes, Zod-validated DTOs, and request tracing throughout the API

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite |
| **State Management** | Zustand |
| **Local Persistence** | Dexie.js (IndexedDB abstraction) |
| **Real-time Client** | Socket.io-client |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | MongoDB (Mongoose), MongoDB Atlas |
| **Cache / Presence** | Redis (Upstash / Redis Cloud) |
| **Real-time Server** | Socket.io, MongoDB Change Streams |
| **Validation** | Zod |
| **Frontend Hosting** | Vercel |
| **Backend Hosting** | Render / Railway |

---

## Architecture

NexusSync uses a **client-authoritative write, server-authoritative truth** model:

```
┌────────────────────────────────────────┐
│              React Client              │
│                                        │
│  User Action → IndexedDB → UI Update  │  ← Zero-latency writes
│                    │                   │
│              opLog Entry               │  ← Operation recorded
│                    │                   │
│           Background Sync Engine       │  ← Retry + backoff
└────────────────────┬───────────────────┘
                     │  REST (push)
         ┌───────────▼───────────┐
         │    Express Backend    │
         │                       │
         │  Zod Validation       │
         │  Idempotency Check    │
         │  Service Layer        │
         └───────────┬───────────┘
                     │
              ┌──────▼──────┐
              │   MongoDB   │◄── Change Streams
              └──────┬──────┘
                     │  WebSocket broadcast
         ┌───────────▼───────────┐
         │   Socket.io Server    │
         │   (workspace-scoped)  │
         └───────────┬───────────┘
                     │  pullSync trigger
         ┌───────────▼───────────┐
         │   Client IndexedDB    │
         │   UI Re-renders       │
         └───────────────────────┘
```

**Write path:** All writes are local-first. The opLog captures each mutation as a discrete operation. The sync engine processes the queue in the background, making idempotent REST calls to the backend.

**Read path:** MongoDB Change Streams detect writes from any client. The server broadcasts a WebSocket event to all members of the affected workspace. Clients receive the trigger and run a `pullSync()` to fetch the diff, updating IndexedDB and re-rendering the UI.

**Offline path:** When no network is available, writes accumulate in the opLog. On reconnection, the sync engine resumes processing the queue in order, guaranteeing no operation is lost or duplicated.

---

## Key Engineering Highlights

**Idempotent Operations**
Every operation in the opLog carries a unique `operationId`. The backend checks this ID before processing, making all sync calls safe to retry without risk of duplicate mutations.

**Exponential Backoff with Retry**
The sync engine implements a capped exponential backoff strategy for failed sync attempts, preventing thundering herd scenarios after mass reconnections.

**WebSocket as Trigger, Not Data Carrier**
WebSocket events notify clients that new data is available — they do not carry payloads. Clients then pull the diff via REST. This prevents race conditions and keeps the real-time layer stateless.

**Debounced Pull Sync**
Rapid bursts of Change Stream events (e.g., a bulk import) are debounced on the client to avoid redundant network requests and IndexedDB thrash.

**Workspace-Scoped Socket Rooms**
Each WebSocket connection is joined to a workspace-specific room on authentication. Events are never broadcast outside tenant boundaries, satisfying multi-tenant isolation at the transport layer.

**Persistent opLog for Crash Recovery**
The operation log is stored in IndexedDB, not memory. A mid-session crash or browser refresh does not lose pending operations — they resume syncing on next load.

---

## Installation & Setup

### Prerequisites

- Node.js >= 18
- pnpm
- MongoDB Atlas cluster
- Redis instance (Upstash or Redis Cloud)

### Clone

```bash
git clone https://github.com/aryan-494/nexussync.git
cd nexussync
```

### Install Dependencies

```bash
pnpm install
```

### Run in Development

```bash
pnpm dev
```

This starts both the frontend (Vite) and backend (Express) in development mode.

---

## Environment Variables

Create `.env` files in both `apps/backend` and `apps/frontend`.

**Backend — `apps/backend/.env`**

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/nexussync
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
REDIS_URL=redis://your-redis-url
CLIENT_URL=http://localhost:5173
```

**Frontend — `apps/frontend/.env`**

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

---

## API Reference

All endpoints are prefixed with `/api/v1`. Authentication uses HttpOnly cookie sessions.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Create a new user account |
| `POST` | `/auth/login` | Authenticate and receive session cookie |
| `POST` | `/auth/refresh` | Rotate access token using refresh token |
| `POST` | `/auth/logout` | Invalidate session |
| `GET` | `/workspaces` | List workspaces for authenticated user |
| `POST` | `/workspaces` | Create a new workspace |
| `GET` | `/workspaces/:id/tasks` | Fetch all tasks in a workspace |
| `POST` | `/workspaces/:id/tasks` | Create a task |
| `PATCH` | `/workspaces/:id/tasks/:taskId` | Update a task |
| `DELETE` | `/workspaces/:id/tasks/:taskId` | Delete a task |
| `POST` | `/sync/push` | Push operation batch from client opLog |
| `GET` | `/sync/pull` | Pull latest state delta for a workspace |

All mutating endpoints accept an `X-Operation-Id` header for idempotency.

---

## Project Structure

```
nexussync/
├── apps/
│   ├── api/                         # Express backend
│   │   └── src/
│   │       ├── modules/             # Feature modules (vertical slice)
│   │       │   ├── sync/            # opLog push/pull endpoints
│   │       │   ├── task/            # Task CRUD
│   │       │   ├── users/           # User management
│   │       │   └── workspace/       # Workspace & membership
│   │       ├── realtime/            # WebSocket layer
│   │       │   ├── presence.ts      # Redis-backed online presence
│   │       │   ├── redis.ts         # Redis client & pub/sub
│   │       │   ├── socket.auth.ts   # Socket authentication middleware
│   │       │   ├── socket.events.ts # Event handlers & room logic
│   │       │   └── socket.server.ts # Socket.io server bootstrap
│   │       ├── routes/              # Route registration
│   │       ├── services/            # Shared service utilities
│   │       ├── types/               # Shared backend types
│   │       ├── utils/               # Helpers (logger, errors, etc.)
│   │       ├── app.ts               # Express app setup
│   │       ├── config.ts            # Environment & DB config
│   │       ├── context.ts           # Request context propagation
│   │       ├── errors.ts            # Structured error definitions
│   │       ├── logger.ts            # Structured logger
│   │       └── server.ts            # Entry point & graceful shutdown
│   │
│   └── client/                      # React + Vite frontend
│       └── src/
│           ├── api/                 # HTTP client wrappers
│           │   ├── auth.api.ts
│           │   ├── http.ts          # Axios instance + interceptors
│           │   ├── task.api.ts
│           │   └── workspace.api.ts
│           ├── components/
│           │   └── SyncStatusIndicator.tsx  # Live sync state UI
│           ├── contexts/
│           │   ├── AuthContext.tsx
│           │   └── WorkspaceContext.tsx
│           ├── local/               # Offline-first core
│           │   ├── hooks/
│           │   │   └── useTasksLocal.ts     # IndexedDB-backed task hook
│           │   ├── hydration/
│           │   │   └── hydrateWorkspace.ts  # Initial pull on load
│           │   ├── repositories/
│           │   │   └── taskRepository.ts    # Dexie CRUD abstraction
│           │   └── sync/
│           │       ├── syncEngine.ts        # Core push/pull orchestrator
│           │       ├── syncMetaRepo.ts      # opLog metadata store
│           │       └── syncState.ts         # Sync status state machine
│           ├── pages/               # Route-level page components
│           │   ├── Login.tsx
│           │   ├── Me.tsx
│           │   ├── Register.tsx
│           │   ├── TaskPage.tsx
│           │   └── WorkspaceListPage.tsx
│           ├── realtime/
│           │   └── socket.ts        # Socket.io client + event binding
│           ├── routes/              # React Router configuration
│           ├── types/               # Shared frontend types
│           ├── db.ts                # Dexie database schema definition
│           └── main.tsx             # App entry point
```

---

## Deployment

**Frontend** is deployed on [Vercel](https://vercel.com) with automatic deployments from the `main` branch.

**Backend** is deployed on [Render](https://render.com) as a containerized Node.js service.

**Database** is hosted on [MongoDB Atlas](https://www.mongodb.com/atlas) with Change Streams enabled (requires a replica set — Atlas M0+ satisfies this).

**Redis** is provisioned via [Upstash](https://upstash.com) for the presence and caching layer.

> Live instance: [nexussync-client.vercel.app](https://nexussync-client.vercel.app/)

---

## Demo



**Suggested walkthrough:**

1. Create tasks while online
2. Disconnect from the network
3. Create additional tasks — they persist immediately in the UI
4. Refresh the page — offline tasks survive the reload
5. Reconnect — the sync engine flushes the opLog automatically
6. Open a second browser tab — observe real-time updates propagate instantly

---

## Future Improvements

- **CRDT-based conflict resolution** — replace Last-Write-Wins with a Conflict-free Replicated Data Type for richer concurrent editing semantics
- **Multi-device session coordination** — sync opLog state across devices under the same account
- **Selective sync** — allow clients to subscribe to specific workspace subtrees to reduce pull payload size
- **Observability** — structured logging, distributed tracing (OpenTelemetry), and a metrics dashboard
- **AI task classification** — auto-categorize and prioritize tasks using an LLM layer

---

## Contributing

Contributions are welcome. Please open an issue to discuss proposed changes before submitting a pull request.

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit using conventional commits: `git commit -m "feat: add X"`
4. Push and open a pull request against `main`

---

## License

MIT © [Aryan Mishra](https://github.com/aryan-494)

---

<p align="center">
  Built to work reliably in imperfect real-world conditions — not just ideal ones.
</p>
