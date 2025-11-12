const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Тестовый маршрут
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Сервер работает!',
    timestamp: new Date().toISOString(),
    note: 'Базы данных пока не подключены'
  });
});

// Маршрут для теста аутентификации
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API работает нормально!',
    nextSteps: 'Настройте базы данных'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
});