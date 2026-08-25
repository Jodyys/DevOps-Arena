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
const usersRoutes = require('./routes/users');
const errorHandler = require('./middleware/errorHandler');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/levels', levelsRoutes);
app.use('/api/missions', missionsRoutes);
app.use('/api/users', usersRoutes);

// Global Error Handler
app.use(errorHandler);

const PORT = 4000;

const startServer = async () => {
  try {
    console.log("PORT IS:", PORT);
    console.log("process.env.PORT:", process.env.PORT);
    console.log("process.env.BACKEND_PORT:", process.env.BACKEND_PORT);
    await connectRedis();
    const { setupWebSocket } = require('./websocket');

    const port = process.env.PORT || 4000;
    const server = app.listen(port, '0.0.0.0', () => {
      logger.info(`Backend server running on port ${port} (K8s mode)`);
    });

    // Attach WebSocket server
    setupWebSocket(server, logger);
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
