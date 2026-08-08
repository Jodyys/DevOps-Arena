const express = require('express');
const router = express.Router();
const missionController = require('../controllers/missionController');
const authMiddleware = require('../middleware/auth');

router.get('/:id', authMiddleware, missionController.getMissionById);
router.post('/:id/start', authMiddleware, missionController.startMission);
router.post('/:id/submit', authMiddleware, missionController.submitMission);

module.exports = router;
