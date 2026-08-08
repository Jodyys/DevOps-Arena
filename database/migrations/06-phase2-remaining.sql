-- Phase 2 Remaining Missions

INSERT INTO missions (id, level_id, title, description, objective, difficulty, xp_reward, hints, prerequisites, solution) VALUES
(12, 2, 'Zombie Process Hunt', 'A rogue process is consuming high CPU. Find and kill the process running /app/rogue.sh.', 'Use kubectl exec to find and kill the rogue process.', 'Medium', 1200, '["Use ps aux to find the PID of /app/rogue.sh", "Use kill -9 <PID> to terminate it"]', '[11]', 'kill -9 <PID>'),
(13, 2, 'Network Connection Test', 'The container cannot reach an external API. Wait, actually, let''s make it simple: the container needs a specific file /etc/resolv.conf updated or a route added.', 'Actually, a simpler Linux test: A required service is listening on port 8080 but the application is trying to reach port 80. Add a port forwarding rule using iptables, OR simpler: just change the port in /app/config.json from 80 to 8080.', 'Medium', 1200, '["Use sed or vi to edit /app/config.json inside the pod", "Change the port from 80 to 8080"]', '[11]', 'sed -i s/80/8080/ /app/config.json'),
(14, 2, 'Log Analysis', 'An application is crashing. The error is hidden in a large log file /var/log/app.log. Find the error code and write it to /app/error_code.txt.', 'Extract the error code from /var/log/app.log (look for "CRITICAL_ERROR:") and save it to /app/error_code.txt.', 'Medium', 1000, '["Use grep CRITICAL_ERROR /var/log/app.log", "Redirect the output to /app/error_code.txt using >"]', '[11]', 'grep CRITICAL_ERROR /var/log/app.log > /app/error_code.txt'),
(16, 3, 'Fix Kubernetes Deployment', 'A deployment is failing to start because it references a non-existent container port. Update the deployment to use port 8080.', 'Edit the deployment and change the containerPort from 80 to 8080.', 'Medium', 1500, '["Use kubectl edit deployment -n ns-challenges", "Find containerPort and change it"]', '[3]', 'kubectl edit deployment'),
(17, 3, 'Fix ConfigMap Mount', 'A pod is failing to start because it is trying to mount a ConfigMap that doesn''t exist. Create the missing ConfigMap named ''app-config'' with a key ''APP_ENV'' set to ''production''.', 'Create the missing ConfigMap so the pod can start.', 'Medium', 1500, '["Use kubectl create configmap app-config --from-literal=APP_ENV=production -n ns-challenges"]', '[3]', 'kubectl create configmap'),
(19, 3, 'CrashLoopBackOff', 'A pod is crashing repeatedly because of a missing environment variable. Add the ''DB_HOST'' environment variable to the deployment.', 'Edit the deployment and add the DB_HOST environment variable.', 'Hard', 2000, '["Use kubectl edit deployment", "Add env section to the container with name DB_HOST and value db"]', '[18]', 'kubectl edit deployment'),
(20, 3, 'Fix RBAC (ServiceAccount)', 'A pod is failing to read secrets because its ServiceAccount lacks permissions. Bind the ''secret-reader'' role to the pod''s ServiceAccount.', 'Create a RoleBinding linking the ''secret-reader'' Role to the pod''s ServiceAccount.', 'Hard', 2000, '["Use kubectl create rolebinding to bind the role to the service account"]', '[3]', 'kubectl create rolebinding')
ON CONFLICT (id) DO UPDATE SET 
    level_id = EXCLUDED.level_id,
    title = EXCLUDED.title, 
    description = EXCLUDED.description, 
    objective = EXCLUDED.objective, 
    difficulty = EXCLUDED.difficulty, 
    xp_reward = EXCLUDED.xp_reward, 
    hints = EXCLUDED.hints, 
    prerequisites = EXCLUDED.prerequisites,
    solution = EXCLUDED.solution;

SELECT setval('missions_id_seq', (SELECT MAX(id) FROM missions));
