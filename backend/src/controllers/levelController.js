const db = require('../db');

const getLevels = async (req, res, next) => {
  try {
    const levelsResult = await db.query(
      'SELECT id, name, description, difficulty, category, xp_reward, is_active FROM levels ORDER BY id ASC'
    );
    
    // Add fake status for now (this would normally join with attempts or user progress)
    const levels = levelsResult.rows.map((level, index) => ({
      ...level,
      status: index === 0 ? 'completed' : index === 1 ? 'in_progress' : 'locked' // mocked for MVP
    }));

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
    const levelResult = await db.query('SELECT * FROM levels WHERE id = $1', [id]);
    
    if (levelResult.rows.length === 0) {
      const error = new Error('Level not found');
      error.statusCode = 404;
      return next(error);
    }

    const missionsResult = await db.query('SELECT id, title, description, difficulty FROM missions WHERE level_id = $1', [id]);
    
    res.json({
      success: true,
      data: {
        ...levelResult.rows[0],
        missions: missionsResult.rows,
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
