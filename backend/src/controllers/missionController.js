const db = require('../db');
const k8sService = require('../services/kubernetesService');

const getMissionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Don't expose solution to the frontend yet!
    const missionResult = await db.query(
      'SELECT id, level_id, title, description, objective, difficulty FROM missions WHERE id = $1', 
      [id]
    );

    if (missionResult.rows.length === 0) {
      const error = new Error('Mission not found');
      error.statusCode = 404;
      return next(error);
    }

    res.json({
      success: true,
      data: missionResult.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

const startMission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if it's a Kubernetes mission (IDs 4 to 7 in our seed)
    if (parseInt(id) >= 4 && parseInt(id) <= 7) {
      // Check if already active
      const activeCheck = await db.query('SELECT namespace FROM active_challenges WHERE user_id = $1 AND mission_id = $2', [userId, id]);
      if (activeCheck.rows.length > 0) {
        return res.json({ success: true, message: 'Challenge already active', namespace: activeCheck.rows[0].namespace });
      }

      // Start the challenge in Kubernetes
      const challengeId = await k8sService.startChallenge(parseInt(id), userId);
      
      // Track in DB (using the namespace column to store challengeId for now to avoid DB migration)
      if (challengeId) {
        await db.query(
          'INSERT INTO active_challenges (user_id, mission_id, namespace) VALUES ($1, $2, $3)',
          [userId, id, challengeId]
        );
      }
    }

    // Check if mission exists
    const missionCheck = await db.query('SELECT id FROM missions WHERE id = $1', [id]);
    if (missionCheck.rows.length === 0) {
      const error = new Error('Mission not found');
      error.statusCode = 404;
      return next(error);
    }

    // Insert or update attempt
    const attemptResult = await db.query(
      `INSERT INTO attempts (user_id, mission_id, status) 
       VALUES ($1, $2, 'started') 
       RETURNING id, status, created_at`,
      [userId, id]
    );

    res.json({
      success: true,
      data: attemptResult.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

const submitMission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { answer } = req.body;
    const userId = req.user.id;

    if (!answer) {
      const error = new Error('Answer is required');
      error.statusCode = 400;
      return next(error);
    }

    // Get mission to check solution
    const missionResult = await db.query('SELECT solution, level_id FROM missions WHERE id = $1', [id]);
    if (missionResult.rows.length === 0) {
      const error = new Error('Mission not found');
      error.statusCode = 404;
      return next(error);
    }

    const mission = missionResult.rows[0];
    let isCorrect = false;

    if (parseInt(id) >= 4 && parseInt(id) <= 7) {
      // K8s Mission: validate via API instead of string comparison
      const challengeId = `u${userId}-m${id}`;
      isCorrect = await k8sService.validateChallenge(parseInt(id), challengeId);
      
      // Cleanup ONLY if correct as per requirements
      if (isCorrect) {
        // Run cleanup in background
        k8sService.cleanupChallenge(challengeId).catch(e => console.error(e));
        // Remove from DB
        await db.query('DELETE FROM active_challenges WHERE user_id = $1 AND mission_id = $2', [userId, id]);
      }
    } else {
      // Normal string matching mission
      isCorrect = answer.trim() === mission.solution.trim();
    }

    // Update attempt
    let status = isCorrect ? 'completed' : 'failed';
    let xpAwarded = isCorrect ? 100 : -25; // simple scoring from plan

    await db.query(
      `INSERT INTO attempts (user_id, mission_id, status, score) 
       VALUES ($1, $2, $3, $4)`,
      [userId, id, status, xpAwarded]
    );

    if (isCorrect) {
       // Update user XP
       await db.query(
         'UPDATE users SET total_xp = total_xp + $1 WHERE id = $2',
         [xpAwarded, userId]
       );
    }

    res.json({
      success: true,
      data: {
        status,
        correct: isCorrect,
        xp: xpAwarded,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMissionById,
  startMission,
  submitMission,
};
