-- Phase 1: Mechanics Expansion

-- 1. Alter missions table safely
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='missions' AND column_name='xp_reward') THEN
        ALTER TABLE missions ADD COLUMN xp_reward INTEGER DEFAULT 1000;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='missions' AND column_name='hints') THEN
        ALTER TABLE missions ADD COLUMN hints JSONB DEFAULT '[]';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='missions' AND column_name='prerequisites') THEN
        ALTER TABLE missions ADD COLUMN prerequisites JSONB DEFAULT '[]';
    END IF;
END $$;

-- 2. Alter attempts table safely
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attempts' AND column_name='started_at') THEN
        ALTER TABLE attempts ADD COLUMN started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attempts' AND column_name='completed_at') THEN
        ALTER TABLE attempts ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attempts' AND column_name='hints_used') THEN
        ALTER TABLE attempts ADD COLUMN hints_used INTEGER DEFAULT 0;
    END IF;
END $$;

-- 3. Update existing missions with xp_reward
UPDATE missions SET xp_reward = 500 WHERE difficulty = 'Easy';
UPDATE missions SET xp_reward = 1000 WHERE difficulty = 'Medium';
UPDATE missions SET xp_reward = 2000 WHERE difficulty = 'Hard';

-- 4. Seed new achievements
INSERT INTO achievements (id, name, description, icon) VALUES
(4, 'Speed Runner', 'Completed a mission in under 2 minutes.', '⚡'),
(5, 'Persistent Operator', 'Successfully replayed a previously completed mission.', '🔁'),
(6, 'Incident Responder', 'Complete 3 troubleshooting missions.', '🔥')
ON CONFLICT (id) DO NOTHING;

-- Reset achievement sequence
SELECT setval('achievements_id_seq', (SELECT MAX(id) FROM achievements));

-- 5. Seed Phase 1 Missions
-- (We will define them in a separate script or insert here)
INSERT INTO missions (id, level_id, title, description, objective, difficulty, xp_reward, hints, prerequisites, solution) VALUES
(8, 1, 'Docker Container Won''t Start', 'A simple nginx container is failing to start because of a configuration issue in the run command.', 'Fix the command to expose port 80 properly.', 'Easy', 500, '["Check the port mapping syntax (-p).", "It should be -p 8080:80"]', '[]', '-p 8080:80'),
(9, 3, 'Service Not Reachable', 'The frontend service is not routing traffic to the frontend pods correctly.', 'Fix the selector in the frontend-service to match the frontend deployment.', 'Medium', 1500, '["Run kubectl get svc and describe it.", "Check the pod labels compared to the service selector."]', '[]', 'app: frontend-challenge')
ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title, 
    description = EXCLUDED.description, 
    objective = EXCLUDED.objective, 
    difficulty = EXCLUDED.difficulty, 
    xp_reward = EXCLUDED.xp_reward, 
    hints = EXCLUDED.hints, 
    prerequisites = EXCLUDED.prerequisites,
    solution = EXCLUDED.solution;

SELECT setval('missions_id_seq', (SELECT MAX(id) FROM missions));
