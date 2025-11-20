const { redisClient } = require("../config/redis");

module.exports = (io) => {
  // Хранилище соответствий userId → socketId
  const userSockets = {};

  io.on("connection", async (socket) => {
    console.log("🟢 Пользователь подключен:", socket.id);
  
    const userId = socket.handshake.query.userId;
    console.log("User ID из handshake:", userId);
    if (!userId) {
      console.log("❌ User ID не определен");
      return;
    }
  
    // Сохраняем сокет пользователя
    userSockets[userId] = socket.id;
    console.log("Сокет пользователя сохранен:", { userId, socketId: socket.id });
  
    // Помечаем онлайн
    await redisClient.set(`user:${userId}:online`, "1");
    await redisClient.set(`user:${userId}:lastSeen`, Date.now());
  
    io.emit("user:online", { userId });
    console.log("Событие user:online отправлено:", { userId });

    // События онлайн статуса
    socket.on("user:status", async ({ status }) => {
      console.log(`🔄 Статус пользователя ${userId} изменен на:`, status);
      
      try {
        const User = require("../models/User");
        const user = await User.findByPk(userId);
        
        if (user) {
          user.status = status;
          if (status === 'online') {
            user.online = true;
          }
          await user.save();
          
          // Отправляем обновленный статус всем клиентам
          io.emit("user:status:updated", { userId, status });
          console.log("✅ Статус пользователя обновлен и отправлен всем клиентам");
        }
      } catch (error) {
        console.error("Ошибка обновления статуса пользователя:", error);
      }
    });

    // ====== Отключение ======
    socket.on("disconnect", async () => {
      console.log("🔴 Disconnect:", userId);

      delete userSockets[userId];
      console.log("Сокет пользователя удален:", userId);

      await redisClient.del(`user:${userId}:online`);
      await redisClient.set(`user:${userId}:lastSeen`, Date.now());

      // Обновляем статус пользователя
      try {
        const User = require("../models/User");
        const user = await User.findByPk(userId);
        
        if (user) {
          user.online = false;
          user.status = 'offline';
          await user.save();
        }
      } catch (error) {
        console.error("Ошибка обновления статуса пользователя при отключении:", error);
      }

      io.emit("user:offline", {
        userId,
        lastSeen: Date.now(),
      });
      console.log("Событие user:offline отправлено:", { userId });
    });
  });
};
