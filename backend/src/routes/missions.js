const express = require('express');
const router = express.Router();
const missionController = require('../controllers/missionController');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all mission routes
router.use(authMiddleware);

router.get('/:id', missionController.getMissionById);
router.post('/:id/start', authMiddleware, missionController.startMission);
router.post('/:id/submit', authMiddleware, missionController.submitMission);
router.post('/:id/replay', authMiddleware, missionController.replayMission);
router.get('/:id/history', authMiddleware, missionController.getMissionHistory);

module.exports = router;
