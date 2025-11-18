const express = require('express');
const cors = require('cors');
require('dotenv').config();
const corsOptions = require('./config/cors');

const app = express();

// Middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // preflight
app.use(express.json());
app.use(require("cookie-parser")());

//  Подключаем маршруты
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);
app.use("/api/status", require("./routes/status.routes"));
app.use("/api/users", require("./routes/users.routes"));



// Тестовый маршрут
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Express сервер работает',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Простой маршрут для теста
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API работает!',
    endpoints: [
      '/api/health',
      '/api/test', 
      '/api/db-check'
    ]
  });
});

// Маршрут для проверки подключения к БД
app.get('/api/db-check', async (req, res) => {
  try {
    // Динамически импортируем чтобы избежать ошибок при запуске
    const { testConnection } = require('./config/database');
    
    console.log('🔧 Проверка подключения к БД...');
    await testConnection();
    
    res.json({ 
      status: 'SUCCESS', 
      message: 'База данных подключена успешно!',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Ошибка БД:', error.message);
    res.status(500).json({
      status: 'ERROR',
      message: 'Не удалось подключиться к базе данных',
      error: error.message,
      solution: 'Проверьте что контейнеры запущены: docker ps'
    });
  }
});



// Запуск сервера
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    const { sequelize } = require('./config/database');
    console.log('🗄  Синхронизация моделей с БД...');
    await sequelize.sync({ alter: true });
    console.log(' Модели успешно синхронизированы!');
  } catch (err) {
    console.error(' Ошибка при синхронизации БД:', err.message);
  }
})();
app.listen(PORT, () => {
  console.log('=' .repeat(50));
  console.log(` Сервер запущен на порту ${PORT}`);
  console.log(` Health: http://localhost:${PORT}/api/health`);
  console.log(` Test: http://localhost:${PORT}/api/test`);
  console.log(` DB Check: http://localhost:${PORT}/api/db-check`);
  console.log('=' .repeat(50));
  console.log('💡 Если DB Check не работает:');
  console.log('   1. Проверь контейнеры: docker ps');
  console.log('   2. Пересоздай контейнеры: npm run db:reset');
  console.log('   3. Проверь настройки в .env файле');
});

module.exports = app;