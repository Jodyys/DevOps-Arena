const db = require('../db');
const k8sService = require('../services/kubernetesService');

const getMissionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Don't expose solution to the frontend yet!
    const missionResult = await db.query(
      `SELECT m.id, m.level_id, m.title, m.description, m.objective, m.difficulty, m.hints, l.category 
       FROM missions m
       JOIN levels l ON m.level_id = l.id
       WHERE m.id = $1`, 
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

    // Check if mission exists and get category
    const missionCheck = await db.query(
      `SELECT m.id, l.category 
       FROM missions m
       JOIN levels l ON m.level_id = l.id
       WHERE m.id = $1`, 
      [id]
    );
    
    if (missionCheck.rows.length === 0) {
      const error = new Error('Mission not found');
      error.statusCode = 404;
      return next(error);
    }

    const mission = missionCheck.rows[0];

    // Check if it's a Kubernetes, Linux, or CI/CD mission (which all use k8s pods)
    if (mission.category === 'Kubernetes' || mission.category === 'Docker' || mission.category === 'Linux' || mission.category === 'CI/CD' || parseInt(id) === 31 || parseInt(id) === 35 || parseInt(id) === 3) {
      // Check if already active
      const activeCheck = await db.query('SELECT namespace FROM active_challenges WHERE user_id = $1 AND mission_id = $2', [userId, id]);
      if (activeCheck.rows.length > 0) {
        return res.json({ success: true, message: 'Challenge already active', namespace: activeCheck.rows[0].namespace });
      }

      // Start the challenge in Kubernetes
      console.log(`Starting Kubernetes challenge for mission ${id}, category: ${mission.category}`);
      const challengeId = await k8sService.startChallenge(parseInt(id), userId);
      console.log(`startChallenge returned: ${challengeId}`);
      
      // Track in DB
      if (challengeId) {
        await db.query(
          'INSERT INTO active_challenges (user_id, mission_id, namespace, status) VALUES ($1, $2, $3, $4)',
          [userId, id, challengeId, 'ACTIVE']
        );
      }
    }

    // Insert or update attempt
    const attemptResult = await db.query(
      `INSERT INTO attempts (user_id, mission_id, status, started_at) 
       VALUES ($1, $2, 'started', CURRENT_TIMESTAMP) 
       RETURNING id, status, started_at`,
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
    const { answer, hints_used } = req.body;
    const userId = req.user.id;

    if (!answer && answer !== 'validate') {
      const error = new Error('Answer is required');
      error.statusCode = 400;
      return next(error);
    }

    // Get mission to check solution and fetch xp_reward from levels
    const missionResult = await db.query(`
      SELECT m.solution, m.level_id, l.xp_reward, l.category 
      FROM missions m
      JOIN levels l ON m.level_id = l.id
      WHERE m.id = $1
    `, [id]);

    if (missionResult.rows.length === 0) {
      const error = new Error('Mission not found');
      error.statusCode = 404;
      return next(error);
    }

    const mission = missionResult.rows[0];
    let isCorrect = false;

    let checks = [];
    // Delegate to K8s Challenge Validator for Kubernetes, Linux, and CI/CD missions
    if (mission.category === 'Kubernetes' || mission.category === 'Docker' || mission.category === 'Linux' || mission.category === 'CI/CD' || parseInt(id) === 31 || parseInt(id) === 35 || parseInt(id) === 3) {
      const activeCheck = await db.query('SELECT namespace FROM active_challenges WHERE user_id = $1 AND mission_id = $2', [userId, id]);
      if (activeCheck.rows.length === 0) {
         const error = new Error('Sandbox not active or already cleaned up');
         error.statusCode = 400;
         return next(error);
      }
      const challengeId = activeCheck.rows[0].namespace;
      const validationResult = await k8sService.validateChallenge(parseInt(id), challengeId);
      
      if (typeof validationResult === 'object' && validationResult !== null) {
        isCorrect = validationResult.success;
        checks = validationResult.checks || [];
      } else {
        isCorrect = validationResult;
      }
      
      // Cleanup ONLY if correct as per requirements
      if (isCorrect) {
        // Run cleanup in background
        k8sService.cleanupChallenge(challengeId).catch(e => console.error(e));
        // Remove from DB
        await db.query('DELETE FROM active_challenges WHERE user_id = $1 AND mission_id = $2', [userId, id]);
      }
    } else {
      // Normal string matching mission
      isCorrect = answer.trim() === (mission.solution ? mission.solution.trim() : '');
    }

    // Determine completion status
    let isFirstCompletion = true;
    let personalBest = null;
    let isNewPersonalBest = false;
    
    if (isCorrect) {
      const previousCompletions = await db.query(
        'SELECT id, duration FROM attempts WHERE user_id = $1 AND mission_id = $2 AND status = $3',
        [userId, id, 'completed']
      );
      if (previousCompletions.rows.length > 0) {
        isFirstCompletion = false;
        personalBest = Math.min(...previousCompletions.rows.map(r => r.duration).filter(d => d != null));
      }
    }

    // Calculate duration from started_at
    const activeAttempt = await db.query(
      `SELECT id, started_at FROM attempts 
       WHERE user_id = $1 AND mission_id = $2 AND status = 'started' 
       ORDER BY created_at DESC LIMIT 1`,
      [userId, id]
    );

    let durationSeconds = 0;
    if (activeAttempt.rows.length > 0) {
      const startedAt = new Date(activeAttempt.rows[0].started_at);
      durationSeconds = Math.round((new Date().getTime() - startedAt.getTime()) / 1000);
    }

    // Update attempt
    let status = isCorrect ? 'completed' : 'failed';
    // Replay completion awards 0 XP. First completion awards full XP.
    let xpAwarded = 0;
    if (isCorrect) {
       xpAwarded = isFirstCompletion ? (mission.xp_reward || 1000) : 0;
    } else {
       xpAwarded = -25; // Penalty for failing
    }

    const usedHints = hints_used || 0;

    await db.query(
      `INSERT INTO attempts (user_id, mission_id, status, score, is_first_completion, duration, completed_at, hints_used) 
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, $7)`,
      [userId, id, status, xpAwarded, isFirstCompletion, durationSeconds, usedHints]
    );

    if (isCorrect && xpAwarded > 0) {
       // Update user XP
       await db.query(
         'UPDATE users SET total_xp = total_xp + $1 WHERE id = $2',
         [xpAwarded, userId]
       );
    }
    
    // Check Personal Best
    if (isCorrect && durationSeconds > 0) {
        if (personalBest === null || durationSeconds < personalBest) {
            isNewPersonalBest = true;
            personalBest = durationSeconds;
        }
    }

    // Check Achievements if successful
    if (isCorrect) {
        // Speed Runner (id: 8) (under 60 seconds)
        if (durationSeconds < 60) {
            await db.query('INSERT INTO user_achievements (user_id, achievement_id) VALUES ($1, 8) ON CONFLICT DO NOTHING', [userId]);
        }
        
        // No-Hint Hero (id: 9)
        if (usedHints === 0) {
            await db.query('INSERT INTO user_achievements (user_id, achievement_id) VALUES ($1, 9) ON CONFLICT DO NOTHING', [userId]);
        }
        
        // Consistent Operator (id: 10) - check streak
        const userStreakReq = await db.query('SELECT current_streak FROM users WHERE id = $1', [userId]);
        if (userStreakReq.rows.length > 0 && userStreakReq.rows[0].current_streak >= 3) {
            await db.query('INSERT INTO user_achievements (user_id, achievement_id) VALUES ($1, 10) ON CONFLICT DO NOTHING', [userId]);
        }

        // Category-based achievements
        const completedByCategory = await db.query(
          `SELECT l.category, COUNT(DISTINCT a.mission_id) as count 
           FROM attempts a 
           JOIN missions m ON a.mission_id = m.id 
           JOIN levels l ON m.level_id = l.id
           WHERE a.user_id = $1 AND a.status = 'completed'
           GROUP BY l.category`,
          [userId]
        );
        
        const counts = {};
        let totalCompleted = 0;
        for (let row of completedByCategory.rows) {
            counts[row.category] = parseInt(row.count);
            totalCompleted += parseInt(row.count);
        }
        
        // Troubleshooter (id: 7) - 5 missions total
        if (totalCompleted >= 5) {
            await db.query('INSERT INTO user_achievements (user_id, achievement_id) VALUES ($1, 7) ON CONFLICT DO NOTHING', [userId]);
        }
        
        // Docker Rookie (id: 1), Docker Master (id: 4)
        if (counts['Docker'] >= 1) await db.query('INSERT INTO user_achievements (user_id, achievement_id) VALUES ($1, 1) ON CONFLICT DO NOTHING', [userId]);
        // To check "all", we query total in category
        const totalDocker = await db.query(`SELECT COUNT(m.id) as count FROM missions m JOIN levels l ON m.level_id = l.id WHERE l.category = 'Docker'`);
        if (counts['Docker'] >= parseInt(totalDocker.rows[0].count)) await db.query('INSERT INTO user_achievements (user_id, achievement_id) VALUES ($1, 4) ON CONFLICT DO NOTHING', [userId]);
        
        // Linux Troubleshooter (id: 5)
        if (counts['Linux'] >= 3) await db.query('INSERT INTO user_achievements (user_id, achievement_id) VALUES ($1, 5) ON CONFLICT DO NOTHING', [userId]);
        
        // Kubernetes Operator (id: 6)
        if (counts['Kubernetes'] >= 5) await db.query('INSERT INTO user_achievements (user_id, achievement_id) VALUES ($1, 6) ON CONFLICT DO NOTHING', [userId]);

        // Rollback Master (id: 11) - completed M41
        if (parseInt(id) === 41) {
            await db.query('INSERT INTO user_achievements (user_id, achievement_id) VALUES ($1, 11) ON CONFLICT DO NOTHING', [userId]);
        }

        // DevSecOps (id: 12) - completed M42
        if (parseInt(id) === 42) {
            await db.query('INSERT INTO user_achievements (user_id, achievement_id) VALUES ($1, 12) ON CONFLICT DO NOTHING', [userId]);
        }

        // DevOps Master (id: 13) - all missions
        const totalMissions = await db.query('SELECT COUNT(id) as count FROM missions');
        if (totalCompleted >= parseInt(totalMissions.rows[0].count)) {
            await db.query('INSERT INTO user_achievements (user_id, achievement_id) VALUES ($1, 13) ON CONFLICT DO NOTHING', [userId]);
        }
    }

    res.json({
      success: true,
      data: {
        status,
        correct: isCorrect,
        xp: xpAwarded,
        is_first_completion: isFirstCompletion,
        duration: durationSeconds,
        personal_best: personalBest,
        is_new_personal_best: isNewPersonalBest,
        checks
      },
    });
  } catch (error) {
    next(error);
  }
};

const replayMission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if the user has completed this mission previously
    const previousCompletion = await db.query(
      'SELECT id FROM attempts WHERE user_id = $1 AND mission_id = $2 AND status = $3 LIMIT 1',
      [userId, id, 'completed']
    );

    if (previousCompletion.rows.length === 0) {
       return res.status(400).json({ success: false, message: 'You can only replay completed missions.' });
    }

    const missionCheck = await db.query(
      `SELECT l.category 
       FROM missions m
       JOIN levels l ON m.level_id = l.id
       WHERE m.id = $1`, 
      [id]
    );
    const mission = missionCheck.rows[0];

    // Cleanup existing challenge if it's a k8s/linux/cicd challenge
    if (mission.category === 'Kubernetes' || mission.category === 'Docker' || mission.category === 'Linux' || mission.category === 'CI/CD' || parseInt(id) === 31 || parseInt(id) === 35 || parseInt(id) === 3) {
       const activeCheck = await db.query('SELECT namespace FROM active_challenges WHERE user_id = $1 AND mission_id = $2', [userId, id]);
       if (activeCheck.rows.length > 0) {
         const oldChallengeId = activeCheck.rows[0].namespace;
         await k8sService.cleanupChallenge(oldChallengeId).catch(e => console.error(e));
         await db.query('DELETE FROM active_challenges WHERE user_id = $1 AND mission_id = $2', [userId, id]);
       }

       // Create new challenge
       const challengeId = await k8sService.startChallenge(parseInt(id), userId);
       await db.query(
         'INSERT INTO active_challenges (user_id, mission_id, namespace, status) VALUES ($1, $2, $3, $4)',
         [userId, id, challengeId, 'ACTIVE']
       );
    }

    // Insert new attempt
    const attemptResult = await db.query(
      `INSERT INTO attempts (user_id, mission_id, status, started_at) 
       VALUES ($1, $2, 'started', CURRENT_TIMESTAMP) 
       RETURNING id, status, started_at`,
      [userId, id]
    );

    res.json({
      success: true,
      message: 'Mission replay started',
      data: attemptResult.rows[0],
    });

  } catch (error) {
    next(error);
  }
};

const getMissionHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const history = await db.query(
      `SELECT id, status, score, duration, hints_used, started_at, completed_at
       FROM attempts
       WHERE user_id = $1 AND mission_id = $2
       ORDER BY created_at DESC`,
      [userId, id]
    );

    res.json({
      success: true,
      data: history.rows
    });
  } catch (error) {
    next(error);
  }
};

const getSandboxStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const activeCheck = await db.query(
      'SELECT namespace, status FROM active_challenges WHERE user_id = $1 AND mission_id = $2', 
      [userId, id]
    );
    if (activeCheck.rows.length === 0) {
      return res.json({ success: true, data: { status: 'DESTROYED', sandbox_id: null } });
    }

    const namespaceName = activeCheck.rows[0].namespace;

    // Check real-time pod status from Kubernetes
    try {
      const { kc } = require('../services/kubernetesService');
      const k8s = require('@kubernetes/client-node');
      const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
      const podRes = await k8sApi.readNamespacedPod('terminal', namespaceName);
      const phase = podRes.body.status.phase;
      const containerReady = podRes.body.status.containerStatuses?.[0]?.ready || false;

      if (phase === 'Running' && containerReady) {
        // Update DB status if it was stale
        if (activeCheck.rows[0].status !== 'ACTIVE') {
          await db.query('UPDATE active_challenges SET status = $1 WHERE user_id = $2 AND mission_id = $3', ['ACTIVE', userId, id]);
        }
        return res.json({ success: true, data: { status: 'ACTIVE', sandbox_id: namespaceName } });
      } else if (phase === 'Pending' || phase === 'Running') {
        return res.json({ success: true, data: { status: 'PROVISIONING', sandbox_id: namespaceName } });
      } else {
        return res.json({ success: true, data: { status: 'FAILED', sandbox_id: namespaceName } });
      }
    } catch (k8sErr) {
      // Pod not found or namespace gone
      return res.json({ success: true, data: { status: 'PROVISIONING', sandbox_id: namespaceName } });
    }
  } catch (error) {
    next(error);
  }
};


const runTerminalCommand = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { command } = req.body;
    
    if (!command) {
       return res.status(400).json({ success: false, stdout: '', stderr: 'Command is required', exitCode: 1 });
    }

    const activeCheck = await db.query('SELECT namespace, status FROM active_challenges WHERE user_id = $1 AND mission_id = $2', [userId, id]);
    if (activeCheck.rows.length === 0) {
      return res.status(400).json({ success: false, stdout: '', stderr: 'Sandbox is not active or has been destroyed.', exitCode: 1 });
    }
    
    const challengeId = activeCheck.rows[0].namespace;
    const result = await k8sService.executeTerminalCommand(challengeId, command);
    res.json({ success: true, data: { success: result.success !== false, ...result } });
  } catch (error) {
    next(error);
  }
};

const abortMission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const activeCheck = await db.query('SELECT namespace FROM active_challenges WHERE user_id = $1 AND mission_id = $2', [userId, id]);
    if (activeCheck.rows.length > 0) {
      const challengeId = activeCheck.rows[0].namespace;
      await db.query('UPDATE active_challenges SET status = $1 WHERE user_id = $2 AND mission_id = $3', ['CLEANING_UP', userId, id]);
      
      // Cleanup in background
      k8sService.cleanupChallenge(challengeId)
        .then(() => db.query('DELETE FROM active_challenges WHERE user_id = $1 AND mission_id = $2', [userId, id]))
        .catch(e => console.error(e));
    }
    
    res.json({ success: true, message: 'Mission aborted and sandbox cleaned up' });
  } catch (error) {
    next(error);
  }
};

// Background sandbox cleaner
setInterval(async () => {
  try {
    // 30 minutes timeout
    const result = await db.query("SELECT * FROM active_challenges WHERE started_at < NOW() - INTERVAL '30 minutes'");
    for (const challenge of result.rows) {
      console.log(`Sandbox ${challenge.namespace} expired. Cleaning up...`);
      await k8sService.cleanupChallenge(challenge.namespace).catch(e => console.error(e));
      await db.query('DELETE FROM active_challenges WHERE id = $1', [challenge.id]);
    }
  } catch(e) {
    console.error("Background cleaner error:", e);
  }
}, 60 * 1000); // Check every minute

module.exports = {
  getMissionById,
  startMission,
  submitMission,
  replayMission,
  getMissionHistory,
  getSandboxStatus,
  runTerminalCommand,
  abortMission
};
