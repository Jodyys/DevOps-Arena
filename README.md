# DevOps Arena

Welcome to **DevOps Arena**! A platform designed to test, practice, and challenge your DevOps skills.

## 🏗️ Architecture & Topology

The application is deployed on Kubernetes using a microservices-oriented approach. It consists of a Frontend, a Backend API, a PostgreSQL database, and a Redis cache, all routed through an NGINX Ingress Controller.

### Topology Diagram

```mermaid
graph TD
    User([User / Browser])
    Ingress[NGINX Ingress Controller<br>(devops-arena.local)]

    subgraph Kubernetes Cluster [Kubernetes Cluster (ns-devops-arena)]
        Frontend[Frontend Pod<br>Next.js:3001]
        Backend[Backend Pod<br>Node.js/Express:4000]
        Postgres[(PostgreSQL<br>Stateful/DB:5432)]
        Redis[(Redis<br>Cache:6379)]
        
        Challenges[Challenges ConfigMap<br>(Mounted as Volume)]
    end

    User -->|HTTP Request| Ingress
    Ingress -->|Path: /| Frontend
    Ingress -->|Path: /api| Backend
    Backend -->|Read/Write| Postgres
    Backend -->|Cache/PubSub| Redis
    Backend -->|Read| Challenges
```

## 🚀 Deployment (DevOps Perspective)

The infrastructure and deployment definitions are managed via Kubernetes manifests located in the `k8s/` directory.

### Key Components

1. **Namespace Isolation:** All resources are isolated within the `ns-devops-arena` namespace.
2. **Ingress Controller:** NGINX is used to route external traffic to the internal frontend and backend services based on path prefixes (`/` and `/api`).
3. **Backend Service:**
   - Deployed as a `Deployment` with a dedicated Service Account (`backend-sa`).
   - Hardened with `readOnlyRootFilesystem: true` and runs as a non-root user (`runAsUser: 1000`) for enhanced security.
   - Credentials and environment variables are injected securely using Kubernetes `Secret`.
   - The Challenges configurations are mounted via a `ConfigMap` (`backend-challenges-cm`) as a volume inside the backend pod.
   - Resource limits (CPU: 500m, Memory: 512Mi) and requests are explicitly defined for Quality of Service (QoS).
4. **Frontend Service:**
   - Next.js application served via a `Deployment`.
5. **Databases (PostgreSQL & Redis):**
   - Provide state persistence and caching for the arena.

### Security & Hardening

- **Vulnerability Scanning:** Container images (Frontend & Backend) are routinely scanned using Trivy for HIGH and CRITICAL vulnerabilities before deployment.
- **Rootless Containers:** Dockerfiles and Kubernetes Pod Specs are configured to run applications as non-root users (`USER node`).
- **Dependency Management:** Critical security vulnerabilities in nested NPM dependencies (e.g., `tar`, `postcss`) are patched using `overrides` in `package.json`.

## 🛠️ CI/CD Pipeline Workflow

The project utilizes an automated CI/CD pipeline to streamline the build and deployment process:
1. **Code Checkout**
2. **Security Audits:** Source Code (SAST) and nested dependency checks.
3. **Container Build:** Leveraging multi-stage Docker builds to produce optimized and lightweight Alpine-based images.
4. **Image Scanning (Trivy):** Thorough scanning of the resulting Docker images to block vulnerabilities from entering production.
5. **Deployment:** Seamless application of the Kubernetes manifests (`k8s/platform/`) to the target cluster.
