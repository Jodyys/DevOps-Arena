# Implementation Plan for DevOps Arena — MVP (Revised)

## 1. Overview

This implementation plan covers **Sprint 1 — MVP** for DevOps Arena.

The goal is to build a clean application foundation that can later be extended into:

```text
Application
    ↓
Docker
    ↓
Kubernetes
    ↓
CI/CD
    ↓
GitOps
    ↓
ArgoCD
    ↓
Prometheus / Grafana
    ↓
Incident Simulation
```

The MVP should therefore not only "work", but also establish production-oriented application structure from the beginning.

---

# 2. MVP Scope

Sprint 1 focuses on:

- Next.js frontend
- Node.js + Express backend
- PostgreSQL
- Redis
- Authentication
- User progress
- Levels
- Missions
- Score / XP
- Basic API validation
- Error handling
- Health checks
- Logging
- Basic automated tests
- Docker Compose for local development
- Git repository
- Documentation

The following are intentionally postponed:

- Kubernetes
- ArgoCD
- GitOps
- Prometheus
- Grafana
- Elasticsearch / Kibana
- Cloud deployment
- Production incident simulation

Those will be implemented in later sprints.

---

# 3. Technology Stack

## Frontend

```text
Next.js
React
```

Recommended:

```text
Next.js App Router
```

## Backend

```text
Node.js
Express
```

Supporting libraries:

```text
pg
redis
bcrypt
jsonwebtoken
cors
zod
pino
pino-http
```

## Database

```text
PostgreSQL
```

## Cache

```text
Redis
```

## Local Infrastructure

```text
Docker
Docker Compose
```

## Version Control

```text
Git
GitHub
```

---

# 4. Repository Strategy

Use a **monorepo**.

```text
devops-arena/
├── frontend/
├── backend/
├── database/
├── docs/
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

Initialize Git from the beginning:

```bash
git init
```

Initial commit:

```bash
git add .
git commit -m "chore: initialize devops arena"
```

---

# 5. Environment Configuration

Environment variables must not be hardcoded.

Create:

```text
.env
.env.example
```

## Root `.env.example`

```env
POSTGRES_DB=devops_arena
POSTGRES_USER=devops_arena
POSTGRES_PASSWORD=change-me
POSTGRES_PORT=5432

REDIS_PORT=6379

BACKEND_PORT=4000
FRONTEND_PORT=3000

DATABASE_URL=postgresql://devops_arena:change-me@postgres:5432/devops_arena
REDIS_URL=redis://redis:6379

JWT_SECRET=change-me
JWT_EXPIRES_IN=1d

FRONTEND_URL=http://localhost:3000
```

Never commit:

```text
.env
```

Commit only:

```text
.env.example
```

---

# 6. Docker Compose

The local environment should contain:

```text
Frontend
Backend
PostgreSQL
Redis
```

Architecture:

```text
                 Docker Compose
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
    Frontend       Backend       PostgreSQL
    Next.js        Express           │
        │             │              │
        └─────────────┼──────────────┘
                      │
                     Redis
```

## Required services

```yaml
services:
  frontend:
  backend:
  postgres:
  redis:
```

## PostgreSQL

Requirements:

- persistent volume
- healthcheck
- environment variables

Example healthcheck:

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U devops_arena -d devops_arena"]
  interval: 5s
  timeout: 5s
  retries: 5
```

## Redis

Requirements:

- persistent volume
- healthcheck

Example:

```yaml
healthcheck:
  test: ["CMD", "redis-cli", "ping"]
  interval: 5s
  timeout: 5s
  retries: 5
```

This introduces an important DevOps concept:

```text
Container Running
        ≠
Application Healthy
```

---

# 7. Backend Architecture

The backend should not put all logic directly inside route files.

Recommended structure:

```text
backend/
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── levelController.js
│   │   └── missionController.js
│   │
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validation.js
│   │
│   ├── routes/
│   │   ├── auth.js
│   │   ├── levels.js
│   │   └── missions.js
│   │
│   ├── services/
│   │   ├── authService.js
│   │   ├── levelService.js
│   │   └── missionService.js
│   │
│   ├── validators/
│   │   ├── authValidator.js
│   │   └── missionValidator.js
│   │
│   ├── db.js
│   ├── redis.js
│   └── index.js
│
├── tests/
├── Dockerfile
├── package.json
└── .env.example
```

Flow:

```text
HTTP Request
     ↓
Middleware
     ↓
Validation
     ↓
Controller
     ↓
Service
     ↓
Database / Redis
     ↓
Response
```

This separation makes the application easier to test and maintain.

---

# 8. Backend Dependencies

Recommended dependencies:

```text
express
pg
redis
bcrypt
jsonwebtoken
cors
zod
pino
pino-http
```

Development dependencies:

```text
nodemon
jest
supertest
```

---

# 9. Health Check

Add:

```http
GET /health
```

Example response:

```json
{
  "success": true,
  "status": "ok",
  "service": "devops-arena-backend",
  "dependencies": {
    "postgres": "healthy",
    "redis": "healthy"
  }
}
```

The endpoint should verify:

```text
Backend
PostgreSQL
Redis
```

This endpoint will later be reused by Kubernetes:

```text
livenessProbe
readinessProbe
```

---

# 10. API Response Standard

All APIs should use a consistent response format.

## Success

```json
{
  "success": true,
  "data": {}
}
```

## List

```json
{
  "success": true,
  "data": []
}
```

## Error

```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

This prevents different endpoints from returning inconsistent formats.

---

# 11. Error Handling

Create:

```text
backend/src/middleware/errorHandler.js
```

The application should handle:

```text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
500 Internal Server Error
```

Example:

```json
{
  "success": false,
  "message": "Level not found"
}
```

Do not expose internal stack traces in production responses.

---

# 12. Request Validation

Use:

```text
Zod
```

Example registration validation:

```text
username:
- required
- minimum length

email:
- required
- valid email

password:
- required
- minimum 8 characters
```

Invalid input should return:

```http
400 Bad Request
```

---

# 13. Authentication

Required endpoints:

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

Flow:

```text
Register
   ↓
Hash password
   ↓
Store user
```

Login:

```text
Login
  ↓
Verify password
  ↓
Create session/token
  ↓
Authenticated user
```

For the MVP, use JWT-based authentication with a secure HTTP-only cookie where practical.

Do not store plaintext passwords.

Use:

```text
bcrypt
```

for password hashing.

---

# 14. Authentication Middleware

Protected APIs should require authentication.

Example:

```text
GET /api/auth/me
GET /api/levels
GET /api/missions/:id
POST /api/missions/:id/start
POST /api/missions/:id/submit
```

Flow:

```text
Request
  ↓
Auth Middleware
  ↓
Valid Token?
  ├── No  → 401
  └── Yes
       ↓
    Controller
```

---

# 15. CORS

Frontend:

```text
http://localhost:3000
```

Backend:

```text
http://localhost:4000
```

Configure CORS using:

```env
FRONTEND_URL=http://localhost:3000
```

Do not use unrestricted:

```javascript
origin: "*"
```

for authenticated application traffic.

---

# 16. Logging

Add structured logging using:

```text
Pino
pino-http
```

Example:

```text
GET /api/levels 200 32ms
POST /api/auth/login 200 124ms
GET /api/missions/1 401 4ms
```

The application should log:

- HTTP method
- route
- status code
- response time
- error details when appropriate

Never log:

- passwords
- JWT tokens
- database passwords
- sensitive secrets

These logs can later be shipped to:

```text
Elasticsearch
Kibana
```

---

# 17. Database Architecture

Use PostgreSQL.

Recommended structure:

```text
database/
├── migrations/
│   ├── 001_create_users.sql
│   ├── 002_create_levels.sql
│   ├── 003_create_missions.sql
│   ├── 004_create_attempts.sql
│   ├── 005_create_achievements.sql
│   └── 006_create_user_achievements.sql
│
├── seed.sql
└── init.sql
```

For the initial MVP, `init.sql` can bootstrap the database.

As the project evolves, use migrations as the primary schema-management mechanism.

---

# 18. Database Schema

## users

```text
id
username
email
password_hash
total_xp
created_at
updated_at
```

Constraints:

```text
username UNIQUE
email UNIQUE
```

---

## levels

```text
id
name
description
difficulty
category
xp_reward
is_active
created_at
```

Example:

```text
1 | Docker Basics
2 | Docker Compose
3 | Kubernetes Deployment
4 | Kubernetes Service
5 | Kubernetes Secret
...
```

---

## missions

```text
id
level_id
title
description
objective
difficulty
solution
created_at
```

Relationship:

```text
Level
  │
  ├── Mission
  ├── Mission
  └── Mission
```

---

## attempts

```text
id
user_id
mission_id
status
score
duration
created_at
```

Status:

```text
started
failed
completed
```

---

## achievements

```text
id
name
description
icon
created_at
```

---

## user_achievements

```text
id
user_id
achievement_id
unlocked_at
```

---

# 19. Database Seed

Create initial game data.

Example:

```text
Level 1
Docker Basics

Mission 1:
Fix the Dockerfile

Mission 2:
Reduce Docker Image Size
```

Level 2:

```text
Docker Compose

Mission 1:
Fix Database Connection

Mission 2:
Fix Redis Connection
```

The MVP should have enough seed data to test the complete user flow.

---

# 20. Redis Usage

Redis will initially be used for:

```text
Session / temporary state
Caching
Leaderboard preparation
Rate limiting preparation
```

For MVP, keep Redis usage simple.

Example:

```text
GET /api/leaderboard
        ↓
Redis cache
        ↓
PostgreSQL fallback
```

Later Redis can support real-time leaderboard and temporary challenge state.

---

# 21. Frontend Architecture

Recommended:

```text
frontend/
├── src/
│   ├── app/
│   │   ├── login/
│   │   ├── register/
│   │   ├── dashboard/
│   │   ├── levels/
│   │   └── missions/
│   │
│   ├── components/
│   ├── lib/
│   │   └── api.js
│   │
│   └── services/
│       ├── auth.js
│       ├── levels.js
│       └── missions.js
│
├── Dockerfile
├── package.json
└── .env.example
```

---

# 22. Frontend Pages

MVP pages:

```text
/login
/register
/dashboard
/levels
/levels/:id
/missions/:id
```

## Login

User enters:

```text
Email
Password
```

Then:

```text
Login
  ↓
Authenticated
  ↓
Dashboard
```

---

# 23. Dashboard

Display:

```text
Username
Total XP
Completed Levels
Completed Missions
Achievements
Current Progress
```

Example:

```text
DEVOPS ARENA

Player:
devin

XP:
1,250

Progress:
3 / 10 Levels

Achievements:
2 / 10

Current Mission:
Kubernetes Deployment
```

---

# 24. Level List

Display:

```text
Level 1
Docker Basics
Difficulty: Easy
Status: Completed

Level 2
Docker Compose
Difficulty: Easy
Status: In Progress

Level 3
Kubernetes Deployment
Difficulty: Medium
Status: Locked
```

Level unlocking can initially be sequential.

---

# 25. Mission View

Example:

```text
Kubernetes Deployment

Mission:
Backend is experiencing ImagePullBackOff.

Objective:
Identify and fix the incorrect Docker image.

Environment:
Kubernetes

Hint:
Check the image name and tag.

[ Start Mission ]
```

The MVP does not need a real Kubernetes environment yet.

Mission validation can initially be simulated by backend game logic.

---

# 26. Mission Submission

API:

```http
POST /api/missions/:id/start
```

and:

```http
POST /api/missions/:id/submit
```

Example submission:

```json
{
  "answer": "jodyys/devops-arena-backend:v1"
}
```

Backend validates the answer.

Response:

```json
{
  "success": true,
  "data": {
    "status": "completed",
    "score": 1000,
    "xp": 1000
  }
}
```

---

# 27. Scoring

Basic formula:

```text
Final Score =
Base XP
+ Speed Bonus
+ First Attempt Bonus
- Hint Penalty
- Failed Attempt Penalty
```

For MVP, keep scoring simple:

```text
Correct answer:
+100 XP

Wrong answer:
-25 XP

Use hint:
-10 XP
```

The scoring engine can be expanded later.

---

# 28. API Endpoints

## Health

```http
GET /health
```

## Authentication

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

## Users

```http
GET /api/users/me
GET /api/users/me/progress
```

## Levels

```http
GET /api/levels
GET /api/levels/:id
```

## Missions

```http
GET  /api/missions/:id
POST /api/missions/:id/start
POST /api/missions/:id/submit
```

## Leaderboard

```http
GET /api/leaderboard
```

## Achievements

```http
GET /api/achievements
GET /api/users/me/achievements
```

---

# 29. API Testing

Use:

```text
curl
Postman
```

or automated tests with:

```text
Jest
Supertest
```

Minimum automated tests:

```text
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
GET /api/levels
GET /api/levels/:id
GET /api/missions/:id
POST /api/missions/:id/start
POST /api/missions/:id/submit
GET /health
```

Test important status codes:

```text
200
201
400
401
404
409
500
```

---

# 30. Backend Dockerfile

Backend should be containerized during Sprint 1 rather than postponing containerization completely.

Goals:

```text
npm install
npm test
npm start
```

The container should:

- use a supported Node.js LTS image
- run as a non-root user where practical
- expose port 4000
- use environment variables
- avoid copying `.env`
- support health checking

---

# 31. Frontend Dockerfile

Frontend should also have a Dockerfile.

Goals:

```text
npm install
npm build
npm start
```

Use a production-oriented build where practical.

The image should:

- use a supported Node.js LTS image
- avoid development-only dependencies in the final runtime image where practical
- use environment configuration
- avoid embedding secrets

---

# 32. `.gitignore`

Required:

```gitignore
node_modules/
.env
.env.*
!.env.example

.next/
dist/
coverage/

*.log

.DS_Store
```

---

# 33. README

Create the README from the beginning.

Required sections:

```text
# DevOps Arena

## Overview
## Architecture
## Tech Stack
## Project Structure
## Prerequisites
## Environment Variables
## Local Development
## Docker Compose
## Database
## API
## Testing
## Troubleshooting
## Roadmap
```

---

# 34. Local Development Flow

## Step 1 — Clone

```bash
git clone <repository>
cd devops-arena
```

## Step 2 — Configure environment

```bash
cp .env.example .env
```

Update values as needed.

## Step 3 — Start infrastructure

```bash
docker compose up -d postgres redis
```

Check:

```bash
docker compose ps
```

Expected:

```text
postgres    healthy
redis       healthy
```

## Step 4 — Start backend

```bash
cd backend
npm install
npm run dev
```

Backend:

```text
http://localhost:4000
```

Health:

```text
http://localhost:4000/health
```

## Step 5 — Start frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:3000
```

---

# 35. Full Docker Compose Development

After individual services work, run the complete stack:

```bash
docker compose up -d --build
```

Check:

```bash
docker compose ps
```

Logs:

```bash
docker compose logs -f backend
```

Stop:

```bash
docker compose down
```

Stop without deleting persistent volumes:

```bash
docker compose down
```

Remove volumes only when intentionally resetting the development database:

```bash
docker compose down -v
```

---

# 36. Verification Plan

## Infrastructure

- [ ] PostgreSQL starts
- [ ] Redis starts
- [ ] PostgreSQL healthcheck passes
- [ ] Redis healthcheck passes
- [ ] Database data persists
- [ ] Environment variables load correctly

## Backend

- [ ] Backend starts
- [ ] `/health` returns 200
- [ ] PostgreSQL connection works
- [ ] Redis connection works
- [ ] Registration works
- [ ] Login works
- [ ] `/me` works
- [ ] Protected routes reject unauthenticated users
- [ ] Validation works
- [ ] Error handling works
- [ ] Logging works

## Frontend

- [ ] Login page works
- [ ] Register page works
- [ ] Dashboard works
- [ ] Level list works
- [ ] Mission page works
- [ ] Authentication state works
- [ ] Protected pages redirect unauthenticated users
- [ ] API integration works

## Game

- [ ] Levels load
- [ ] Missions load
- [ ] Mission can be started
- [ ] Mission can be submitted
- [ ] Correct answer gives XP
- [ ] Wrong answer is rejected
- [ ] Attempts are recorded
- [ ] User progress updates

## Tests

- [ ] Authentication tests
- [ ] Level API tests
- [ ] Mission API tests
- [ ] Health check test
- [ ] Error response tests

## Docker

- [ ] Frontend image builds
- [ ] Backend image builds
- [ ] Full Docker Compose stack starts
- [ ] Frontend can reach backend
- [ ] Backend can reach PostgreSQL
- [ ] Backend can reach Redis

---

# 37. Sprint 1 Definition of Done

Sprint 1 is complete when:

```text
Git
☑ Repository initialized
☑ .gitignore configured
☑ Initial README available

Frontend
☑ Next.js application works
☑ Login page works
☑ Register page works
☑ Dashboard works
☑ Level list works
☑ Mission page works

Backend
☑ Express API works
☑ Authentication implemented
☑ JWT/session implemented
☑ Protected routes implemented
☑ Validation implemented
☑ Error handling implemented
☑ Logging implemented
☑ Health endpoint implemented

Database
☑ PostgreSQL works
☑ Schema created
☑ Seed data available
☑ User data persists
☑ Game progress persists

Redis
☑ Redis connection works
☑ Basic caching/session use implemented

Docker
☑ PostgreSQL container
☑ Redis container
☑ Backend container
☑ Frontend container
☑ Docker Compose works

Testing
☑ API tests available
☑ Authentication tested
☑ Mission flow tested
☑ Health endpoint tested

Documentation
☑ README complete
☑ Architecture documented
☑ Local setup documented
```

---

# 38. Sprint 2 — Docker & Containerization

After MVP is stable:

```text
Application
    ↓
Dockerfile optimization
    ↓
Docker Compose
    ↓
Container Registry
```

Tasks:

- [ ] Multi-stage Docker builds
- [ ] Image optimization
- [ ] Non-root containers
- [ ] Image tagging
- [ ] Docker Hub / registry
- [ ] Container security scanning

---

# 39. Sprint 3 — Kubernetes

Tasks:

- [ ] Namespace
- [ ] Deployment
- [ ] Service
- [ ] ConfigMap
- [ ] Secret
- [ ] PVC
- [ ] Ingress
- [ ] Resource requests
- [ ] Resource limits
- [ ] Readiness probe
- [ ] Liveness probe
- [ ] Rolling deployment

---

# 40. Sprint 4 — CI/CD

Pipeline:

```text
Git Push
    ↓
Checkout
    ↓
Lint
    ↓
Unit Test
    ↓
Build
    ↓
Docker Build
    ↓
Security Scan
    ↓
Push Image
```

---

# 41. Sprint 5 — GitOps

Architecture:

```text
Application Repository
        ↓
CI
        ↓
Container Registry
        ↓
GitOps Repository
        ↓
ArgoCD
        ↓
Kubernetes
```

Tasks:

- [ ] GitOps repository
- [ ] ArgoCD installation
- [ ] ArgoCD Application
- [ ] Automated sync
- [ ] Rollback
- [ ] Self-healing

---

# 42. Sprint 6 — Observability

Monitoring:

```text
Prometheus
Grafana
```

Metrics:

```text
CPU
Memory
Pod count
Pod restarts
HTTP requests
HTTP errors
Latency
Database connections
Redis connections
```

Logging can later be extended to:

```text
Elasticsearch
Kibana
```

---

# 43. Sprint 7 — DevOps Incident Simulation

Introduce real DevOps challenges:

```text
ImagePullBackOff
CrashLoopBackOff
CreateContainerConfigError
Pending Pod
OOMKilled
Service selector mismatch
Wrong container port
Wrong Service port
Ingress misconfiguration
Missing Secret
Wrong ConfigMap
Database connection refused
Redis connection timeout
PVC Pending
Readiness Probe failed
Liveness Probe failed
High CPU
High memory
Deployment rollout stuck
ArgoCD OutOfSync
CI pipeline failed
Registry authentication failed
```

At this stage, the game moves from simulated answers toward real infrastructure interaction.

---

# 44. Long-Term Architecture

Final target:

```text
                           User
                            │
                            ▼
                         Ingress
                            │
                            ▼
                        Frontend
                            │
                            ▼
                         Backend
                       /    |    \
                      /     |     \
                     ▼      ▼      ▼
               PostgreSQL Redis Game Engine

                    Kubernetes
                         │
             ┌───────────┼───────────┐
             ▼           ▼           ▼
         Prometheus   Grafana     Logging


Developer
    │
    ▼
GitHub
    │
    ▼
CI Pipeline
    │
    ├── Test
    ├── Build
    ├── Scan
    └── Push Image
              │
              ▼
       Container Registry
              │
              ▼
          GitOps Repo
              │
              ▼
            ArgoCD
              │
              ▼
         Kubernetes
```

---

# 45. Implementation Principles

Follow these principles throughout the project:

### 1. Build simple first

Do not implement every DevOps feature in Sprint 1.

### 2. Production-oriented structure

Even though this is a learning project, use:

```text
Environment variables
Validation
Error handling
Logging
Testing
Health checks
Authentication
```

from the beginning.

### 3. Containerize early

The application should be designed so that:

```text
npm run dev
```

and:

```text
docker compose up
```

both work.

### 4. Keep DevOps stages incremental

Do not jump directly to Kubernetes.

Recommended:

```text
Application
   ↓
Docker
   ↓
Docker Compose
   ↓
Kubernetes
   ↓
CI
   ↓
GitOps
   ↓
ArgoCD
   ↓
Monitoring
   ↓
Incident Simulation
```

### 5. Every failure should become a learning opportunity

The eventual goal is not just:

```text
Application is Running
```

but:

```text
Application is Running
        ↓
Something breaks
        ↓
Observe
        ↓
Investigate
        ↓
Identify root cause
        ↓
Fix
        ↓
Deploy
        ↓
Verify
        ↓
Monitor
```

---

# 46. Final Sprint 1 Flow

The complete MVP flow should be:

```text
User
 │
 ▼
Register
 │
 ▼
Login
 │
 ▼
Dashboard
 │
 ▼
Level List
 │
 ▼
Mission
 │
 ▼
Start Mission
 │
 ▼
Submit Answer
 │
 ▼
Backend Validation
 │
 ├── Wrong
 │     ↓
 │   Failed Attempt
 │
 └── Correct
       ↓
     Score
       ↓
      XP
       ↓
  Update Progress
       ↓
 Unlock Next Level
```

Once this flow works reliably, Sprint 1 is considered complete.

---

# 47. Next Step

Do not start Kubernetes yet.

The recommended implementation order is:

```text
1. Initialize Git repository
2. Create monorepo structure
3. Create Docker Compose
4. Setup PostgreSQL
5. Setup Redis
6. Build Express backend
7. Build database schema
8. Add seed data
9. Implement authentication
10. Implement level API
11. Implement mission API
12. Implement scoring
13. Build Next.js frontend
14. Connect frontend to API
15. Add validation
16. Add error handling
17. Add logging
18. Add health check
19. Add automated tests
20. Containerize frontend and backend
21. Verify complete Docker Compose stack
22. Document everything
23. Commit MVP
```

**MVP success criteria:**

> A user can register, log in, see their dashboard, select a level, start a mission, submit an answer, receive XP/score, and see their progress — with the complete application running through Docker Compose and covered by basic API tests.
