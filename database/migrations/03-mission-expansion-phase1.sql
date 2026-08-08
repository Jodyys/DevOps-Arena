-- Phase 1: Mission Expansion (New Levels & 3 Target Missions)

-- 1. Re-structure Levels
-- We want 4 main levels. We will update the existing ones to match the new structure, and insert missing ones.
UPDATE levels SET name = 'Docker', description = 'Master containerization with Docker.', category = 'Docker' WHERE id = 1;
UPDATE levels SET name = 'Linux / Troubleshooting', description = 'Master Linux operations and OS troubleshooting.', category = 'Linux' WHERE id = 2;
UPDATE levels SET name = 'Kubernetes', description = 'Master container orchestration with Kubernetes.', category = 'Kubernetes' WHERE id = 3;
UPDATE levels SET name = 'CI/CD & DevSecOps', description = 'Master automation, pipelines, and security.', category = 'CI/CD' WHERE id = 4;

-- 2. Re-assign existing missions to correct levels based on the new spec.
-- Existing missions:
-- 1: Docker Basics -> Level 1 (Docker)
-- 2: Docker Compose -> Level 1 (Docker)
-- 3: Kubernetes Deployment -> Level 3 (Kubernetes)
-- 4: Kubernetes Troubleshooting -> Level 3 (Kubernetes)
-- 5-7 are part of Sprint 3 ? Wait, let's just make sure 1-4 are correct.
UPDATE missions SET level_id = 1 WHERE id IN (1, 2);
UPDATE missions SET level_id = 3 WHERE id IN (3, 4);

-- 3. Delete the temporary missions 8 and 9 that I created earlier to avoid ID conflicts, 
-- or we can just let them be replaced/ignored. Let's delete them to keep it clean.
DELETE FROM missions WHERE id IN (8, 9);

-- 4. Seed the 3 new missions for Phase 1
-- Mission 10: Fix Dockerfile (Docker, Level 1)
-- Mission 15: Fix Kubernetes Service (Kubernetes, Level 3)
-- Mission 18: ImagePullBackOff (Kubernetes, Level 3)

INSERT INTO missions (id, level_id, title, description, objective, difficulty, xp_reward, hints, prerequisites, solution) VALUES
(10, 1, 'Fix Dockerfile', 'A Dockerfile is failing to build because of an incorrect command used to start the Node.js application.', 'Fix the Dockerfile CMD instruction so it correctly runs "npm start".', 'Easy', 500, '["Look closely at the CMD instruction syntax.", "It should be an array of strings."]', '[]', 'CMD ["npm", "start"]'),

(15, 3, 'Fix Kubernetes Service', 'The frontend service is not routing traffic to the frontend pods correctly because of a mismatched selector.', 'Fix the selector in the frontend-service to match the frontend-challenge deployment labels.', 'Medium', 1000, '["Run kubectl get svc and describe the service.", "Check the pod labels compared to the service selector."]', '[14]', 'app: frontend-challenge'),

(18, 3, 'ImagePullBackOff', 'A newly deployed application is failing to start. The Pod is stuck in ImagePullBackOff.', 'Investigate the deployment and fix the container image name so it pulls successfully.', 'Medium', 1000, '["Use kubectl describe pod to see the exact error.", "The image name seems to have a typo. Use nginx:alpine."]', '[17]', 'nginx:alpine')
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
