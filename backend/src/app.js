const express = require("express");
const cors = require("cors");
require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const corsOptions = require("./config/cors");

const app = express();

// HTTP сервер
const server = http.createServer(app);

// WebSocket сервер
const io = new Server(server, {
  path: "/socket.io/",
  cors: corsOptions
});

// Middleware
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());
app.use(require("cookie-parser")());

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/status", require("./routes/status.routes"));
app.use("/api/users", require("./routes/users.routes"));

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

(async () => {
  // DB sync
  try {
    const { sequelize } = require("./config/database");
    await sequelize.sync();
  } catch (e) {
    console.error("DB Sync Error:", e.message);
  }

  // Redis
  await connectRedis();

  // Socket logic
  const initPresence = require("./socket/presence");
  initPresence(io);

  // RUN SERVER
  server.listen(PORT, () => {
    console.log(`🚀 Сервер + WebSocket запущены на порту ${PORT}`);
  });
})();

module.exports = { app, server, io };
