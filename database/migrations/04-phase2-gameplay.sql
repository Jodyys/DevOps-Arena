-- 1. Update Users Table
ALTER TABLE users ADD COLUMN IF NOT EXISTS best_streak INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE;

-- 2. Expand Achievements (assuming 1-3 exist, we'll upsert)
INSERT INTO achievements (id, name, description, icon) VALUES
(4, 'Docker Master', 'Complete all Docker missions.', '🐳'),
(5, 'Linux Troubleshooter', 'Complete 3 Linux missions.', '🐧'),
(6, 'Kubernetes Operator', 'Complete 5 Kubernetes missions.', '☸️'),
(7, 'Kubernetes Master', 'Complete all Kubernetes missions.', '☸️'),
(8, 'CI/CD Engineer', 'Complete 3 CI/CD missions.', '🔄'),
(9, 'No-Hint Hero', 'Complete a mission without using hints.', '🧠'),
(10, 'Consistent Operator', 'Maintain a 3-day active streak.', '🔥'),
(11, 'DevOps Master', 'Complete all available missions in the Arena.', '👑')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name, 
    description = EXCLUDED.description, 
    icon = EXCLUDED.icon;

SELECT setval('achievements_id_seq', (SELECT MAX(id) FROM achievements));
