// backend/src/server.js
// Точка входа в приложение

require('dotenv').config();

const { app, server, initApp } = require('./app');

// Запуск приложения
const PORT = process.env.PORT || 5000;

(async () => {
  // Инициализация приложения
  await initApp();

  // RUN SERVER
  server.listen(PORT, () => {
    console.log('');
    console.log('═════════════════════════════════════════════');
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log('═════════════════════════════════════════════');
    console.log(`📡 Socket.IO:      http://localhost:${PORT}/socket.io`);
    console.log(`🤖 AI API:         http://localhost:${PORT}/api/ai`);
    console.log(`🎯 AI Agent:       http://localhost:${PORT}/api/ai-agent`);
    console.log(`💬 AI Chat UI:     http://localhost:${PORT}/chat`);
    console.log(`⚡ WebSocket:      ws://localhost:${PORT}/ws/tasks`);
    console.log('═════════════════════════════════════════════');
    console.log('');
  });
})();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM получен, закрываем сервер...');
  server.close(() => {
    console.log('Сервер остановлен');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT получен, закрываем сервер...');
  server.close(() => {
    console.log('Сервер остановлен');
    process.exit(0);
  });
});

module.exports = { app, server };