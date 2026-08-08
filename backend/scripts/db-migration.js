const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' }); // Assuming executed from scripts/

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'devops',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'devopsarena',
  password: process.env.POSTGRES_PASSWORD || 'secret',
  port: process.env.POSTGRES_PORT || 5432,
});

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('Adding is_first_completion to attempts...');
    // Add column if it doesn't exist. Compatible with PostgreSQL 9.6+
    await client.query(`
      ALTER TABLE attempts 
      ADD COLUMN IF NOT EXISTS is_first_completion BOOLEAN DEFAULT true;
    `);

    console.log('Seeding new achievements...');
    await client.query(`
      INSERT INTO achievements (id, name, description, icon) VALUES
      (1, 'Docker Beginner', 'Completed your first Docker mission.', '🐳'),
      (2, 'Kubernetes Rookie', 'Completed your first Kubernetes mission.', '☸️'),
      (3, 'Fast Solver', 'Completed a mission in under 1 minute.', '⚡'),
      (4, 'First Blood', 'Completed your very first mission.', '🩸'),
      (5, 'Container Master', 'Complete 5 Docker missions.', '🏆'),
      (6, 'Persistence', 'Replay a mission you already completed.', '🔄')
      ON CONFLICT (id) DO UPDATE SET 
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        icon = EXCLUDED.icon;
    `);

    // Fix sequence
    await client.query(`
      SELECT setval('achievements_id_seq', (SELECT MAX(id) FROM achievements));
    `);

    await client.query('COMMIT');
    console.log('Migration completed successfully!');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', e);
  } finally {
    client.release();
    pool.end();
  }
}

migrate();
