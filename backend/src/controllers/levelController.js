const db = require('../db');

const getLevels = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const levelsResult = await db.query(
      'SELECT id, name, description, difficulty, category, xp_reward, is_active FROM levels ORDER BY id ASC'
    );
    
    // Count total missions per level
    const totalMissionsResult = await db.query(
      'SELECT level_id, COUNT(*) as total FROM missions GROUP BY level_id'
    );
    const totalMissionsMap = {};
    totalMissionsResult.rows.forEach(r => {
      totalMissionsMap[r.level_id] = parseInt(r.total);
    });

    // Count completed missions per level for this user
    const completedMissionsResult = await db.query(`
       SELECT m.level_id, COUNT(DISTINCT a.mission_id) as done 
       FROM attempts a
       JOIN missions m ON a.mission_id = m.id
       WHERE a.user_id = $1 AND a.status = 'completed'
       GROUP BY m.level_id
    `, [userId]);
    const completedMissionsMap = {};
    completedMissionsResult.rows.forEach(r => {
      completedMissionsMap[r.level_id] = parseInt(r.done);
    });

    const levels = levelsResult.rows.map((level, index) => {
      const done = completedMissionsMap[level.id] || 0;
      const total = totalMissionsMap[level.id] || 0;
      const allDone = total > 0 && done >= total;

      let status = 'locked';
      if (allDone) {
        status = 'completed';
      } else {
        // All levels are always accessible
        status = 'in_progress';
      }

      return {
        ...level,
        status,
        missions_completed: done,
        missions_total: total,
      };
    });

    res.json({
      success: true,
      data: levels,
    });
  } catch (error) {
    next(error);
  }
};

const getLevelById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const levelResult = await db.query('SELECT * FROM levels WHERE id = $1', [id]);
    
    if (levelResult.rows.length === 0) {
      const error = new Error('Level not found');
      error.statusCode = 404;
      return next(error);
    }

    const missionsResult = await db.query(
        'SELECT id, title, description, difficulty, prerequisites FROM missions WHERE level_id = $1 ORDER BY id ASC', 
        [id]
    );
    
    // Get user's completed missions to determine status of these missions
    const userAttempts = await db.query(
        'SELECT mission_id, status FROM attempts WHERE user_id = $1',
        [userId]
    );
    
    // Map of mission_id -> best status
    const statusMap = {};
    userAttempts.rows.forEach(row => {
        if (!statusMap[row.mission_id] || row.status === 'completed') {
            statusMap[row.mission_id] = row.status;
        }
    });

    const missions = missionsResult.rows.map(m => {
       const status = statusMap[m.id] || 'not_started';
       let lockedReason = null;
       
       // Check prerequisites (array of mission IDs)
       if (m.prerequisites && Array.isArray(m.prerequisites) && m.prerequisites.length > 0) {
           for (const prereqId of m.prerequisites) {
               if (statusMap[prereqId] !== 'completed') {
                   lockedReason = `Requires Mission ${prereqId} to be completed`;
                   break;
               }
           }
       }

       // Also sequential lock inside the level if no specific prereqs
       if (!lockedReason && !m.prerequisites?.length) {
          const currentIndex = missionsResult.rows.findIndex(row => row.id === m.id);
          if (currentIndex > 0) {
             const prevMission = missionsResult.rows[currentIndex - 1];
             if (statusMap[prevMission.id] !== 'completed') {
                 lockedReason = `Requires: ${prevMission.title}`;
             }
          }
       }

       return {
           ...m,
           status: lockedReason ? 'locked' : status,
           lockedReason
       };
    });

    res.json({
      success: true,
      data: {
        ...levelResult.rows[0],
        missions: missions,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLevels,
  getLevelById,
};
