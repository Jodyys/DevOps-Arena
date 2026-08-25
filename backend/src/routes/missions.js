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

// Sandbox specific routes
router.get('/:id/status', authMiddleware, missionController.getSandboxStatus);
router.post('/:id/terminal', authMiddleware, missionController.runTerminalCommand);
router.post('/:id/abort', authMiddleware, missionController.abortMission);

module.exports = router;
