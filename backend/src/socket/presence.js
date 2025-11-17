const redis = require("../config/redis");

module.exports = (io) => {
  io.on("connection", async (socket) => {
    console.log("User connected:", socket.id);

    const userId = socket.handshake.query.userId;
    if (!userId) return;

    // Помечаем пользователя как онлайн
    await redis.set(`user:${userId}:online`, "1");
    await redis.set(`user:${userId}:lastSeen`, Date.now());

    io.emit("user:online", { userId });

    // === TYPING EVENTS ===
    socket.on("typing:start", (data) => {
      io.to(data.chatId).emit("typing:start", { userId });
    });

    socket.on("typing:stop", (data) => {
      io.to(data.chatId).emit("typing:stop", { userId });
    });

    // === DISCONNECT ===
    socket.on("disconnect", async () => {
      console.log("User disconnected:", socket.id);

      await redis.del(`user:${userId}:online`);
      await redis.set(`user:${userId}:lastSeen`, Date.now());

      io.emit("user:offline", {
        userId,
        lastSeen: Date.now(),
      });
    });
  });
};
