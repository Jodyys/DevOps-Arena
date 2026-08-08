const express = require('express');
const router = express.Router();
const levelController = require('../controllers/levelController');
const authMiddleware = require('../middleware/auth');

// Note: For MVP, levels are public or protected. Let's protect them as per plan.
router.get('/', authMiddleware, levelController.getLevels);
router.get('/:id', authMiddleware, levelController.getLevelById);

module.exports = router;
