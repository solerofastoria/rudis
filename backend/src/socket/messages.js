const { Message, User } = require("../models");
const { Op } = require("sequelize");

module.exports = (io) => {
  // Namespace /messages
  const messages = io.of("/messages");

  // userId → socketId
  const userSockets = {};

  messages.on("connection", async (socket) => {
    console.log("🟢 [messages] пользователь подключён:", socket.id);

    // userId из query
    const userId = socket.handshake.query.userId;
    console.log("👉 User ID:", userId);

    if (!userId) {
      console.log("❌ Нет userId в handshake");
      socket.disconnect();
      return;
    }

    // сохраняем сокет
    userSockets[userId] = socket.id;
    console.log("🔗 userSockets:", userSockets);

    // ====================================================
    // 📩 ОТПРАВКА ЛИЧНОГО СООБЩЕНИЯ
    // ====================================================
    socket.on("dm:send", async ({ toUserId, content }) => {
      console.log(`📨 DM ${userId} → ${toUserId}:`, content);

      try {
        console.log("🔍 Создание сообщения с параметрами:", {
          content: content.trim(),
          sender_id: userId,
          recipient_id: toUserId,
          is_direct: true,
          is_read: false,
        });
        
        const message = await Message.create({
          content: content.trim(),
          sender_id: userId,
          recipient_id: toUserId,
          is_direct: true,
          isRead: false,
        });
        
        console.log("✅ Сообщение создано в БД:", message.toJSON());

        const fullMessage = await Message.findByPk(message.id, {
          include: [
            { model: User, as: "sender", attributes: ["id", "username", "avatar"] },
            { model: User, as: "recipient", attributes: ["id", "username", "avatar"] },
          ],
        });

        const msg = fullMessage.get({ plain: true });
        msg.username = msg.sender.username;
        msg.userId = msg.sender.id;
        msg.timestamp = new Date(msg.created_at).getTime();
        if (msg.edited_at) msg.edited_at = new Date(msg.edited_at).getTime();

        // отправляем себе
        socket.emit("dm:sent", msg);

        // отправляем получателю
        const targetSocketId = userSockets[toUserId];
        console.log("🔍 Target socket ID для пользователя", toUserId, ":", targetSocketId);
        console.log("🔍 Все подключенные пользователи:", userSockets);
        if (targetSocketId) {
          messages.to(targetSocketId).emit("dm:new", msg);
          console.log("📤 dm:new отправлено", targetSocketId);
          console.log("📤 Отправленное сообщение:", msg);
        } else {
          console.log("❌ Не удалось отправить DM: сокет пользователя не найден");
        }

        // обновляем счётчик непрочитанных
        if (targetSocketId) {
          const unread = await Message.count({
            where: {
              is_direct: true,
              recipient_id: toUserId,
              is_read: false,
            },
          });

          messages.to(targetSocketId).emit("unread:update", {
            userId,
            count: unread,
          });
        }

      } catch (e) {
        console.error("❌ Ошибка DM:", e);
        socket.emit("dm:error", { message: "Ошибка отправки сообщения" });
        console.log("❌ Ошибка DM отправлена клиенту:", { message: "Ошибка отправки сообщения" });
      }
    });

    // ====================================================
    // 💬 ПУБЛИЧНЫЙ ЧАТ
    // ====================================================
    socket.on("chat:send", async ({ content }) => {
      console.log(`💬 PUBLIC от ${userId}: ${content}`);

      try {
        const messageData = await Message.create({
          content: content.trim(),
          sender_id: userId,
          is_direct: false,
        });

        const fullMessage = await Message.findByPk(messageData.id, {
          include: [{ model: User, as: "sender", attributes: ["id", "username", "avatar"] }],
        });

        const msg = fullMessage.get({ plain: true });
        msg.username = msg.sender.username;
        msg.userId = msg.sender.id;
        msg.timestamp = new Date(msg.created_at).getTime();
        if (msg.edited_at) msg.edited_at = new Date(msg.edited_at).getTime();

        messages.emit("chat:message", msg);
        console.log("📤 chat:message отправлено всем:", msg);

      } catch (e) {
        console.error("❌ Ошибка public message:", e);
        socket.emit("chat:error", { message: "Ошибка отправки" });
        console.log("❌ Ошибка public message отправлена клиенту:", { message: "Ошибка отправки" });
      }
    });

    // ====================================================
    // ✏️ РЕДАКТИРОВАНИЕ СООБЩЕНИЯ
    // ====================================================
    socket.on("message:edit", async ({ messageId, content }) => {
      try {
        const message = await Message.findByPk(messageId);

        if (!message) {
          socket.emit("message:error", { message: "Сообщение не найдено" });
          return;
        }

        if (message.sender_id !== userId) {
          socket.emit("message:error", { message: "Нет прав" });
          return;
        }

        message.content = content.trim();
        message.is_edited = true;
        message.edited_at = new Date();
        await message.save();

        const fullMessage = await Message.findByPk(message.id, {
          include: [
            { model: User, as: "sender", attributes: ["id", "username", "avatar"] },
            { model: User, as: "recipient", attributes: ["id", "username", "avatar"] },
          ],
        });

        const msg = fullMessage.get({ plain: true });
        msg.username = msg.sender.username;
        msg.userId = msg.sender.id;
        msg.timestamp = new Date(msg.created_at).getTime();
        if (msg.edited_at) msg.edited_at = new Date(msg.edited_at).getTime();

        messages.emit("message:updated", msg);
        console.log("📤 message:updated отправлено всем:", msg);

      } catch (e) {
        console.error("❌ Edit error:", e);
        socket.emit("message:error", { message: "Ошибка редактирования" });
        console.log("❌ Ошибка edit отправлена клиенту:", { message: "Ошибка редактирования" });
      }
    });

    // ====================================================
    // 🗑 УДАЛЕНИЕ
    // ====================================================
    socket.on("message:delete", async ({ messageId }) => {
      try {
        const message = await Message.findByPk(messageId);

        if (!message) {
          socket.emit("message:error", { message: "Сообщение не найдено" });
          return;
        }

        if (message.sender_id !== userId) {
          socket.emit("message:error", { message: "Нет прав" });
          return;
        }

        await message.destroy();
        messages.emit("message:deleted", { messageId });
        console.log("📤 message:deleted отправлено всем:", messageId);

      } catch (e) {
        console.error("❌ Delete error:", e);
        socket.emit("message:error", { message: "Ошибка удаления" });
        console.log("❌ Ошибка delete отправлена клиенту:", { message: "Ошибка удаления" });
      }
    });

    // ====================================================
    // 🔴 ОТКЛЮЧЕНИЕ
    // ====================================================
    socket.on("disconnect", () => {
      console.log("🔴 disconnect:", userId);
      delete userSockets[userId];
    });
  });
};
