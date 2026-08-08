-- Mission 11: Linux File Permissions (Linux / Troubleshooting, Level 2)

INSERT INTO missions (id, level_id, title, description, objective, difficulty, xp_reward, hints, prerequisites, solution) VALUES
(11, 2, 'Linux File Permissions', 'A script inside the container cannot be executed because it lacks the execute permission.', 'Use kubectl exec to enter the challenge pod and grant execute permissions (+x) to the /app/script.sh file.', 'Easy', 800, '["You need to use kubectl exec -it <pod-name> -n ns-challenges -- sh", "Once inside, use the chmod command: chmod +x /app/script.sh"]', '[10]', 'chmod +x /app/script.sh')
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
