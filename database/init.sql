-- Schema Definition

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    total_xp INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS levels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty VARCHAR(50),
    category VARCHAR(100),
    xp_reward INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS missions (
    id SERIAL PRIMARY KEY,
    level_id INTEGER REFERENCES levels(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    objective TEXT,
    difficulty VARCHAR(50),
    solution TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attempts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    mission_id INTEGER REFERENCES missions(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL, -- 'started', 'failed', 'completed'
    score INTEGER DEFAULT 0,
    duration INTEGER, -- in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS achievements (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    achievement_id INTEGER REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS active_challenges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    mission_id INTEGER REFERENCES missions(id) ON DELETE CASCADE,
    namespace VARCHAR(255) NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, mission_id)
);

-- Seed Data

-- Users
INSERT INTO users (id, username, email, password_hash, total_xp) VALUES
(1, 'admin', 'admin@devopsarena.local', '$2b$10$GlMP9plzSiPCVXL4txJjcODDw5NAOK7RwPl2RhuR//aebvYYzdw5i', 0)
ON CONFLICT (id) DO NOTHING;

-- Levels
INSERT INTO levels (id, name, description, difficulty, category, xp_reward, is_active) VALUES
(1, 'Docker Basics', 'Learn the fundamentals of Docker containers and images.', 'Easy', 'Docker', 1000, true),
(2, 'Docker Compose', 'Learn how to manage multi-container applications.', 'Easy', 'Docker', 1200, true),
(3, 'Kubernetes Deployment', 'Deploy your first application to a Kubernetes cluster.', 'Medium', 'Kubernetes', 2000, true),
(4, 'Kubernetes Troubleshooting', 'Debug and fix broken Kubernetes workloads.', 'Hard', 'Kubernetes', 3000, true)
ON CONFLICT (id) DO NOTHING;

-- Missions
INSERT INTO missions (id, level_id, title, description, objective, difficulty, solution) VALUES
(1, 1, 'Fix the Dockerfile', 'The backend Dockerfile is failing to build because it is missing a command to install dependencies.', 'Identify and fix the missing command in the Dockerfile.', 'Easy', 'RUN npm install'),
(2, 1, 'Reduce Docker Image Size', 'The current frontend image is 1.2GB. That is way too big!', 'Change the base image to a smaller Alpine version.', 'Easy', 'FROM node:18-alpine'),
(3, 2, 'Fix Database Connection', 'The backend cannot connect to the database in docker-compose.yml.', 'Update the DB_HOST environment variable to point to the correct service name.', 'Easy', 'DB_HOST=postgres'),
(4, 3, 'Fix ImagePullBackOff', 'The backend pod is stuck in ImagePullBackOff state.', 'Identify and fix the incorrect Docker image name in the deployment manifest.', 'Medium', 'jodyys/devops-arena-backend:v1'),
(5, 4, 'Fix CrashLoopBackOff', 'The backend Pod keeps crashing. Logs indicate a missing environment variable.', 'Identify which environment variable is missing causing the crash.', 'Hard', 'DATABASE_URL'),
(6, 4, 'Service Selector Mismatch', 'The application is unavailable. The Pod is running but the Service is not routing traffic to it.', 'Fix the label selector in the Service definition to match the Pods.', 'Medium', 'app: backend'),
(7, 4, 'Fix Ingress 502 Bad Gateway', 'Users are getting a 502 Bad Gateway when accessing the /api endpoint.', 'Find the incorrect Ingress configuration for the backend path.', 'Hard', 'port: 80')
ON CONFLICT (id) DO NOTHING;

-- Achievements
INSERT INTO achievements (id, name, description, icon) VALUES
(1, 'Docker Beginner', 'Completed your first Docker mission.', '🐳'),
(2, 'Kubernetes Rookie', 'Completed your first Kubernetes mission.', '☸️'),
(3, 'Fast Solver', 'Completed a mission in under 1 minute.', '⚡')
ON CONFLICT (id) DO NOTHING;

-- Reset sequences for proper ID generation after seeding
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('levels_id_seq', (SELECT MAX(id) FROM levels));
SELECT setval('missions_id_seq', (SELECT MAX(id) FROM missions));
SELECT setval('achievements_id_seq', (SELECT MAX(id) FROM achievements));
