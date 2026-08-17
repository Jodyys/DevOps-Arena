-- 08-phase2a-batch3.sql

INSERT INTO missions (id, level_id, title, description, objective, difficulty, xp_reward, hints, prerequisites)
VALUES
(
  39,
  4,
  'CI/CD Pipeline Failure',
  'A CI/CD pipeline is failing during the test stage. Investigate the isolated pipeline configuration file provided in the challenge environment.',
  'Fix the typo in the test stage command so that it runs `npm run test` instead of `npm run tesst`.',
  'Medium',
  1000,
  '["Look inside /workspace/Jenkinsfile.", "Check the test stage command.", "Use sed or vi to fix the command to npm run test."]',
  '[38]'
),
(
  40,
  4,
  'Docker Image Tag Failure',
  'A Kubernetes deployment is failing to start because it is referencing an incorrect Docker image tag.',
  'Investigate the failing Pods and update the Deployment to use the working image tag `nginx:alpine`.',
  'Medium',
  1000,
  '["Use `kubectl get pods -n ns-challenges` to see the ImagePullBackOff error.", "Use `kubectl get deployment -n ns-challenges`.", "Update the deployment image using `kubectl set image` or edit it."]',
  '[39]'
),
(
  41,
  4,
  'Kubernetes Deployment Rollback',
  'A recent update to a deployment introduced a broken image, leaving the application in a degraded state (ImagePullBackOff).',
  'Use `kubectl rollout undo` to restore the deployment to its previous healthy revision.',
  'Hard',
  1500,
  '["Check the rollout history using `kubectl rollout history deployment/<name> -n ns-challenges`.", "Use `kubectl rollout undo deployment/<name> -n ns-challenges` to rollback to the previous revision."]',
  '[40]'
),
(
  42,
  4,
  'Trivy / Container Security (Simulation)',
  'A controlled educational container security simulation. A `trivy_report.txt` and a `Dockerfile` are provided. The current base image is outdated and vulnerable.',
  'Inspect the report and update the base image in `/workspace/Dockerfile` to `alpine:3.20` or `alpine:latest`.',
  'Hard',
  1500,
  '["Read /workspace/trivy_report.txt to identify the vulnerability.", "Edit /workspace/Dockerfile to use a newer alpine version (e.g. alpine:3.20)."]',
  '[41]'
)
ON CONFLICT (id) DO NOTHING;
