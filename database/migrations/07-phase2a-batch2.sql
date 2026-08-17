-- 07-phase2a-batch2.sql

INSERT INTO missions (id, level_id, title, description, objective, difficulty, xp_reward, hints, prerequisites)
VALUES
(
  35,
  1,
  'Dockerfile Build Failure',
  'A developer pushed a broken Dockerfile that fails to build. Use a simulated environment to fix the `CMD` instruction inside the `Dockerfile`.',
  'The expected command should run `npm start` instead of `npm strat`.',
  'Medium',
  800,
  '["Check the spelling of the npm command.", "Open the /workspace/Dockerfile and edit the CMD array."]',
  '[34]'
),
(
  36,
  3,
  'Kubernetes CrashLoopBackOff',
  'A deployment has been scaled up, but the pod immediately crashes and enters CrashLoopBackOff.',
  'Investigate the pod logs and update the deployment configuration to fix the crashing command.',
  'Medium',
  1000,
  '["Use `kubectl get pods -n ns-challenges` to find the pod.", "Check the pod logs using `kubectl logs <pod-name> -n ns-challenges`.", "The command in the deployment terminates with an exit 1. Remove the exit 1 or fix the command so it runs continuously."]',
  '[35]'
),
(
  37,
  3,
  'Kubernetes Secret Configuration',
  'An application is unhealthy because its configuration relies on a Kubernetes Secret that has an incorrect value.',
  'Investigate the Secret and fix the APP_MODE to `production`.',
  'Hard',
  1200,
  '["Use `kubectl get secret -n ns-challenges` to list secrets.", "Update the Secret data to set APP_MODE to base64(production).", "Restart the pod to pick up the new secret value."]',
  '[36]'
),
(
  38,
  3,
  'Kubernetes Ingress / 502',
  'The application backend is healthy, but the Ingress controller returns a 502 Bad Gateway.',
  'Investigate the Ingress configuration and ensure it routes traffic to the correct Service port.',
  'Hard',
  1500,
  '["Check the Ingress backend configuration: `kubectl get ingress -n ns-challenges -o yaml`.", "Check the actual Service port: `kubectl get svc -n ns-challenges`.", "Edit the Ingress and update the backend port to 80."]',
  '[37]'
)
ON CONFLICT (id) DO NOTHING;
