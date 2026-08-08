# DevOps Arena --- Mini Game DevOps End-to-End

## 1. Project Overview

**DevOps Arena** adalah mini game berbasis web yang dibuat untuk belajar
DevOps secara end-to-end.

Konsepnya sederhana:

> Player berperan sebagai DevOps Engineer yang harus menyelesaikan
> berbagai incident dan deployment challenge.

Game tidak hanya menjadi aplikasi biasa. Infrastruktur, CI/CD,
Kubernetes, monitoring, logging, GitOps, dan troubleshooting menjadi
bagian utama gameplay.

### Target pembelajaran

Project ini dirancang untuk mempraktikkan:

-   Git & GitHub
-   Linux
-   Docker
-   Docker Compose
-   REST API
-   PostgreSQL
-   Redis
-   Kubernetes
-   Kubernetes troubleshooting
-   CI/CD
-   Container Registry
-   GitOps
-   ArgoCD
-   Ingress
-   Prometheus
-   Grafana
-   Logging
-   Incident response
-   Infrastructure troubleshooting
-   Deployment ke cloud

------------------------------------------------------------------------

# 2. Konsep Game

Player memiliki sebuah environment DevOps yang sedang mengalami masalah.

Contoh:

``` text
🚨 PRODUCTION INCIDENT

Backend:
❌ CrashLoopBackOff

Database:
✅ Healthy

Redis:
✅ Healthy

Ingress:
✅ Healthy

Mission:
Cari penyebab backend gagal start dan lakukan recovery.
```

Player harus menganalisis kondisi environment dan memilih tindakan yang
benar.

Setiap challenge memiliki:

-   Mission
-   Environment
-   Error / incident
-   Hint
-   Objective
-   Solution
-   XP
-   Score
-   Attempts
-   Completion time

------------------------------------------------------------------------

# 3. Core Gameplay

Flow utama:

``` text
Login
  ↓
Dashboard
  ↓
Pilih Level
  ↓
Baca Mission
  ↓
Investigasi
  ↓
Pilih / lakukan tindakan
  ↓
System melakukan validation
  ↓
Success / Failed
  ↓
Score + XP
  ↓
Unlock Level berikutnya
```

Contoh:

``` text
Level 3 — Kubernetes Deployment

Mission:
Backend mengalami ImagePullBackOff.

Environment:
Kubernetes

Objective:
Cari image yang salah dan deploy image yang benar.

[Start Mission]
```

------------------------------------------------------------------------

# 4. Level Roadmap

## Level 1 --- Docker Basics

### Objective

Memahami dasar Docker.

### Challenge

Player harus memperbaiki Dockerfile yang bermasalah.

Materi:

-   Dockerfile
-   Image
-   Container
-   Layer
-   Docker build
-   Docker run
-   `.dockerignore`

Contoh masalah:

``` dockerfile
FROM node:latest

COPY . .

RUN npm install

CMD ["npm", "start"]
```

Challenge lanjutan:

-   image terlalu besar
-   dependency tidak ter-cache
-   menggunakan image tag yang tidak spesifik
-   file yang tidak diperlukan ikut masuk image

------------------------------------------------------------------------

# Level 2 --- Docker Compose

## Objective

Memahami komunikasi antar-container.

Architecture:

``` text
Frontend
   │
   ▼
Backend
   │
   ├── PostgreSQL
   │
   └── Redis
```

Challenge:

``` text
Backend:
❌ Cannot connect to database
```

Contoh konfigurasi salah:

``` env
DB_HOST=localhost
```

Yang benar:

``` env
DB_HOST=postgres
```

Materi:

-   Docker network
-   Service discovery
-   Environment variables
-   Docker Compose
-   Dependency antar-service

------------------------------------------------------------------------

# Level 3 --- Kubernetes Deployment

## Objective

Memahami Deployment dan Pod.

Challenge:

``` text
Pod:
ImagePullBackOff
```

Contoh image salah:

``` yaml
image: jodyys/game-backend:v99
```

Image yang tersedia:

``` text
jodyys/game-backend:v1
```

Player harus memperbaiki manifest.

Materi:

-   Namespace
-   Pod
-   Deployment
-   Replica
-   Image
-   kubectl
-   Rollout

------------------------------------------------------------------------

# Level 4 --- Kubernetes Service

## Objective

Memahami komunikasi antar-Pod.

Initial condition:

``` text
Pod:
Running ✅

Deployment:
Healthy ✅

Service:
Healthy ✅

Application:
Unavailable ❌
```

Penyebab:

``` yaml
selector:
  app: backend-old
```

Padahal Pod:

``` yaml
labels:
  app: backend
```

Materi:

-   Service
-   ClusterIP
-   Selector
-   Endpoint
-   DNS Kubernetes

------------------------------------------------------------------------

# Level 5 --- Kubernetes Config & Secret

## Objective

Memahami konfigurasi aplikasi.

Incident:

``` text
Backend:
CrashLoopBackOff
```

Log:

``` text
password authentication failed
```

Player harus mengecek:

``` text
ConfigMap
Secret
Environment Variable
Database Configuration
```

Materi:

-   ConfigMap
-   Secret
-   Environment variable
-   Secret reference
-   Configuration troubleshooting

------------------------------------------------------------------------

# Level 6 --- Ingress

## Objective

Memahami external traffic ke Kubernetes.

Environment:

``` text
Internet
   ↓
Ingress
   ↓
Service
   ↓
Pod
```

Challenge:

``` text
Application:
Healthy ✅

Internal Service:
Healthy ✅

External URL:
502 / 404 ❌
```

Player harus menemukan masalah pada Ingress.

Materi:

-   Ingress
-   Host
-   Path
-   TLS
-   Reverse proxy
-   HTTP status code

------------------------------------------------------------------------

# Level 7 --- CI/CD

## Objective

Membuat pipeline otomatis.

Pipeline:

``` text
Git Push
   ↓
Checkout
   ↓
Lint
   ↓
Test
   ↓
Docker Build
   ↓
Security Scan
   ↓
Push Image
   ↓
Deploy
```

Challenge:

``` text
Checkout       ✅
Test           ✅
Docker Build   ❌
Push           ❌
Deploy         ❌
```

Player harus membaca pipeline log dan mencari penyebab.

Materi:

-   GitHub Actions
-   CI pipeline
-   Build
-   Test
-   Docker
-   Registry
-   Pipeline troubleshooting

------------------------------------------------------------------------

# Level 8 --- GitOps + ArgoCD

## Objective

Memahami GitOps deployment.

Architecture:

``` text
Developer
    ↓
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

Challenge:

``` text
Running version:
v1

Available version:
v2

ArgoCD:
OutOfSync
```

Player harus mengubah deployment version melalui GitOps repository.

Materi:

-   GitOps
-   ArgoCD
-   Desired state
-   Sync
-   OutOfSync
-   Self-healing
-   Rollback

------------------------------------------------------------------------

# Level 9 --- Monitoring

## Objective

Memahami monitoring aplikasi dan Kubernetes.

Dashboard:

``` text
CPU       92%
Memory    87%
Pods      3/5
Errors    1,293
Latency   4.8s
```

Player harus menentukan komponen yang bermasalah.

Stack:

``` text
Application
    ↓
Metrics
    ↓
Prometheus
    ↓
Grafana
```

Materi:

-   Prometheus
-   Grafana
-   Metrics
-   CPU
-   Memory
-   Pod status
-   Request rate
-   Error rate
-   Latency

------------------------------------------------------------------------

# Level 10 --- Production Incident

## Objective

Menggabungkan semua skill.

Incident:

``` text
🚨 PRODUCTION INCIDENT

HTTP 500:
↑ 800%

Backend:
CrashLoopBackOff

Database:
Connection refused

Redis:
Healthy

Ingress:
Healthy
```

Player harus melakukan investigation:

``` text
1. Check Pod
2. Check logs
3. Check Deployment
4. Check Service
5. Check Secret
6. Check Database connectivity
7. Fix configuration
8. Redeploy
9. Verify application
```

Success condition:

``` text
Backend:
Running ✅

Database:
Connected ✅

HTTP:
200 ✅

Incident:
Resolved ✅
```

Reward:

``` text
XP:
+2500

Badge:
🔥 Production Incident Responder

MTTR:
06:42
```

------------------------------------------------------------------------

# 5. Application Architecture

## High-Level Architecture

``` text
                         ┌──────────────┐
                         │    User      │
                         └──────┬───────┘
                                │
                                ▼
                         ┌──────────────┐
                         │   Ingress    │
                         └──────┬───────┘
                                │
                                ▼
                         ┌──────────────┐
                         │   Frontend   │
                         └──────┬───────┘
                                │
                                ▼
                         ┌──────────────┐
                         │   Backend    │
                         └──────┬───────┘
                                │
                   ┌────────────┼────────────┐
                   ▼            ▼            ▼
             PostgreSQL       Redis       Game Engine
```

------------------------------------------------------------------------

# 6. Application Components

## Frontend

Recommended stack:

``` text
React
```

Responsibilities:

-   Login
-   Dashboard
-   Level selection
-   Mission screen
-   Challenge interaction
-   Score display
-   Leaderboard
-   Profile
-   Achievement / badge

------------------------------------------------------------------------

## Backend

Recommended stack:

``` text
Node.js
Express
```

Responsibilities:

-   Authentication
-   User management
-   Game logic
-   Level management
-   Score calculation
-   Mission validation
-   Leaderboard
-   Achievement system
-   API

------------------------------------------------------------------------

## Database

``` text
PostgreSQL
```

Data:

-   users
-   levels
-   missions
-   attempts
-   scores
-   achievements
-   user achievements

------------------------------------------------------------------------

## Redis

Digunakan untuk:

-   Session
-   Cache
-   Leaderboard
-   Rate limiting
-   Temporary game state

------------------------------------------------------------------------

# 7. Database Design

## users

``` text
id
username
email
password_hash
created_at
updated_at
```

## levels

``` text
id
name
description
difficulty
category
xp_reward
is_active
created_at
```

## missions

``` text
id
level_id
title
description
objective
difficulty
solution
created_at
```

## attempts

``` text
id
user_id
mission_id
status
score
duration
created_at
```

## achievements

``` text
id
name
description
icon
created_at
```

## user_achievements

``` text
id
user_id
achievement_id
unlocked_at
```

------------------------------------------------------------------------

# 8. API Design

## Authentication

``` http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

## Users

``` http
GET /api/users/me
GET /api/users/me/progress
```

## Levels

``` http
GET /api/levels
GET /api/levels/:id
```

## Missions

``` http
GET /api/missions/:id
POST /api/missions/:id/start
POST /api/missions/:id/submit
```

## Leaderboard

``` http
GET /api/leaderboard
```

## Achievements

``` http
GET /api/achievements
GET /api/users/me/achievements
```

------------------------------------------------------------------------

# 9. Repository Structure

``` text
devops-arena/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   ├── package.json
│   └── README.md
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── models/
│   ├── Dockerfile
│   ├── package.json
│   └── README.md
│
├── database/
│   └── migrations/
│
├── docker-compose.yml
│
├── k8s/
│   ├── namespace.yaml
│   │
│   ├── frontend/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── ingress.yaml
│   │
│   ├── backend/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── configmap.yaml
│   │   └── secret.yaml
│   │
│   ├── postgres/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── pvc.yaml
│   │
│   └── redis/
│       ├── deployment.yaml
│       └── service.yaml
│
├── monitoring/
│   ├── prometheus/
│   │   └── prometheus.yaml
│   └── grafana/
│
├── argocd/
│   └── application.yaml
│
├── .github/
│   └── workflows/
│       ├── ci.yaml
│       └── cd.yaml
│
├── docs/
│   ├── architecture.md
│   ├── deployment.md
│   ├── troubleshooting.md
│   └── challenges.md
│
└── README.md
```

------------------------------------------------------------------------

# 10. Containerization

## Development

Gunakan Docker Compose:

``` text
Frontend
Backend
PostgreSQL
Redis
```

Command:

``` bash
docker compose up -d
```

Check:

``` bash
docker compose ps
```

Logs:

``` bash
docker compose logs -f backend
```

------------------------------------------------------------------------

# 11. Kubernetes Architecture

Target environment:

``` text
Kubernetes Cluster
│
├── ns-devops-arena
│
├── frontend
│   ├── Deployment
│   └── Service
│
├── backend
│   ├── Deployment
│   ├── Service
│   ├── ConfigMap
│   └── Secret
│
├── postgres
│   ├── Deployment
│   ├── Service
│   └── PVC
│
├── redis
│   ├── Deployment
│   └── Service
│
└── ingress
```

------------------------------------------------------------------------

# 12. Kubernetes Learning Checklist

## Basic

-   [ ] Namespace
-   [ ] Pod
-   [ ] Deployment
-   [ ] ReplicaSet
-   [ ] Service
-   [ ] ConfigMap
-   [ ] Secret

## Networking

-   [ ] ClusterIP
-   [ ] NodePort
-   [ ] Ingress
-   [ ] Kubernetes DNS
-   [ ] Service discovery

## Storage

-   [ ] Volume
-   [ ] PersistentVolume
-   [ ] PersistentVolumeClaim
-   [ ] StorageClass

## Advanced

-   [ ] HPA
-   [ ] Resource Requests
-   [ ] Resource Limits
-   [ ] Readiness Probe
-   [ ] Liveness Probe
-   [ ] Rolling Update
-   [ ] Rollback
-   [ ] PodDisruptionBudget

------------------------------------------------------------------------

# 13. CI Pipeline

Recommended pipeline:

``` text
Git Push
   ↓
Checkout
   ↓
Install Dependencies
   ↓
Lint
   ↓
Unit Test
   ↓
Build Application
   ↓
Build Docker Image
   ↓
Security Scan
   ↓
Push Image
```

Example image:

``` text
docker.io/<username>/devops-arena-frontend:<tag>
docker.io/<username>/devops-arena-backend:<tag>
```

Tag sebaiknya menggunakan:

``` text
Git SHA
```

atau:

``` text
Release Version
```

Hindari hanya menggunakan:

``` text
latest
```

untuk deployment production.

------------------------------------------------------------------------

# 14. GitOps Pipeline

Setelah CI berhasil:

``` text
Application Repo
        │
        ▼
GitHub Actions
        │
        ▼
Docker Registry
        │
        ▼
Update Image Tag
        │
        ▼
GitOps Repository
        │
        ▼
ArgoCD
        │
        ▼
Kubernetes
```

ArgoCD bertugas menjaga:

``` text
Git Desired State
        =
Kubernetes Actual State
```

------------------------------------------------------------------------

# 15. Monitoring

Monitoring stack:

``` text
Prometheus
Grafana
```

Metrics minimum:

``` text
CPU Usage
Memory Usage
Pod Count
Pod Restart
HTTP Request Rate
HTTP Error Rate
HTTP Latency
Database Connection
Redis Connection
```

Dashboard minimal:

### Application Overview

``` text
Request Rate
Error Rate
Latency
Active Users
```

### Kubernetes Overview

``` text
Nodes
Pods
CPU
Memory
Restarts
```

### Backend

``` text
HTTP 2xx
HTTP 4xx
HTTP 5xx
Response Time
```

------------------------------------------------------------------------

# 16. Logging

Minimal logging:

``` text
Application
    ↓
Container stdout
    ↓
kubectl logs
```

Advanced version:

``` text
Application
    ↓
Container
    ↓
Log Collector
    ↓
Elasticsearch
    ↓
Kibana
```

Challenge dapat menggunakan log sebagai bagian dari gameplay.

Contoh:

``` text
ERROR Database connection failed
ERROR Redis connection timeout
WARN Retry attempt 3
```

Player harus menemukan root cause.

------------------------------------------------------------------------

# 17. Security

Security basic:

-   Jangan commit password
-   Jangan commit API key
-   Gunakan `.env` untuk local development
-   Gunakan Kubernetes Secret
-   Gunakan GitHub Secrets untuk CI
-   Gunakan least privilege
-   Scan Docker image
-   Jangan menggunakan `root` di container jika tidak diperlukan
-   Gunakan HTTPS
-   Validasi input API
-   Gunakan password hashing
-   Gunakan rate limiting

Advanced:

``` text
Secret Manager
    ↓
External Secrets
    ↓
Kubernetes Secret
```

------------------------------------------------------------------------

# 18. Deployment Roadmap

## Phase 1 --- Local

``` text
Laptop
  ↓
Docker Compose
  ↓
Frontend
Backend
PostgreSQL
Redis
```

Goal:

``` text
Application berjalan.
```

------------------------------------------------------------------------

## Phase 2 --- Container Registry

``` text
GitHub
   ↓
Docker Build
   ↓
Docker Hub
```

Goal:

``` text
Image berhasil dipush.
```

------------------------------------------------------------------------

## Phase 3 --- Kubernetes

``` text
K3s
  ↓
Deploy application
```

Goal:

``` text
Frontend       Running
Backend        Running
PostgreSQL     Running
Redis          Running
```

------------------------------------------------------------------------

## Phase 4 --- CI/CD

``` text
Git Push
   ↓
CI
   ↓
Test
   ↓
Build
   ↓
Docker Push
```

Goal:

``` text
Push code → image otomatis dibuat.
```

------------------------------------------------------------------------

## Phase 5 --- GitOps

``` text
GitHub
 ↓
CI
 ↓
Registry
 ↓
GitOps
 ↓
ArgoCD
 ↓
Kubernetes
```

Goal:

``` text
Push code → application otomatis ter-deploy.
```

------------------------------------------------------------------------

## Phase 6 --- Monitoring

``` text
Kubernetes
   ↓
Prometheus
   ↓
Grafana
```

Goal:

``` text
Application metrics dapat dimonitor.
```

------------------------------------------------------------------------

## Phase 7 --- Production Simulation

Tambahkan:

-   HPA
-   TLS
-   Resource limits
-   Health check
-   Rolling deployment
-   Rollback
-   Alerting
-   Logging
-   Incident simulation

------------------------------------------------------------------------

# 19. Deployment Target

## Development

``` text
Local Docker Compose
```

## Staging

``` text
EC2
  ↓
K3s
  ↓
ArgoCD
```

## Advanced

Bisa dipindahkan ke:

``` text
AWS EKS
```

atau:

``` text
Tencent Kubernetes Service
```

atau:

``` text
GCP GKE
```

Tujuannya supaya project bisa menjadi latihan cloud deployment juga.

------------------------------------------------------------------------

# 20. Troubleshooting Challenges

Challenge yang wajib tersedia:

``` text
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
Docker registry authentication failed
```

------------------------------------------------------------------------

# 21. Scoring System

Contoh:

``` text
Base XP:
1000
```

Bonus:

``` text
First Attempt:
+500 XP

No Hint:
+300 XP

Fast Completion:
+200 XP
```

Penalty:

``` text
Failed Attempt:
-100 XP

Use Hint:
-100 XP
```

Score:

``` text
Final Score =
Base XP
+ Bonus
- Penalty
```

------------------------------------------------------------------------

# 22. Achievement

Contoh badge:

``` text
🐳 Docker Beginner
☸️ Kubernetes Rookie
🔐 Secret Keeper
🚀 Deployment Master
🔄 GitOps Engineer
📊 Monitoring Expert
🔥 Incident Responder
⚡ CI/CD Master
🏆 DevOps Engineer
```

------------------------------------------------------------------------

# 23. Dashboard

Dashboard player:

``` text
DEVOPS ARENA

Level:
7 / 10

XP:
8,450

Rank:
#12

Achievements:
6 / 10

Progress:
████████████░░ 70%

Current Mission:
GitOps Deployment
```

------------------------------------------------------------------------

# 24. Recommended MVP

Jangan langsung membuat semua fitur.

MVP pertama cukup:

``` text
Frontend
Backend
PostgreSQL
Docker Compose
Login
Level list
Mission
Score
```

Target:

``` text
User login
   ↓
Pilih level
   ↓
Start mission
   ↓
Submit answer
   ↓
Validation
   ↓
Score
```

Setelah MVP selesai baru masuk DevOps.

------------------------------------------------------------------------

# 25. Development Roadmap

## Sprint 1 --- Application

-   [ ] Setup repository
-   [ ] Setup frontend
-   [ ] Setup backend
-   [ ] Setup PostgreSQL
-   [ ] Setup Redis
-   [ ] Create authentication
-   [ ] Create level API
-   [ ] Create mission API
-   [ ] Create scoring system

------------------------------------------------------------------------

## Sprint 2 --- Docker

-   [ ] Dockerfile frontend
-   [ ] Dockerfile backend
-   [ ] `.dockerignore`
-   [ ] Docker Compose
-   [ ] Environment configuration
-   [ ] Container networking
-   [ ] Healthcheck

------------------------------------------------------------------------

## Sprint 3 --- Kubernetes

-   [ ] Create namespace
-   [ ] Create Deployment
-   [ ] Create Service
-   [ ] Create ConfigMap
-   [ ] Create Secret
-   [ ] Create PVC
-   [ ] Create Ingress
-   [ ] Configure probes
-   [ ] Configure resources

------------------------------------------------------------------------

## Sprint 4 --- CI

-   [ ] GitHub Actions
-   [ ] Lint
-   [ ] Unit test
-   [ ] Build
-   [ ] Docker build
-   [ ] Security scan
-   [ ] Push image

------------------------------------------------------------------------

## Sprint 5 --- GitOps

-   [ ] Create GitOps repository
-   [ ] Create Kubernetes manifests
-   [ ] Install ArgoCD
-   [ ] Create ArgoCD Application
-   [ ] Configure auto sync
-   [ ] Test rollback

------------------------------------------------------------------------

## Sprint 6 --- Observability

-   [ ] Install Prometheus
-   [ ] Install Grafana
-   [ ] Create dashboard
-   [ ] Application metrics
-   [ ] Kubernetes metrics
-   [ ] Alerting

------------------------------------------------------------------------

## Sprint 7 --- Incident Simulation

-   [ ] CrashLoopBackOff challenge
-   [ ] ImagePullBackOff challenge
-   [ ] Secret challenge
-   [ ] Service challenge
-   [ ] Ingress challenge
-   [ ] Database challenge
-   [ ] High CPU challenge
-   [ ] Deployment failure challenge

------------------------------------------------------------------------

# 26. Definition of Done

Project dianggap selesai apabila:

``` text
[Application]
☑ User dapat login
☑ User dapat memilih level
☑ User dapat menjalankan mission
☑ User mendapatkan score

[Docker]
☑ Semua service containerized
☑ Docker Compose berjalan

[Kubernetes]
☑ Application berjalan di Kubernetes
☑ Service berfungsi
☑ Ingress berfungsi
☑ Secret dan ConfigMap digunakan
☑ Persistent storage digunakan

[CI/CD]
☑ Push code menjalankan CI
☑ Test otomatis
☑ Docker image otomatis dibuat
☑ Image otomatis dipush

[GitOps]
☑ ArgoCD terhubung
☑ Deployment menggunakan GitOps
☑ Auto sync berjalan
☑ Rollback dapat dilakukan

[Monitoring]
☑ Prometheus berjalan
☑ Grafana berjalan
☑ Dashboard tersedia
☑ Metrics aplikasi tersedia

[Incident Response]
☑ Player dapat melakukan troubleshooting
☑ Incident memiliki root cause
☑ System melakukan validation
☑ Score dihitung
```

------------------------------------------------------------------------

# 27. Portfolio Story

Project ini dapat ditulis di CV/portfolio sebagai:

> Built an end-to-end DevOps learning platform that simulates real-world
> infrastructure incidents and deployment challenges. Containerized
> frontend, backend, PostgreSQL, and Redis using Docker, deployed
> workloads to Kubernetes, implemented CI/CD with GitHub Actions, GitOps
> deployment using ArgoCD, and observability using Prometheus and
> Grafana.

Technology:

``` text
React
Node.js
Express
PostgreSQL
Redis
Docker
Kubernetes
GitHub Actions
Docker Registry
ArgoCD
Prometheus
Grafana
Nginx / Ingress
Git
Linux
```

------------------------------------------------------------------------

# 28. Final Target Architecture

``` text
                         ┌──────────────┐
                         │    Player    │
                         └──────┬───────┘
                                │
                                ▼
                         ┌──────────────┐
                         │   Ingress    │
                         └──────┬───────┘
                                │
                                ▼
                         ┌──────────────┐
                         │   Frontend   │
                         └──────┬───────┘
                                │
                                ▼
                         ┌──────────────┐
                         │   Backend    │
                         └──────┬───────┘
                                │
                    ┌───────────┼───────────┐
                    ▼           ▼           ▼
               PostgreSQL     Redis      Game Engine
                    │           │
                    └─────┬─────┘
                          │
                          ▼
                    Kubernetes
                          │
             ┌────────────┼────────────┐
             ▼            ▼            ▼
         Prometheus    Grafana      Logging
             │
             ▼
         Monitoring


Developer
   │
   ▼
GitHub
   │
   ▼
GitHub Actions
   │
   ├── Test
   ├── Build
   ├── Security Scan
   └── Docker Push
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

------------------------------------------------------------------------

# 29. Recommended Learning Order

Urutan pengerjaan yang paling aman:

``` text
1. Build application
        ↓
2. PostgreSQL
        ↓
3. Redis
        ↓
4. Docker
        ↓
5. Docker Compose
        ↓
6. Kubernetes
        ↓
7. Ingress
        ↓
8. CI
        ↓
9. Container Registry
        ↓
10. GitOps
        ↓
11. ArgoCD
        ↓
12. Prometheus
        ↓
13. Grafana
        ↓
14. Logging
        ↓
15. Incident simulation
        ↓
16. Cloud deployment
```

**Prinsip utama project:**

> Jangan hanya membuat aplikasi yang bisa berjalan. Buat aplikasi yang
> bisa di-build, di-test, di-containerize, di-deploy, dimonitor,
> di-debug, di-rollback, dan dipulihkan ketika terjadi incident.

Dengan pendekatan ini, DevOps Arena bukan cuma mini game, tetapi
sekaligus **laboratorium DevOps pribadi** dan project portfolio
end-to-end.
