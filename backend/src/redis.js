const { createClient } = require('redis');
require('dotenv').config();

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));

// Export a function to connect, so we can await it in our app startup
const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
  return redisClient;
};

module.exports = {
  redisClient,
  connectRedis,
};
