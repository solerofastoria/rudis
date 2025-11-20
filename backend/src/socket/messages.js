const Message = require("../models/Message");
const User = require("../models/User");

module.exports = (io) => {
  // Хранилище соответствий userId → socketId
  const userSockets = {};

  io.on("connection", async (socket) => {
    console.log("🟢 Пользователь подключен к messages:", socket.id);
  
    const userId = socket.handshake.query.userId;
    console.log("User ID из handshake:", userId);
    if (!userId) {
      console.log("❌ User ID не определен");
      return;
    }
  
    // Сохраняем сокет пользователя
    userSockets[userId] = socket.id;
    console.log("Сокет пользователя сохранен:", { userId, socketId: socket.id });
  
    // ======= ПОЛУЧЕНИЕ DM =======
    socket.on("dm:send", async ({ toUserId, content }) => {
      console.log(`📨 DM от ${userId} → ${toUserId}:`, content);

      try {
        // Создаем сообщение в базе данных
        const message = await Message.create({
          content: content.trim(),
          senderId: userId,
          recipientId: toUserId,
          isDirect: true
        });

        // Загружаем полную информацию о сообщении
        const fullMessage = await Message.findByPk(message.id, {
          include: [
            {
              model: User,
              as: 'sender',
              attributes: ['id', 'username', 'avatar']
            },
            {
              model: User,
              as: 'recipient',
              attributes: ['id', 'username', 'avatar']
            }
          ]
        });

        // Преобразуем сообщение в простой объект
        const messageToSend = fullMessage.get({ plain: true });
        // Добавляем username отправителя и получателя
        messageToSend.username = messageToSend.sender.username;
        messageToSend.userId = messageToSend.sender.id;
        messageToSend.timestamp = new Date(messageToSend.createdAt).getTime();
        if (messageToSend.editedAt) {
          messageToSend.editedAt = new Date(messageToSend.editedAt).getTime();
        }

        // Отправляем сообщение отправителю
        socket.emit("dm:sent", messageToSend);

        // Отправляем сообщение получателю, если он онлайн
        const targetSocketId = userSockets[toUserId];
        if (targetSocketId) {
          io.to(targetSocketId).emit("dm:new", messageToSend);
          console.log("DM отправлено получателю:", { targetSocketId, content });
        } else {
          console.log("❌ Получатель оффлайн, DM сохранен в базе");
        }
      } catch (error) {
        console.error("Ошибка отправки DM:", error);
        socket.emit("dm:error", { message: "Ошибка отправки сообщения" });
      }
    });

    // ======= ПУБЛИЧНЫЕ СООБЩЕНИЯ =======
    socket.on("chat:send", async ({ content, username }) => {
      console.log(`💬 PUBLIC MESSAGE от ${username}: ${content}`);

      try {
        // Создаем сообщение в базе данных
        const messageData = await Message.create({
          content: content.trim(),
          senderId: userId,
          isDirect: false
        });

        // Загружаем полную информацию о сообщении
        const fullMessage = await Message.findByPk(messageData.id, {
          include: [
            {
              model: User,
              as: 'sender',
              attributes: ['id', 'username', 'avatar']
            }
          ]
        });

        console.log("📤 Отправка сообщения всем клиентам:", fullMessage);
        // Преобразуем сообщение в простой объект
        const messageToSend = fullMessage.get({ plain: true });
        // Добавляем username отправителя
        messageToSend.username = messageToSend.sender.username;
        messageToSend.userId = messageToSend.sender.id;
        messageToSend.timestamp = new Date(messageToSend.createdAt).getTime();
        if (messageToSend.editedAt) {
          messageToSend.editedAt = new Date(messageToSend.editedAt).getTime();
        }

        console.log("📤 Отправка сообщения всем клиентам:", messageToSend);
        io.emit("chat:message", messageToSend);
        console.log("✅ Сообщение отправлено всем клиентам");
      } catch (error) {
        console.error("Ошибка отправки сообщения:", error);
        socket.emit("chat:error", { message: "Ошибка отправки сообщения" });
      }
    });

    // ======= РЕДАКТИРОВАНИЕ СООБЩЕНИЯ =======
    socket.on("message:edit", async ({ messageId, content }) => {
      console.log(`✏️ Редактирование сообщения ${messageId}:`, content);

      try {
        // Найти сообщение
        const message = await Message.findByPk(messageId);
        
        if (!message) {
          socket.emit("message:error", { message: "Сообщение не найдено" });
          return;
        }

        // Проверить, что пользователь является автором сообщения
        if (message.senderId !== userId) {
          socket.emit("message:error", { message: "Нет прав для редактирования этого сообщения" });
          return;
        }

        // Обновить сообщение
        message.content = content.trim();
        message.isEdited = true;
        message.editedAt = new Date();
        
        await message.save();

        // Загружаем полную информацию о сообщении
        const fullMessage = await Message.findByPk(message.id, {
          include: [
            {
              model: User,
              as: 'sender',
              attributes: ['id', 'username', 'avatar']
            },
            {
              model: User,
              as: 'recipient',
              attributes: ['id', 'username', 'avatar']
            }
          ]
        });

        // Преобразуем сообщение в простой объект
        const messageToSend = fullMessage.get({ plain: true });
        // Добавляем username отправителя
        messageToSend.username = messageToSend.sender.username;
        messageToSend.userId = messageToSend.sender.id;
        messageToSend.timestamp = new Date(messageToSend.createdAt).getTime();
        if (messageToSend.editedAt) {
          messageToSend.editedAt = new Date(messageToSend.editedAt).getTime();
        }

        // Отправляем обновленное сообщение всем клиентам
        io.emit("message:updated", messageToSend);
        console.log("✅ Сообщение обновлено и отправлено всем клиентам");
      } catch (error) {
        console.error("Ошибка редактирования сообщения:", error);
        socket.emit("message:error", { message: "Ошибка редактирования сообщения" });
      }
    });

    // ======= УДАЛЕНИЕ СООБЩЕНИЯ =======
    socket.on("message:delete", async ({ messageId }) => {
      console.log(`🗑️ Удаление сообщения ${messageId}`);

      try {
        // Найти сообщение
        const message = await Message.findByPk(messageId);
        
        if (!message) {
          socket.emit("message:error", { message: "Сообщение не найдено" });
          return;
        }

        // Проверить, что пользователь является автором сообщения
        if (message.senderId !== userId) {
          socket.emit("message:error", { message: "Нет прав для удаления этого сообщения" });
          return;
        }

        // Удалить сообщение
        await message.destroy();

        // Отправляем уведомление об удалении всем клиентам
        io.emit("message:deleted", { messageId });
        console.log("✅ Сообщение удалено и уведомление отправлено всем клиентам");
      } catch (error) {
        console.error("Ошибка удаления сообщения:", error);
        socket.emit("message:error", { message: "Ошибка удаления сообщения" });
      }
    });

    // ====== Отключение ======
    socket.on("disconnect", async () => {
      console.log("🔴 Disconnect:", userId);

      delete userSockets[userId];
      console.log("Сокет пользователя удален:", userId);
    });
  });
};