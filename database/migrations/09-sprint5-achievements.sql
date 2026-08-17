-- Migration: Sprint 5 Achievements Update
-- Safely inserts or updates required achievements without dropping existing user data.

INSERT INTO achievements (id, name, description, icon) VALUES
(1, 'Docker Rookie', 'Completed your first Docker mission.', '🐳'),
(2, 'Kubernetes Rookie', 'Completed your first Kubernetes mission.', '⚓'),
(3, 'Fast Solver', 'Completed a mission quickly.', '⚡'),
(4, 'Docker Master', 'Completed all Docker missions.', '🐋'),
(5, 'Linux Troubleshooter', 'Completed 3 Linux missions.', '🐧'),
(6, 'Kubernetes Operator', 'Completed 5 Kubernetes missions.', '☸️'),
(7, 'Troubleshooter', 'Completed 5 missions in total.', '🔧'),
(8, 'Speed Runner', 'Completed a mission in under 60 seconds.', '🏎️'),
(9, 'No-Hint Hero', 'Completed a mission without using any hints.', '🧠'),
(10, 'Consistent Operator', 'Maintained a 3-day streak.', '🔥'),
(11, 'Rollback Master', 'Successfully rolled back a broken Kubernetes deployment.', '⏪'),
(12, 'DevSecOps', 'Secured a container image by scanning for vulnerabilities.', '🛡️'),
(13, 'DevOps Master', 'Completed all available missions in the Arena.', '👑')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon;

-- Reset sequence to ensure future inserts don't collide
SELECT setval('achievements_id_seq', (SELECT MAX(id) FROM achievements));
