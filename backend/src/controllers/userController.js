const db = require('../db');

const getLeaderboard = async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT id, username, total_xp, current_streak, best_streak FROM users ORDER BY total_xp DESC LIMIT 50'
    );
    
    // Calculate level and title for each user for the frontend
    const users = result.rows.map(user => {
      let level = 1;
      let title = 'DevOps Rookie';
      let nextLevelXp = 1000;
      const xp = user.total_xp || 0;
      
      if (xp >= 40000) { level = 15; title = 'Arena Grandmaster'; nextLevelXp = 50000; }
      else if (xp >= 35000) { level = 14; title = 'Site Reliability Engineer'; nextLevelXp = 40000; }
      else if (xp >= 30000) { level = 13; title = 'Cloud Native Architect'; nextLevelXp = 35000; }
      else if (xp >= 25000) { level = 12; title = 'Principal DevOps Engineer'; nextLevelXp = 30000; }
      else if (xp >= 20000) { level = 11; title = 'Staff DevOps Engineer'; nextLevelXp = 25000; }
      else if (xp >= 15000) { level = 10; title = 'DevOps Architect'; nextLevelXp = 20000; }
      else if (xp >= 10000) { level = 9; title = 'Platform Engineer'; nextLevelXp = 15000; }
      else if (xp >= 7500) { level = 8; title = 'Senior DevOps Engineer'; nextLevelXp = 10000; }
      else if (xp >= 5000) { level = 7; title = 'DevOps Engineer'; nextLevelXp = 7500; }
      else if (xp >= 3000) { level = 6; title = 'Kubernetes Engineer'; nextLevelXp = 5000; }
      else if (xp >= 1500) { level = 5; title = 'Kubernetes Apprentice'; nextLevelXp = 3000; }
      else if (xp >= 1000) { level = 4; title = 'Docker Engineer'; nextLevelXp = 1500; }
      else if (xp >= 500) { level = 3; title = 'Container Apprentice'; nextLevelXp = 1000; }
      else if (xp >= 200) { level = 2; title = 'Linux Apprentice'; nextLevelXp = 500; }
      else { nextLevelXp = 200; }

      return {
        ...user,
        level,
        title,
        nextLevelXp
      };
    });

    res.json({
      status: 'success',
      data: users
    });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT id, username, email, total_xp, last_active_at, created_at FROM users ORDER BY created_at DESC'
    );
    
    res.json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeaderboard,
  getUsers
};
