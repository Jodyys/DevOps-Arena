const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middleware/validation');
const { registerSchema, loginSchema } = require('../validators/authValidator');
const authMiddleware = require('../middleware/auth');

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
