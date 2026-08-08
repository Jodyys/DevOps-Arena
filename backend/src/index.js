require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pino = require('pino');
const pinoHttp = require('pino-http');
const db = require('./db');
const { connectRedis } = require('./redis');

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true
}));
app.use(express.json());
app.use(pinoHttp({ logger }));

// Health check endpoint
app.get('/health', async (req, res) => {
  let postgresStatus = 'unhealthy';
  let redisStatus = 'unhealthy';

  try {
    await db.query('SELECT 1');
    postgresStatus = 'healthy';
  } catch (error) {
    logger.error({ error }, 'PostgreSQL health check failed');
  }

  try {
    const redisClient = await connectRedis();
    const pingResponse = await redisClient.ping();
    if (pingResponse === 'PONG') {
      redisStatus = 'healthy';
    }
  } catch (error) {
    logger.error({ error }, 'Redis health check failed');
  }

  const status = (postgresStatus === 'healthy' && redisStatus === 'healthy') ? 'ok' : 'error';
  const statusCode = status === 'ok' ? 200 : 503;

  res.status(statusCode).json({
    success: status === 'ok',
    status,
    service: 'devops-arena-backend',
    dependencies: {
      postgres: postgresStatus,
      redis: redisStatus
    }
  });
});

const authRoutes = require('./routes/auth');
const levelsRoutes = require('./routes/levels');
const missionsRoutes = require('./routes/missions');
const errorHandler = require('./middleware/errorHandler');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/levels', levelsRoutes);
app.use('/api/missions', missionsRoutes);

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.BACKEND_PORT || 4000;

const startServer = async () => {
  try {
    await connectRedis();
    app.listen(PORT, () => {
      logger.info(`Backend server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
