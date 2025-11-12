const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize, testConnection } = require('./config/database');
const { connectRedis } = require('./config/redis');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Тестовый маршрут
app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = await testConnection();
    const redisStatus = await connectRedis();
    
    res.json({ 
      status: 'OK', 
      message: 'Сервер работает!',
      timestamp: new Date().toISOString(),
      databases: {
        postgres: 'connected',
        redis: 'connected'
      },
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Проблемы с подключением к базам данных',
      error: error.message
    });
  }
});

// Маршрут для проверки API
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API работает нормально!',
    version: '1.0.0',
    features: ['Express', 'PostgreSQL', 'Redis', 'JWT Auth']
  });
});

// Обработка 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Маршрут не найден',
    path: req.originalUrl,
    availableRoutes: ['/api/health', '/api/test']
  });
});

// Инициализация и запуск сервера
const initializeServer = async () => {
  try {
    const PORT = process.env.PORT || 5000;
    
    // Тестируем подключения к базам
    console.log('🔄 Проверка подключения к PostgreSQL...');
    await testConnection();
    
    console.log('🔄 Проверка подключения к Redis...');
    await connectRedis();
    
    // Запускаем сервер
    app.listen(PORT, () => {
      console.log(` Сервер запущен на порту ${PORT}`);
      console.log(` Health check: http://localhost:${PORT}/api/health`);
      console.log(`Test route: http://localhost:${PORT}/api/test`);
      console.log(` Environment: ${process.env.NODE_ENV}`);
      console.log(` PostgreSQL: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
      console.log(` Redis: ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`);
    });
    
  } catch (error) {
    console.error(' Не удалось запустить сервер:', error.message);
    console.log(' Проверьте:');
    console.log('  1. Запущен ли Docker');
    console.log('  2. Запущены ли контейнеры: npm run db:start');
    console.log('  3. Правильные ли настройки в .env файле');
    process.exit(1);
  }
};

initializeServer();

module.exports = app;