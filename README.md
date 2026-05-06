# 🖥️ BetterStack Clone — Website Uptime Monitor

A full-stack, production-inspired clone of [BetterStack](https://betterstack.com/) built as a portfolio project. Monitor the availability and response time of any website in real-time using a distributed worker architecture, Redis Streams for messaging, and a slick Next.js dashboard.

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure sign-up / sign-in with token-based auth
- 🌐 **Website Monitoring** — Add any URL and start tracking its uptime instantly
- ⚡ **Real-time Status** — Workers poll every 20 seconds and persist results to PostgreSQL
- 📊 **Dashboard** — View uptime %, response times, and per-site status at a glance
- 🔁 **Auto-Refresh UI** — Dashboard auto-refreshes every 30 seconds without a page reload
- 🗂️ **Region-aware Workers** — Each worker registers itself with a configurable region ID
- 📬 **Redis Streams Pusher** — A dedicated service that queues websites for monitoring every 3 minutes
- 🏗️ **Monorepo** — Turborepo workspace with shared packages for the DB client and Redis client

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15, React 19, Tailwind CSS v4, shadcn/ui |
| **Backend API** | Express.js v5, TypeScript, Zod, JWT |
| **Worker** | Node.js / Bun, Axios |
| **Database** | PostgreSQL (via [Neon](https://neon.tech/)) + Prisma ORM |
| **Messaging** | Redis Streams |
| **Monorepo** | Turborepo + Bun workspaces |
| **Language** | TypeScript throughout |

---

## 🗂️ Project Structure

```
betterstackclone/
├── apps/
│   ├── fe/          # Next.js 15 frontend (landing page + dashboard)
│   ├── api/         # Express REST API (auth + website management)
│   ├── worker/      # Uptime monitoring worker (polls every 20s)
│   └── pusher/      # Redis Streams feeder (runs every 3 min)
│
└── packages/
    ├── store/       # Prisma client + schema (shared DB access)
    ├── redisstream/ # Redis Streams client wrapper
    ├── ui/          # Shared React component library
    ├── eslint-config/
    ├── tailwind-config/
    └── typescript-config/
```

---

## ⚙️ Architecture

```
┌─────────────┐      JWT       ┌─────────────────┐
│  Next.js FE │ ─────────────▶ │   Express API    │
│  (port 3000)│ ◀───────────── │   (port 3001)    │
└─────────────┘                └────────┬────────┘
                                        │ Prisma
                                        ▼
                               ┌─────────────────┐
                               │   PostgreSQL     │
                               │   (Neon cloud)   │
                               └────────▲────────┘
                                        │ Prisma
                          ┌─────────────┴──────────────┐
                          │                            │
                ┌─────────────────┐       ┌─────────────────┐
                │     Worker      │       │     Pusher      │
                │  (polls every   │       │ (feeds Redis    │
                │    20 seconds)  │       │  every 3 min)   │
                └─────────────────┘       └────────┬────────┘
                                                   │
                                         ┌─────────▼────────┐
                                         │  Redis Streams    │
                                         └──────────────────┘
```

1. The **Pusher** service fetches all registered websites from the DB and pushes them onto a Redis Stream.
2. The **Worker** reads from the stream, pings each URL with Axios, records the response time and `Up`/`Down` status to PostgreSQL, and repeats every 20 seconds.
3. The **API** serves the React frontend: it handles auth and exposes `/websites`, `/website`, and `/status/:websiteId` endpoints.
4. The **Frontend** fetches live status data and displays uptime metrics, response times, and historical ticks.

---

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) ≥ 1.2 or Node.js ≥ 18
- [Redis](https://redis.io/) running locally (`redis-server`)
- A PostgreSQL database (local or [Neon](https://neon.tech/))

### 1. Clone & Install

```bash
git clone https://github.com/your-username/betterstackclone.git
cd betterstackclone
bun install
```

### 2. Configure Environment Variables

**`packages/store/.env`** (Database)
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
```

**`apps/api/.env`** (API)
```env
PORT=3001
JWT_SECRET=your_super_secret_key
```

**`apps/worker/.env`** (Worker)
```env
REGION_ID=us-east-1
WORKER_ID=worker-1
DATABASE_URL="postgresql://..."   # same as store
```

### 3. Run Database Migrations

```bash
cd packages/store
bunx prisma migrate dev
```

### 4. Start All Services

```bash
# From the repo root — starts fe, api, worker, and pusher concurrently
bun run dev
```

Or start services individually:

```bash
# Frontend
cd apps/fe && bun run dev

# API
cd apps/api && bun run index.ts

# Worker
cd apps/worker && bun run index.ts

# Pusher
cd apps/pusher && bun run index.ts
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Database Schema

| Model | Description |
|---|---|
| `user` | Registered users (username + password) |
| `website` | URLs being monitored, linked to a user |
| `region` | Monitoring regions (e.g. `us-east-1`) |
| `website_tick` | Individual check results: status (`Up`/`Down`), response time, timestamp |

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/user/signup` | ❌ | Create a new account |
| `POST` | `/user/signin` | ❌ | Sign in and receive a JWT |
| `GET` | `/websites` | ✅ | List all monitored websites |
| `POST` | `/website` | ✅ | Add a new website to monitor |
| `GET` | `/status/:websiteId` | ✅ | Get last 10 ticks for a website |

All protected routes require `Authorization: Bearer <token>`.

---

## 📦 Monorepo Scripts

Run from the repo root:

```bash
bun run dev          # Start all apps in dev mode
bun run build        # Build all apps
bun run lint         # Lint all packages
bun run check-types  # Type-check all packages
bun run format       # Format with Prettier
```

---

## 🔮 Future Improvements

- [ ] Email / SMS alerting when a site goes down
- [ ] Multi-region distributed workers
- [ ] Public status pages per website
- [ ] Historical uptime graphs (30d / 90d)
- [ ] Webhook integrations (Slack, PagerDuty)
- [ ] Docker Compose setup for one-command local start

---

## 📄 License

MIT — feel free to use this as inspiration for your own projects.
