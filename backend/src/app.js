// backend/src/app.js
// ОБНОВЛЕННЫЙ ФАЙЛ С ПОЛНОЙ AI ИНТЕГРАЦИЕЙ + WebSocket

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const corsOptions = require("./config/cors");
const multer = require('multer');
const path = require('path');

const app = express();

// HTTP сервер
const server = http.createServer(app);

// WebSocket сервер для Socket.IO (ваши существующие сокеты)
const io = new Server(server, {
  path: "/socket.io/",
  cors: corsOptions
});

// Middleware для статических файлов
app.use('/uploads', express.static('uploads'));

// Middleware
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());
app.use(require("cookie-parser")());

// ========================================
// AI ROUTES
// ========================================
const aiRoutes = require("./routes/ai.routes");
const aiAgentRoutes = require("./routes/ai-agent.routes");
const chatRoutes = require('./routes/chat.routes');

app.use("/api/ai", aiRoutes);
app.use("/api/ai-agent", aiAgentRoutes);
app.use('/chat', chatRoutes);
// ========================================

// Existing Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/status", require("./routes/status.routes"));
app.use("/api/users", require("./routes/users.routes"));
app.use("/api/messages", require("./routes/messages.routes"));
app.use("/api/friends", require("./routes/friends.routes"));
app.use("/api/servers", require("./routes/servers.routes"));

// --- тестовые маршруты ---
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

app.get("/api/test", (req, res) => {
  res.json({ message: "API работает!" });
});

app.get("/api/db-check", async (req, res) => {
  try {
    const { testConnection } = require("./config/database");
    await testConnection();
    res.json({ status: "DB OK" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Redis
const { connectRedis } = require("./config/redis");

// Запуск
const PORT = process.env.PORT || 5000;

// Инициализация приложения
const initApp = async () => {
  // DB sync
  try {
    const { sequelize } = require("./config/database");
    await sequelize.sync();
    console.log('✅ База данных синхронизирована');
  } catch (e) {
    console.error("❌ DB Sync Error:", e.message);
  }

  // Redis
  await connectRedis();

  // Socket.IO logic (ваши существующие сокеты)
  const initPresence = require("./socket/presence");
  const initMessages = require("./socket/messages");
  initPresence(io);
  initMessages(io);

  // ========================================
  // AI WebSocket для задач (новое)
  // ========================================
  const { initTaskWS } = require("./socket/tasks.ws");
  initTaskWS(server, aiAgentRoutes);
  console.log('✅ AI WebSocket инициализирован');
  // ========================================
};

// RUN SERVER
// server.listen(PORT, () => {
//   console.log('');
//   console.log('═════════════════════════════════════════════');
//   console.log(`🚀 Сервер запущен на порту ${PORT}`);
//   console.log('═════════════════════════════════════════════');
//   console.log(`📡 Socket.IO:      http://localhost:${PORT}/socket.io`);
//   console.log(`🤖 AI API:         http://localhost:${PORT}/api/ai`);
//   console.log(`🎯 AI Agent:       http://localhost:${PORT}/api/ai-agent`);
//   console.log(`💬 AI Chat UI:     http://localhost:${PORT}/chat`);
//   console.log(`⚡ WebSocket:      ws://localhost:${PORT}/ws/tasks`);
//   console.log('═════════════════════════════════════════════');
//   console.log('');
// });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM получен, закрываем сервер...');
  server.close(() => {
    console.log('Сервер остановлен');
    process.exit(0);
  });
});

module.exports = { app, server, io, initApp };