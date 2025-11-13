const redis = require('redis');
require('dotenv').config();

const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
});

redisClient.on('error', (err) => console.log('❌ Redis Client Error:', err.message));
redisClient.on('connect', () => console.log('✅ Redis подключен успешно'));

const connectRedis = async () => {
  try {
    await redisClient.connect();
    return true;
  } catch (error) {
    console.error('❌ Ошибка подключения к Redis:', error.message);
    // Не блокируем запуск сервера из-за Redis
    return false;
  }
};

module.exports = { redisClient, connectRedis };