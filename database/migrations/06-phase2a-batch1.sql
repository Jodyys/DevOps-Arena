-- Phase 2A Batch 1 Missions
-- 31: Docker - Container Port Misconfiguration (Level 1)
-- 32: Linux - Broken File Permissions (Level 2)
-- 33: Kubernetes - ConfigMap Value Misconfiguration (Level 3)
-- 34: Fix Failed Kubernetes Deployment (Level 3)

INSERT INTO missions (id, level_id, title, description, objective, difficulty, solution, hints, prerequisites, xp_reward) VALUES
(31, 1, 'Container Port Misconfiguration', 'A containerized web application is running but cannot be accessed on the expected host port (80) because the docker-compose mapping is reversed.', 'Diagnose and fix the incorrect port mapping in the docker-compose.yml file. Change it from 8080:80 to 80:80.', 'Easy', '80:80', '["Look at the ports section in the docker-compose.yml.", "The format is HOST:CONTAINER. Which port should be on the host?"]', '[]', 500),
(32, 2, 'Broken File Permissions', 'An application fails to start because it cannot read its configuration file at /app/config.txt. The file has incorrect permissions (000).', 'Use kubectl exec to investigate and change the file permissions of /app/config.txt to 0644 so the non-root user can read it.', 'Medium', 'chmod 644 /app/config.txt', '["You need to use kubectl exec -it <pod> -n ns-challenges -- sh", "Use chmod 644 /app/config.txt"]', '[]', 700),
(33, 3, 'ConfigMap Value Misconfiguration', 'A Kubernetes workload is stuck in CrashLoopBackOff because it receives an incorrect configuration value. It expects APP_PORT to be 8080 but receives 9999.', 'Investigate the ConfigMap and correct the APP_PORT value to 8080 so the application can start successfully.', 'Medium', 'APP_PORT=8080', '["Check the ConfigMap attached to this application.", "Use kubectl edit configmap config-m33 -n ns-challenges to change the value."]', '[]', 1000),
(34, 3, 'Fix Failed Kubernetes Deployment', 'A Kubernetes Deployment is stuck in ImagePullBackOff because the image tag is invalid (nginx:broken-tag).', 'Restore the Deployment to a healthy state by updating the image to nginx:stable-alpine.', 'Medium', 'kubectl set image deployment/deploy-m34 nginx=nginx:stable-alpine', '["Use kubectl describe pod to see why it fails.", "Use kubectl edit deployment or kubectl set image to fix the image tag."]', '[]', 1000)
ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    objective = EXCLUDED.objective,
    difficulty = EXCLUDED.difficulty,
    solution = EXCLUDED.solution,
    hints = EXCLUDED.hints,
    prerequisites = EXCLUDED.prerequisites,
    xp_reward = EXCLUDED.xp_reward;

-- Update sequences for proper ID generation
SELECT setval('missions_id_seq', (SELECT MAX(id) FROM missions));
