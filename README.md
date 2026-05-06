```
 ██████╗██╗  ██╗██████╗  ██████╗ ███╗   ██╗ ██████╗ ███████╗
██╔════╝██║  ██║██╔══██╗██╔═══██╗████╗  ██║██╔═══██╗██╔════╝
██║     ███████║██████╔╝██║   ██║██╔██╗ ██║██║   ██║███████╗
██║     ██╔══██║██╔══██╗██║   ██║██║╚██╗██║██║   ██║╚════██║
╚██████╗██║  ██║██║  ██║╚██████╔╝██║ ╚████║╚██████╔╝███████║
 ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝ ╚══════╝
```

<div align="center">

**Distributed Task Orchestrator** — *Execute once. Recover always. Scale forever.*

[![Java](https://img.shields.io/badge/Java_21-ED8B00?style=flat-square&logo=openjdk&logoColor=white)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot_3-6DB33F?style=flat-square&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io/)
[![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Render](https://img.shields.io/badge/Deployed_on-Render-46E3B7?style=flat-square&logo=render&logoColor=white)](https://render.com/)

</div>

---

## The Problem

> In a distributed system, if three nodes all wake up at 9:00 AM to run a scheduled job — **who fires it?**
>
> Without coordination: all three do. You get triple billing, triple emails, triple chaos.
>
> **Chronos was built to make that impossible.**

It solves the **Double Execution** problem using a two-layer locking strategy that guarantees exactly-once task execution across any number of nodes — even under partial failure.

---

## How It Works

```
  ┌─────────────────────────────────────────────────────────────┐
  │                   CHRONOS RUNTIME                           │
  │                                                             │
  │   Node A ──┐                                                │
  │            ├──▶  REDIS LOCK  ──▶  [ LEADER ELECTED ]       │
  │   Node B ──┤     (Lettuce)         │                        │
  │            │                       ▼                        │
  │   Node C ──┘              SCHEDULER FIRES QUERY             │
  │                                    │                        │
  │                                    ▼                        │
  │                    ┌───────────────────────────┐            │
  │                    │   PostgreSQL Task Queue    │            │
  │                    │   FOR UPDATE SKIP LOCKED   │            │
  │                    │                           │            │
  │   Worker ─────────▶│  task_1  [ LOCKED  ]  ◀─ Worker 1     │
  │   Worker ─────────▶│  task_2  [ LOCKED  ]  ◀─ Worker 2     │
  │   Worker ─────────▶│  task_3  [ PENDING ]  ◀─ Worker 3     │
  │                    └───────────────────────────┘            │
  │                                    │                        │
  │                    ┌───────────────▼───────────┐            │
  │                    │   JANITOR SERVICE          │            │
  │                    │   Recovers zombie tasks    │            │
  │                    │   stuck in RUNNING state   │            │
  │                    └───────────────────────────┘            │
  └─────────────────────────────────────────────────────────────┘
```

**Layer 1 — The Scheduler Lock:** Only one node may query the database at any given time. Redis (via Lettuce) elects a single leader. All other nodes stand by silently.

**Layer 2 — The Row Lock:** When a worker picks up a task, PostgreSQL locks that row with `FOR UPDATE SKIP LOCKED`. Other workers skip it entirely — no contention, no collisions.

---

## Core Features

| | Feature | Detail |
|---|---|---|
| 🔐 | **Leader Election** | Redis-backed distributed lock via Lettuce ensures a single scheduler node |
| ⚡ | **Concurrent Workers** | `FOR UPDATE SKIP LOCKED` lets multiple workers drain the queue without blocking |
| 🔁 | **Exponential Backoff** | Failed tasks retry at 30s → 60s → 120s → ... with configurable max attempts |
| 🧟 | **Zombie Recovery** | Janitor service auto-heals tasks stuck in `RUNNING` after a node crash |
| 📡 | **Live Dashboard** | React + Vite UI polls task status, retries, and next-run times in real time |

---

## Tech Stack

```
Backend    Java 21 · Spring Boot 3.x · Spring Data JPA
Frontend   React.js · Vite · Tailwind CSS
Database   PostgreSQL  ──  Neon.tech
Cache      Redis       ──  Upstash
Deploy     Render
```

---

## Getting Started

### Prerequisites

- JDK 21
- Node.js v18+
- A PostgreSQL instance — [Neon](https://neon.tech) (free tier works)
- A Redis instance — [Upstash](https://upstash.com) (free tier works)

### Environment Variables

```properties
# application.properties
DB_URL=your_postgres_connection_url
DB_USER=your_db_user
DB_PASSWORD=your_db_password

REDIS_HOST=your_redis_host
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
```

### Run

```bash
# Backend
mvn spring-boot:run

# Frontend
cd chronos-ui
npm install
npm run dev
```

Dashboard available at `http://localhost:5173`

---

## Retry Behaviour

When a task fails, Chronos does not retry immediately. It backs off exponentially to avoid thundering herd:

```
Attempt 1  ──▶  fails  ──▶  wait  30s  ──▶  retry
Attempt 2  ──▶  fails  ──▶  wait  60s  ──▶  retry
Attempt 3  ──▶  fails  ──▶  wait 120s  ──▶  retry
Attempt N  ──▶  fails  ──▶  marked DEAD
```

This is fully configurable per-task via `maxAttempts`.

---

## Roadmap

```
[✓]  Redis leader election
[✓]  Exponential backoff retries
[✓]  Real-time React dashboard
[ ]  Cron expression support  ( "0 0 * * *" )
[ ]  Webhook alerts on task failure
[ ]  Docker + Compose setup
```

---

<div align="center">
<sub>Built with a bias for correctness over convenience.</sub>
</div>