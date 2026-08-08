const bcrypt = require('bcrypt');
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
      'SELECT id, username, email, total_xp, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    res.json({
      success: true,
      data: userResult.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
};
