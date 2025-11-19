const { redisClient } = require("../config/redis");

module.exports = (io) => {
  io.on("connection", async (socket) => {
    console.log("🟢 Пользователь подключен");

    const userId = socket.handshake.query.userId;

    if (userId) {
      await redisClient.set(`user:${userId}:online`, "1");
      await redisClient.set(`user:${userId}:lastSeen`, Date.now());
      io.emit("user:online", { userId });
    }

    socket.on("chat:send", (msg) => {
      io.emit("chat:newMessage", msg);
    });

    socket.on("typing:start", ({ chatId }) => {
      io.to(chatId).emit("typing:start", { userId });
    });

    socket.on("typing:stop", ({ chatId }) => {
      io.to(chatId).emit("typing:stop", { userId });
    });

    socket.on("disconnect", async () => {
      console.log("🔴 Пользователь отключился:", socket.id);

      if (userId) {
        await redisClient.del(`user:${userId}:online`);
        await redisClient.set(`user:${userId}:lastSeen`, Date.now());

        io.emit("user:offline", {
          userId,
          lastSeen: Date.now()
        });
      }
    });
  });
};
