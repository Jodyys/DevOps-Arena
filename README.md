# DevOps Arena

## Overview
DevOps Arena is a mini-game based web application designed for learning DevOps end-to-end. Players take on the role of a DevOps Engineer and must solve various incidents and deployment challenges.

## Architecture
The application uses a modern web stack:
- Next.js Frontend
- Node.js + Express Backend
- PostgreSQL Database
- Redis Cache
- Docker & Kubernetes for infrastructure

## Tech Stack
- **Frontend**: Next.js (React), Tailwind CSS
- **Backend**: Node.js, Express, Pino, Zod, JWT
- **Database**: PostgreSQL, Redis
- **Infra**: Docker, Docker Compose

## Project Structure
This is a monorepo containing:
- `frontend/`: Next.js web application
- `backend/`: Node.js Express API
- `database/`: Database initialization scripts
- `docker-compose.yml`: Local infrastructure setup

## Prerequisites
- Node.js (v18+)
- Docker and Docker Compose
- Git

## Environment Variables
Copy `.env.example` to `.env` in the root directory before starting the application:
```bash
cp .env.example .env
```

## How to Run (Docker Compose)
1. Copy `.env.example` to `.env`
2. Start the database and redis: `docker compose up -d postgres redis`
3. Start backend: `cd backend && npm install && npm run dev`
4. Start frontend: `cd frontend && npm install && npm run dev`

Atau jalankan semuanya sekaligus:
```bash
docker compose up -d --build
```

## How to Run (Kubernetes)
For instructions on deploying the application to a local Kubernetes cluster, see [docs/kubernetes.md](docs/kubernetes.md).

## Database
The PostgreSQL database is automatically initialized with the schema and seed data found in `database/init.sql` when running the Docker Compose stack for the first time.

## API
The backend exposes a RESTful API at `http://localhost:4000/api`.
Health check is available at `http://localhost:4000/health`.

## Testing
(TBD)

## Troubleshooting
- If the database fails to initialize, remove the Docker volumes: `docker compose down -v` and try again.

## Roadmap
- Sprint 1: MVP Application Setup
- Sprint 2: Docker & Containerization
- Sprint 3: Kubernetes Deployment
- Sprint 4: CI/CD Pipeline
- Sprint 5: GitOps with ArgoCD
