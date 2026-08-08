# Kubernetes Challenge Arena

This document describes the Kubernetes setup for the **DevOps Arena - Challenge Arena**.

## Architecture Shift (Sprint 3 Revised)
Unlike traditional applications where the entire stack is deployed to Kubernetes, **DevOps Arena** uses Kubernetes purely as an interactive learning environment (Challenge Arena).

- **Game Stack**: Frontend, Backend, PostgreSQL, and Redis remain running via Docker Compose.
- **Challenge Arena**: A local Kubernetes cluster (like K3s, Minikube, or Docker Desktop).

When a player starts a Kubernetes mission, the Node.js backend orchestrator uses `~/.kube/config` to connect to the cluster and dynamically spins up a **broken workload** in an isolated namespace (e.g., `challenge-u1-m4`). 
The player then uses their local `kubectl` to troubleshoot and fix it. Upon submitting, the backend checks the real-time cluster state to validate the fix.

## Setup Instructions

1. **Install Kubernetes Locally**: Install [K3s](https://k3s.io/), [Minikube](https://minikube.sigs.k8s.io/docs/start/), or enable Kubernetes in Docker Desktop.
2. **Verify kubeconfig**: Ensure your `~/.kube/config` is properly set and you can run `kubectl get nodes`.
3. **RBAC Setup**: 
   To restrict the game backend from having full cluster-admin access, apply the RBAC rules:
   ```bash
   kubectl apply -f k8s/rbac.yaml
   ```
4. **Start the Game**: Run the main game stack with Docker Compose.
   ```bash
   docker compose up -d --build
   ```
5. **Play**: Go to `http://localhost:3001` and start a Kubernetes mission. The backend will automatically create the broken workloads in your cluster!

## Missions
Currently, the backend orchestrates 4 Kubernetes missions:
- **Mission 4**: Fix ImagePullBackOff
- **Mission 5**: Fix CrashLoopBackOff 
- **Mission 6**: Fix Service Selector Mismatch
- **Mission 7**: Fix Ingress 502 Bad Gateway
