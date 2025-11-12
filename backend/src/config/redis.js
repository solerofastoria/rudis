const redis = require('redis');
require('dotenv').config();

const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  }
});

redisClient.on('error', (err) => console.log(' Redis Client Error:', err.message));
redisClient.on('connect', () => console.log(' Redis подключен успешно'));

const connectRedis = async () => {
  try {
    await redisClient.connect();
    return true;
  } catch (error) {
    console.error(' Ошибка подключения к Redis:', error.message);
    throw error;
  }
};

module.exports = { redisClient, connectRedis };