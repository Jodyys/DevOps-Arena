const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const userCheck = await db.query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);
    if (userCheck.rows.length > 0) {
      const error = new Error('Username or email already exists');
      error.statusCode = 409;
      return next(error);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    const newUser = await db.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, total_xp',
      [username, email, passwordHash]
    );

    res.status(201).json({
      success: true,
      data: newUser.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      return next(error);
    }

    const user = userResult.rows[0];

    // Check password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      return next(error);
    }

    // Create JWT
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          total_xp: user.total_xp,
        }
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const userResult = await db.query(
      'SELECT id, username, email, total_xp, created_at, best_streak, current_streak, last_active_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }
    
    const user = userResult.rows[0];

    // Calculate level based on XP (simple thresholds as per plan)
    const xp = user.total_xp || 0;
    let level = 1;
    let title = 'DevOps Rookie';
    let nextLevelXp = 1000;
    
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

    user.level = level;
    user.title = title;
    user.nextLevelXp = nextLevelXp;

    // Get completed missions count
    const completedCountResult = await db.query(
      "SELECT COUNT(DISTINCT mission_id) as count FROM attempts WHERE user_id = $1 AND status = 'completed'",
      [user.id]
    );
    user.completed_missions = parseInt(completedCountResult.rows[0].count);

    // Get achievements
    const achievementsResult = await db.query(
      `SELECT a.id, a.name, a.description, a.icon, ua.unlocked_at 
       FROM achievements a
       LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = $1
       ORDER BY a.id ASC`,
      [user.id]
    );
    
    user.achievements = achievementsResult.rows.map(a => ({
      id: a.id,
      name: a.name,
      description: a.description,
      icon: a.icon,
      unlocked: !!a.unlocked_at,
      unlocked_at: a.unlocked_at
    }));

    // Calculate streak
    const attemptsResult = await db.query(
      `SELECT DATE(created_at) as attempt_date 
       FROM attempts 
       WHERE user_id = $1 
       GROUP BY DATE(created_at) 
       ORDER BY attempt_date DESC`,
      [user.id]
    );

    let streak = 0;
    if (attemptsResult.rows.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let currentDateToMatch = new Date(today);
      
      // Check if they have activity today or yesterday to continue the streak
      const mostRecent = new Date(attemptsResult.rows[0].attempt_date);
      mostRecent.setHours(0, 0, 0, 0);
      
      const diffTime = Math.abs(today.getTime() - mostRecent.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) {
        // Active today or yesterday, streak is alive
        for (let row of attemptsResult.rows) {
          const attemptDate = new Date(row.attempt_date);
          attemptDate.setHours(0, 0, 0, 0);
          
          if (attemptDate.getTime() === currentDateToMatch.getTime()) {
            streak++;
            currentDateToMatch.setDate(currentDateToMatch.getDate() - 1);
          } else if (attemptDate.getTime() === currentDateToMatch.getTime() + (1000 * 60 * 60 * 24) && streak === 0) {
              // Edge case: first record is yesterday, so today's loop missed
              currentDateToMatch.setDate(currentDateToMatch.getDate() - 1);
              if (attemptDate.getTime() === currentDateToMatch.getTime()) {
                  streak++;
                  currentDateToMatch.setDate(currentDateToMatch.getDate() - 1);
              }
          } else {
            break;
          }
        }
      }
    }
    
    // Update streak in DB if needed
    if (streak !== user.current_streak || streak > user.best_streak) {
      const bestStreak = Math.max(streak, user.best_streak || 0);
      await db.query(
        'UPDATE users SET current_streak = $1, best_streak = $2 WHERE id = $3',
        [streak, bestStreak, user.id]
      );
      user.current_streak = streak;
      user.best_streak = bestStreak;
    }
    
    user.streak = streak;
    user.best_streak = user.best_streak || 0;

    // Get Incident Feed (Recent Activity)
    // We combine recent attempts and recent achievements
    const recentAttemptsResult = await db.query(
      `SELECT a.id, a.status, a.score as xp, a.duration, a.created_at, m.title, m.id as mission_id, 'mission' as type
       FROM attempts a
       JOIN missions m ON a.mission_id = m.id
       WHERE a.user_id = $1
       ORDER BY a.created_at DESC LIMIT 5`,
      [user.id]
    );
    
    const recentAchievementsResult = await db.query(
      `SELECT ua.id, a.name as title, ua.unlocked_at as created_at, 'achievement' as type
       FROM user_achievements ua
       JOIN achievements a ON ua.achievement_id = a.id
       WHERE ua.user_id = $1
       ORDER BY ua.unlocked_at DESC LIMIT 5`,
      [user.id]
    );
    
    const incidentFeed = [...recentAttemptsResult.rows, ...recentAchievementsResult.rows]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10);
      
    user.incidentFeed = incidentFeed;

    // Calculate "Continue Learning" ID
    // Find the first mission that is not completed and has prerequisites met
    // (For simplicity, we'll just fetch all missions, completed statuses, and prerequisites)
    const allMissions = await db.query('SELECT id, prerequisites FROM missions ORDER BY id ASC');
    const completedMissionsSet = new Set(
      (await db.query(`SELECT DISTINCT mission_id FROM attempts WHERE user_id = $1 AND status = 'completed'`, [user.id]))
      .rows.map(r => r.mission_id)
    );
    
    let continueMissionId = null;
    for (let mission of allMissions.rows) {
      if (!completedMissionsSet.has(mission.id)) {
        // Check prerequisites
        let reqs = Array.isArray(mission.prerequisites) ? mission.prerequisites : [];
        if (typeof mission.prerequisites === 'string') {
          try { reqs = JSON.parse(mission.prerequisites); } catch(e){}
        }
        const canUnlock = reqs.every(reqId => completedMissionsSet.has(reqId));
        if (canUnlock) {
          continueMissionId = mission.id;
          break;
        }
      }
    }
    
    user.continueMissionId = continueMissionId;

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const resetGame = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Begin transaction
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      
      // Delete user's active challenges (cleaning up k8s resources should be handled separately if we want, but doing it from DB is easy for next start)
      // Actually, we should trigger k8s cleanup for active challenges before deleting from DB.
      // But a simple reset might just orphan them if not careful. Let's fetch active challenges first.
      const activeChallenges = await client.query('SELECT * FROM active_challenges WHERE user_id = $1', [userId]);
      
      // Delete records
      await client.query('DELETE FROM attempts WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM user_achievements WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM active_challenges WHERE user_id = $1', [userId]);
      
      // Reset user stats
      await client.query(
        'UPDATE users SET total_xp = 0, current_streak = 0, best_streak = 0 WHERE id = $1',
        [userId]
      );
      
      await client.query('COMMIT');
      
      // Clean up K8s namespaces for active challenges
      const k8sService = require('../services/kubernetesService');
      for (const challenge of activeChallenges.rows) {
        try {
          const challengeId = `u${challenge.user_id}-m${challenge.mission_id}`;
          await k8sService.cleanupChallenge(challengeId);
        } catch (err) {
          console.error('Failed to cleanup challenge on reset:', err);
        }
      }
      
      res.json({ success: true, message: "Game reset successfully." });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  resetGame,
};
